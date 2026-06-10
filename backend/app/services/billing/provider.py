from abc import ABC, abstractmethod
from typing import Dict, Any

class BillingProvider(ABC):
    
    @abstractmethod
    def validate_customer(self, customer: Any) -> bool:
        """Validates if the customer has the correct fields for the provider"""
        pass
        
    @abstractmethod
    def build_payload(self, invoice: Any, customer: Any, items: list) -> Dict:
        """Builds the provider-specific payload"""
        pass
        
    @abstractmethod
    def emit_invoice(self, payload: Dict, credentials: Any) -> Dict:
        """Sends the request to the provider to emit the invoice"""
        pass
        
    @abstractmethod
    def get_pdf(self, invoice_id: str, credentials: Any) -> bytes:
        """Retrieves the generated PDF from the provider"""
        pass
