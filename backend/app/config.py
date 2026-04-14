from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    environment: str = "development"
    port: int = 8000
    
    # DB
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sage_raksha"
    
    # Auth
    jwt_secret_key: str = "your-super-secret-development-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
