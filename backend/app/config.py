import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ETHERSCAN_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./traceforge.db"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    APP_NAME: str = "TraceForge AML Forensics API"
    GOOGLE_API_KEY: str = ""
    GOOGLE_CSE_ID: str = ""
    SEARCH_API_KEY: str = ""
    GROK_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    COPILOT_API_KEY: str = ""
    ALCHEMY_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
