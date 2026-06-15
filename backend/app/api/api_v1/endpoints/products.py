from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.db.models import Product, User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("", response_model=List[ProductSchema])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve products for the current tenant.
    """
    products = db.query(Product).filter(
        Product.tenant_id == current_user.tenant_id,
        Product.active == True
    ).offset(skip).limit(limit).all()
    return products

@router.post("", response_model=ProductSchema)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new product.
    """
    db_product = Product(
        tenant_id=current_user.tenant_id,
        code=product_in.code,
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        vat_rate=product_in.vat_rate,
        unit=product_in.unit,
        active=True
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{id}")
def delete_product(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a product (logical delete).
    """
    product = db.query(Product).filter(
        Product.id == id,
        Product.tenant_id == current_user.tenant_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.active = False
    db.commit()
    return {"message": "Product removed successfully"}
