from alembic import op
import sqlalchemy as sa


revision = "006_customers"
down_revision = "005_sales"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("phone", sa.String(30), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("postcode", sa.String(20), nullable=True),
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
    )

    op.create_index(
        "ix_customers_phone",
        "customers",
        ["phone"],
    )

    op.create_index(
        "ix_customers_email",
        "customers",
        ["email"],
    )


def downgrade():
    op.drop_index(
        "ix_customers_email",
        table_name="customers",
    )

    op.drop_index(
        "ix_customers_phone",
        table_name="customers",
    )

    op.drop_table("customers")
