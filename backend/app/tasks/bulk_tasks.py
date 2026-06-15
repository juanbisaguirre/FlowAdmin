import pandas as pd
from celery import shared_task
from app.worker import get_db_session
from app.db.models import Customer, Invoice, InvoiceItem
from decimal import Decimal
import uuid
from typing import List

@shared_task(bind=True, name="process_bulk_invoices")
def process_bulk_invoices(self, file_path: str, tenant_id: str):
    """
    Lee un archivo excel, valida clientes e inserta borradores de facturas.
    El excel debe tener columnas: document_number, invoice_type, issue_date, due_date, description, quantity, unit_price, tax_rate
    """
    # Initialize DB session
    db_gen = get_db_session()
    db = next(db_gen)
    
    try:
        # Update state to started
        self.update_state(state='PROGRESS', meta={'message': 'Leyendo archivo...'})
        
        # Read excel using pandas
        df = pd.read_excel(file_path)
        
        total_rows = len(df)
        success_count = 0
        errors = []
        
        # Group by customer and invoice to support multiple items per invoice if needed
        # For simplicity in MVP, each row is a single invoice with one item.
        
        for index, row in df.iterrows():
            try:
                document_number = str(row['document_number']).strip()
                
                # Verify customer
                customer = db.query(Customer).filter(
                    Customer.document_number == document_number,
                    Customer.tenant_id == tenant_id
                ).first()
                
                if not customer:
                    errors.append(f"Fila {index+2}: Cliente con documento {document_number} no encontrado.")
                    continue
                
                # Calculate totals
                quantity = Decimal(str(row['quantity']))
                unit_price = Decimal(str(row['unit_price']))
                tax_rate = Decimal(str(row['tax_rate']))
                
                subtotal = quantity * unit_price
                tax = subtotal * (tax_rate / Decimal("100.0"))
                total = subtotal + tax
                
                invoice_id = str(uuid.uuid4())
                
                # Create invoice
                db_invoice = Invoice(
                    id=invoice_id,
                    tenant_id=tenant_id,
                    customer_id=customer.id,
                    invoice_type=str(row['invoice_type']),
                    issue_date=pd.to_datetime(row['issue_date']).date(),
                    due_date=pd.to_datetime(row['due_date']).date(),
                    subtotal=subtotal,
                    taxes=tax,
                    total=total,
                    status="draft"
                )
                
                # Create single item
                db_item = InvoiceItem(
                    id=str(uuid.uuid4()),
                    invoice_id=invoice_id,
                    description=str(row['description']),
                    quantity=quantity,
                    unit_price=unit_price,
                    tax_rate=tax_rate,
                    total=total
                )
                
                db.add(db_invoice)
                db.add(db_item)
                
                success_count += 1
                
            except Exception as e:
                errors.append(f"Fila {index+2}: Error procesando - {str(e)}")
        
        db.commit()
        
        return {
            "status": "completed",
            "total_processed": total_rows,
            "success_count": success_count,
            "error_count": len(errors),
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
