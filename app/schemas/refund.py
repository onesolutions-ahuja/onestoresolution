from decimal import Decimal

from pydantic import BaseModel, Field


class RefundCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    reason: str | None = None
    payment_method: str | None = None


class RefundResponse(BaseModel):
    id: int
    sale_id: int
    user_id: int
    amount: Decimal
    reason: str | None
    payment_method: str
    created_at: object
