from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id"),
        nullable=False,
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="DRAFT",
        nullable=False,
    )

    invoice_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    received_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    purchase_order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id"),
        nullable=False,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    unit_cost: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
