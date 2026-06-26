import httpx
from app.config import settings


async def send_block_request(url: str, platform: str, reason: str) -> dict:
    if not settings.uzinfocom_api_key:
        return {"status": "simulated", "message": "UZINFOCOM API sozlanmagan"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                f"{settings.uzinfocom_api_url}/block",
                headers={"Authorization": f"Bearer {settings.uzinfocom_api_key}"},
                json={"url": url, "platform": platform, "reason": reason},
            )
            return resp.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}
