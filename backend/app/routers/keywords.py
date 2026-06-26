from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.keyword import KeywordCreate, KeywordUpdate, KeywordResponse, KeywordBulkCreate
from app.services import keyword_service

router = APIRouter(prefix="/api/v1/keywords", tags=["keywords"])


@router.get("", response_model=list[KeywordResponse])
async def list_keywords(
    risk_level: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await keyword_service.list_keywords(db, risk_level)


@router.post("", response_model=KeywordResponse, status_code=status.HTTP_201_CREATED)
async def create_keyword(
    data: KeywordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await keyword_service.create_keyword(db, data, current_user.id)


@router.patch("/{keyword_id}", response_model=KeywordResponse)
async def update_keyword(
    keyword_id: int,
    data: KeywordUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    kw = await keyword_service.update_keyword(db, keyword_id, data)
    if not kw:
        raise HTTPException(status_code=404, detail="Kalit so'z topilmadi")
    return kw


@router.delete("/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_keyword(
    keyword_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin", "analyst")),
):
    deleted = await keyword_service.delete_keyword(db, keyword_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Kalit so'z topilmadi")


@router.post("/bulk", response_model=list[KeywordResponse], status_code=status.HTTP_201_CREATED)
async def bulk_create(
    data: KeywordBulkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await keyword_service.bulk_create_keywords(db, data.keywords, current_user.id)
