from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.content import (
    Module,
    Lesson,
    UserProgress,
    Subject,
    PastExam,
    PastExamAttempt,
)
from app.schemas.progress import (
    DashboardProgressOut,
    LessonCompletionOut,
    SubjectProgressItemOut,
    SubjectProgressOut,
)
from app.schemas.content import NextTopicOut

router = APIRouter()


@router.get("/dashboard", response_model=DashboardProgressOut)
async def get_dashboard_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate progress for all subjects and overall exam readiness."""
    subjects_result = await db.execute(select(Subject).order_by(Subject.order_index))
    subjects = list(subjects_result.scalars().all())
    subject_progress_list: list[SubjectProgressItemOut] = []
    total_percent = 0.0
    count_with_activity = 0

    for subject in subjects:
        module_ids_result = await db.execute(
            select(Module.id).where(Module.subject_id == subject.id)
        )
        module_ids = [r[0] for r in module_ids_result.all()]
        if not module_ids:
            lessons_total = 0
            past_exams_total = 0
        else:
            lessons_total_result = await db.execute(
                select(func.count(Lesson.id)).where(Lesson.module_id.in_(module_ids))
            )
            lessons_total = lessons_total_result.scalar() or 0
            past_exams_total_result = await db.execute(
                select(func.count(PastExam.id)).where(PastExam.subject_id == subject.id)
            )
            past_exams_total = past_exams_total_result.scalar() or 0

        if not module_ids:
            lessons_completed = 0
        else:
            done_lessons = await db.execute(
                select(Lesson.id)
                .where(Lesson.module_id.in_(module_ids))
                .where(
                    Lesson.id.in_(
                        select(UserProgress.lesson_id).where(
                            UserProgress.user_id == current_user.id,
                            UserProgress.completed_at.isnot(None),
                        )
                    )
                )
            )
            lessons_completed = len(done_lessons.all())

        exams_done_result = await db.execute(
            select(func.count(PastExamAttempt.id))
            .where(
                PastExamAttempt.user_id == current_user.id,
                PastExamAttempt.past_exam_id.in_(
                    select(PastExam.id).where(PastExam.subject_id == subject.id)
                ),
            )
        )
        past_exams_completed = exams_done_result.scalar() or 0

        total_activities = lessons_total + past_exams_total
        completed_activities = lessons_completed + past_exams_completed
        progress_percent = (
            round(100 * completed_activities / total_activities, 1) if total_activities else 0.0
        )
        subject_progress_list.append(
            SubjectProgressItemOut(
                subject_id=subject.id,
                subject_name=subject.name,
                progress_percent=progress_percent,
            )
        )
        if total_activities > 0:
            total_percent += progress_percent
            count_with_activity += 1

    exam_readiness = (
        round(total_percent / count_with_activity, 1) if count_with_activity else 0.0
    )
    return DashboardProgressOut(
        exam_readiness_percent=exam_readiness,
        exam_readiness_delta=0,
        subject_progress=subject_progress_list,
        daily_streak_days=0,
        today_goal_minutes=45,
    )


@router.get("/completions", response_model=list[LessonCompletionOut])
async def list_my_completions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserProgress)
        .where(UserProgress.user_id == current_user.id)
        .order_by(UserProgress.completed_at.desc())
    )
    return [LessonCompletionOut.model_validate(p) for p in result.scalars().all()]


@router.get("/next-topic", response_model=NextTopicOut | None)
async def get_next_topic(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # First incomplete lesson in first module (or first module if no progress)
    completed = select(UserProgress.lesson_id).where(
        UserProgress.user_id == current_user.id,
        UserProgress.completed_at.isnot(None),
    )
    result = await db.execute(
        select(Lesson, Module, Subject)
        .join(Module, Lesson.module_id == Module.id)
        .join(Subject, Module.subject_id == Subject.id)
        .where(Lesson.id.not_in(completed))
        .order_by(Module.order_index, Lesson.order_index)
        .limit(1)
    )
    row = result.first()
    if not row:
        return None
    lesson, module, subject = row
    return NextTopicOut(
        module_id=module.id,
        module_name=module.name,
        subject_name=subject.name,
        lesson_id=lesson.id,
        lesson_title=lesson.title,
        estimated_minutes_left=15,
        difficulty="Intermediate",
    )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompletionOut)
async def complete_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lesson not found")
    progress = UserProgress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        completed_at=datetime.utcnow(),
    )
    db.add(progress)
    await db.flush()
    await db.refresh(progress)
    return LessonCompletionOut.model_validate(progress)


@router.get("/subjects/{subject_id}", response_model=SubjectProgressOut)
async def get_subject_progress(
    subject_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Progression du cours : leçons complétées + past exams passés."""
    # Total leçons dans ce subject (via modules)
    modules_result = await db.execute(
        select(Module.id).where(Module.subject_id == subject_id)
    )
    module_ids = [r[0] for r in modules_result.all()]
    if not module_ids:
        lessons_total = 0
        past_exams_total = 0
    else:
        from sqlalchemy import func
        lessons_total_result = await db.execute(
            select(func.count(Lesson.id)).where(Lesson.module_id.in_(module_ids))
        )
        lessons_total = lessons_total_result.scalar() or 0
        past_exams_total_result = await db.execute(
            select(func.count(PastExam.id)).where(PastExam.subject_id == subject_id)
        )
        past_exams_total = past_exams_total_result.scalar() or 0

    # Leçons complétées par l'utilisateur dans ces modules
    if module_ids:
        done_lessons_result = await db.execute(
            select(Lesson.id)
            .where(Lesson.module_id.in_(module_ids))
            .where(
                Lesson.id.in_(
                    select(UserProgress.lesson_id).where(
                        UserProgress.user_id == current_user.id,
                        UserProgress.completed_at.isnot(None),
                    )
                )
            )
        )
        lessons_completed = len(done_lessons_result.all())
    else:
        lessons_completed = 0

    # Past exams passés par l'utilisateur pour ce subject
    exams_done_result = await db.execute(
        select(func.count(PastExamAttempt.id))
        .where(
            PastExamAttempt.user_id == current_user.id,
            PastExamAttempt.past_exam_id.in_(
                select(PastExam.id).where(PastExam.subject_id == subject_id)
            ),
        )
    )
    past_exams_completed = exams_done_result.scalar() or 0

    # Progression agrégée : moyenne pondérée (50% leçons, 50% exams) ou simple
    total_activities = lessons_total + past_exams_total
    completed_activities = lessons_completed + past_exams_completed
    progress_percent = (
        round(100 * completed_activities / total_activities, 1) if total_activities else 0.0
    )
    return SubjectProgressOut(
        subject_id=subject_id,
        lessons_completed=lessons_completed,
        lessons_total=lessons_total,
        past_exams_completed=past_exams_completed,
        past_exams_total=past_exams_total,
        progress_percent=progress_percent,
    )


@router.delete("/completions/{progress_id}", status_code=204)
async def delete_completion(
    progress_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.id == progress_id,
            UserProgress.user_id == current_user.id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=404, detail="Completion not found")
    await db.delete(progress)
    return None
