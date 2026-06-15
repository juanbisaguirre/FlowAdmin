from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.db.database import get_db
from app.db.models import Invoice, Customer, User

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get metrics for the dashboard.
    """
    tenant_id = current_user.tenant_id

    # 1. Total Income (Approved Invoices)
    total_income = db.query(func.sum(Invoice.total)).filter(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "approved"
    ).scalar() or 0.0

    # 2. Active Customers
    active_customers = db.query(func.count(Customer.id)).filter(
        Customer.tenant_id == tenant_id,
        Customer.status == "active"
    ).scalar() or 0

    # 3. Sent Invoices
    sent_invoices = db.query(func.count(Invoice.id)).filter(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "approved"
    ).scalar() or 0

    # 4. Pending Payments (Draft or Processing)
    pending_payments = db.query(func.count(Invoice.id)).filter(
        Invoice.tenant_id == tenant_id,
        Invoice.status.in_(["draft", "processing"])
    ).scalar() or 0

    # 5. Recent Activity (Last 5 approved invoices)
    recent_invoices = db.query(Invoice).filter(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "approved"
    ).order_by(Invoice.issue_date.desc()).limit(5).all()

    # Get customer names for recent invoices
    recent_activity = []
    for inv in recent_invoices:
        customer = db.query(Customer).filter(Customer.id == inv.customer_id).first()
        recent_activity.append({
            "id": inv.id,
            "customer_name": customer.business_name if customer else "Unknown",
            "invoice_number": inv.invoice_number or inv.id[:8],
            "amount": float(inv.total),
            "date": str(inv.issue_date)
        })

    # For the chart, we can group approved invoices by date (last 7 days for simplicity)
    # This is a simplified version, in production you might use func.date_trunc or similar
    from datetime import date, timedelta
    today = date.today()
    chart_data = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        daily_total = db.query(func.sum(Invoice.total)).filter(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "approved",
            Invoice.issue_date == target_date
        ).scalar() or 0.0
        
        chart_data.append({
            "date": target_date.strftime("%d %b"),
            "amount": float(daily_total)
        })

    return {
        "metrics": {
            "total_income": float(total_income),
            "active_customers": active_customers,
            "sent_invoices": sent_invoices,
            "pending_payments": pending_payments
        },
        "recent_activity": recent_activity,
        "chart_data": chart_data
    }
