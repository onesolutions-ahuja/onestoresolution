from pydantic import BaseModel, Field


class InventoryAdjustment(BaseModel):
    store_id: int
    product_id: int
    quantity_change: int
    reason: str = Field(min_length=1, max_length=255)
