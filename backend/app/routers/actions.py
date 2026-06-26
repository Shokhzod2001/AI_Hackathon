import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.action import ActionCreate, ActionResponse, ActionStatusUpdate
from app.services import action_service

router = APIRouter(prefix="/api/v1/actions", tags=["actions"])


@router.post("", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
async def create_action(
    data: ActionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await action_service.create_action(db, data, current_user.id)


@router.get("", response_model=list[ActionResponse])
async def list_actions(
    scan_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await action_service.list_actions(db, scan_id, page)


@router.patch("/{action_id}", response_model=ActionResponse)
async def update_action(
    action_id: uuid.UUID,
    data: ActionStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    action = await action_service.update_action_status(db, action_id, data.status)
    if not action:
        raise HTTPException(status_code=404, detail="Amal topilmadi")
    return action
