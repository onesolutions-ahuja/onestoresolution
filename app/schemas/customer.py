from datetime import datetime

from pydantic import BaseModel, EmailStr


class CustomerCreate(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    postcode: str | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    postcode: str | None = None
    is_active: bool | None = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str | None
    email: str | None
    address: str | None
    postcode: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
