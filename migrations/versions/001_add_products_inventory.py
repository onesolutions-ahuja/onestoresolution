"""add products categories and inventory

Revision ID: 001_products_inventory
Revises: 001_initial_schema
Create Date: 2026-09-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002_products_inventory"
down_revision: Union[str, Sequence[str], None] = "001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.UniqueConstraint("name"),
    )

    op.create_index(
        "ix_categories_id",
        "categories",
        ["id"],
    )

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("barcode", sa.String(length=100), nullable=True),
        sa.Column("sku", sa.String(length=100), nullable=True),
        sa.Column(
            "category_id",
            sa.Integer(),
            sa.ForeignKey("categories.id"),
            nullable=True,
        ),
        sa.Column(
            "cost_price",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "selling_price",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "vat_rate",
            sa.Numeric(5, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.UniqueConstraint("barcode"),
        sa.UniqueConstraint("sku"),
    )

    op.create_index(
        "ix_products_id",
        "products",
        ["id"],
    )

    op.create_index(
        "ix_products_barcode",
        "products",
        ["barcode"],
    )

    op.create_index(
        "ix_products_sku",
        "products",
        ["sku"],
    )

    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "store_id",
            sa.Integer(),
            sa.ForeignKey("stores.id"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column(
            "quantity",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "minimum_quantity",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "cost_price",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "selling_price",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_inventory_id",
        "inventory",
        ["id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_inventory_id",
        table_name="inventory",
    )

    op.drop_table("inventory")

    op.drop_index(
        "ix_products_sku",
        table_name="products",
    )

    op.drop_index(
        "ix_products_barcode",
        table_name="products",
    )

    op.drop_index(
        "ix_products_id",
        table_name="products",
    )

    op.drop_table("products")

    op.drop_index(
        "ix_categories_id",
        table_name="categories",
    )

    op.drop_table("categories")
