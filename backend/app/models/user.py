import enum
import uuid
from sqlalchemy import String, Enum, Boolean, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.db.base import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"
    ADMIN = "admin"


class StudyIntensity(str, enum.Enum):
    SOFT = "soft"
    HARD = "hard"
    ADAPTIVE = "adaptive"


class SchoolYear(str, enum.Enum):
    SHS1 = "shs1"
    SHS2 = "shs2"
    SHS3 = "shs3"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)  # null for OAuth
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    school_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    school_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("schools.id"), nullable=True
    )
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    study_intensity: Mapped[StudyIntensity | None] = mapped_column(
        Enum(StudyIntensity), nullable=True
    )
    school_year: Mapped[SchoolYear | None] = mapped_column(Enum(SchoolYear), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
