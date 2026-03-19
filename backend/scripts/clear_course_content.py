#!/usr/bin/env python3
"""
Vide le contenu des cours en base : subjects, modules, lessons, concepts, exercises,
et les past exams (et tentatives) qui en dépendent.
Conserve : users, schools, user_progress est supprimé (lié aux lessons).

Usage (depuis backend/) :
  python scripts/clear_course_content.py [--dry-run]
"""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from sqlalchemy import create_engine, delete, select, func
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.content import (
    Subject,
    Module,
    Lesson,
    Concept,
    Exercise,
    PastExam,
    PastExamQuestion,
    PastExamAttempt,
    PastExamAttemptAnswer,
    UserProgress,
)
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt


def get_sync_url() -> str:
    url = settings.DATABASE_URL
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql")
    return url


def clear_course_content(dry_run: bool = False) -> None:
    sync_url = get_sync_url()
    engine = create_engine(sync_url)
    Session = sessionmaker(engine, autocommit=False, autoflush=False)

    with Session() as session:
        # Ordre des suppressions (références FK)
        # 1. Réponses des tentatives past exam
        # 2. Tentatives past exam
        # 3. Questions past exam
        # 4. Past exams
        # 5. User progress (lesson_id)
        # 6. Quiz attempts, quiz questions, quizzes
        # 7. Concepts, Exercises
        # 8. Lessons
        # 9. Modules
        # 10. Subjects

        if dry_run:
            for model, name in [
                (PastExamAttemptAnswer, "past_exam_attempt_answers"),
                (PastExamAttempt, "past_exam_attempts"),
                (PastExamQuestion, "past_exam_questions"),
                (PastExam, "past_exams"),
                (UserProgress, "user_progress"),
                (QuizAttempt, "quiz_attempts"),
                (QuizQuestion, "quiz_questions"),
                (Quiz, "quizzes"),
                (Concept, "concepts"),
                (Exercise, "exercises"),
                (Lesson, "lessons"),
                (Module, "modules"),
                (Subject, "subjects"),
            ]:
                r = session.execute(select(func.count()).select_from(model))
                count = r.scalar() or 0
                print(f"  {name}: {count} enregistrement(s) seraient supprimés")
            print("Dry-run : aucune suppression.")
            return

        session.execute(delete(PastExamAttemptAnswer))
        session.execute(delete(PastExamAttempt))
        session.execute(delete(PastExamQuestion))
        session.execute(delete(PastExam))
        session.execute(delete(UserProgress))
        session.execute(delete(QuizAttempt))
        session.execute(delete(QuizQuestion))
        session.execute(delete(Quiz))
        session.execute(delete(Concept))
        session.execute(delete(Exercise))
        session.execute(delete(Lesson))
        session.execute(delete(Module))
        session.execute(delete(Subject))
        session.commit()
        print("Contenu des cours (subjects, modules, lessons, concepts, exercises, quizzes, past exams, progress) supprimé.")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("Mode dry-run :")
    clear_course_content(dry_run=dry_run)
