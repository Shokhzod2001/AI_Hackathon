import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, delete, text
from app.models.scan import Scan
from app.schemas.scan import (
    ScanCreateRequest, DashboardStats, WeeklyStats,
    PlatformStats, TopKeyword, MonthlyStats,
)
from app.services import keyword_service, claude_service
from app.websocket.manager import manager
from app.ml import DrugJargonDetector


async def create_scan(db: AsyncSession, data: ScanCreateRequest, user_id: uuid.UUID | None = None) -> Scan:
    keywords = await keyword_service.get_active_keywords(db)
    found = keyword_service.detect_keywords(data.content_text, keywords)
    local_score = keyword_service.calc_risk_score(found, data.content_text)

    # ML model score (JEDIS-inspired, context-based)
    ml_result = DrugJargonDetector.get().predict(data.content_text)
    ml_score = ml_result["score"]

    ai_result = await claude_service.analyze_text(data.content_text, data.platform)

    # Blend: max of keyword, ML, and AI scores — any signal can escalate
    ai_score = ai_result.get("risk_score", 0) if ai_result else 0
    final_score = max(local_score, ml_score, ai_score)
    all_found = found["high"] + found["mid"] + found["low"]

    # Merge ML triggers into keyword list
    for trigger in ml_result.get("triggers", []):
        if trigger.startswith("pattern:") and trigger not in all_found:
            all_found.append(trigger)

    if ai_result:
        verdict = ai_result.get("verdict", _score_to_verdict(final_score))
    else:
        verdict = _score_to_verdict(final_score)

    scan = Scan(
        user_id=user_id,
        platform=data.platform,
        source_url=data.source_url,
        content_text=data.content_text,
        risk_score=final_score,
        verdict=verdict,
        category=ai_result.get("category") if ai_result else None,
        language=ai_result.get("language") if ai_result else None,
        threat_type=ai_result.get("threat_type") if ai_result else None,
        keywords_found=all_found or None,
        ai_explanation=ai_result.get("explanation") if ai_result else None,
        ai_raw_response=ai_result,
        city=data.city,
        status="blocked" if final_score >= 70 else "pending",
    )
    db.add(scan)
    await db.flush()

    await manager.broadcast({
        "type": "new_scan",
        "id": str(scan.id),
        "platform": scan.platform,
        "risk_score": scan.risk_score,
        "verdict": scan.verdict,
        "created_at": scan.created_at.isoformat(),
    })

    return scan


def _score_to_verdict(score: int) -> str:
    if score >= 85:
        return "KRITIK"
    if score >= 70:
        return "XAVFLI"
    if score >= 40:
        return "SHUBHALI"
    return "XAVFSIZ"


async def get_scan(db: AsyncSession, scan_id: uuid.UUID) -> Scan | None:
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    return result.scalar_one_or_none()


async def list_scans(
    db: AsyncSession,
    platform: str | None = None,
    status: str | None = None,
    risk_min: int | None = None,
    risk_max: int | None = None,
    search: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Scan], int]:
    conditions = []
    if platform:
        conditions.append(Scan.platform == platform)
    if status:
        conditions.append(Scan.status == status)
    if risk_min is not None:
        conditions.append(Scan.risk_score >= risk_min)
    if risk_max is not None:
        conditions.append(Scan.risk_score <= risk_max)
    if search:
        conditions.append(Scan.content_text.ilike(f"%{search}%"))

    base_q = select(Scan).where(and_(*conditions)) if conditions else select(Scan)
    total = (await db.execute(select(func.count()).select_from(base_q.subquery()))).scalar() or 0
    items = list((await db.execute(
        base_q.order_by(Scan.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    )).scalars().all())
    return items, total


async def update_scan_status(db: AsyncSession, scan_id: uuid.UUID, new_status: str) -> Scan | None:
    scan = await get_scan(db, scan_id)
    if scan:
        scan.status = new_status
        scan.updated_at = datetime.utcnow()
    return scan


async def delete_scan(db: AsyncSession, scan_id: uuid.UUID) -> bool:
    result = await db.execute(delete(Scan).where(Scan.id == scan_id))
    return result.rowcount > 0


async def get_dashboard_stats(db: AsyncSession) -> DashboardStats:
    total_detected = (await db.execute(select(func.count(Scan.id)))).scalar() or 0
    total_pending = (await db.execute(select(func.count(Scan.id)).where(Scan.status == "pending"))).scalar() or 0
    total_blocked = (await db.execute(select(func.count(Scan.id)).where(Scan.status == "blocked"))).scalar() or 0
    total_reported = (await db.execute(select(func.count(Scan.id)).where(Scan.status == "reported"))).scalar() or 0
    return DashboardStats(
        total_detected=total_detected,
        total_pending=total_pending,
        total_blocked=total_blocked,
        total_reported=total_reported,
    )


async def get_weekly_stats(db: AsyncSession) -> WeeklyStats:
    result = await db.execute(text("""
        SELECT
            to_char(d::date, 'Dy') AS label,
            COUNT(s.id) FILTER (WHERE s.id IS NOT NULL) AS detected,
            COUNT(s.id) FILTER (WHERE s.status = 'blocked') AS blocked
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        ) d
        LEFT JOIN scans s ON s.created_at::date = d::date
        GROUP BY d
        ORDER BY d
    """))
    rows = result.all()
    day_map = {"Mon": "Dush", "Tue": "Sesh", "Wed": "Chor", "Thu": "Pay",
               "Fri": "Jum", "Sat": "Shan", "Sun": "Yak"}
    return WeeklyStats(
        labels=[day_map.get(r[0], r[0]) for r in rows],
        detected=[r[1] for r in rows],
        blocked=[r[2] for r in rows],
    )


async def get_platform_stats(db: AsyncSession) -> PlatformStats:
    result = await db.execute(select(Scan.platform, func.count(Scan.id)).group_by(Scan.platform))
    rows = result.all()
    if rows:
        return PlatformStats(labels=[r[0] for r in rows], values=[r[1] for r in rows])
    return PlatformStats(labels=["telegram", "instagram", "olx", "darkweb"], values=[62, 20, 11, 7])


async def get_top_keywords(db: AsyncSession, limit: int = 7) -> list[TopKeyword]:
    result = await db.execute(text("""
        SELECT kw, COUNT(*) AS cnt
        FROM scans, unnest(keywords_found) AS kw
        WHERE keywords_found IS NOT NULL
        GROUP BY kw
        ORDER BY cnt DESC
        LIMIT :lim
    """), {"lim": limit})
    rows = result.all()
    return [TopKeyword(word=r[0], count=r[1]) for r in rows]


async def get_monthly_stats(db: AsyncSession) -> MonthlyStats:
    result = await db.execute(text("""
        SELECT
            to_char(d::date, 'Mon') AS label,
            COUNT(s.id) FILTER (WHERE s.id IS NOT NULL) AS cnt
        FROM generate_series(
            date_trunc('year', CURRENT_DATE),
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
        ) d
        LEFT JOIN scans s ON date_trunc('month', s.created_at) = d::date
        GROUP BY d
        ORDER BY d
    """))
    rows = result.all()
    mon_map = {"Jan": "Yan", "Feb": "Fev", "Mar": "Mar", "Apr": "Apr", "May": "May",
               "Jun": "Iyn", "Jul": "Iyl", "Aug": "Avg", "Sep": "Sen",
               "Oct": "Okt", "Nov": "Noy", "Dec": "Dek"}
    return MonthlyStats(
        labels=[mon_map.get(r[0], r[0]) for r in rows],
        values=[r[1] for r in rows],
    )
