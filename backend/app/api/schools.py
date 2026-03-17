from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.base import get_db
from app.models.school import School
from app.models.user import User
from app.schemas.school import SchoolOut, SchoolCreate, SchoolUpdate

router = APIRouter()


@router.get("", response_model=list[SchoolOut])
async def list_schools(
    db: AsyncSession = Depends(get_db),
) -> list[SchoolOut]:
    result = await db.execute(select(School).order_by(School.name))
    return list(result.scalars().all())


@router.get("/{school_id}", response_model=SchoolOut)
async def get_school(
    school_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> SchoolOut:
    result = await db.execute(select(School).where(School.id == school_id))
    school = result.scalar_one_or_none()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school


@router.post("", response_model=SchoolOut)
async def create_school(
    data: SchoolCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SchoolOut:
    school = School(
        name=data.name,
        address=data.address,
        picture_url=data.picture_url,
        city=data.city,
        region=data.region,
        country=data.country,
        phone=data.phone,
        website_url=data.website_url,
    )
    db.add(school)
    await db.flush()
    await db.refresh(school)
    return school


@router.put("/{school_id}", response_model=SchoolOut)
async def update_school(
    school_id: UUID,
    data: SchoolUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> SchoolOut:
    result = await db.execute(select(School).where(School.id == school_id))
    school = result.scalar_one_or_none()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    if data.name is not None:
        school.name = data.name
    if data.address is not None:
        school.address = data.address
    if data.picture_url is not None:
        school.picture_url = data.picture_url
    if data.city is not None:
        school.city = data.city
    if data.region is not None:
        school.region = data.region
    if data.country is not None:
        school.country = data.country
    if data.phone is not None:
        school.phone = data.phone
    if data.website_url is not None:
        school.website_url = data.website_url

    await db.flush()
    await db.refresh(school)
    return school


@router.delete("/{school_id}", status_code=204)
async def delete_school(
    school_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> None:
    result = await db.execute(select(School).where(School.id == school_id))
    school = result.scalar_one_or_none()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    await db.delete(school)
    return None

