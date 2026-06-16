import os
from celery import Celery
from app.core.config import settings

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "gestionapp_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(['app.tasks'])

from app.db.database import SessionLocal

def get_db_session():
    """Retorna una sesión de DB para uso en Celery tasks."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
