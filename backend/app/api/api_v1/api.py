from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, customers, invoices, billing_settings, webhooks, files, bulk, metrics, team, products, superadmin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(superadmin.router, prefix="/superadmin", tags=["superadmin"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(billing_settings.router, prefix="/billing-settings", tags=["billing-settings"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(bulk.router, prefix="/bulk", tags=["bulk"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
