from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    BOT_TOKEN: SecretStr
    WEBAPP_URL: str
    WEBHOOK_URL: str
    WEBHOOK_PATH: str = "/webhook"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8"
    )

config = Settings()