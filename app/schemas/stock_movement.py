from datetime import datetime

from pydantic import BaseModel, Field


class StockAdjustmentCreate(BaseModel):
    store_id: int
    product_id: int
    quantity_change: int
    reason: str | None = Field(
        default=None,
        max_length=255,
    )


class StockMovementResponse(BaseModel):
    id: int
    store_id: int
    product_id: int
    user_id: int
    movement_type: str
    quantity_change: int
    quantity_before: int
    quantity_after: int
    reason: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
