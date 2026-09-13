from alembic import op
import sqlalchemy as sa


revision = "005_sales"
down_revision = "004_product_suppliers"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "sales",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("sale_number", sa.String(50), nullable=False),
        sa.Column(
            "status",
            sa.String(30),
            nullable=False,
            server_default="COMPLETED",
        ),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False),
        sa.Column(
            "discount",
            sa.Numeric(12, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "tax",
            sa.Numeric(12, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("sale_number"),
    )

    op.create_index(
        "ix_sales_sale_number",
        "sales",
        ["sale_number"],
    )

    op.create_index(
        "ix_sales_store_id",
        "sales",
        ["store_id"],
    )

    op.create_table(
        "sale_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sale_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "discount",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column("line_total", sa.Numeric(12, 2), nullable=False),
        sa.ForeignKeyConstraint(["sale_id"], ["sales.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
    )

    op.create_index(
        "ix_sale_items_sale_id",
        "sale_items",
        ["sale_id"],
    )


def downgrade():
    op.drop_index(
        "ix_sale_items_sale_id",
        table_name="sale_items",
    )

    op.drop_table("sale_items")

    op.drop_index(
        "ix_sales_store_id",
        table_name="sales",
    )

    op.drop_index(
        "ix_sales_sale_number",
        table_name="sales",
    )

    op.drop_table("sales")
