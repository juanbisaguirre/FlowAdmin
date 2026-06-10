from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UploadedFileBase(BaseModel):
    file_name: str
    original_name: str
    content_type: Optional[str] = None

class UploadedFileCreate(UploadedFileBase):
    tenant_id: str

class UploadedFileResponse(UploadedFileBase):
    id: str
    tenant_id: str
    created_at: datetime
    url: Optional[str] = None

    class Config:
        from_attributes = True
