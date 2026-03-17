from uuid import UUID

from pydantic import BaseModel


class QuizQuestionOut(BaseModel):
    id: UUID
    quiz_id: UUID
    question_text: str
    option_a: str
    option_b: str
    option_c: str | None
    option_d: str | None
    order_index: int
    # correct_option and explanation only after submission

    class Config:
        from_attributes = True


class QuizQuestionWithAnswerOut(QuizQuestionOut):
    correct_option: str
    explanation: str | None


class QuizOut(BaseModel):
    id: UUID
    module_id: UUID | None
    title: str
    description: str | None

    class Config:
        from_attributes = True


class SubmitQuizAnswer(BaseModel):
    question_id: UUID
    selected_option: str  # A, B, C, D


class SubmitQuizRequest(BaseModel):
    answers: list[SubmitQuizAnswer]


class QuizResultOut(BaseModel):
    score_percent: float
    total_questions: int
    correct_count: int
    feedback: list[dict]  # [{ question_id, correct, correct_option, explanation }]


class QuizAttemptOut(BaseModel):
    id: UUID
    quiz_id: UUID
    score_percent: float
    completed_at: str  # datetime as ISO string

    class Config:
        from_attributes = True
