from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, auth, users, content, progress, quiz, flashcards, tutor, payments, parent, schools
from app.core.config import settings
from app.db.base import engine, Base, AsyncSessionLocal
from app.models import User, OTPCode, School  # noqa: F401 - register models
from app.models import content as _content  # noqa: F401 - register tables
from app.models import quiz as _quiz  # noqa: F401 - register tables
from app.models import subscription as _subscription  # noqa: F401 - register tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").warning("DB init skipped: %s", e)
    # Seed default school if not present
    from sqlalchemy import select  # local import to avoid circulars

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(School).where(School.name == "Labone Senior High School")
        )
        school = result.scalar_one_or_none()
        if not school:
            school = School(
                name="Labone Senior High School",
                city="Accra",
                region="Greater Accra",
                country="Ghana",
            )
            session.add(school)
            await session.commit()
    yield


app = FastAPI(
    title="SCHOLA API",
    description="Backend API for SCHOLA - WASSCE preparation platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
app.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(parent.router, prefix="/parent", tags=["parent"])
app.include_router(schools.router, prefix="/schools", tags=["schools"])


@app.get("/")
def root():
    return {"message": "SCHOLA API", "docs": "/docs"}
