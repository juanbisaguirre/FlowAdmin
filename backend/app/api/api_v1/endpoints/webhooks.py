from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import logging

from app.api import deps
from app.db.models import Invoice

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/tusfacturas")
async def tusfacturas_webhook(
    request: Request,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Webhook for receiving updates from TusFacturasAPP
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
        
    logger.info(f"Received webhook from TusFacturas: {payload}")
    
    # Process webhook payload
    # Usually contains: invoice_number, status, cae, etc.
    # For MVP we just log and accept
    
    # Example logic:
    # invoice_id = payload.get("internal_id")
    # status = payload.get("status")
    # if invoice_id and status:
    #     invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    #     if invoice:
    #         invoice.status = status
    #         db.commit()
    
    return {"status": "received"}

from app.core.limiter import limiter
from app.db.models import User

@router.post("/bot-command")
@limiter.limit("5/minute")
async def process_bot_command(
    request: Request,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Webhook for processing commands from external bots like n8n.
    Protected by rate limiter (5 per minute) and requires authentication.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
        
    command = payload.get("command")
    
    if not command:
        raise HTTPException(status_code=400, detail="Missing command in payload")
        
    logger.info(f"Received bot command: {command} from tenant {current_user.tenant_id}")
    
    return {
        "status": "accepted",
        "message": f"Command '{command}' is being processed.",
        "tenant_id": current_user.tenant_id
    }
