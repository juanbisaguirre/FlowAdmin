from celery import shared_task
from app.worker import get_db_session
from app.db.models import Invoice, Customer
from app.services.billing.service import BillingService
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="emit_invoice_task", max_retries=3, default_retry_delay=60)
def emit_invoice_task(self, invoice_id: str, tenant_id: str):
    """
    Emite una factura usando el proveedor configurado de forma asíncrona.
    """
    db_gen = get_db_session()
    db = next(db_gen)
    try:
        invoice = db.query(Invoice).filter(
            Invoice.id == invoice_id,
            Invoice.tenant_id == tenant_id
        ).first()
        
        if not invoice:
            logger.error(f"Invoice {invoice_id} not found in task")
            return
            
        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
        
        billing_service = BillingService(db=db, tenant_id=tenant_id)
        
        try:
            billing_service.process_invoice_emission(invoice, customer)
        except Exception as exc:
            # If API fails or rate limits, retry
            logger.warning(f"Error emitting invoice {invoice_id}, retrying...")
            raise self.retry(exc=exc)
            
        return {"status": "success", "invoice_id": invoice_id}
        
    except Exception as e:
        logger.error(f"Fatal error in emit_invoice_task: {str(e)}")
        raise e
    finally:
        db.close()
