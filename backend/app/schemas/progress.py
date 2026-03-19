from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class LessonCompletionOut(BaseModel):
    id: UUID
    lesson_id: UUID
    completed_at: datetime | None
    minutes_spent: int = 0

    class Config:
        from_attributes = True


class SubjectProgressItemOut(BaseModel):
    """Subject progress with name for dashboard listing."""
    subject_id: UUID
    subject_name: str
    progress_percent: float


class DashboardProgressOut(BaseModel):
    """Dashboard data: overall progress and per-subject breakdown."""
    exam_readiness_percent: float  # 0–100, average of subject progress
    exam_readiness_delta: int  # e.g. +5 from last week (0 if not computed)
    subject_progress: list[SubjectProgressItemOut]
    daily_streak_days: int
    today_goal_minutes: int


class SubjectProgressOut(BaseModel):
    """Progression pour un cours : leçons complétées + past exams passés."""
    subject_id: UUID
    lessons_completed: int
    lessons_total: int
    past_exams_completed: int
    past_exams_total: int
    progress_percent: float  # 0-100, agrégé leçons + exams
