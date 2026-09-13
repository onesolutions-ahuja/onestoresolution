from pydantic import BaseModel


class StoreCreate(BaseModel):
    name: str
    address: str
    postcode: str
    phone: str | None = None


class StoreResponse(BaseModel):
    id: int
    name: str
    address: str
    postcode: str
    phone: str | None
    is_active: bool
