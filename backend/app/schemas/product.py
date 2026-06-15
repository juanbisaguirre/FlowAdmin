from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    code: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: float
    vat_rate: float
    unit: str = "unidades"
    active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    price: Optional[float] = None
    vat_rate: Optional[float] = None

class Product(ProductBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True
