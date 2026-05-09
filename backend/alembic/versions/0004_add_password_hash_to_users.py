"""Add password_hash column to users table

Revision ID: 0004_add_password_hash_to_users
Revises: 0003_booking_request_link
Create Date: 2026-05-09
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0004_add_password_hash_to_users"
down_revision = "0003_booking_request_link"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(length=255), nullable=False, server_default="")
    )
    op.alter_column("users", "password_hash", server_default=None)

def downgrade() -> None:
    op.drop_column("users", "password_hash")
