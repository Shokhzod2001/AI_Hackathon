import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ActionCreate(BaseModel):
    scan_id: uuid.UUID
    action_type: str = Field(..., pattern="^(block_request|report|archive|review)$")
    agency: Optional[str] = None
    priority: Optional[str] = None
    note: Optional[str] = None


class ActionResponse(BaseModel):
    id: uuid.UUID
    scan_id: uuid.UUID
    action_type: str
    agency: Optional[str]
    priority: Optional[str]
    note: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ActionStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(sent|confirmed|rejected)$")
