from alembic import op
import sqlalchemy as sa


revision = "009_till_refunds"
down_revision = "008_stock_movements"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "till_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "store_id",
            sa.Integer(),
            sa.ForeignKey("stores.id"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "opening_cash",
            sa.Numeric(12, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "closing_cash",
            sa.Numeric(12, 2),
            nullable=True,
        ),
        sa.Column(
            "expected_cash",
            sa.Numeric(12, 2),
            nullable=True,
        ),
        sa.Column(
            "variance",
            sa.Numeric(12, 2),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="OPEN",
        ),
        sa.Column(
            "opened_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "closed_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_till_sessions_id",
        "till_sessions",
        ["id"],
    )

    op.create_table(
        "till_movements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "till_session_id",
            sa.Integer(),
            sa.ForeignKey("till_sessions.id"),
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
            sa.String(20),
            nullable=False,
        ),
        sa.Column(
            "amount",
            sa.Numeric(12, 2),
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
        "ix_till_movements_id",
        "till_movements",
        ["id"],
    )

    op.create_table(
        "refunds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "sale_id",
            sa.Integer(),
            sa.ForeignKey("sales.id"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "amount",
            sa.Numeric(12, 2),
            nullable=False,
        ),
        sa.Column(
            "reason",
            sa.String(500),
            nullable=True,
        ),
        sa.Column(
            "payment_method",
            sa.String(20),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_refunds_id",
        "refunds",
        ["id"],
    )


def downgrade():
    op.drop_index(
        "ix_refunds_id",
        table_name="refunds",
    )
    op.drop_table("refunds")

    op.drop_index(
        "ix_till_movements_id",
        table_name="till_movements",
    )
    op.drop_table("till_movements")

    op.drop_index(
        "ix_till_sessions_id",
        table_name="till_sessions",
    )
    op.drop_table("till_sessions")
