"""add study_intensity and school_year to users

Revision ID: add_user_study_prefs
Revises:
Create Date: 2025-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.models.user import StudyIntensity, SchoolYear


revision: str = "add_user_study_prefs"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    study_intensity_enum = sa.Enum(StudyIntensity, name="studyintensity")
    school_year_enum = sa.Enum(SchoolYear, name="schoolyear")
    study_intensity_enum.create(op.get_bind(), checkfirst=True)
    school_year_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "users",
        sa.Column("study_intensity", study_intensity_enum, nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("school_year", school_year_enum, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "school_year")
    op.drop_column("users", "study_intensity")
    sa.Enum(SchoolYear, name="schoolyear").drop(op.get_bind(), checkfirst=True)
    sa.Enum(StudyIntensity, name="studyintensity").drop(op.get_bind(), checkfirst=True)
