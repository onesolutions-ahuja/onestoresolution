from decimal import Decimal
from pydantic import BaseModel, Field

class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_cost: Decimal = Field(ge=0)

class PurchaseOrderCreate(BaseModel):
    store_id: int
    supplier_id: int
    invoice_number: str | None = None
    notes: str | None = None
    items: list[PurchaseOrderItemCreate] = Field(min_length=1)

class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_cost: Decimal
    line_total: Decimal

class PurchaseOrderResponse(BaseModel):
    id: int
    store_id: int
    supplier_id: int
    status: str
    invoice_number: str | None
    notes: str | None
    total_amount: Decimal
    items: list[PurchaseOrderItemResponse]

class ReceivePurchaseResponse(BaseModel):
    message: str
    purchase_order_id: int
    store_id: int
    total_amount: Decimal
