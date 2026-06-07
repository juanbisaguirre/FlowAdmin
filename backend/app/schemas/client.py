from typing import Optional
from pydantic import BaseModel, EmailStr

class ClientBase(BaseModel):
    legal_name: str
    commercial_name: Optional[str] = None
    cuit: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = "active"

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    legal_name: Optional[str] = None
    commercial_name: Optional[str] = None
    cuit: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class ClientInDBBase(ClientBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class Client(ClientInDBBase):
    pass
