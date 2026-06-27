import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ScanCreateRequest(BaseModel):
    content_text: str = Field(..., max_length=5000)
    platform: str = Field(..., pattern="^(telegram|instagram|olx|darkweb|other)$")
    source_url: Optional[str] = None
    city: Optional[str] = None


class ScanResponse(BaseModel):
    id: uuid.UUID
    platform: str
    source_url: Optional[str]
    content_text: str
    risk_score: int
    verdict: str
    category: Optional[str]
    language: Optional[str]
    threat_type: Optional[str]
    keywords_found: Optional[list[str]]
    ai_explanation: Optional[str]
    city: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanListResponse(BaseModel):
    items: list[ScanResponse]
    total: int
    page: int
    per_page: int


class ScanStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|blocked|reported|archived)$")


class DashboardStats(BaseModel):
    total_detected: int
    total_pending: int
    total_blocked: int
    total_reported: int


class WeeklyStats(BaseModel):
    labels: list[str]
    detected: list[int]
    blocked: list[int]


class PlatformStats(BaseModel):
    labels: list[str]
    values: list[int]


class TopKeyword(BaseModel):
    word: str
    count: int


class MonthlyStats(BaseModel):
    labels: list[str]
    values: list[int]
