import requests
import json
import logging
from typing import Dict, Any
from app.services.billing.provider import BillingProvider
from app.core.encryption import decrypt

logger = logging.getLogger(__name__)

class TusFacturasProvider(BillingProvider):
    
    BASE_URL = "https://www.tusfacturas.app/app/api/v2"

    def validate_customer(self, customer: Any) -> bool:
        """Validates if the customer has the correct fields for the provider"""
        if not customer.document_number or not customer.vat_condition:
            return False
        return True
        
    def build_payload(self, invoice: Any, customer: Any, items: list) -> Dict:
        """Builds the provider-specific payload"""
        
        # Mapping our vat_condition to TusFacturas condition
        # (Assuming simplified mapping for MVP)
        cliente = {
            "documento_tipo": customer.document_type or "CUIT",
            "documento_nro": customer.document_number,
            "razon_social": customer.business_name,
            "email": customer.email or "",
            "condicion_iva": customer.vat_condition or "Consumidor Final"
        }
        
        comprobante = {
            "tipo": invoice.invoice_type, # e.g. "Factura A"
            "fecha": invoice.issue_date.strftime("%d/%m/%Y"),
            "concepto": "Servicios" # or Productos
        }
        
        detalle = []
        for item in items:
            detalle.append({
                "cantidad": float(item.quantity),
                "producto": item.description,
                "precio_unitario": float(item.unit_price),
                "alicuota": float(item.tax_rate)
            })
            
        payload = {
            "cliente": cliente,
            "comprobante": comprobante,
            "detalle": detalle
        }
        return payload
        
    def emit_invoice(self, payload: Dict, credentials: Any) -> Dict:
        """Sends the request to the provider to emit the invoice"""
        url = f"{self.BASE_URL}/facturacion/nuevo"
        
        apikey = decrypt(credentials.apikey)
        apitoken = decrypt(credentials.apitoken)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {apitoken}" # Or whatever TusFacturas uses
        }
        
        # Inject API key/token into payload if required by TusFacturas
        payload["apikey"] = apikey
        payload["usertoken"] = decrypt(credentials.usertoken)
        
        logger.info(f"Sending request to TusFacturas: {url}")
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                return {"status": "error", "error_message": data.get("error")}
            
            # Mapping assuming standard AFIP-like response from TusFacturas
            return {
                "status": "success",
                "cae": data.get("cae"),
                "cae_expiration": data.get("cae_vto"),
                "invoice_number": data.get("comprobante_nro")
            }
            
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if getattr(e, 'response', None) is not None:
                try:
                    error_msg = e.response.json().get("error", e.response.text)
                except Exception:
                    error_msg = e.response.text
            logger.error(f"TusFacturas API error: {error_msg}")
            return {"status": "error", "error_message": f"Provider API error: {error_msg}"}
        
    def get_pdf(self, invoice_id: str, credentials: Any) -> bytes:
        """Retrieves the generated PDF from the provider"""
        url = f"{self.BASE_URL}/facturacion/pdf/{invoice_id}"
        
        apikey = decrypt(credentials.apikey)
        apitoken = decrypt(credentials.apitoken)
        
        headers = {
            "Authorization": f"Bearer {apitoken}"
        }
        
        try:
            response = requests.get(
                url, 
                headers=headers, 
                params={"apikey": apikey, "usertoken": decrypt(credentials.usertoken)}
            )
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch PDF from TusFacturas: {e}")
            raise Exception(f"PDF Retrieval failed: {str(e)}")
