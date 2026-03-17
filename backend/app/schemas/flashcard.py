from uuid import UUID

from pydantic import BaseModel


class FlashcardOut(BaseModel):
    id: UUID
    deck_id: UUID
    front: str
    back: str
    order_index: int

    class Config:
        from_attributes = True


class FlashcardDeckOut(BaseModel):
    id: UUID
    module_id: UUID | None
    title: str
    description: str | None
    card_count: int = 0

    class Config:
        from_attributes = True
