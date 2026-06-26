from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "NarkoMonitor API"
    debug: bool = False
    app_env: str = "development"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/narkomonitor"
    redis_url: str = "redis://localhost:6379/0"

    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"
    claude_max_tokens: int = 800
    claude_timeout: float = 10.0

    uzinfocom_api_url: str = ""
    uzinfocom_api_key: str = ""

    telegram_bot_token: str = ""
    telegram_notify_chat_id: str = ""

    jwt_secret_key: str = "change-this-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "narkomonitor-reports"

    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    auto_block_threshold: int = 85

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
