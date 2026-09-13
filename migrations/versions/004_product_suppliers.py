from alembic import op
import sqlalchemy as sa


revision = "004_product_suppliers"
down_revision = "003_suppliers_purchases"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "product_suppliers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "product_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "supplier_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "supplier_product_code",
            sa.String(100),
            nullable=True,
        ),
        sa.Column(
            "cost_price",
            sa.Numeric(10, 2),
            nullable=False,
        ),
        sa.Column(
            "is_preferred",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.ForeignKeyConstraint(
            ["supplier_id"],
            ["suppliers.id"],
        ),
        sa.UniqueConstraint(
            "product_id",
            "supplier_id",
            name="uq_product_supplier",
        ),
    )

    op.create_index(
        "ix_product_suppliers_product_id",
        "product_suppliers",
        ["product_id"],
    )

    op.create_index(
        "ix_product_suppliers_supplier_id",
        "product_suppliers",
        ["supplier_id"],
    )


def downgrade():
    op.drop_index(
        "ix_product_suppliers_supplier_id",
        table_name="product_suppliers",
    )

    op.drop_index(
        "ix_product_suppliers_product_id",
        table_name="product_suppliers",
    )

    op.drop_table("product_suppliers")
