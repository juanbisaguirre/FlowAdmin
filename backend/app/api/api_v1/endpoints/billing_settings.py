from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import User, CompanyBillingCredentials
from app.core.encryption import encrypt, decrypt
from pydantic import BaseModel

router = APIRouter()

class CredentialsUpdate(BaseModel):
    provider: str = "TusFacturas"
    apikey: str
    apitoken: str
    usertoken: str

class CredentialsResponse(BaseModel):
    provider: str
    has_apikey: bool
    has_apitoken: bool
    has_usertoken: bool

@router.get("", response_model=CredentialsResponse)
def get_credentials(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get billing credentials status (without revealing secrets).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    creds = db.query(CompanyBillingCredentials).filter(
        CompanyBillingCredentials.tenant_id == current_user.tenant_id
    ).first()
    
    if not creds:
        return CredentialsResponse(
            provider="TusFacturas",
            has_apikey=False,
            has_apitoken=False,
            has_usertoken=False
        )
        
    return CredentialsResponse(
        provider=creds.provider,
        has_apikey=bool(creds.apikey),
        has_apitoken=bool(creds.apitoken),
        has_usertoken=bool(creds.usertoken)
    )

@router.put("", response_model=CredentialsResponse)
def update_credentials(
    *,
    db: Session = Depends(deps.get_db),
    item_in: CredentialsUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update billing credentials.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    creds = db.query(CompanyBillingCredentials).filter(
        CompanyBillingCredentials.tenant_id == current_user.tenant_id
    ).first()
    
    if not creds:
        creds = CompanyBillingCredentials(
            tenant_id=current_user.tenant_id,
            provider=item_in.provider
        )
        db.add(creds)
        
    creds.apikey = encrypt(item_in.apikey)
    creds.apitoken = encrypt(item_in.apitoken)
    creds.usertoken = encrypt(item_in.usertoken)
    
    db.commit()
    db.refresh(creds)
    
    return CredentialsResponse(
        provider=creds.provider,
        has_apikey=bool(creds.apikey),
        has_apitoken=bool(creds.apitoken),
        has_usertoken=bool(creds.usertoken)
    )
