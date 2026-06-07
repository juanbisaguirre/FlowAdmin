from typing import Any, List
import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.db.models import Invoice, InvoiceItem, User, Client
from app.schemas.invoice import Invoice as InvoiceSchema, InvoiceCreate

router = APIRouter()

@router.get("/", response_model=List[InvoiceSchema])
def read_invoices(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve invoices for the current tenant.
    """
    invoices = db.query(Invoice).filter(Invoice.tenant_id == current_user.tenant_id).offset(skip).limit(limit).all()
    return invoices

@router.post("/", response_model=InvoiceSchema)
def create_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_in: InvoiceCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new invoice and its items.
    """
    # Verify client belongs to tenant
    client = db.query(Client).filter(
        Client.id == invoice_in.client_id,
        Client.tenant_id == current_user.tenant_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Calculate total and items totals
    invoice_total = Decimal("0.0")
    db_items = []
    
    # We will generate IDs manually so we can link them
    invoice_id = str(uuid.uuid4())
    
    for item in invoice_in.items:
        # Calculate subtotal + tax
        item_subtotal = item.quantity * item.unit_price
        item_tax = item_subtotal * (item.tax_rate / Decimal("100.0"))
        item_total = item_subtotal + item_tax
        invoice_total += item_total
        
        db_items.append(
            InvoiceItem(
                id=str(uuid.uuid4()),
                invoice_id=invoice_id,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                tax_rate=item.tax_rate,
                total=item_total
            )
        )
        
    db_invoice = Invoice(
        id=invoice_id,
        tenant_id=current_user.tenant_id,
        client_id=invoice_in.client_id,
        invoice_type=invoice_in.invoice_type,
        issue_date=invoice_in.issue_date,
        due_date=invoice_in.due_date,
        total_amount=invoice_total,
        status="draft" # initial status
    )
    
    db.add(db_invoice)
    # Add items
    for db_item in db_items:
        db.add(db_item)
        
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.post("/{id}/emit", response_model=InvoiceSchema)
def emit_invoice(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Emit invoice (Mock integration with AFIP or electronic billing).
    Generates a mock CAE and changes status to 'sent'.
    """
    invoice = db.query(Invoice).filter(
        Invoice.tenant_id == current_user.tenant_id,
        Invoice.id == id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if invoice.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft invoices can be emitted")
        
    # Mock CAE generation
    import random
    invoice.cae = "".join([str(random.randint(0, 9)) for _ in range(14)])
    invoice.status = "sent"
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
