import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FlowAdmin"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # POSTGRES
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "flowadmin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "flowadmin_password")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "flowadmin_db")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # AUTH
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-jwt-development-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        case_sensitive = True

settings = Settings()
