"""
Parent portal API: view linked student progress. Parent auth is same User with role=parent.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.subscription import ParentStudentLink

router = APIRouter()


class LinkChildRequest(BaseModel):
    student_id: UUID


def require_parent(current_user: User) -> User:
    if current_user.role != UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Parent access only")
    return current_user


@router.get("/children")
async def list_children(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_parent(current_user)
    result = await db.execute(
        select(User)
        .join(ParentStudentLink, ParentStudentLink.student_id == User.id)
        .where(ParentStudentLink.parent_id == current_user.id)
    )
    students = result.scalars().all()
    return {
        "children": [
            {"id": s.id, "full_name": s.full_name, "email": s.email, "school_name": s.school_name}
            for s in students
        ]
    }


@router.post("/children", status_code=201)
async def link_child(
    body: LinkChildRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_parent(current_user)
    if body.student_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot link to yourself")
    result = await db.execute(select(User).where(User.id == body.student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.role != UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="User is not a student")
    existing = await db.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == body.student_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already linked to this student")
    link = ParentStudentLink(parent_id=current_user.id, student_id=body.student_id)
    db.add(link)
    return {"ok": True, "student_id": body.student_id}


@router.delete("/children/{student_id}", status_code=204)
async def unlink_child(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_parent(current_user)
    result = await db.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id,
        )
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    await db.delete(link)
    return None


@router.get("/children/{student_id}/progress")
async def get_child_progress(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_parent(current_user)
    result = await db.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Student not linked")
    # TODO: aggregate progress (Exam Readiness, modules completed, recent activity)
    return {
        "student_id": student_id,
        "exam_readiness_percent": 0,
        "modules_completed": 0,
        "weekly_report": "Stub. Implement progress aggregation.",
    }
