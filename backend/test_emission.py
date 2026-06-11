import sys
import os
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User, Customer, Invoice, InvoiceItem
from app.services.billing.service import BillingService
from app.schemas.invoice import InvoiceCreate, InvoiceItemCreate
from datetime import date
from decimal import Decimal

def main():
    db = SessionLocal()
    try:
        # Create or get a user
        user = db.query(User).first()
        if not user:
            print("No users found in database.")
            return

        print(f"Using user: {user.email}")

        # Create or get a customer
        customer = db.query(Customer).filter_by(tenant_id=user.tenant_id).first()
        if not customer:
            print("Creating mock customer...")
            customer = Customer(
                tenant_id=user.tenant_id,
                business_name="Test Acme Corp",
                document_type="CUIT",
                document_number="30111111118",
                address="Test St 123",
                vat_condition="Responsable Inscripto",
                email="test@acme.com"
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        
        print(f"Using customer: {customer.business_name}")

        # Create or get billing credentials
        from app.db.models import CompanyBillingCredentials
        creds = db.query(CompanyBillingCredentials).filter_by(tenant_id=user.tenant_id).first()
        if not creds:
            print("Creating mock billing credentials...")
            creds = CompanyBillingCredentials(
                tenant_id=user.tenant_id,
                apikey="mock_apikey",
                apitoken="mock_apitoken"
            )
            db.add(creds)
            db.commit()

        # Create a mock invoice
        print("Creating mock invoice...")
        import uuid
        invoice_id = str(uuid.uuid4())
        
        invoice = Invoice(
            id=invoice_id,
            tenant_id=user.tenant_id,
            customer_id=customer.id,
            invoice_type="A",
            issue_date=date.today(),
            due_date=date.today(),
            subtotal=Decimal("100.0"),
            taxes=Decimal("21.0"),
            total=Decimal("121.0"),
            status="draft"
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        print(f"Emitting invoice {invoice.id}...")
        
        billing_service = BillingService(db=db, tenant_id=user.tenant_id)
        invoice = billing_service.process_invoice_emission(invoice, customer)
        
        print(f"Invoice status: {invoice.status}")
        print(f"Invoice CAE: {invoice.cae}")
        print(f"Invoice error_message: {invoice.error_message}")
        print(f"Invoice pdf_url: {invoice.pdf_url}")

    except Exception as e:
        print(f"Exception during testing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
