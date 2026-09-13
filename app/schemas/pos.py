from decimal import Decimal

from pydantic import BaseModel


class ProductSearchResponse(BaseModel):
    id: int
    name: str
    barcode: str | None
    sku: str | None
    selling_price: Decimal
    vat_rate: Decimal
    stock_quantity: int


class ReceiptItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class ReceiptResponse(BaseModel):
    sale_id: int
    sale_number: str
    store_id: int
    customer_id: int | None
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str
    items: list[ReceiptItem]
    created_at: object
