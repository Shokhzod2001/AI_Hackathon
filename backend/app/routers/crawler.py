from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services import telegram_crawler

router = APIRouter(prefix="/api/v1/crawler", tags=["crawler"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class AuthSendRequest(BaseModel):
    phone: str                  # "+998901234567"


class AuthVerifyRequest(BaseModel):
    phone: str
    code: str
    password: str = ""          # 2FA password (agar bo'lsa)


class AuthVerifyResponse(BaseModel):
    session_string: str
    message: str


class CrawlRequest(BaseModel):
    channels: list[str] | None = None   # None = config dagi ro'yxat
    limit: int = 50


class ChannelResult(BaseModel):
    channel: str
    total: int
    scanned: int
    drug_hits: int
    errors: list[str]


class CrawlResponse(BaseModel):
    started_at: str
    finished_at: str
    total_scanned: int
    total_drug_hits: int
    channels: list[ChannelResult]


class StatusResponse(BaseModel):
    configured: bool
    has_session: bool
    channels: list[str]
    message: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/status", response_model=StatusResponse)
async def status(_: User = Depends(get_current_user)):
    configured = telegram_crawler.is_configured()
    has_session = telegram_crawler.has_session()

    if not configured:
        msg = "TELEGRAM_API_ID va TELEGRAM_API_HASH .env fayliga qo'shilmagan"
    elif not has_session:
        msg = "Session yo'q. /auth/send va /auth/verify orqali kiring"
    else:
        from app.config import settings
        msg = f"{len(settings.telegram_channels)} ta kanal sozlangan"

    from app.config import settings
    return StatusResponse(
        configured=configured,
        has_session=has_session,
        channels=settings.telegram_channels,
        message=msg,
    )


@router.post("/auth/send")
async def auth_send(
    body: AuthSendRequest,
    _: User = Depends(require_roles("admin")),
):
    if not telegram_crawler.is_configured():
        raise HTTPException(400, "TELEGRAM_API_ID / TELEGRAM_API_HASH sozlanmagan")
    await telegram_crawler.auth_send_code(body.phone)
    return {"message": f"{body.phone} raqamiga SMS kod yuborildi"}


@router.post("/auth/verify", response_model=AuthVerifyResponse)
async def auth_verify(
    body: AuthVerifyRequest,
    _: User = Depends(require_roles("admin")),
):
    try:
        session_string = await telegram_crawler.auth_verify_code(
            body.phone, body.code, body.password
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    return AuthVerifyResponse(
        session_string=session_string,
        message=(
            "Muvaffaqiyatli! Quyidagi session_string ni .env fayliga "
            "TELEGRAM_SESSION_STRING= ga qo'ying, keyin konteynerini restart qiling."
        ),
    )


@router.post("/run", response_model=CrawlResponse)
async def run_crawl(
    body: CrawlRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    try:
        summary = await telegram_crawler.crawl_channels(
            channels=body.channels,
            limit=body.limit,
            db=db,
            user_id=current_user.id,
        )
    except RuntimeError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Crawler xatosi: {e}")

    return CrawlResponse(
        started_at=summary.started_at,
        finished_at=summary.finished_at,
        total_scanned=summary.total_scanned,
        total_drug_hits=summary.total_drug_hits,
        channels=[
            ChannelResult(
                channel=r.channel,
                total=r.total,
                scanned=r.scanned,
                drug_hits=r.drug_hits,
                errors=r.errors,
            )
            for r in summary.channels
        ],
    )
