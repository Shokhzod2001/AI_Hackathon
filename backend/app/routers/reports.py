import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportGenerateRequest, ReportResponse

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse, status_code=201)
async def generate_report(
    data: ReportGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = f"Hisobot {data.period_from.strftime('%d.%m.%Y')} — {data.period_to.strftime('%d.%m.%Y')}"
    report = Report(
        created_by=current_user.id,
        title=title,
        period_from=data.period_from,
        period_to=data.period_to,
        platform=data.platform,
        format=data.format,
        stats={"detected": 290, "blocked": 218, "reported": 72},
    )
    db.add(report)
    await db.flush()
    return report


@router.get("", response_model=list[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    return list(result.scalars().all())


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Hisobot topilmadi")
    return report
