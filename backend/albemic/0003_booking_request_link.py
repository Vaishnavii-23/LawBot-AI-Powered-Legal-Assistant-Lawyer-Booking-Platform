"""Link bookings to booking requests

Revision ID: 0003_booking_request_link
Revises: 0002_booking_requests
Create Date: 2025-11-29 00:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003_booking_request_link"
down_revision: Union[str, None] = "0002_booking_requests"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("booking_request_id", sa.Integer(), nullable=True))
    op.create_unique_constraint(
        "uq_bookings_booking_request_id",
        "bookings",
        ["booking_request_id"],
    )
    op.create_foreign_key(
        "fk_bookings_booking_request_id",
        "bookings",
        "booking_requests",
        ["booking_request_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_bookings_booking_request_id", "bookings", type_="foreignkey")
    op.drop_constraint("uq_bookings_booking_request_id", "bookings", type_="unique")
    op.drop_column("bookings", "booking_request_id")
