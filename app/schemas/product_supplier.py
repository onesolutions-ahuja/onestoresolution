from decimal import Decimal

from pydantic import BaseModel, Field


class ProductSupplierCreate(BaseModel):
    product_id: int
    supplier_id: int
    supplier_product_code: str | None = None
    cost_price: Decimal = Field(ge=0)
    is_preferred: bool = False


class ProductSupplierUpdate(BaseModel):
    supplier_product_code: str | None = None
    cost_price: Decimal | None = Field(default=None, ge=0)
    is_preferred: bool | None = None


class ProductSupplierResponse(BaseModel):
    id: int
    product_id: int
    supplier_id: int
    supplier_product_code: str | None
    cost_price: Decimal
    is_preferred: bool

    class Config:
        from_attributes = True
