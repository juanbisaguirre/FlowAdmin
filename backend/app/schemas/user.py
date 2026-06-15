from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDBBase(UserBase):
    id: str
    tenant_id: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserRegister(BaseModel):
    tenant_name: str
    tenant_cuit: str
    user_name: str
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
