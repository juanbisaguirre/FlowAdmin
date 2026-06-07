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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="tenant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")

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

class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    legal_name = Column(String, nullable=False)
    commercial_name = Column(String)
    cuit = Column(String, index=True, nullable=False)
    address = Column(String)
    email = Column(String)
    phone = Column(String)
    status = Column(String, default="active")

    tenant = relationship("Tenant", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    
    invoice_type = Column(String, nullable=False) # A, B, C
    cae = Column(String)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="draft") # draft, sent, paid, overdue
    pdf_url = Column(String)

    tenant = relationship("Tenant", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
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
