"""add avatar_url to users

Revision ID: add_user_avatar_url
Revises: add_user_study_prefs
Create Date: 2025-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_user_avatar_url"
down_revision: Union[str, None] = "add_user_study_prefs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("avatar_url", sa.String(512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "avatar_url")
