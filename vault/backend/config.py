"""
Application configuration loaded from environment variables.

Uses Pydantic Settings to validate and type-check all required
environment variables at startup.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings sourced from environment variables.

    Attributes:
        database_url: Full PostgreSQL connection string.
        anthropic_api_key: API key for Anthropic Claude API.
    """

    database_url: str = "postgresql://vault_user:vault_secret_change_me@db:5432/vault"
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
