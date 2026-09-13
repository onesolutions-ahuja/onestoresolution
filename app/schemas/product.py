from decimal import Decimal

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    barcode: str | None = None
    sku: str | None = None
    category_id: int | None = None
    cost_price: Decimal = 0
    selling_price: Decimal = 0
    vat_rate: Decimal = 0


class ProductResponse(BaseModel):
    id: int
    name: str
    barcode: str | None
    sku: str | None
    category_id: int | None
    cost_price: Decimal
    selling_price: Decimal
    vat_rate: Decimal
    is_active: bool
