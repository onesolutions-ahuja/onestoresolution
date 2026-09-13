from pydantic import BaseModel, EmailStr

class SupplierCreate(BaseModel):
    name: str
    contact_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    postcode: str | None = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_name: str | None
    phone: str | None
    email: str | None
    address: str | None
    postcode: str | None
    is_active: bool
