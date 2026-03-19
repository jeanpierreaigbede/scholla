#!/usr/bin/env python3
"""
Vide le contenu cours actuel puis importe le cours depuis courses.json (structure WAEC).
- Un seul subject (root title/slug), modules = chapitres, lessons avec concepts.
- Lesson.content = concaténation de tous les concepts (théorie + exemples + résumé) pour l'affichage.
- Les IDs du JSON sont ignorés ; la base génère ses propres UUID.
- Les quiz de chaque leçon sont créés et liés au module.

Usage (depuis backend/ ou repo root) :
  python scripts/import_courses_from_courses_json.py [--dry-run] [--file PATH]
  python backend/scripts/import_courses_from_courses_json.py [--file /path/to/courses.json]

Fichier par défaut : courses.json à la racine du repo (schola/courses.json).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Repo root (schola) for default courses.json
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.content import Subject, Module, Lesson, Concept
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.models.content import (
    PastExamAttemptAnswer,
    PastExamAttempt,
    PastExamQuestion,
    PastExam,
    UserProgress,
    Exercise,
)


def get_sync_url() -> str:
    url = settings.DATABASE_URL
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql")
    return url


def sanitize(s: str) -> str:
    if not s:
        return s
    return s.replace("\x00", "").replace("\u0000", "")


def slugify(title: str, max_len: int = 200) -> str:
    t = title.lower().strip()
    t = re.sub(r"[^\w\s-]", "", t)
    t = re.sub(r"[-\s]+", "-", t).strip("-")
    return sanitize(t)[:max_len] or "module"


def build_lesson_content(concepts: list[dict]) -> str:
    """Build lesson content from all concepts (theory + examples + resume) for display."""
    if not concepts:
        return ""
    parts = []
    for c in sorted(concepts, key=lambda x: x.get("order_index", 0)):
        title = c.get("title") or "Concept"
        content = (c.get("content") or "").strip()
        parts.append(f"## {sanitize(title)}\n\n{sanitize(content)}")
    return "\n\n".join(parts)


def load_json(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        start = 1 if lines[0].strip().startswith("```") else 0
        end = len(lines)
        if lines[-1].strip() == "```":
            end = len(lines) - 1
        raw = "\n".join(lines[start:end])
    return json.loads(raw)


def clear_content(session) -> None:
    """Delete all course content and quizzes (same order as clear_course_content.py)."""
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
    session.flush()


def import_courses(session, data: dict, dry_run: bool) -> None:
    title = (data.get("title") or "Course").strip()
    slug = (data.get("slug") or slugify(title))[:100]
    title = sanitize(title)[:255]
    slug = sanitize(slug)[:100]
    modules_data = data.get("modules") or []

    if dry_run:
        print(f"Subject: {title} ({slug})")
        print(f"Modules: {len(modules_data)}")
        for m in modules_data:
            lessons = m.get("lessons") or []
            print(f"  - {m.get('title')}: {len(lessons)} lesson(s)")
            for le in lessons:
                concepts = le.get("concepts") or []
                quiz = le.get("quiz") or {}
                q_count = len(quiz.get("questions") or [])
                print(f"      - {le.get('title')}: {len(concepts)} concept(s), quiz: {q_count} question(s)")
        return

    subject = Subject(name=title, slug=slug, order_index=0)
    session.add(subject)
    session.flush()

    for mod_idx, mod_data in enumerate(modules_data):
        m_title = (mod_data.get("title") or f"Module {mod_idx+1}").strip()
        m_title = sanitize(m_title)[:255]
        m_slug = slugify(m_title, 255)
        m_order = int(mod_data.get("order_index") or mod_idx + 1)

        module = Module(
            subject_id=subject.id,
            name=m_title,
            slug=m_slug,
            description=None,
            order_index=m_order,
            estimated_minutes=0,
        )
        session.add(module)
        session.flush()

        lessons_data = mod_data.get("lessons") or []
        for le_idx, le_data in enumerate(lessons_data):
            le_title = (le_data.get("title") or f"Lesson {le_idx+1}").strip()
            le_title = sanitize(le_title)[:255]
            le_order = int(le_data.get("order_index") or le_idx + 1)
            concepts_data = le_data.get("concepts") or []

            lesson_content = build_lesson_content(concepts_data)
            lesson = Lesson(
                module_id=module.id,
                title=le_title,
                content=lesson_content or "(No content)",
                order_index=le_order,
            )
            session.add(lesson)
            session.flush()

            for c_idx, c_data in enumerate(concepts_data):
                c_title = (c_data.get("title") or "Concept").strip()
                c_title = sanitize(c_title)[:255]
                c_content = (c_data.get("content") or "").strip()
                c_content = sanitize(c_content)
                c_order = int(c_data.get("order_index") or c_idx + 1)
                concept = Concept(
                    lesson_id=lesson.id,
                    title=c_title,
                    content=c_content,
                    order_index=c_order,
                )
                session.add(concept)

            quiz_data = le_data.get("quiz")
            if quiz_data and (quiz_data.get("questions") or []):
                quiz_title = (quiz_data.get("title") or f"Quiz: {le_title}").strip()
                quiz_title = sanitize(quiz_title)[:255]
                quiz = Quiz(
                    module_id=module.id,
                    title=quiz_title,
                    description=None,
                )
                session.add(quiz)
                session.flush()

                for q_idx, q_data in enumerate(quiz_data.get("questions") or []):
                    q_text = (q_data.get("question_text") or "").strip()
                    q_text = sanitize(q_text)
                    options = q_data.get("options") or []
                    if len(options) < 2:
                        continue
                    opt_a = sanitize(str(options[0]))[:500]
                    opt_b = sanitize(str(options[1]))[:500]
                    opt_c = sanitize(str(options[2]))[:500] if len(options) > 2 else None
                    opt_d = sanitize(str(options[3]))[:500] if len(options) > 3 else None
                    correct = (q_data.get("correct_option") or "A").strip().upper()
                    if correct not in ("A", "B", "C", "D"):
                        correct = "A"
                    expl = (q_data.get("explanation") or "").strip()
                    expl = sanitize(expl) if expl else None
                    q_order = int(q_data.get("order_index") or q_idx + 1)
                    session.add(
                        QuizQuestion(
                            quiz_id=quiz.id,
                            question_text=q_text,
                            option_a=opt_a,
                            option_b=opt_b,
                            option_c=opt_c,
                            option_d=opt_d,
                            correct_option=correct,
                            explanation=expl,
                            order_index=q_order,
                        )
                    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Clear content and import from courses.json")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB, only show what would be done")
    parser.add_argument(
        "--file",
        type=Path,
        default=REPO_ROOT / "courses.json",
        help="Path to courses.json (default: repo root / courses.json)",
    )
    args = parser.parse_args()

    path = args.file
    if not path.is_absolute():
        path = (REPO_ROOT / path).resolve()
    if not path.exists():
        print(f"File not found: {path}")
        sys.exit(1)

    data = load_json(path)
    sync_url = get_sync_url()
    engine = create_engine(sync_url)
    Session = sessionmaker(engine, autocommit=False, autoflush=False)

    with Session() as session:
        if args.dry_run:
            print("Dry-run: would clear content then import the following.")
            import_courses(session, data, dry_run=True)
            print("Dry-run: no changes written.")
            return

        print("Clearing existing course content and quizzes...")
        clear_content(session)
        print("Importing from", path, "...")
        import_courses(session, data, dry_run=False)
        session.commit()
        print("Done. Subject, modules, lessons, concepts, and quizzes imported.")


if __name__ == "__main__":
    main()
