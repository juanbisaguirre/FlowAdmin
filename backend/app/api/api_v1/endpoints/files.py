from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.services.storage.s3 import S3StorageService
from app.api.deps import get_db, get_current_active_user
from app.db.models import User, UploadedFile
from app.schemas.file import UploadedFileResponse
import uuid

router = APIRouter()
storage_service = S3StorageService()

@router.get("/", response_model=list[UploadedFileResponse])
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all uploaded files for the current user's tenant.
    """
    files = db.query(UploadedFile).filter(UploadedFile.tenant_id == current_user.tenant_id).order_by(UploadedFile.created_at.desc()).all()
    
    for f in files:
        f.url = storage_service.generate_presigned_url(object_name=f.file_name)
        
    return files

@router.post("/upload", response_model=UploadedFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a file to the configured S3 / MinIO bucket and save a record in DB.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"
    
    unique_filename = f"{uuid.uuid4()}-{file.filename}"
    
    object_key = storage_service.upload_file(
        file_name=unique_filename,
        file_bytes=file_bytes,
        content_type=content_type
    )
    
    if not object_key:
        raise HTTPException(status_code=500, detail="Failed to upload file to storage")
        
    db_file = UploadedFile(
        tenant_id=current_user.tenant_id,
        file_name=object_key,
        original_name=file.filename,
        content_type=content_type
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    db_file.url = storage_service.generate_presigned_url(object_name=db_file.file_name)
    return db_file

@router.get("/{file_id}/url")
def get_file_url(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a pre-signed URL to download or view a file by its database ID.
    """
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.tenant_id == current_user.tenant_id
    ).first()
    
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    url = storage_service.generate_presigned_url(object_name=db_file.file_name)
    if not url:
        raise HTTPException(status_code=500, detail="Failed to generate URL for file")
    
    return {"file_name": db_file.original_name, "url": url}
