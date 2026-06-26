from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class KeywordCreate(BaseModel):
    word: str = Field(..., min_length=1, max_length=128)
    risk_level: str = Field(..., pattern="^(high|mid|low)$")
    language: Optional[str] = None


class KeywordUpdate(BaseModel):
    word: Optional[str] = None
    risk_level: Optional[str] = None
    is_active: Optional[bool] = None


class KeywordResponse(BaseModel):
    id: int
    word: str
    risk_level: str
    language: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class KeywordBulkCreate(BaseModel):
    keywords: list[KeywordCreate]
