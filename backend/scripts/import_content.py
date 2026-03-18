#!/usr/bin/env python3
"""
Import du contenu depuis les PDFs vers la base de données.

Usage (depuis backend/) :
  python scripts/import_content.py [--dry-run] [--guide PATH] [--problems PATH] [--solutions PATH]

Fichiers par défaut (depuis la racine du repo schola/) :
  - waec-math-study-guide.pdf  (cours : Subject + Modules + Lessons)
  - 2024allproblems.pdf        (sujet past exam : questions)
  - 2024solutions.pdf           (corrigés : bonne réponse + explication)
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

# Ajouter le répertoire backend au path pour importer app
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Charger .env avant d'importer app (config)
from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

import fitz  # PyMuPDF
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models.content import (
    Subject,
    Module,
    Lesson,
    PastExam,
    PastExamQuestion,
)


def get_sync_url() -> str:
    url = settings.DATABASE_URL
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql")
    return url


def sanitize(s: str) -> str:
    """Retire les caractères NUL (0x00) et autres caractères invalides pour PostgreSQL."""
    if not s:
        return s
    return s.replace("\x00", "").replace("\u0000", "")


def extract_text_from_pdf(path: Path) -> str:
    """Extrait tout le texte d'un PDF (ordre des blocs). Les NUL sont retirés pour la base."""
    doc = fitz.open(path)
    parts = []
    for page in doc:
        parts.append(sanitize(page.get_text()))
    doc.close()
    return "\n".join(parts)


def extract_pages_from_pdf(path: Path) -> list[str]:
    """Extrait le texte page par page."""
    doc = fitz.open(path)
    pages = [page.get_text() for page in doc]
    doc.close()
    return pages


# ----- Study guide: découpage en chapitres / leçons -----
# Titres des 8 grands chapitres du WAEC Math Study Guide (pour découpage fiable)
MAJOR_CHAPTER_TITLES = [
    "Number and Numeration",
    "Algebra",
    "Geometry and Mensuration",
    "Trigonometry",
    "Statistics",
    "Probability",
    "Commercial Mathematics",
    "Miscellaneous Topics",
]


def parse_study_guide(text: str, major_chapters_only: bool = False) -> list[tuple[str, str]]:
    """
    Découpe le guide en (titre, contenu).
    Si major_chapters_only=True, découpe aux 8 titres connus (Number and Numeration, Algebra, ...).
    Sinon : heuristiques "Chapter N", "N. Titre", etc.
    """
    text = re.sub(r"\r\n", "\n", text).strip()
    if not text:
        return []

    if major_chapters_only:
        positions = []
        for title in MAJOR_CHAPTER_TITLES:
            # Chercher le titre (éventuellement précédé de numéro et points)
            pat = re.escape(title)
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                positions.append((m.start(), title))
        positions.sort(key=lambda x: x[0])
        if not positions:
            return [("Full guide", text)]
        chunks = []
        for i, (start, title) in enumerate(positions):
            end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
            content = text[start:end].strip()
            chunks.append((title, content or "(no content)"))
        return chunks

    chapter_pattern = re.compile(
        r"^(?:(?:Chapter|CHAPTER|Part|PART|Section|SECTION)\s*(\d+|[IVXLCDM]+)\s*[:.-]?\s*|"
        r"(\d+)[.)]\s+)([^\n]+)$",
        re.IGNORECASE | re.MULTILINE,
    )
    positions = []
    for m in chapter_pattern.finditer(text):
        start = m.start()
        title = (m.group(3) or m.group(0)).strip()
        if len(title) > 200:
            title = title[:200]
        if not re.match(r"^(Solution|Step|Add|Therefore|Thus|Example)\s*", title, re.I) and len(title) > 3:
            positions.append((start, title))

    if not positions:
        return [("Full guide", text)]

    chunks = []
    for i, (start, title) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        content = text[start:end].strip()
        lines = content.split("\n")
        if lines and re.match(r"^(?:Chapter|CHAPTER|\d+[.)])\s", lines[0], re.I):
            content = "\n".join(lines[1:]).strip()
        chunks.append((title, content or "(no content)"))
    return chunks


def import_study_guide(
    session: Session,
    guide_path: Path,
    dry_run: bool,
    major_chapters_only: bool = True,
) -> Subject | None:
    """Importe le PDF study guide : 1 Subject, N Modules (chapitres), 1 Lesson par module (contenu du chapitre)."""
    if not guide_path.exists():
        print(f"Fichier non trouvé : {guide_path}")
        return None

    print(f"Extraction de {guide_path.name}...")
    full_text = extract_text_from_pdf(guide_path)
    chunks = parse_study_guide(full_text, major_chapters_only=major_chapters_only)
    print(f"  → {len(chunks)} chapitre(s) / section(s) détecté(s)")

    if dry_run:
        for i, (title, content) in enumerate(chunks):
            preview = (content[:120] + "…") if len(content) > 120 else content
            print(f"  [{i+1}] {title[:60]} | {preview}")
        return None

    # Subject unique "Core Mathematics" (ou réutiliser si existe)
    subject = session.execute(select(Subject).where(Subject.slug == "core-mathematics")).scalar_one_or_none()
    if not subject:
        subject = Subject(name="Core Mathematics", slug="core-mathematics", order_index=0)
        session.add(subject)
        session.flush()
        print("  Subject créé : Core Mathematics")
    else:
        print("  Subject existant : Core Mathematics")

    for idx, (title, content) in enumerate(chunks):
        title = sanitize(title)[:255]
        content = sanitize(content)[:100_000]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower())[:100].strip("-") or f"chapter-{idx+1}"
        slug = sanitize(slug)[:255]
        module = Module(
            subject_id=subject.id,
            name=title,
            slug=slug,
            description=None,
            order_index=idx,
            estimated_minutes=max(5, min(60, len(content) // 500)),
        )
        session.add(module)
        session.flush()
        lesson = Lesson(
            module_id=module.id,
            title=title,
            content=content,
            order_index=0,
        )
        session.add(lesson)
    session.flush()
    print(f"  → {len(chunks)} module(s) et lesson(s) créés")
    return subject


# ----- Past exam: questions (sujet) -----
def parse_mcq_options(block: str) -> tuple[str, str, str | None, str | None]:
    """
    Extrait option_a, option_b, option_c, option_d depuis un bloc texte.
    Cherche des motifs A. B. C. D. ou A) B) C) D) ou (A) (B) (C) (D).
    """
    option_a = option_b = option_c = option_d = ""
    # Pattern: A. texte ou A) texte
    opts = re.findall(
        r"(?:^|\n)\s*([A-D])[.)]\s*([^\n]+?)(?=\s*(?:[A-D][.)]|\Z))",
        block,
        re.DOTALL | re.IGNORECASE,
    )
    for letter, val in opts:
        val = val.strip()[:500]
        if letter.upper() == "A":
            option_a = val
        elif letter.upper() == "B":
            option_b = val
        elif letter.upper() == "C":
            option_c = val or None
        elif letter.upper() == "D":
            option_d = val or None
    if not option_a and "A." in block:
        parts = re.split(r"\s+[B-D][.)]\s+", block, maxsplit=3, flags=re.IGNORECASE)
        if len(parts) >= 2:
            option_a = re.sub(r"^[^\n]*\s*A[.)]\s*", "", parts[0]).strip()[:500]
            option_b = parts[1].strip()[:500] if len(parts) > 1 else ""
            option_c = parts[2].strip()[:500] if len(parts) > 2 else None
            option_d = parts[3].strip()[:500] if len(parts) > 3 else None
    return (option_a or "—", option_b or "—", option_c or None, option_d or None)


def parse_past_exam_questions(full_text: str) -> list[dict]:
    """
    Découpe le texte en questions (QCM).
    Chaque question commence par un numéro (1. 2. 3. ou 1) 2) ou Question 1, etc.).
    """
    # Séparer par numéros de question en début de ligne
    blocks = re.split(
        r"(?:\n\s*|\A\s*)(?:\d+[.)]\s*|Question\s+\d+\s*[.:]?\s*)",
        full_text,
        flags=re.IGNORECASE,
    )
    questions = []
    for i, blk in enumerate(blocks):
        blk = blk.strip()
        if not blk or len(blk) < 10:
            continue
        # Première ligne = énoncé, reste = options
        lines = blk.split("\n")
        question_text = lines[0][:2000] if lines else blk[:2000]
        rest = "\n".join(lines[1:]) if len(lines) > 1 else blk
        opt_a, opt_b, opt_c, opt_d = parse_mcq_options(rest)
        questions.append({
            "question_text": question_text,
            "option_a": opt_a,
            "option_b": opt_b,
            "option_c": opt_c,
            "option_d": opt_d,
        })
    return questions


def import_past_exam_problems(
    session: Session,
    subject_id,  # UUID | None when dry_run
    problems_path: Path,
    dry_run: bool,
) -> PastExam | None:
    """Importe 2024allproblems.pdf : 1 PastExam + N PastExamQuestion (sans correct_option/explanation)."""
    if not problems_path.exists():
        print(f"Fichier non trouvé : {problems_path}")
        return None

    if not dry_run and subject_id is None:
        print("  Subject manquant : impossible de créer le past exam sans subject. Importez d'abord le guide.")
        return None

    print(f"Extraction de {problems_path.name}...")
    full_text = extract_text_from_pdf(problems_path)
    questions = parse_past_exam_questions(full_text)
    print(f"  → {len(questions)} question(s) détectée(s)")

    if dry_run:
        for i, q in enumerate(questions[:5]):
            print(f"  [{i+1}] {q['question_text'][:80]}… | A: {q['option_a'][:40]}…")
        if len(questions) > 5:
            print(f"  ... et {len(questions) - 5} autres")
        return None

    # Créer l'examen
    past_exam = PastExam(
        subject_id=subject_id,
        title="Core Mathematics 2024",
        year=2024,
        order_index=0,
    )
    session.add(past_exam)
    session.flush()

    for idx, q in enumerate(questions):
        pq = PastExamQuestion(
            past_exam_id=past_exam.id,
            question_text=sanitize(q["question_text"]),
            option_a=sanitize(q["option_a"]),
            option_b=sanitize(q["option_b"]),
            option_c=sanitize(q["option_c"]) if q.get("option_c") else None,
            option_d=sanitize(q["option_d"]) if q.get("option_d") else None,
            correct_option="A",
            explanation=None,
            order_index=idx,
        )
        session.add(pq)
    session.flush()
    print(f"  → Past exam créé avec {len(questions)} questions (correct_option à mettre à jour via solutions)")
    return past_exam


# ----- Solutions: mise à jour correct_option + explanation -----
def parse_solutions(full_text: str) -> list[tuple[str, str]]:
    """
    Extrait pour chaque numéro : (lettre A/B/C/D, explication optionnelle).
    Format attendu : "1. A" ou "1. A. Explication" ou "1) A" etc.
    """
    pattern = re.compile(
        r"(?:^|\n)\s*(\d+)[.)]\s*([A-D])\s*[.:]?\s*([^\n]*(?:\n(?!\s*\d+[.)])[^\n]*)*)",
        re.IGNORECASE | re.MULTILINE,
    )
    # Index 0 = question 1, index 1 = question 2, ...
    by_num: dict[int, tuple[str, str]] = {}
    for m in pattern.finditer(full_text):
        num = int(m.group(1))
        letter = m.group(2).upper()
        explanation = sanitize((m.group(3).strip()[:2000] if m.group(3) else "").strip())
        by_num[num] = (letter, explanation)
    if not by_num:
        return []
    max_num = max(by_num.keys())
    return [by_num.get(i, ("A", "")) for i in range(1, max_num + 1)]


def apply_solutions(
    session: Session,
    past_exam_id,
    solutions_path: Path,
    dry_run: bool,
) -> None:
    """Met à jour les PastExamQuestion avec correct_option et explanation depuis 2024solutions.pdf."""
    if not solutions_path.exists():
        print(f"Fichier non trouvé : {solutions_path}")
        return

    print(f"Extraction de {solutions_path.name}...")
    full_text = extract_text_from_pdf(solutions_path)
    solutions = parse_solutions(full_text)
    print(f"  → {len(solutions)} solution(s) détectée(s)")

    result = session.execute(
        select(PastExamQuestion)
        .where(PastExamQuestion.past_exam_id == past_exam_id)
        .order_by(PastExamQuestion.order_index)
    )
    questions = list(result.scalars().all())

    if dry_run:
        for i, q in enumerate(questions[:5]):
            sol = solutions[i] if i < len(solutions) else ("?", "")
            print(f"  Q{i+1} → {sol[0]} | {sol[1][:50]}…")
        return

    updated = 0
    for i, q in enumerate(questions):
        if i < len(solutions):
            letter, explanation = solutions[i]
            q.correct_option = letter.upper()
            q.explanation = sanitize(explanation) if explanation else None
            updated += 1
    session.flush()
    print(f"  → {updated} question(s) mises à jour avec corrigé")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import PDFs → DB (study guide + past exam + solutions)")
    parser.add_argument("--dry-run", action="store_true", help="Ne pas écrire en base, seulement afficher l'extraction")
    repo_root = BACKEND_DIR.parent
    parser.add_argument("--guide", type=Path, default=repo_root / "waec-math-study-guide.pdf")
    parser.add_argument("--problems", type=Path, default=repo_root / "2024allproblems.pdf")
    parser.add_argument("--solutions", type=Path, default=repo_root / "2024solutions.pdf")
    parser.add_argument(
        "--all-sections",
        action="store_true",
        help="Découper le guide en toutes les sections détectées (défaut: seulement les 8 grands chapitres)",
    )
    args = parser.parse_args()

    sync_url = get_sync_url()
    engine = create_engine(sync_url)
    SessionLocal = sessionmaker(engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        try:
            subject = import_study_guide(
                session,
                args.guide,
                args.dry_run,
                major_chapters_only=not args.all_sections,
            )
            if subject is None and not args.dry_run:
                # Sans guide, récupérer le subject existant pour le past exam
                subject = session.execute(select(Subject).where(Subject.slug == "core-mathematics")).scalar_one_or_none()
            if subject is None and not args.dry_run:
                # Créer un subject minimal pour le past exam
                subject = Subject(name="Core Mathematics", slug="core-mathematics", order_index=0)
                session.add(subject)
                session.flush()

            subject_id = subject.id if subject else None
            # En dry-run on extrait quand même les problèmes/solutions pour affichage
            past_exam = import_past_exam_problems(session, subject_id, args.problems, args.dry_run)
            if past_exam and not args.dry_run:
                apply_solutions(session, past_exam.id, args.solutions, args.dry_run)
            elif args.dry_run and (args.problems.exists() and args.solutions.exists()):
                # Afficher un aperçu des solutions en dry-run (sans past_exam en base)
                print("Extraction des solutions (aperçu)...")
                full_text = extract_text_from_pdf(args.solutions)
                solutions = parse_solutions(full_text)
                print(f"  → {len(solutions)} solution(s) détectée(s)")
                for i, (letter, expl) in enumerate(solutions[:5]):
                    print(f"  [{i+1}] → {letter} | {expl[:50]}…")
                if len(solutions) > 5:
                    print(f"  ... et {len(solutions) - 5} autres")

            if not args.dry_run:
                session.commit()
                print("Commit effectué.")
            else:
                print("Dry-run : aucun écriture en base.")
        except Exception as e:
            session.rollback()
            print(f"Erreur : {e}", file=sys.stderr)
            raise

    return 0


if __name__ == "__main__":
    sys.exit(main())
