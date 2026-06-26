import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.action import Action
from app.schemas.action import ActionCreate
from app.utils.audit import log_action


async def create_action(db: AsyncSession, data: ActionCreate, user_id: uuid.UUID | None = None) -> Action:
    action = Action(
        scan_id=data.scan_id,
        user_id=user_id,
        action_type=data.action_type,
        agency=data.agency,
        priority=data.priority,
        note=data.note,
    )
    db.add(action)
    await db.flush()
    await log_action(db, f"action.{data.action_type}", user_id=user_id, entity_type="action", entity_id=action.id)
    return action


async def list_actions(
    db: AsyncSession, scan_id: uuid.UUID | None = None, page: int = 1, per_page: int = 20
) -> list[Action]:
    q = select(Action)
    if scan_id:
        q = q.where(Action.scan_id == scan_id)
    result = await db.execute(q.order_by(Action.created_at.desc()).offset((page - 1) * per_page).limit(per_page))
    return list(result.scalars().all())


async def update_action_status(db: AsyncSession, action_id: uuid.UUID, new_status: str) -> Action | None:
    result = await db.execute(select(Action).where(Action.id == action_id))
    action = result.scalar_one_or_none()
    if action:
        action.status = new_status
    return action
