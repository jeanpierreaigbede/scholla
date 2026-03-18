"""add school_id to users

Revision ID: add_user_school_id
Revises: convert_ids_to_uuid
Create Date: 2025-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "add_user_school_id"
down_revision: Union[str, None] = "convert_ids_to_uuid"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("school_id", UUID(as_uuid=True), sa.ForeignKey("schools.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "school_id")
