from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan import Scan

router = APIRouter(prefix="/api/v1/map", tags=["map"])

CITY_COORDS: dict[str, list[float]] = {
    "Toshkent":  [69.279736, 41.299496],
    "Samarqand": [66.975314, 39.654522],
    "Farg'ona":  [71.773561, 40.383632],
    "Andijon":   [72.344152, 40.782746],
    "Namangan":  [71.672436, 41.004297],
    "Qarshi":    [65.800781, 38.860139],
    "Buxoro":    [64.421667, 39.767703],
    "Urganch":   [60.633333, 41.550000],
    "Navoiy":    [65.379444, 40.084167],
    "Termiz":    [67.278889, 37.224167],
    "Nukus":     [59.613056, 42.460833],
    "Jizzax":    [67.842778, 40.119444],
}


@router.get("/incidents")
async def get_incidents(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(
            Scan.city,
            func.count(Scan.id).label("cnt"),
            func.avg(Scan.risk_score).label("avg_risk"),
            func.count(Scan.id).filter(Scan.status == "blocked").label("blocked"),
        )
        .where(Scan.city.isnot(None))
        .group_by(Scan.city)
    )
    city_rows = {row.city: row for row in result.all()}

    features = []
    for city, coords in CITY_COORDS.items():
        row = city_rows.get(city)
        if not row:
            continue

        count = row.cnt
        avg_risk = int(row.avg_risk)

        platforms_result = await db.execute(
            select(Scan.platform, func.count(Scan.id))
            .where(Scan.city == city)
            .group_by(Scan.platform)
            .order_by(func.count(Scan.id).desc())
            .limit(3)
        )
        platforms = [r[0] for r in platforms_result.all()]

        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": coords},
            "properties": {
                "name": city,
                "risk_score": avg_risk,
                "incidents": count,
                "blocked": row.blocked,
                "platforms": platforms,
            },
        })

    return {"type": "FeatureCollection", "features": features}
