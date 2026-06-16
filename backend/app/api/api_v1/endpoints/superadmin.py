from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.db.database import get_db
from app.db.models import User, Tenant, Invoice

router = APIRouter()

def require_superadmin(current_user: User = Depends(deps.get_current_active_user)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Not enough privileges. God Mode required.")
    return current_user

@router.get("/metrics")
def get_global_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
) -> Any:
    """
    Get global platform metrics.
    """
    total_tenants = db.query(Tenant).count()
    total_users = db.query(User).count()
    total_invoices = db.query(Invoice).count()
    
    # Calculate total revenue processed platform-wide
    total_revenue_query = db.query(func.sum(Invoice.total)).filter(Invoice.status == "approved").scalar()
    total_revenue = float(total_revenue_query) if total_revenue_query else 0.0

    return {
        "total_tenants": total_tenants,
        "total_users": total_users,
        "total_invoices": total_invoices,
        "total_revenue": total_revenue
    }

@router.get("/tenants")
def get_all_tenants(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_superadmin)
) -> Any:
    """
    Get all tenants and their status.
    """
    tenants = db.query(Tenant).offset(skip).limit(limit).all()
    result = []
    for t in tenants:
        users_count = db.query(User).filter(User.tenant_id == t.id).count()
        invoices_count = db.query(Invoice).filter(Invoice.tenant_id == t.id).count()
        result.append({
            "id": t.id,
            "commercial_name": t.commercial_name,
            "legal_name": t.legal_name,
            "cuit_rut": t.cuit_rut,
            "subscription_plan": t.subscription_plan,
            "subscription_status": t.subscription_status,
            "subscription_valid_until": t.subscription_valid_until,
            "created_at": t.created_at,
            "users_count": users_count,
            "invoices_count": invoices_count
        })
    return result

@router.put("/tenants/{tenant_id}/status")
def change_tenant_status(
    tenant_id: str,
    status: str, # "active" or "suspended"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
) -> Any:
    """
    Change subscription status of a tenant (Ban / Activate).
    """
    if status not in ["active", "suspended"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    tenant.subscription_status = status
    db.commit()
    
    return {"message": f"Tenant {tenant.commercial_name} is now {status}"}
