"""
Client for the SCHOLA AI Engine. If AI_ENGINE_URL is not set, all methods return None or stub.
"""
import os
from typing import Any

import httpx

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "").rstrip("/")


async def generate_quiz(context: str, num_questions: int = 5) -> dict[str, Any] | None:
    if not AI_ENGINE_URL:
        return None
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            f"{AI_ENGINE_URL}/generate-quiz",
            json={"context": context, "num_questions": num_questions},
        )
        r.raise_for_status()
        return r.json()


async def generate_flashcards(context: str, num_cards: int = 10) -> dict[str, Any] | None:
    if not AI_ENGINE_URL:
        return None
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            f"{AI_ENGINE_URL}/generate-flashcards",
            json={"context": context, "num_cards": num_cards},
        )
        r.raise_for_status()
        return r.json()


async def tutor_chat(message: str, user_id: str | None = None, syllabus_context: str | None = None) -> dict[str, Any] | None:
    if not AI_ENGINE_URL:
        return None
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            f"{AI_ENGINE_URL}/tutor/chat",
            json={"message": message, "user_id": user_id, "syllabus_context": syllabus_context},
        )
        r.raise_for_status()
        return r.json()
