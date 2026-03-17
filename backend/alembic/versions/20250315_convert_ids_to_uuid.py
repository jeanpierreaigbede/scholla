"""convert all table ids to UUID

Revision ID: convert_ids_to_uuid
Revises: add_user_avatar_url
Create Date: 2025-03-15

Drops all tables and recreates them with UUID primary keys and foreign keys.
WARNING: This migration destroys all existing data. Use only on fresh DB or after backup.
"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import create_engine
from app.db.base import Base
from app.models import User, OTPCode  # noqa: F401
from app.models import content  # noqa: F401
from app.models import quiz  # noqa: F401
from app.models import subscription  # noqa: F401


revision: str = "convert_ids_to_uuid"
down_revision: Union[str, None] = "add_user_avatar_url"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
    # Old integer-schema tables are not recreated; run earlier migrations to restore.
