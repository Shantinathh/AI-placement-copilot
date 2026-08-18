import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb+srv://admin:shps36122537@cluster0.notdabx.mongodb.net/?appName=Cluster0")
    DB_NAME: str = os.getenv("DB_NAME", "placement_copilot")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-placement-copilot-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
