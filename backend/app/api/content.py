from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.content import Subject, Module, Lesson
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
