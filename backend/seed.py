"""
Run once to create the initial admin user and seed default keywords.
Usage: python seed.py
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

sys.path.insert(0, ".")

from app.config import settings
from app.database import Base
from app.models.user import User
from app.models.keyword import Keyword
from app.utils.security import hash_password

ADMIN = {
    "username": "admin",
    "email": "admin@clearnet.uz",
    "password": "admin123",
    "role": "admin",
}

DEFAULT_KEYWORDS = [
    # High risk
    ("giyohvand", "high", "uzbek"),
    ("narkotik", "high", "uzbek"),
    ("geroin", "high", "uzbek"),
    ("kokain", "high", "uzbek"),
    ("amfetamin", "high", "uzbek"),
    ("metamfetamin", "high", "uzbek"),
    ("marijuana", "high", "uzbek"),
    ("ganja", "high", "uzbek"),
    ("tur", "high", "uzbek"),
    ("zakladka", "high", "russian"),
    ("klad", "high", "russian"),
    ("закладка", "high", "russian"),
    ("марихуана", "high", "russian"),
    ("героин", "high", "russian"),
    # Mid risk
    ("gul", "mid", "uzbek"),
    ("un", "mid", "uzbek"),
    ("qand", "mid", "uzbek"),
    ("tovar", "mid", "uzbek"),
    ("etkazib", "mid", "uzbek"),
    ("reklama", "mid", "uzbek"),
    ("sifatli", "mid", "uzbek"),
    # Low risk
    ("narx", "low", "uzbek"),
    ("arzon", "low", "uzbek"),
    ("sotish", "low", "uzbek"),
    ("xarid", "low", "uzbek"),
]


async def seed():
    engine = create_async_engine(settings.database_url, echo=False)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables created")

    async with Session() as db:
        # Admin user
        existing = (await db.execute(select(User).where(User.username == ADMIN["username"]))).scalar_one_or_none()
        if existing:
            print(f"  Admin user '{ADMIN['username']}' already exists — skipping")
        else:
            user = User(
                username=ADMIN["username"],
                email=ADMIN["email"],
                password_hash=hash_password(ADMIN["password"]),
                role=ADMIN["role"],
                is_active=True,
            )
            db.add(user)
            await db.commit()
            print(f"✓ Admin user created  username={ADMIN['username']}  password={ADMIN['password']}")

        # Keywords
        added = 0
        for word, risk_level, language in DEFAULT_KEYWORDS:
            exists = (await db.execute(
                select(Keyword).where(Keyword.word == word, Keyword.risk_level == risk_level)
            )).scalar_one_or_none()
            if not exists:
                db.add(Keyword(word=word, risk_level=risk_level, language=language, is_active=True))
                added += 1
        await db.commit()
        print(f"✓ Keywords seeded  ({added} new)")

    await engine.dispose()
    print("\nDone. Start the backend with:  uvicorn app.main:app --reload")


if __name__ == "__main__":
    asyncio.run(seed())
