from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User, Tenant
from app.schemas.token import Token
from app.schemas.user import UserRegister, User as UserSchema

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_tenant_and_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister,
) -> Any:
    """
    Create new tenant and admin user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    tenant = db.query(Tenant).filter(Tenant.cuit_rut == user_in.tenant_cuit).first()
    if tenant:
        raise HTTPException(
            status_code=400,
            detail="A tenant with this CUIT/RUT already exists.",
        )
    
    # Create Tenant
    db_tenant = Tenant(
        commercial_name=user_in.tenant_name,
        legal_name=user_in.tenant_name,
        cuit_rut=user_in.tenant_cuit,
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)

    # Create User
    db_user = User(
        tenant_id=db_tenant.id,
        name=user_in.user_name,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role="admin"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
