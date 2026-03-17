from uuid import UUID

from pydantic import BaseModel, EmailStr
from app.models.user import UserRole, StudyIntensity, SchoolYear


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    school_name: str | None
    role: UserRole
    is_verified: bool
    study_intensity: StudyIntensity | None = None
    school_year: SchoolYear | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    study_intensity: StudyIntensity | None = None
    school_year: SchoolYear | None = None
    avatar_url: str | None = None
