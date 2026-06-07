from typing import Optional, List
from pydantic import BaseModel, condecimal
from datetime import date

# --- Invoice Item ---
class InvoiceItemBase(BaseModel):
    description: str
    quantity: condecimal(max_digits=10, decimal_places=2)
    unit_price: condecimal(max_digits=10, decimal_places=2)
    tax_rate: condecimal(max_digits=5, decimal_places=2)

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemInDBBase(InvoiceItemBase):
    id: str
    invoice_id: str
    total: condecimal(max_digits=10, decimal_places=2)

    class Config:
        from_attributes = True

class InvoiceItem(InvoiceItemInDBBase):
    pass

# --- Invoice ---
class InvoiceBase(BaseModel):
    client_id: str
    invoice_type: str # A, B, C, NC, ND
    issue_date: date
    due_date: Optional[date] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceInDBBase(InvoiceBase):
    id: str
    tenant_id: str
    cae: Optional[str] = None
    total_amount: condecimal(max_digits=10, decimal_places=2)
    status: str
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

class Invoice(InvoiceInDBBase):
    items: List[InvoiceItem] = []
