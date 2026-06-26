import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.scan import (
    ScanCreateRequest, ScanResponse, ScanListResponse, ScanStatusUpdate,
    DashboardStats, WeeklyStats, PlatformStats, TopKeyword, MonthlyStats,
)
from app.services import scan_service

router = APIRouter(prefix="/api/v1/scans", tags=["scans"])


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    data: ScanCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await scan_service.create_scan(db, data, current_user.id)


@router.get("/stats/summary", response_model=DashboardStats)
async def dashboard_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await scan_service.get_dashboard_stats(db)


@router.get("/stats/weekly", response_model=WeeklyStats)
async def weekly_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await scan_service.get_weekly_stats(db)


@router.get("/stats/by-platform", response_model=PlatformStats)
async def platform_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await scan_service.get_platform_stats(db)


@router.get("/stats/top-keywords", response_model=list[TopKeyword])
async def top_keywords(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await scan_service.get_top_keywords(db)


@router.get("/stats/monthly", response_model=MonthlyStats)
async def monthly_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    return await scan_service.get_monthly_stats(db)


@router.get("", response_model=ScanListResponse)
async def list_scans(
    platform: str | None = None,
    scan_status: str | None = Query(None, alias="status"),
    risk_min: int | None = None,
    risk_max: int | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = await scan_service.list_scans(db, platform, scan_status, risk_min, risk_max, search, page, per_page)
    return ScanListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    scan = await scan_service.get_scan(db, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Skan topilmadi")
    return scan


@router.patch("/{scan_id}/status", response_model=ScanResponse)
async def update_status(
    scan_id: uuid.UUID,
    data: ScanStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    scan = await scan_service.update_scan_status(db, scan_id, data.status)
    if not scan:
        raise HTTPException(status_code=404, detail="Skan topilmadi")
    return scan


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(
    scan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    deleted = await scan_service.delete_scan(db, scan_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Skan topilmadi")
