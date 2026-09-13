from decimal import Decimal

from pydantic import BaseModel, Field


class CheckoutItem(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class CheckoutCreate(BaseModel):
    store_id: int
    customer_id: int | None = None
    items: list[CheckoutItem] = Field(min_length=1)
    discount: Decimal = Field(default=0, ge=0)
    payment_method: str = "CASH"
