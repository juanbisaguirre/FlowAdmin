from typing import Optional
from pydantic import BaseModel

class CustomerBase(BaseModel):
    business_name: str
    document_type: Optional[str] = "CUIT"
    document_number: str
    vat_condition: Optional[str] = None
    address: Optional[str] = None
    province: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    business_name: Optional[str] = None
    document_number: Optional[str] = None

class CustomerSchema(CustomerBase):
    id: str
    tenant_id: str
    status: str

    class Config:
        from_attributes = True
