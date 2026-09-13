from alembic import op
import sqlalchemy as sa


revision = "007_sale_customer"
down_revision = "006_customers"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "sales",
        sa.Column(
            "customer_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_sales_customer_id",
        "sales",
        "customers",
        ["customer_id"],
        ["id"],
    )

    op.create_index(
        "ix_sales_customer_id",
        "sales",
        ["customer_id"],
    )


def downgrade():
    op.drop_index(
        "ix_sales_customer_id",
        table_name="sales",
    )

    op.drop_constraint(
        "fk_sales_customer_id",
        "sales",
        type_="foreignkey",
    )

    op.drop_column(
        "sales",
        "customer_id",
    )
