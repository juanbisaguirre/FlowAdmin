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
    from app.db.models import Customer
    # Verify customer belongs to tenant
    customer = db.query(Customer).filter(
        Customer.id == invoice_in.customer_id,
        Customer.tenant_id == current_user.tenant_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Calculate total and items totals
    invoice_subtotal = Decimal("0.0")
    invoice_taxes = Decimal("0.0")
    invoice_total = Decimal("0.0")
    db_items = []
    
    # We will generate IDs manually so we can link them
    invoice_id = str(uuid.uuid4())
    
    for item in invoice_in.items:
        # Calculate subtotal + tax
        item_subtotal = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
        item_tax = item_subtotal * (Decimal(str(item.tax_rate)) / Decimal("100.0"))
        item_total = item_subtotal + item_tax
        
        invoice_subtotal += item_subtotal
        invoice_taxes += item_tax
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
        customer_id=invoice_in.customer_id,
        invoice_type=invoice_in.invoice_type,
        issue_date=invoice_in.issue_date,
        due_date=invoice_in.due_date,
        subtotal=invoice_subtotal,
        taxes=invoice_taxes,
        total=invoice_total,
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
    Emit invoice using TusFacturasAPP integration via BillingService.
    """
    invoice = db.query(Invoice).filter(
        Invoice.tenant_id == current_user.tenant_id,
        Invoice.id == id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if invoice.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft invoices can be emitted")
        
    # Get Customer
    from app.db.models import Customer
    customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
    
    # Process emission using BillingService
    from app.services.billing.service import BillingService
    try:
        billing_service = BillingService(db=db, tenant_id=current_user.tenant_id)
        invoice = billing_service.process_invoice_emission(invoice, customer)
    except Exception as e:
        import logging
        logging.error(f"Emission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Billing provider error: {str(e)}")
        
    return invoice

@router.get("/{id}/pdf")
def get_invoice_pdf_url(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get signed URL to download PDF from S3.
    """
    invoice = db.query(Invoice).filter(
        Invoice.tenant_id == current_user.tenant_id,
        Invoice.id == id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if not invoice.pdf_url:
        raise HTTPException(status_code=404, detail="PDF not available yet")
        
    from app.services.storage.s3 import S3StorageService
    s3_service = S3StorageService()
    url = s3_service.generate_presigned_url(invoice.pdf_url)
    
    return {"url": url}
