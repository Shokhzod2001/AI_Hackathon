import uuid
from datetime import datetime, date, timedelta
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class ReportGenerateRequest(BaseModel):
    period_from: Optional[date] = None
    period_to: Optional[date] = None
    platform: Optional[str] = None
    format: str = Field(default="json", pattern="^(pdf|excel|json)$")
    email: Optional[str] = None

    @model_validator(mode="after")
    def set_defaults(self) -> "ReportGenerateRequest":
        today = date.today()
        if self.period_to is None:
            self.period_to = today
        if self.period_from is None:
            self.period_from = today - timedelta(days=30)
        return self


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
