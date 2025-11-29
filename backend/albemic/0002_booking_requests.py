"""Add booking requests table

Revision ID: 0002_booking_requests
Revises: 0001_initial_schema
Create Date: 2025-11-28 00:30:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0002_booking_requests"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "booking_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lawyer_id", sa.Integer(), sa.ForeignKey("lawyer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("preferred_date", sa.String(length=20), nullable=True),
        sa.Column("preferred_time", sa.String(length=20), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_index("ix_booking_requests_user_id", "booking_requests", ["user_id"])
    op.create_index("ix_booking_requests_lawyer_id", "booking_requests", ["lawyer_id"])
    op.create_index("ix_booking_requests_status", "booking_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_booking_requests_status", table_name="booking_requests")
    op.drop_index("ix_booking_requests_lawyer_id", table_name="booking_requests")
    op.drop_index("ix_booking_requests_user_id", table_name="booking_requests")
    op.drop_table("booking_requests")
