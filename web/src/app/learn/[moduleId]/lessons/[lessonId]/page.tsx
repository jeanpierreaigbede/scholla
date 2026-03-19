"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  contentApi,
  progressApi,
  quizApi,
  type Lesson,
  type Module,
  type QuizOut,
  type QuizQuestionOut,
  type QuizResultOut,
} from "@/lib/api";
import { ContentWithMath } from "@/components/ContentWithMath";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const quizSectionRef = useRef<HTMLElement>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [lessonsInModule, setLessonsInModule] = useState<Lesson[]>([]);
  const [modulesInSubject, setModulesInSubject] = useState<Module[]>([]);
  const [chapterQuiz, setChapterQuiz] = useState<QuizOut | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionOut[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResultOut | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!lessonId || !moduleId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const [data, moduleData, lessons, quizzes, completions] = await Promise.all([
          contentApi.getLesson(lessonId),
          contentApi.getModule(moduleId),
          contentApi.listLessons(moduleId),
          quizApi.listByModule(moduleId),
          progressApi.listCompletions(),
        ]);
        setLesson(data);
        const completedIds = new Set(completions.map((c) => c.lesson_id));
        setLessonCompleted(completedIds.has(lessonId));
        setLessonsInModule(lessons ?? []);
        if (moduleData?.subject_id) {
          const mods = await contentApi.listModules(moduleData.subject_id);
          setModulesInSubject(mods ?? []);
        }
        const first = quizzes?.[0] ?? null;
        setChapterQuiz(first);
        if (first) {
          const qs = await quizApi.getQuestions(first.id);
          setQuizQuestions(qs || []);
        }
      } catch {
        setLesson(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId, moduleId, router]);

  async function markComplete() {
    if (!lesson) return;
    setCompleting(true);
    try {
      await progressApi.completeLesson(lessonId);
      setLessonCompleted(true);
      quizSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setCompleting(false);
    }
  }

  async function handleQuizSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chapterQuiz || quizQuestions.length === 0) return;
    setQuizSubmitting(true);
    try {
      const res = await quizApi.submit(
        chapterQuiz.id,
        quizQuestions.map((q) => ({
          question_id: q.id,
          selected_option: quizAnswers[q.id] || "A",
        }))
      );
      if (res) setQuizResult(res);
    } finally {
      setQuizSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Lesson not found</p>
        <Link href={`/learn/${moduleId}`} className="text-[var(--primary)]">← Back to module</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href={`/learn/${moduleId}`} className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold line-clamp-1">{lesson.title}</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        <article className="prose prose-slate max-w-none text-[var(--foreground)]">
          <ContentWithMath content={lesson.content} />
        </article>

        {chapterQuiz && quizQuestions.length > 0 && (
          <section ref={quizSectionRef} className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {quizResult ? "Quiz result" : "Validate with a quiz"}
            </h2>
            {chapterQuiz.description && !quizResult && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{chapterQuiz.description}</p>
            )}
            {quizResult ? (
              <div className="mt-4">
                <div className="rounded-xl bg-[var(--muted)]/50 p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--primary)]">{quizResult.score_percent}%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {quizResult.correct_count} / {quizResult.total_questions} correct answers
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  {quizResult.feedback.map((fb, idx) => {
                    const q = quizQuestions.find((x) => x.id === fb.question_id);
                    return (
                      <li
                        key={fb.question_id}
                        className={`rounded-lg border p-3 text-sm ${
                          fb.correct ? "border-[var(--success)]/50 bg-[var(--success)]/5" : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        {q && <ContentWithMath content={q.question_text} small />}
                        <p className="mt-1 font-medium">Correct answer: {fb.correct_option}</p>
                        {fb.explanation && (
                          <p className="mt-1 text-[var(--muted-foreground)]">{fb.explanation}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} className="mt-4 space-y-4">
                {quizQuestions.map((q, idx) => (
                  <fieldset key={q.id} className="rounded-xl border border-[var(--border)] p-4">
                    <legend className="text-xs font-medium text-[var(--muted-foreground)]">
                      Question {idx + 1}
                    </legend>
                    <div className="mt-1">
                      <ContentWithMath content={q.question_text} small />
                    </div>
                    <div className="mt-3 space-y-2">
                      {["A", "B", "C", "D"].map((opt) => {
                        const val = opt === "A" ? q.option_a : opt === "B" ? q.option_b : opt === "C" ? q.option_c : q.option_d;
                        if (val == null) return null;
                        return (
                          <label
                            key={opt}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              className="h-4 w-4"
                            />
                            <div className="min-w-0 flex-1 text-sm">
                              <ContentWithMath content={val} small />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                <button
                  type="submit"
                  disabled={quizSubmitting}
                  className="w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-white disabled:opacity-50"
                >
                  {quizSubmitting ? "Submitting…" : "Submit quiz"}
                </button>
              </form>
            )}
          </section>
        )}

        {!lessonCompleted && (
          <div className="mt-8">
            <button
              onClick={markComplete}
              disabled={completing}
              className="w-full rounded-xl bg-[var(--primary)] py-3 font-semibold text-white disabled:opacity-50"
            >
              {completing ? "Saving…" : "Mark as complete"}
            </button>
          </div>
        )}

        {lessonCompleted && (() => {
          const sortedLessons = [...lessonsInModule].sort((a, b) => a.order_index - b.order_index);
          const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
          const nextLesson = currentIndex >= 0 && currentIndex < sortedLessons.length - 1
            ? sortedLessons[currentIndex + 1]
            : null;
          const sortedModules = [...modulesInSubject].sort((a, b) => a.order_index - b.order_index);
          const currentModuleIndex = sortedModules.findIndex((m) => m.id === moduleId);
          const nextModule = currentModuleIndex >= 0 && currentModuleIndex < sortedModules.length - 1
            ? sortedModules[currentModuleIndex + 1]
            : null;
          if (!nextLesson && !nextModule) return null;
          return (
            <div className="mt-8 flex flex-col gap-3">
              {nextLesson && (
                <Link
                  href={`/learn/${moduleId}/lessons/${nextLesson.id}`}
                  className="w-full rounded-xl bg-[var(--primary)] py-3 text-center font-semibold text-white hover:opacity-90"
                >
                  Next lesson →
                </Link>
              )}
              {nextModule && (
                <Link
                  href={`/learn/${nextModule.id}`}
                  className="w-full rounded-xl border border-[var(--primary)] py-3 text-center font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/5"
                >
                  Next chapter →
                </Link>
              )}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
