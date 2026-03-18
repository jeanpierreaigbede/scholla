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


class DashboardProgressOut(BaseModel):
    exam_readiness_percent: int
    exam_readiness_delta: int  # e.g. +5 from last week
    maths_percent: int
    science_percent: int
    english_percent: int
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
