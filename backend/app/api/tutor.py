"""
Smart Tutor chat - proxy to AI engine. Stub if AI_ENGINE_URL not set.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_client import tutor_chat

router = APIRouter()


class TutorMessageRequest(BaseModel):
    message: str


class TutorMessageResponse(BaseModel):
    response: str
    sources: list[str] = []


@router.post("/chat", response_model=TutorMessageResponse)
async def post_tutor_chat(
    body: TutorMessageRequest,
    current_user: User = Depends(get_current_user),
):
    result = await tutor_chat(
        message=body.message,
        user_id=str(current_user.id),
        syllabus_context=None,
    )
    if result:
        return TutorMessageResponse(
            response=result.get("response", ""),
            sources=result.get("sources", []),
        )
    return TutorMessageResponse(
        response="The Smart Tutor is not configured yet. Set AI_ENGINE_URL and enable an LLM in the AI engine.",
        sources=[],
    )
