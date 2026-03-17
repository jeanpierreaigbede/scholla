from uuid import UUID

from pydantic import BaseModel


class SchoolBase(BaseModel):
    name: str
    address: str | None = None
    picture_url: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = "Ghana"
    phone: str | None = None
    website_url: str | None = None


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    picture_url: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    phone: str | None = None
    website_url: str | None = None


class SchoolOut(SchoolBase):
    id: UUID

    class Config:
        from_attributes = True

