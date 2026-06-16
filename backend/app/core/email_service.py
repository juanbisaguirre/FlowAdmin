import smtplib
import logging
from email.message import EmailMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_invoice_email(to_email: str, subject: str, body: str, pdf_bytes: bytes, filename: str):
    """
    Send an email with the PDF invoice attached.
    Since we don't have real SMTP credentials yet, this will log the action.
    """
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = "noreply@gestionapp.com" # Should be configurable
    msg['To'] = to_email
    
    msg.set_content(body)
    
    # Attach PDF
    msg.add_attachment(
        pdf_bytes,
        maintype='application',
        subtype='pdf',
        filename=filename
    )
    
    # Mocking SMTP send for now to avoid crashing without real credentials
    logger.info(f"MOCK: Sending email to {to_email} with subject '{subject}' and attachment '{filename}'")
    
    # Example real implementation:
    # try:
    #     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    #         server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    #         server.send_message(msg)
    # except Exception as e:
    #     logger.error(f"Error sending email: {e}")
