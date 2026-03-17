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
