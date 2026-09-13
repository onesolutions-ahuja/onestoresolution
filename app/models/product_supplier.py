from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProductSupplier(Base):
    __tablename__ = "product_suppliers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"),
        nullable=False,
    )

    supplier_product_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    is_preferred: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
