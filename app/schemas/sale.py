from decimal import Decimal

from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    discount: Decimal = Field(default=0, ge=0)


class SaleCreate(BaseModel):
    store_id: int
    payment_method: str
    discount: Decimal = Field(default=0, ge=0)
    tax: Decimal = Field(default=0, ge=0)
    items: list[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    discount: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    store_id: int
    user_id: int
    sale_number: str
    status: str
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str
    created_at: object
    items: list[SaleItemResponse] = []

    class Config:
        from_attributes = True
