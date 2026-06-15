import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    commercial_name = Column(String, nullable=False)
    legal_name = Column(String, nullable=False)
    cuit_rut = Column(String, unique=True, index=True, nullable=False)
    address = Column(String)
    email = Column(String)
    phone = Column(String)
    
    # SaaS Fields
    subscription_plan = Column(String, default="free")
    subscription_status = Column(String, default="active")
    subscription_valid_until = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="tenant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")
    billing_credentials = relationship("CompanyBillingCredentials", back_populates="tenant", cascade="all, delete-orphan", uselist=False)
    uploaded_files = relationship("UploadedFile", back_populates="tenant", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="users")

class CompanyBillingCredentials(Base):
    __tablename__ = "company_billing_credentials"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), unique=True, nullable=False)
    provider = Column(String, default="TusFacturas")
    apikey = Column(String)
    apitoken = Column(String)
    usertoken = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="billing_credentials")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    business_name = Column(String, nullable=False)
    document_type = Column(String) # CUIT, DNI
    document_number = Column(String, index=True, nullable=False)
    vat_condition = Column(String)
    address = Column(String)
    province = Column(String)
    email = Column(String)
    phone = Column(String)
    status = Column(String, default="active")

    tenant = relationship("Tenant", back_populates="customers")
    invoices = relationship("Invoice", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    code = Column(String)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    vat_rate = Column(Numeric(5, 2), nullable=False)
    unit = Column(String, default="unidades")
    active = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="products")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    
    invoice_type = Column(String, nullable=False) # A, B, C, NC, ND
    invoice_number = Column(String) # assigned by provider
    
    status = Column(String, default="draft") # draft, processing, approved, rejected, cancelled
    
    subtotal = Column(Numeric(10, 2), default=0)
    taxes = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)
    
    cae = Column(String)
    cae_expiration = Column(Date)
    
    pdf_url = Column(String)
    error_message = Column(String)
    
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    
    description = Column(String, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)

    invoice = relationship("Invoice", back_populates="items")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    file_name = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    content_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="uploaded_files")
