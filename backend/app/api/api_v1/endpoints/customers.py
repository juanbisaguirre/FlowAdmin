from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import User, Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerSchema

router = APIRouter()

@router.get("", response_model=List[CustomerSchema])
def read_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve customers for the current tenant.
    """
    customers = db.query(Customer).filter(
        Customer.tenant_id == current_user.tenant_id,
        Customer.status == "active"
    ).offset(skip).limit(limit).all()
    return customers

@router.post("", response_model=CustomerSchema)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    item_in: CustomerCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new customer.
    """
    customer = Customer(
        **item_in.model_dump(),
        tenant_id=current_user.tenant_id
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
