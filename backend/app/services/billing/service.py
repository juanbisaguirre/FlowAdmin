from typing import Any
from sqlalchemy.orm import Session
from app.db.models import Invoice, Customer, CompanyBillingCredentials
from app.services.billing.provider import BillingProvider
from app.services.billing.tusfacturas import TusFacturasProvider
import logging

logger = logging.getLogger(__name__)

class BillingService:
    def __init__(self, db: Session, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id
        
        # In the future, this can be resolved dynamically based on tenant config
        self.provider: BillingProvider = TusFacturasProvider()

    def get_credentials(self) -> CompanyBillingCredentials:
        credentials = self.db.query(CompanyBillingCredentials).filter(
            CompanyBillingCredentials.tenant_id == self.tenant_id
        ).first()
        return credentials

    def process_invoice_emission(self, invoice: Invoice, customer: Customer) -> Invoice:
        """
        Orchestrates the emission of an invoice using the configured provider.
        """
        logger.info(f"Starting emission process for invoice {invoice.id}")
        
        credentials = self.get_credentials()
        if not credentials:
            raise ValueError("Billing credentials not configured for this company.")

        if not self.provider.validate_customer(customer):
            raise ValueError("Customer is missing required fields for electronic billing.")

        # Build payload
        payload = self.provider.build_payload(invoice, customer, invoice.items)
        
        # Update status to processing
        invoice.status = "processing"
        self.db.commit()

        try:
            # Emit via provider
            response = self.provider.emit_invoice(payload, credentials)
            
            if response.get("status") == "success":
                # Success!
                invoice.status = "approved"
                invoice.cae = response.get("cae")
                invoice.invoice_number = response.get("invoice_number")
                
                # Try to parse expiration date
                from datetime import datetime
                cae_exp = response.get("cae_expiration")
                if cae_exp:
                    invoice.cae_expiration = datetime.strptime(cae_exp, "%d/%m/%Y").date()
                
                logger.info(f"Invoice {invoice.id} approved. CAE: {invoice.cae}")
            else:
                # Rejected
                invoice.status = "rejected"
                invoice.error_message = response.get("error_message") or "Provider rejected the request"
                logger.error(f"Invoice {invoice.id} rejected by provider. Response: {response}")

            self.db.commit()
            
            # If approved, get PDF and upload to S3 (to be implemented next)
            if invoice.status == "approved":
                self._handle_pdf_and_s3(invoice, credentials)
                
        except Exception as e:
            logger.error(f"Error during invoice emission: {str(e)}")
            invoice.status = "rejected" 
            invoice.error_message = f"Internal emission error: {str(e)}"
            self.db.commit()

        return invoice

    def _handle_pdf_and_s3(self, invoice: Invoice, credentials: Any):
        try:
            from app.core.pdf_service import generate_invoice_pdf
            from app.db.models import Tenant
            
            tenant = self.db.query(Tenant).filter(Tenant.id == self.tenant_id).first()
            customer = self.db.query(Customer).filter(Customer.id == invoice.customer_id).first()
            
            pdf_bytes = generate_invoice_pdf(invoice, customer, tenant.commercial_name if tenant else "Empresa")
            
            from app.services.storage.s3 import S3StorageService
            s3_service = S3StorageService()
            
            file_name = f"facturas/{invoice.tenant_id}/{invoice.id}.pdf"
            s3_service.upload_file(file_name, pdf_bytes, content_type='application/pdf')
            
            invoice.pdf_url = file_name
            self.db.commit()
            
            logger.info(f"PDF for invoice {invoice.id} uploaded to S3 at {file_name}")
        except Exception as e:
            logger.error(f"Failed to handle PDF and S3 upload for invoice {invoice.id}: {e}")
