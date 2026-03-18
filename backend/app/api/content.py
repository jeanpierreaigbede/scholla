from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.content import (
    Subject,
    Module,
    Lesson,
    Concept,
    Exercise,
    PastExam,
    PastExamQuestion,
    PastExamAttempt,
    PastExamAttemptAnswer,
)
from app.schemas.content import (
    SubjectOut,
    SubjectCreate,
    SubjectUpdate,
    ModuleOut,
    ModuleCreate,
    ModuleUpdate,
    LessonOut,
    LessonCreate,
    LessonUpdate,
    ConceptOut,
    ConceptCreate,
    ExerciseOut,
    ExerciseCreate,
    PastExamOut,
    PastExamCreate,
    PastExamQuestionOut,
    PastExamQuestionWithAnswerOut,
    SubmitPastExamBody,
    PastExamResultOut,
    PastExamAttemptOut,
)

router = APIRouter()


@router.get("/subjects", response_model=list[SubjectOut])
async def list_subjects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Subject).order_by(Subject.order_index))
    return list(result.scalars().all())


@router.get("/subjects/{subject_id}", response_model=SubjectOut)
async def get_subject(
    subject_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    return sub


@router.post("/subjects", response_model=SubjectOut)
async def create_subject(
    data: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    subject = Subject(
        name=data.name,
        slug=data.slug,
        order_index=data.order_index,
    )
    db.add(subject)
    await db.flush()
    await db.refresh(subject)
    return subject


@router.put("/subjects/{subject_id}", response_model=SubjectOut)
async def update_subject(
    subject_id: UUID,
    data: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    if data.name is not None:
        sub.name = data.name
    if data.slug is not None:
        sub.slug = data.slug
    if data.order_index is not None:
        sub.order_index = data.order_index
    await db.flush()
    await db.refresh(sub)
    return sub


@router.delete("/subjects/{subject_id}", status_code=204)
async def delete_subject(
    subject_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    await db.delete(sub)
    return None


@router.get("/subjects/{subject_id}/modules", response_model=list[ModuleOut])
async def list_modules(
    subject_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Module).where(Module.subject_id == subject_id).order_by(Module.order_index)
    )
    modules = list(result.scalars().all())
    return [ModuleOut.model_validate(m) for m in modules]


@router.get("/modules/{module_id}", response_model=ModuleOut)
async def get_module(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    mod = result.scalar_one_or_none()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    return ModuleOut.model_validate(mod)


@router.post("/modules", response_model=ModuleOut)
async def create_module(
    data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    module = Module(
        subject_id=data.subject_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        order_index=data.order_index,
        estimated_minutes=data.estimated_minutes,
    )
    db.add(module)
    await db.flush()
    await db.refresh(module)
    return ModuleOut.model_validate(module)


@router.put("/modules/{module_id}", response_model=ModuleOut)
async def update_module(
    module_id: UUID,
    data: ModuleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    mod = result.scalar_one_or_none()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    if data.name is not None:
        mod.name = data.name
    if data.slug is not None:
        mod.slug = data.slug
    if data.description is not None:
        mod.description = data.description
    if data.order_index is not None:
        mod.order_index = data.order_index
    if data.estimated_minutes is not None:
        mod.estimated_minutes = data.estimated_minutes
    await db.flush()
    await db.refresh(mod)
    return ModuleOut.model_validate(mod)


@router.delete("/modules/{module_id}", status_code=204)
async def delete_module(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Module).where(Module.id == module_id))
    mod = result.scalar_one_or_none()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    await db.delete(mod)
    return None


@router.get("/modules/{module_id}/lessons", response_model=list[LessonOut])
async def list_lessons(
    module_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.order_index)
    )
    return [LessonOut.model_validate(l) for l in result.scalars().all()]


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
async def get_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonOut.model_validate(lesson)


@router.post("/lessons", response_model=LessonOut)
async def create_lesson(
    data: LessonCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    lesson = Lesson(
        module_id=data.module_id,
        title=data.title,
        content=data.content,
        order_index=data.order_index,
    )
    db.add(lesson)
    await db.flush()
    await db.refresh(lesson)
    return LessonOut.model_validate(lesson)


@router.put("/lessons/{lesson_id}", response_model=LessonOut)
async def update_lesson(
    lesson_id: UUID,
    data: LessonUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if data.title is not None:
        lesson.title = data.title
    if data.content is not None:
        lesson.content = data.content
    if data.order_index is not None:
        lesson.order_index = data.order_index
    await db.flush()
    await db.refresh(lesson)
    return LessonOut.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=204)
async def delete_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    await db.delete(lesson)
    return None


# ----- Concepts -----
@router.get("/lessons/{lesson_id}/concepts", response_model=list[ConceptOut])
async def list_concepts(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Concept).where(Concept.lesson_id == lesson_id).order_by(Concept.order_index)
    )
    return [ConceptOut.model_validate(c) for c in result.scalars().all()]


@router.post("/concepts", response_model=ConceptOut)
async def create_concept(
    data: ConceptCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    concept = Concept(
        lesson_id=data.lesson_id,
        title=data.title,
        content=data.content,
        order_index=data.order_index,
    )
    db.add(concept)
    await db.flush()
    await db.refresh(concept)
    return ConceptOut.model_validate(concept)


# ----- Exercises -----
@router.get("/lessons/{lesson_id}/exercises", response_model=list[ExerciseOut])
async def list_exercises(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.order_index)
    )
    return [ExerciseOut.model_validate(e) for e in result.scalars().all()]


@router.post("/exercises", response_model=ExerciseOut)
async def create_exercise(
    data: ExerciseCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    exercise = Exercise(
        lesson_id=data.lesson_id,
        title=data.title,
        statement=data.statement,
        solution=data.solution,
        order_index=data.order_index,
    )
    db.add(exercise)
    await db.flush()
    await db.refresh(exercise)
    return ExerciseOut.model_validate(exercise)


# ----- Past exams -----
@router.get("/subjects/{subject_id}/past-exams", response_model=list[PastExamOut])
async def list_past_exams(
    subject_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PastExam).where(PastExam.subject_id == subject_id).order_by(PastExam.order_index)
    )
    return [PastExamOut.model_validate(e) for e in result.scalars().all()]


@router.get("/past-exams/{past_exam_id}", response_model=PastExamOut)
async def get_past_exam(
    past_exam_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(PastExam).where(PastExam.id == past_exam_id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Past exam not found")
    return PastExamOut.model_validate(exam)


@router.get("/past-exams/{past_exam_id}/questions", response_model=list[PastExamQuestionOut])
async def get_past_exam_questions(
    past_exam_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PastExamQuestion)
        .where(PastExamQuestion.past_exam_id == past_exam_id)
        .order_by(PastExamQuestion.order_index)
    )
    questions = list(result.scalars().all())
    return [
        PastExamQuestionOut(
            id=q.id,
            past_exam_id=q.past_exam_id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            order_index=q.order_index,
        )
        for q in questions
    ]


@router.post("/past-exams/{past_exam_id}/submit", response_model=PastExamResultOut)
async def submit_past_exam(
    past_exam_id: UUID,
    body: SubmitPastExamBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PastExamQuestion).where(PastExamQuestion.past_exam_id == past_exam_id)
    )
    questions = {q.id: q for q in result.scalars().all()}
    if not questions:
        raise HTTPException(status_code=404, detail="Past exam not found")
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
            "question_id": str(q.id),
            "correct": is_correct,
            "correct_option": q.correct_option,
            "explanation": q.explanation,
        })
    total = len(questions)
    score_percent = round(100 * correct / total, 1) if total else 0.0
    attempt = PastExamAttempt(
        user_id=current_user.id,
        past_exam_id=past_exam_id,
        score_percent=score_percent,
    )
    db.add(attempt)
    await db.flush()
    for a in body.answers:
        q = questions.get(a.question_id)
        if q:
            ans = PastExamAttemptAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option=a.selected_option.upper(),
            )
            db.add(ans)
    await db.refresh(attempt)
    return PastExamResultOut(
        attempt_id=attempt.id,
        score_percent=score_percent,
        total_questions=total,
        correct_count=correct,
        feedback=feedback,
    )


@router.get("/past-exams/{past_exam_id}/attempts", response_model=list[PastExamAttemptOut])
async def list_past_exam_attempts(
    past_exam_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PastExamAttempt)
        .where(
            PastExamAttempt.past_exam_id == past_exam_id,
            PastExamAttempt.user_id == current_user.id,
        )
        .order_by(PastExamAttempt.completed_at.desc())
    )
    attempts = result.scalars().all()
    return [
        PastExamAttemptOut(
            id=a.id,
            past_exam_id=a.past_exam_id,
            score_percent=a.score_percent,
            completed_at=a.completed_at.isoformat() if a.completed_at else "",
        )
        for a in attempts
    ]


@router.get("/past-exam-attempts/{attempt_id}", response_model=PastExamResultOut)
async def get_past_exam_attempt_result(
    attempt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PastExamAttempt).where(
            PastExamAttempt.id == attempt_id,
            PastExamAttempt.user_id == current_user.id,
        )
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    # Rebuild feedback from stored answers + questions
    q_result = await db.execute(
        select(PastExamQuestion).where(PastExamQuestion.past_exam_id == attempt.past_exam_id)
    )
    questions = {q.id: q for q in q_result.scalars().all()}
    # We need PastExamAttemptAnswer for this attempt - check if model has relationship
    ans_result = await db.execute(
        select(PastExamAttemptAnswer).where(PastExamAttemptAnswer.attempt_id == attempt_id)
    )
    answers = {a.question_id: a.selected_option for a in ans_result.scalars().all()}
    feedback = []
    correct_count = 0
    for q in questions.values():
        sel = answers.get(q.id, "")
        is_correct = q.correct_option.upper() == sel.upper()
        if is_correct:
            correct_count += 1
        feedback.append({
            "question_id": str(q.id),
            "correct": is_correct,
            "correct_option": q.correct_option,
            "explanation": q.explanation,
        })
    return PastExamResultOut(
        attempt_id=attempt.id,
        score_percent=attempt.score_percent,
        total_questions=len(questions),
        correct_count=correct_count,
        feedback=feedback,
    )
