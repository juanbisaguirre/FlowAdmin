from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from typing import Any
import os
import uuid
import shutil
from app.api import deps
from app.db.models import User
from app.tasks.bulk_tasks import process_bulk_invoices
from app.worker import celery_app
from celery.result import AsyncResult

router = APIRouter()

UPLOAD_DIR = "/tmp/gestionapp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
def upload_bulk_invoices(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Sube un archivo Excel para crear borradores de facturas de forma masiva.
    Devuelve un task_id para consultar el estado.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
    # Save file temporarily
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Dispatch Celery task
    task = process_bulk_invoices.delay(file_path, current_user.tenant_id)
    
    return {"task_id": task.id, "message": "Bulk upload process started"}

@router.get("/tasks/{task_id}")
def get_task_status(
    task_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Consulta el estado de una tarea de carga masiva en segundo plano.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.status,
    }
    
    if task_result.status == 'SUCCESS':
        response["result"] = task_result.result
    elif task_result.status == 'FAILURE':
        response["error"] = str(task_result.info)
    elif task_result.status == 'PROGRESS':
        response["progress"] = task_result.info
        
    return response
