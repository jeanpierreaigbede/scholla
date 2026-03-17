from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.schemas.quiz import (
    QuizOut,
    QuizQuestionOut,
    QuizResultOut,
    SubmitQuizRequest,
    QuizQuestionWithAnswerOut,
    QuizAttemptOut,
)

router = APIRouter()


@router.get("", response_model=list[QuizOut])
async def list_quizzes(
    module_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Quiz)
    if module_id is not None:
        q = q.where(Quiz.module_id == module_id)
    q = q.order_by(Quiz.id)
    result = await db.execute(q)
    return [QuizOut.model_validate(r) for r in result.scalars().all()]


@router.get("/attempts", response_model=list[QuizAttemptOut])
async def list_my_attempts(
    quiz_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(QuizAttempt).where(QuizAttempt.user_id == current_user.id)
    if quiz_id is not None:
        q = q.where(QuizAttempt.quiz_id == quiz_id)
    q = q.order_by(QuizAttempt.completed_at.desc())
    result = await db.execute(q)
    attempts = result.scalars().all()
    return [
        QuizAttemptOut(
            id=a.id,
            quiz_id=a.quiz_id,
            score_percent=a.score_percent,
            completed_at=a.completed_at.isoformat() if a.completed_at else "",
        )
        for a in attempts
    ]


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return QuizOut.model_validate(quiz)


@router.get("/{quiz_id}/questions", response_model=list[QuizQuestionOut])
async def get_quiz_questions(
    quiz_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.order_index)
    )
    questions = list(result.scalars().all())
    # Return without correct_option and explanation (revealed on submit)
    return [
        QuizQuestionOut(
            id=q.id,
            quiz_id=q.quiz_id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            order_index=q.order_index,
        )
        for q in questions
    ]


@router.post("/{quiz_id}/submit", response_model=QuizResultOut)
async def submit_quiz(
    quiz_id: UUID,
    body: SubmitQuizRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id))
    questions = {q.id: q for q in result.scalars().all()}
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz not found")
    correct = 0
    feedback = []
    for a in body.answers:
        q = questions.get(a.question_id)
        if not q:
            continue
        is_correct = q.correct_option.upper() == a.selected_option.upper()
        if is_correct:
            correct += 1
        feedback.append({
            "question_id": q.id,
            "correct": is_correct,
            "correct_option": q.correct_option,
            "explanation": q.explanation,
        })
    total = len(questions)
    score_percent = round(100 * correct / total, 1) if total else 0
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score_percent=score_percent,
    )
    db.add(attempt)
    return QuizResultOut(
        score_percent=score_percent,
        total_questions=total,
        correct_count=correct,
        feedback=feedback,
    )
