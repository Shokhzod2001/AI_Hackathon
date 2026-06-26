import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field


class ReportGenerateRequest(BaseModel):
    period_from: date
    period_to: date
    platform: Optional[str] = None
    format: str = Field(..., pattern="^(pdf|excel|json)$")
    email: Optional[str] = None


class ReportResponse(BaseModel):
    id: uuid.UUID
    title: str
    period_from: date
    period_to: date
    platform: Optional[str]
    format: str
    stats: Optional[dict]
    created_at: datetime

    model_config = {"from_attributes": True}
