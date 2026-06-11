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

@router.put("/{id}", response_model=CustomerSchema)
def update_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    item_in: CustomerUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a customer.
    """
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tenant_id == current_user.tenant_id,
        Customer.status == "active"
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
        
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{id}", response_model=CustomerSchema)
def delete_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a customer (logical delete).
    """
    customer = db.query(Customer).filter(
        Customer.id == id,
        Customer.tenant_id == current_user.tenant_id,
        Customer.status == "active"
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    customer.status = "deleted"
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
