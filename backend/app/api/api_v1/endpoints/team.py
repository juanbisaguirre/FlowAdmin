from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import User as UserSchema, UserCreate
from app.core.security import get_password_hash

router = APIRouter()

@router.get("", response_model=List[UserSchema])
def read_team_members(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all users in the same tenant.
    """
    users = db.query(User).filter(
        User.tenant_id == current_user.tenant_id,
        User.is_active == True
    ).offset(skip).limit(limit).all()
    return users

@router.post("", response_model=UserSchema)
def invite_team_member(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    role: str = "user",
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Invite a new team member. Only admins can do this.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    db_user = User(
        tenant_id=current_user.tenant_id,
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def remove_team_member(
    *,
    db: Session = Depends(get_db),
    user_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove a team member (logical delete). Only admins can do this.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Users cannot delete themselves")

    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = False
    db.commit()
    
    return {"message": "User removed successfully"}
