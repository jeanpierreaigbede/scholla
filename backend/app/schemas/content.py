from uuid import UUID

from pydantic import BaseModel


class SubjectOut(BaseModel):
    id: UUID
    name: str
    slug: str
    order_index: int

    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    name: str
    slug: str
    order_index: int = 0


class SubjectUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    order_index: int | None = None


class ModuleOut(BaseModel):
    id: UUID
    subject_id: UUID
    name: str
    slug: str
    description: str | None
    order_index: int
    estimated_minutes: int
    status: str | None = None  # locked | in_progress | completed (set by progress API)

    class Config:
        from_attributes = True


class ModuleCreate(BaseModel):
    subject_id: UUID
    name: str
    slug: str
    description: str | None = None
    order_index: int = 0
    estimated_minutes: int = 0


class ModuleUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    order_index: int | None = None
    estimated_minutes: int | None = None


class LessonOut(BaseModel):
    id: UUID
    module_id: UUID
    title: str
    content: str
    order_index: int

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    module_id: UUID
    title: str
    content: str
    order_index: int = 0


class LessonUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    order_index: int | None = None


class NextTopicOut(BaseModel):
    module_id: UUID
    module_name: str
    subject_name: str
    lesson_id: UUID
    lesson_title: str
    estimated_minutes_left: int
    difficulty: str = "Intermediate"


# ----- Concepts -----
class ConceptOut(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    content: str
    order_index: int

    class Config:
        from_attributes = True


class ConceptCreate(BaseModel):
    lesson_id: UUID
    title: str
    content: str
    order_index: int = 0


# ----- Exercises -----
class ExerciseOut(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str | None
    statement: str
    solution: str | None
    order_index: int

    class Config:
        from_attributes = True


class ExerciseCreate(BaseModel):
    lesson_id: UUID
    title: str | None = None
    statement: str
    solution: str | None = None
    order_index: int = 0


# ----- Past exams -----
class PastExamOut(BaseModel):
    id: UUID
    subject_id: UUID
    title: str
    year: int | None
    order_index: int

    class Config:
        from_attributes = True


class PastExamCreate(BaseModel):
    subject_id: UUID
    title: str
    year: int | None = None
    order_index: int = 0


class PastExamQuestionOut(BaseModel):
    """Question sans bonne réponse ni explication (affichée avant soumission)."""
    id: UUID
    past_exam_id: UUID
    question_text: str
    option_a: str
    option_b: str
    option_c: str | None
    option_d: str | None
    order_index: int

    class Config:
        from_attributes = True


class PastExamQuestionWithAnswerOut(PastExamQuestionOut):
    correct_option: str
    explanation: str | None


class PastExamSubmitAnswer(BaseModel):
    question_id: UUID
    selected_option: str


class SubmitPastExamBody(BaseModel):
    answers: list[PastExamSubmitAnswer]


class PastExamResultOut(BaseModel):
    attempt_id: UUID
    score_percent: float
    total_questions: int
    correct_count: int
    feedback: list[dict]


class PastExamAttemptOut(BaseModel):
    id: UUID
    past_exam_id: UUID
    score_percent: float
    completed_at: str

    class Config:
        from_attributes = True
