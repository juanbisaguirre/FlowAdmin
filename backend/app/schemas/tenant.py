from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class TenantBase(BaseModel):
    commercial_name: str
    legal_name: str
    cuit_rut: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class TenantCreate(TenantBase):
    pass

class TenantInDBBase(TenantBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Tenant(TenantInDBBase):
    pass
