from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

_FEED = [
    {"icon": "🚨", "title": "Kritik post aniqlandi", "meta": "Telegram · Risk: 97", "time": "hozir"},
    {"icon": "⚠️", "title": "Shubhali reklama", "meta": "Instagram · Risk: 74", "time": "2 daq"},
    {"icon": "🔍", "title": "OLX e'lon tekshiruvda", "meta": "OLX · Risk: 52", "time": "5 daq"},
    {"icon": "✅", "title": "Kanal bloklash tasdiqlandi", "meta": "UZINFOCOM · Telegram kanali", "time": "8 daq"},
    {"icon": "📨", "title": "Hisobot IIV ga yuborildi", "meta": "Ref#2048 · Kritik", "time": "12 daq"},
]


@router.get("/live-feed")
async def live_feed(_: User = Depends(get_current_user)):
    return _FEED
