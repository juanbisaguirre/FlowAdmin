from typing import Optional, List
from pydantic import BaseModel
from datetime import date

# --- Invoice Item ---
class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float
    tax_rate: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemSchema(InvoiceItemBase):
    id: str
    invoice_id: str
    total: float

    class Config:
        from_attributes = True

# --- Invoice ---
class InvoiceBase(BaseModel):
    invoice_type: str
    issue_date: date
    due_date: Optional[date] = None

class InvoiceCreate(InvoiceBase):
    customer_id: str
    items: List[InvoiceItemCreate]

class InvoiceSchema(InvoiceBase):
    id: str
    tenant_id: str
    customer_id: str
    invoice_number: Optional[str] = None
    status: str
    subtotal: float
    taxes: float
    total: float
    cae: Optional[str] = None
    cae_expiration: Optional[date] = None
    pdf_url: Optional[str] = None
    error_message: Optional[str] = None
    items: List[InvoiceItemSchema] = []

    class Config:
        from_attributes = True
