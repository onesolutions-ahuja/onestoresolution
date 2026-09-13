from pydantic import BaseModel


class StoreAccessCreate(BaseModel):
    user_id: int
    store_id: int


class StoreAccessResponse(BaseModel):
    id: int
    user_id: int
    store_id: int
