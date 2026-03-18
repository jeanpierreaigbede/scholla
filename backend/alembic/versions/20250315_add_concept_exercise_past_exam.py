"""add concept, exercise, past_exam tables

Revision ID: add_concept_past_exam
Revises: add_user_school_id
Create Date: 2025-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


revision: str = "add_concept_past_exam"
down_revision: Union[str, None] = "add_user_school_id"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "concepts",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("lesson_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("order_index", sa.Integer(), default=0),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "exercises",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("lesson_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("statement", sa.Text(), nullable=False),
        sa.Column("solution", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), default=0),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "past_exams",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("subject_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("order_index", sa.Integer(), default=0),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "past_exam_questions",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("past_exam_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("option_a", sa.String(500), nullable=False),
        sa.Column("option_b", sa.String(500), nullable=False),
        sa.Column("option_c", sa.String(500), nullable=True),
        sa.Column("option_d", sa.String(500), nullable=True),
        sa.Column("correct_option", sa.String(1), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), default=0),
        sa.ForeignKeyConstraint(["past_exam_id"], ["past_exams.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "past_exam_attempts",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("past_exam_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("score_percent", sa.Float(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["past_exam_id"], ["past_exams.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "past_exam_attempt_answers",
        sa.Column("id", PG_UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("attempt_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("selected_option", sa.String(1), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["past_exam_attempts.id"]),
        sa.ForeignKeyConstraint(["question_id"], ["past_exam_questions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("past_exam_attempt_answers")
    op.drop_table("past_exam_attempts")
    op.drop_table("past_exam_questions")
    op.drop_table("past_exams")
    op.drop_table("exercises")
    op.drop_table("concepts")
