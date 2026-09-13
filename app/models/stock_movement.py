from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    movement_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    quantity_change: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    quantity_before: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    quantity_after: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )
