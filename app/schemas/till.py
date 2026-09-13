from decimal import Decimal

from pydantic import BaseModel, Field


class TillOpenRequest(BaseModel):
    store_id: int
    opening_cash: Decimal = Field(ge=0)


class TillMovementRequest(BaseModel):
    movement_type: str
    amount: Decimal = Field(gt=0)
    reason: str | None = None


class TillCloseRequest(BaseModel):
    closing_cash: Decimal = Field(ge=0)


class TillResponse(BaseModel):
    id: int
    store_id: int
    user_id: int
    opening_cash: Decimal
    closing_cash: Decimal | None
    expected_cash: Decimal | None
    variance: Decimal | None
    status: str
    opened_at: object
    closed_at: object | None
