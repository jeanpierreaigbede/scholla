from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import FlashcardDeck, Flashcard
from app.schemas.flashcard import FlashcardDeckOut, FlashcardOut

router = APIRouter()


@router.get("/decks", response_model=list[FlashcardDeckOut])
async def list_decks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FlashcardDeck).order_by(FlashcardDeck.id)
    )
    decks = list(result.scalars().all())
    out = []
    for d in decks:
        count_result = await db.execute(
            select(func.count(Flashcard.id)).where(Flashcard.deck_id == d.id)
        )
        count = count_result.scalar() or 0
        out.append(
            FlashcardDeckOut(
                id=d.id,
                module_id=d.module_id,
                title=d.title,
                description=d.description,
                card_count=count,
            )
        )
    return out


@router.get("/decks/{deck_id}", response_model=FlashcardDeckOut)
async def get_deck(
    deck_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(FlashcardDeck).where(FlashcardDeck.id == deck_id))
    deck = result.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    count_result = await db.execute(
        select(func.count(Flashcard.id)).where(Flashcard.deck_id == deck.id)
    )
    count = count_result.scalar() or 0
    return FlashcardDeckOut(
        id=deck.id,
        module_id=deck.module_id,
        title=deck.title,
        description=deck.description,
        card_count=count,
    )


@router.get("/decks/{deck_id}/cards", response_model=list[FlashcardOut])
async def list_cards(
    deck_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Flashcard).where(Flashcard.deck_id == deck_id).order_by(Flashcard.order_index)
    )
    return [FlashcardOut.model_validate(c) for c in result.scalars().all()]


@router.get("/cards/{card_id}", response_model=FlashcardOut)
async def get_card(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Flashcard).where(Flashcard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return FlashcardOut.model_validate(card)
