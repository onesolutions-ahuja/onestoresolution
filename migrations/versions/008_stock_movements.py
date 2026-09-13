from alembic import op
import sqlalchemy as sa


revision = "008_stock_movements"
down_revision = "007_sale_customer"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "stock_movements",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
        ),
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
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "movement_type",
            sa.String(30),
            nullable=False,
        ),
        sa.Column(
            "quantity_change",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "quantity_before",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "quantity_after",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "reason",
            sa.String(255),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_stock_movements_id",
        "stock_movements",
        ["id"],
    )

    op.create_index(
        "ix_stock_movements_store_id",
        "stock_movements",
        ["store_id"],
    )

    op.create_index(
        "ix_stock_movements_product_id",
        "stock_movements",
        ["product_id"],
    )

    op.create_index(
        "ix_stock_movements_user_id",
        "stock_movements",
        ["user_id"],
    )

    op.create_index(
        "ix_stock_movements_created_at",
        "stock_movements",
        ["created_at"],
    )


def downgrade():
    op.drop_index(
        "ix_stock_movements_created_at",
        table_name="stock_movements",
    )

    op.drop_index(
        "ix_stock_movements_user_id",
        table_name="stock_movements",
    )

    op.drop_index(
        "ix_stock_movements_product_id",
        table_name="stock_movements",
    )

    op.drop_index(
        "ix_stock_movements_store_id",
        table_name="stock_movements",
    )

    op.drop_index(
        "ix_stock_movements_id",
        table_name="stock_movements",
    )

    op.drop_table("stock_movements")
