# Scripts d’import

## clear_course_content.py

Vide le contenu des cours en base (subjects, modules, lessons, concepts, exercises, **quizzes**, past exams, user_progress). Utiliser avant de réimporter.

```bash
python scripts/clear_course_content.py --dry-run
python scripts/clear_course_content.py
```

## import_courses_from_courses_json.py

Vide le contenu actuel puis importe le cours depuis **courses.json** (à la racine du repo). Structure : un subject (titre/slug à la racine), modules = chapitres, lessons avec concepts. Le champ `Lesson.content` est rempli par la concaténation de tous les concepts (théorie + exemples + résumé). Les quiz de chaque leçon sont créés et liés au module. Les IDs du JSON sont ignorés.

```bash
# Depuis la racine du repo (schola/)
python backend/scripts/import_courses_from_courses_json.py --dry-run
python backend/scripts/import_courses_from_courses_json.py

# Fichier personnalisé
python backend/scripts/import_courses_from_courses_json.py --file /chemin/courses.json
```

## import_course_from_json.py

Importe un cours depuis un fichier JSON (subject → modules → lessons → concepts/exercises). Fichier par défaut : `course_content.json`.

```bash
python scripts/import_course_from_json.py --dry-run
python scripts/import_course_from_json.py --file mon_cours.json
```

## import_content.py

Importe le contenu des PDFs vers la base de données :

- **Study guide** (`waec-math-study-guide.pdf`) → Subject « Core Mathematics » + 8 Modules (chapitres) + 8 Lessons
- **Sujet d’examen** (`2024allproblems.pdf`) → Past exam « Core Mathematics 2024 » + questions (QCM)
- **Corrigés** (`2024solutions.pdf`) → Mise à jour des bonnes réponses et explications sur les questions

### Prérequis

- Python 3 avec le **venv du backend** activé : `source venv/bin/activate`
- Dépendances : `pip install -r requirements.txt` (inclut `pymupdf`)
- Variables d’environnement / `.env` pour la base (comme pour l’API)
- Les PDFs à la racine du repo `schola/` ou chemins fournis en arguments

### Usage

Depuis le répertoire **backend** :

```bash
# Aperçu sans écriture en base
python scripts/import_content.py --dry-run

# Import réel (guide 8 chapitres + past exam + solutions)
python scripts/import_content.py

# Guide en toutes les sections détectées
python scripts/import_content.py --all-sections

# Fichiers personnalisés
python scripts/import_content.py --guide /chemin/guide.pdf --problems /chemin/sujet.pdf --solutions /chemin/corrige.pdf
```

### Structure des PDFs

- **Guide** : par défaut le script découpe aux 8 titres connus (Number and Numeration, Algebra, etc.). Avec `--all-sections` il utilise les numéros de section.
- **Sujet** : questions numérotées `1.` `2.` avec options A. B. C. D. (ou A) B) C) D)).
- **Corrigés** : lignes du type `1. A` ou `1. A. Explication` dans l’ordre des questions.

Si le nombre de questions/solutions détectées ne correspond pas au PDF, adapter les regex dans `parse_past_exam_questions` et `parse_solutions`.
