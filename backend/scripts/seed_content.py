"""
Seed minimal content for development: 1 subject, 1 module, 2 lessons.
Run from backend dir: python scripts/seed_content.py
Or: cd backend && PYTHONPATH=. python scripts/seed_content.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models.content import Subject, Module, Lesson
from app.models.quiz import Quiz, QuizQuestion, FlashcardDeck, Flashcard
from app.db.base import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://schola:schola@localhost:5432/schola").replace(
    "+asyncpg", ""
)
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def seed():
    Base.metadata.create_all(engine)
    with Session() as session:
        if session.execute(select(Subject)).first():
            print("Content already seeded.")
            return
        s = Subject(name="Core Mathematics", slug="core-mathematics", order_index=0)
        session.add(s)
        session.flush()
        m = Module(
            subject_id=s.id,
            name="Circle Theorems",
            slug="circle-theorems",
            description="Understand and apply circle theorems.",
            order_index=0,
            estimated_minutes=15,
        )
        session.add(m)
        session.flush()
        session.add_all([
            Lesson(module_id=m.id, title="Introduction to circles", content="A circle is the set of all points equidistant from a fixed point (the centre).\n\nKey terms: radius, diameter, chord, tangent.", order_index=0),
            Lesson(module_id=m.id, title="Angle at the centre", content="The angle subtended at the centre of a circle is twice the angle at the circumference.\n\nThis is one of the fundamental circle theorems for WASSCE.", order_index=1),
        ])
        # One quiz for the module
        quiz = Quiz(module_id=m.id, title="Circle Theorems Quiz", description="Check your understanding.")
        session.add(quiz)
        session.flush()
        session.add_all([
            QuizQuestion(quiz_id=quiz.id, question_text="What is the radius of a circle?", option_a="The distance from centre to any point on the circle", option_b="The distance across the circle", option_c="Half the diameter", option_d="The longest chord", correct_option="A", explanation="Radius is the distance from the centre to the circumference.", order_index=0),
            QuizQuestion(quiz_id=quiz.id, question_text="The angle at the centre is ___ the angle at the circumference.", option_a="equal to", option_b="twice", option_c="half", option_d="quarter", correct_option="B", explanation="Circle theorem: angle at centre = 2 × angle at circumference.", order_index=1),
        ])
        # One flashcard deck
        deck = FlashcardDeck(module_id=m.id, title="Circle terms", description="Key vocabulary.")
        session.add(deck)
        session.flush()
        session.add_all([
            Flashcard(deck_id=deck.id, front="Radius", back="Distance from the centre of a circle to any point on its circumference.", order_index=0),
            Flashcard(deck_id=deck.id, front="Diameter", back="A chord that passes through the centre. Twice the radius.", order_index=1),
        ])
        session.commit()
    print("Seeded: 1 subject, 1 module, 2 lessons, 1 quiz (2 questions), 1 flashcard deck (2 cards).")


if __name__ == "__main__":
    seed()
