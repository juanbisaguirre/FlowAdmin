from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.db.models import Client, User
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate

router = APIRouter()

@router.get("/", response_model=List[ClientSchema])
def read_clients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clients for the current tenant.
    """
    clients = db.query(Client).filter(Client.tenant_id == current_user.tenant_id).offset(skip).limit(limit).all()
    return clients

@router.post("/", response_model=ClientSchema)
def create_client(
    *,
    db: Session = Depends(get_db),
    client_in: ClientCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new client.
    """
    # Check if cuit already exists for this tenant
    client = db.query(Client).filter(
        Client.tenant_id == current_user.tenant_id,
        Client.cuit == client_in.cuit
    ).first()
    if client:
        raise HTTPException(
            status_code=400,
            detail="A client with this CUIT already exists.",
        )
    
    db_client = Client(
        tenant_id=current_user.tenant_id,
        **client_in.model_dump()
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/{id}", response_model=ClientSchema)
def read_client(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get client by ID.
    """
    client = db.query(Client).filter(
        Client.tenant_id == current_user.tenant_id,
        Client.id == id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{id}", response_model=ClientSchema)
def update_client(
    *,
    db: Session = Depends(get_db),
    id: str,
    client_in: ClientUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a client.
    """
    client = db.query(Client).filter(
        Client.tenant_id == current_user.tenant_id,
        Client.id == id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(client, field, update_data[field])
        
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{id}", response_model=ClientSchema)
def delete_client(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a client.
    """
    client = db.query(Client).filter(
        Client.tenant_id == current_user.tenant_id,
        Client.id == id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return client
