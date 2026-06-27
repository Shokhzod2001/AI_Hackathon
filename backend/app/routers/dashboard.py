from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan import Scan

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

RISK_ICONS = {
    "blocked": "🚫",
    "reported": "📨",
    "pending": "🔍",
}


def _time_ago(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = int((now - dt).total_seconds())
    if diff < 60:
        return "hozir"
    if diff < 3600:
        return f"{diff // 60} daq"
    if diff < 86400:
        return f"{diff // 3600} soat"
    return f"{diff // 86400} kun"


@router.get("/live-feed")
async def live_feed(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Scan).order_by(Scan.created_at.desc()).limit(10)
    )
    scans = result.scalars().all()

    feed = []
    for s in scans:
        if s.risk_score >= 70:
            icon = "🚨"
            title = "Yuqori risk post aniqlandi"
        elif s.risk_score >= 40:
            icon = "⚠️"
            title = "O'rta risk post"
        else:
            icon = "🔍"
            title = "Past risk post tekshirildi"

        if s.status == "blocked":
            icon = "🚫"
            title = "Post bloklandi"
        elif s.status == "reported":
            icon = "📨"
            title = "Idoraga yuborildi"

        feed.append({
            "icon": icon,
            "title": title,
            "meta": f"{s.platform.capitalize()} · Risk: {s.risk_score}",
            "time": _time_ago(s.created_at),
        })

    return feed
