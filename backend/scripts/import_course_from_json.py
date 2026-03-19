#!/usr/bin/env python3
"""
Importe le contenu des cours depuis un fichier JSON (structure subject / modules / lessons / concepts / exercises).
Le champ Lesson.content est rempli par la concaténation des concepts (pour affichage leçon).

Usage (depuis backend/) :
  python scripts/import_course_from_json.py [--dry-run] [--file PATH]

Format JSON attendu :
  {
    "subject": { "name": "...", "slug": "...", "order_index": 0 },
    "modules": [
      {
        "name": "...",
        "slug": "...",
        "order_index": 0,
        "description": "...",
        "lessons": [
          {
            "title": "...",
            "order_index": 0,
            "concepts": [ { "title": "...", "content": "...", "order_index": 0 } ],
            "exercises": [ { "title": "...", "statement": "...", "solution": "...", "order_index": 0 } ]
          }
        ]
      }
    ]
  }
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.content import Subject, Module, Lesson, Concept, Exercise


def get_sync_url() -> str:
    url = settings.DATABASE_URL
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql")
    return url


def sanitize(s: str) -> str:
    if not s:
        return s
    return s.replace("\x00", "").replace("\u0000", "")


def build_lesson_content(concepts: list[dict]) -> str:
    """Génère un contenu markdown pour la leçon à partir des concepts."""
    if not concepts:
        return ""
    parts = []
    for c in sorted(concepts, key=lambda x: x.get("order_index", 0)):
        title = c.get("title") or "Concept"
        content = c.get("content") or ""
        parts.append(f"## {title}\n\n{content}")
    return "\n\n".join(parts)


def import_from_json(session, data: dict, dry_run: bool) -> None:
    subject_data = data.get("subject") or {}
    modules_data = data.get("modules") or []

    name = subject_data.get("name") or "Subject"
    slug = subject_data.get("slug") or "subject"
    order_index = int(subject_data.get("order_index") or 0)
    slug = sanitize(slug)[:100]
    name = sanitize(name)[:255]

    if dry_run:
        print(f"Subject: {name} ({slug})")
        print(f"Modules: {len(modules_data)}")
        for m in modules_data:
            lessons = m.get("lessons") or []
            print(f"  - {m.get('name')}: {len(lessons)} lesson(s)")
            for le in lessons:
                concepts = le.get("concepts") or []
                exercises = le.get("exercises") or []
                print(f"      - {le.get('title')}: {len(concepts)} concept(s), {len(exercises)} exercise(s)")
        return

    subject = Subject(name=name, slug=slug, order_index=order_index)
    session.add(subject)
    session.flush()

    for mod_data in modules_data:
        m_name = sanitize((mod_data.get("name") or "Module")[:255])
        m_slug = sanitize((mod_data.get("slug") or "module")[:255])
        m_desc = (mod_data.get("description") or "").strip()
        if m_desc:
            m_desc = sanitize(m_desc)[:10000]
        m_order = int(mod_data.get("order_index") or 0)
        module = Module(
            subject_id=subject.id,
            name=m_name,
            slug=m_slug,
            description=m_desc or None,
            order_index=m_order,
            estimated_minutes=0,
        )
        session.add(module)
        session.flush()

        for le_data in (mod_data.get("lessons") or []):
            le_title = sanitize((le_data.get("title") or "Lesson")[:255])
            le_order = int(le_data.get("order_index") or 0)
            concepts = le_data.get("concepts") or []
            exercises_data = le_data.get("exercises") or []
            content = build_lesson_content(concepts)
            if not content:
                content = "(Contenu à venir.)"
            content = sanitize(content)[:100_000]

            lesson = Lesson(
                module_id=module.id,
                title=le_title,
                content=content,
                order_index=le_order,
            )
            session.add(lesson)
            session.flush()

            for c_data in concepts:
                c_title = sanitize((c_data.get("title") or "Concept")[:255])
                c_content = sanitize((c_data.get("content") or "")[:100_000])
                c_order = int(c_data.get("order_index") or 0)
                concept = Concept(
                    lesson_id=lesson.id,
                    title=c_title,
                    content=c_content,
                    order_index=c_order,
                )
                session.add(concept)

            for ex_data in exercises_data:
                ex_title = (ex_data.get("title") or "").strip()
                ex_title = sanitize(ex_title)[:255] if ex_title else None
                ex_statement = sanitize((ex_data.get("statement") or "")[:100_000])
                ex_solution = (ex_data.get("solution") or "").strip()
                ex_solution = sanitize(ex_solution)[:100_000] if ex_solution else None
                ex_order = int(ex_data.get("order_index") or 0)
                exercise = Exercise(
                    lesson_id=lesson.id,
                    title=ex_title,
                    statement=ex_statement,
                    solution=ex_solution,
                    order_index=ex_order,
                )
                session.add(exercise)

    session.flush()
    print(f"Importé : 1 subject, {len(modules_data)} module(s), avec lessons/concepts/exercises.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import cours depuis JSON")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--file", "-f", type=Path, default=Path("course_content.json"))
    args = parser.parse_args()

    path = args.file
    if not path.is_absolute():
        path = BACKEND_DIR / path
    if not path.exists():
        print(f"Fichier introuvable : {path}", file=sys.stderr)
        return 1

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    sync_url = get_sync_url()
    engine = create_engine(sync_url)
    Session = sessionmaker(engine, autocommit=False, autoflush=False)

    with Session() as session:
        try:
            import_from_json(session, data, args.dry_run)
            if not args.dry_run:
                session.commit()
        except Exception as e:
            session.rollback()
            print(f"Erreur : {e}", file=sys.stderr)
            raise
    return 0


if __name__ == "__main__":
    sys.exit(main())
