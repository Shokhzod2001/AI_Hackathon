from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/map", tags=["map"])

INCIDENTS_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {"type": "Feature", "properties": {"city": "Toshkent", "count": 47, "risk": "high"}, "geometry": {"type": "Point", "coordinates": [69.3, 41.3]}},
        {"type": "Feature", "properties": {"city": "Samarqand", "count": 18, "risk": "medium"}, "geometry": {"type": "Point", "coordinates": [66.9, 39.6]}},
        {"type": "Feature", "properties": {"city": "Farg'ona", "count": 23, "risk": "high"}, "geometry": {"type": "Point", "coordinates": [72.3, 40.8]}},
        {"type": "Feature", "properties": {"city": "Andijon", "count": 19, "risk": "high"}, "geometry": {"type": "Point", "coordinates": [71.8, 40.5]}},
        {"type": "Feature", "properties": {"city": "Namangan", "count": 14, "risk": "medium"}, "geometry": {"type": "Point", "coordinates": [71.7, 41.0]}},
        {"type": "Feature", "properties": {"city": "Qarshi", "count": 12, "risk": "medium"}, "geometry": {"type": "Point", "coordinates": [67.3, 37.8]}},
        {"type": "Feature", "properties": {"city": "Buxoro", "count": 8, "risk": "low"}, "geometry": {"type": "Point", "coordinates": [64.4, 39.8]}},
        {"type": "Feature", "properties": {"city": "Urganch", "count": 6, "risk": "low"}, "geometry": {"type": "Point", "coordinates": [60.6, 41.5]}},
        {"type": "Feature", "properties": {"city": "Navoiy", "count": 4, "risk": "low"}, "geometry": {"type": "Point", "coordinates": [65.4, 40.1]}},
    ],
}


@router.get("/incidents")
async def get_incidents(_: User = Depends(get_current_user)):
    return INCIDENTS_GEOJSON
