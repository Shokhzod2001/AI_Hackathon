"""
Telegram Channel Crawler — Telethon asosida.

Ishlash tartibi:
  1. Birinchi marta: POST /api/v1/crawler/auth/send  → telefon raqamga kod keladi
  2.                 POST /api/v1/crawler/auth/verify → kod kiritiladi, session_string saqlanadi
  3. Har doim:       POST /api/v1/crawler/run         → kanallarni skanerlaydi
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import Message, Channel, Chat
from telethon.errors import (
    SessionPasswordNeededError,
    FloodWaitError,
    ChannelPrivateError,
    UsernameNotOccupiedError,
)

from app.config import settings

log = logging.getLogger(__name__)

# Kanal nomi → shahar (xaritada ko'rsatish uchun)
CHANNEL_CITY: dict[str, str] = {
    "narkotik_uz":          "Toshkent",
    "kun_uz":               "Toshkent",
    "daryo_uz":             "Toshkent",
    "aniq_uz":              "Toshkent",
    "uzreport":             "Toshkent",
    "guvoh_uz":             "Toshkent",
    "tashkent_poytaxt":     "Toshkent",
    "uzbekistan_news":      "Toshkent",
    "fergana_uz":           "Farg'ona",
    "buxoro_yangiliklari":  "Buxoro",
    "namangan_uz":          "Namangan",
    "andijan_city":         "Andijon",
    "surxondaryo_uz":       "Termiz",
    "qashqadaryo_uz":       "Qarshi",
    "xorazm_uz":            "Urganch",
    "jizzax_uz":            "Jizzax",
    "sirdaryo_uz":          "Toshkent",
    "navoiy_uz":            "Navoiy",
    "samarqand_city":       "Samarqand",
    "uzbek_crime_news":     "Toshkent",
}


def _city_for_channel(username: str) -> str | None:
    key = username.lstrip("@").lower()
    return CHANNEL_CITY.get(key)

# ── Session storage (in-memory during auth flow) ─────────────────────────────
_pending_client: TelegramClient | None = None
_phone_code_hash: str | None = None


@dataclass
class CrawlResult:
    channel: str
    total: int = 0
    scanned: int = 0
    drug_hits: int = 0
    errors: list[str] = field(default_factory=list)


@dataclass
class CrawlSummary:
    started_at: str
    finished_at: str
    channels: list[CrawlResult]
    total_scanned: int = 0
    total_drug_hits: int = 0


def _make_client(session_str: str = "") -> TelegramClient:
    return TelegramClient(
        StringSession(session_str or settings.telegram_session_string),
        settings.telegram_api_id,
        settings.telegram_api_hash,
    )


def is_configured() -> bool:
    return bool(settings.telegram_api_id and settings.telegram_api_hash and settings.telegram_api_id > 0)


def has_session() -> bool:
    return bool(settings.telegram_session_string)


# ── Auth flow ─────────────────────────────────────────────────────────────────

async def auth_send_code(phone: str) -> str:
    """Step 1 — send OTP to phone. Returns phone_code_hash."""
    global _pending_client, _phone_code_hash

    _pending_client = _make_client("")
    await _pending_client.connect()
    result = await _pending_client.send_code_request(phone)
    _phone_code_hash = result.phone_code_hash
    log.info("OTP sent to %s", phone)
    return _phone_code_hash


async def auth_verify_code(phone: str, code: str, password: str = "") -> str:
    """Step 2 — verify OTP. Returns session_string to save in .env."""
    global _pending_client, _phone_code_hash

    if not _pending_client or not _phone_code_hash:
        raise RuntimeError("auth_send_code() ni avval chaqiring")

    try:
        await _pending_client.sign_in(phone, code, phone_code_hash=_phone_code_hash)
    except SessionPasswordNeededError:
        if not password:
            raise RuntimeError("2FA parol kerak")
        await _pending_client.sign_in(password=password)

    session_string = _pending_client.session.save()
    log.info("Auth muvaffaqiyatli. Session string olindi.")
    await _pending_client.disconnect()
    _pending_client = None
    _phone_code_hash = None
    return session_string


# ── Crawler ───────────────────────────────────────────────────────────────────

async def crawl_channels(
    channels: list[str] | None = None,
    limit: int | None = None,
    db=None,
    user_id=None,
) -> CrawlSummary:
    """
    Berilgan kanallardan so'nggi postlarni o'qib, har birini scan_service orqali tahlil qiladi.
    """
    from app.services import scan_service
    from app.schemas.scan import ScanCreateRequest

    if not is_configured():
        raise RuntimeError("TELEGRAM_API_ID va TELEGRAM_API_HASH sozlanmagan")
    if not has_session():
        raise RuntimeError("Telegram session yo'q. Avval /api/v1/crawler/auth orqali kiring")

    channel_list = channels or settings.telegram_channels
    if not channel_list:
        raise RuntimeError("Skaner qilinadigan kanallar ro'yxati bo'sh")

    crawl_limit = limit or settings.telegram_crawl_limit
    started_at = datetime.now(timezone.utc).isoformat()
    results: list[CrawlResult] = []

    client = _make_client()
    await client.connect()

    try:
        for channel_username in channel_list:
            result = CrawlResult(channel=channel_username)
            log.info("Kanal skanerlanyapti: %s", channel_username)
            city = _city_for_channel(channel_username)

            try:
                entity = await client.get_entity(channel_username)
                messages = await client.get_messages(entity, limit=crawl_limit)

                for msg in messages:
                    if not isinstance(msg, Message) or not msg.text:
                        continue

                    result.total += 1

                    platform = "telegram"
                    source_url = (
                        f"https://t.me/{channel_username.lstrip('@')}/{msg.id}"
                        if isinstance(entity, (Channel, Chat)) else None
                    )

                    try:
                        req = ScanCreateRequest(
                            content_text=msg.text,
                            platform=platform,
                            source_url=source_url,
                            city=city,
                        )
                        scan = await scan_service.create_scan(db, req, user_id)
                        result.scanned += 1
                        if scan.risk_score >= 50:
                            result.drug_hits += 1
                            log.info(
                                "  ⚠ Xavfli post topildi: %s | risk=%d",
                                channel_username, scan.risk_score,
                            )
                    except Exception as e:
                        log.warning("Scan xatosi (%s): %s", channel_username, e)

                    # Flood limitdan qochish
                    await asyncio.sleep(0.3)

            except ChannelPrivateError:
                result.errors.append("Kanal yopiq — kirish imkoni yo'q")
                log.warning("Kanal yopiq: %s", channel_username)
            except UsernameNotOccupiedError:
                result.errors.append("Kanal topilmadi")
                log.warning("Kanal topilmadi: %s", channel_username)
            except FloodWaitError as e:
                result.errors.append(f"Flood wait: {e.seconds}s")
                log.warning("Flood wait %ds", e.seconds)
                await asyncio.sleep(e.seconds)
            except Exception as e:
                result.errors.append(str(e))
                log.error("Kanal xatosi (%s): %s", channel_username, e)

            results.append(result)

    finally:
        await client.disconnect()

    finished_at = datetime.now(timezone.utc).isoformat()
    return CrawlSummary(
        started_at=started_at,
        finished_at=finished_at,
        channels=results,
        total_scanned=sum(r.scanned for r in results),
        total_drug_hits=sum(r.drug_hits for r in results),
    )
