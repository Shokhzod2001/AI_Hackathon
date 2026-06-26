import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.keyword import Keyword
from app.schemas.keyword import KeywordCreate, KeywordUpdate

DEFAULT_KEYWORDS: dict[str, list[str]] = {
    "high": [
        "giyohvand", "narkotik", "geroin", "kokain", "amfetamin", "metamfetamin",
        "marijuana", "ganja", "tur", "zakladka", "klad", "закладка", "марихуана", "героин",
    ],
    "mid": [
        "gul", "un", "qand", "tort", "ovqat", "mahsulot", "tovar", "etkazib",
        "reklama", "test", "sifatli", "shart",
    ],
    "low": ["do'st", "yaxshi", "narx", "arzon", "chegirma", "sotish", "xarid"],
}


async def get_active_keywords(db: AsyncSession) -> dict[str, list[str]]:
    result = await db.execute(select(Keyword).where(Keyword.is_active == True))
    rows = result.scalars().all()
    if not rows:
        return DEFAULT_KEYWORDS
    out: dict[str, list[str]] = {"high": [], "mid": [], "low": []}
    for kw in rows:
        if kw.risk_level in out:
            out[kw.risk_level].append(kw.word)
    return out


def detect_keywords(text: str, keywords: dict[str, list[str]]) -> dict[str, list[str]]:
    t = text.lower()
    found: dict[str, list[str]] = {"high": [], "mid": [], "low": []}
    for level, words in keywords.items():
        for w in words:
            if w.lower() in t:
                found[level].append(w)
    return found


def calc_risk_score(found: dict[str, list[str]], text: str) -> int:
    score = 0
    score += len(found["high"]) * 25
    score += len(found["mid"]) * 12
    score += len(found["low"]) * 4
    if "@" in text:
        score += 10
    if re.search(r"закладка|zakladka|klad", text, re.IGNORECASE):
        score += 30
    if re.search(r"bot|kanal|guruh", text, re.IGNORECASE):
        score += 8
    return min(score, 100)


async def create_keyword(db: AsyncSession, data: KeywordCreate, user_id=None) -> Keyword:
    kw = Keyword(word=data.word.lower(), risk_level=data.risk_level, language=data.language, added_by=user_id)
    db.add(kw)
    await db.flush()
    return kw


async def list_keywords(db: AsyncSession, risk_level: str | None = None) -> list[Keyword]:
    q = select(Keyword)
    if risk_level:
        q = q.where(Keyword.risk_level == risk_level)
    result = await db.execute(q.order_by(Keyword.risk_level, Keyword.word))
    return list(result.scalars().all())


async def delete_keyword(db: AsyncSession, keyword_id: int) -> bool:
    result = await db.execute(delete(Keyword).where(Keyword.id == keyword_id))
    return result.rowcount > 0


async def update_keyword(db: AsyncSession, keyword_id: int, data: KeywordUpdate) -> Keyword | None:
    result = await db.execute(select(Keyword).where(Keyword.id == keyword_id))
    kw = result.scalar_one_or_none()
    if not kw:
        return None
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(kw, field, val)
    return kw


async def bulk_create_keywords(db: AsyncSession, words: list[KeywordCreate], user_id=None) -> list[Keyword]:
    created = []
    for item in words:
        existing = await db.execute(
            select(Keyword).where(Keyword.word == item.word.lower(), Keyword.risk_level == item.risk_level)
        )
        if not existing.scalar_one_or_none():
            kw = Keyword(word=item.word.lower(), risk_level=item.risk_level, language=item.language, added_by=user_id)
            db.add(kw)
            created.append(kw)
    await db.flush()
    return created
