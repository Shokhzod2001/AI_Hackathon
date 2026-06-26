import httpx
from app.config import settings


async def send_message(chat_id: str, text: str) -> bool:
    if not settings.telegram_bot_token:
        return False
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"})
            return resp.status_code == 200
        except Exception:
            return False


async def send_alert(scan_id: str, platform: str, risk_score: int, verdict: str) -> bool:
    if not settings.telegram_notify_chat_id:
        return False
    text = (
        f"🚨 <b>Yangi {verdict} hodisa!</b>\n"
        f"📱 Platforma: {platform}\n"
        f"⚠️ Risk ball: {risk_score}/100\n"
        f"🔗 ID: {scan_id}"
    )
    return await send_message(settings.telegram_notify_chat_id, text)
