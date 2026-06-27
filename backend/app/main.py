from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, scans, keywords, actions, reports, map, dashboard, admin, ws, ml, crawler
from app.ml import DrugJargonDetector


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Warm up ML model (loads or trains from corpus, ~1-2s)
    DrugJargonDetector.get()
    yield
    await engine.dispose()


app = FastAPI(title=settings.app_name, version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [auth.router, scans.router, keywords.router, actions.router,
          reports.router, map.router, dashboard.router, admin.router, ws.router, ml.router,
          crawler.router]:
    app.include_router(r)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
