"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  contentApi,
  getErrorMessage,
  type PastExam,
  type PastExamQuestion,
  type PastExamResult,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ContentWithMath } from "@/components/ContentWithMath";
import { useProgress } from "@/contexts/ProgressContext";

export default function PastExamPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { refreshProgress } = useProgress();
  const examId = params.examId as string;
  const [exam, setExam] = useState<PastExam | null>(null);
  const [questions, setQuestions] = useState<PastExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PastExamResult | null>(null);

  useEffect(() => {
    if (!examId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const [examData, questionsData] = await Promise.all([
          contentApi.getPastExam(examId),
          contentApi.getPastExamQuestions(examId),
        ]);
        setExam(examData);
        setQuestions(questionsData);
      } catch (e) {
        addToast(getErrorMessage(e));
        setExam(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, router, addToast]);

  async function handleSubmit() {
    if (!examId || questions.length === 0) return;
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || "A",
    }));
    setSubmitting(true);
    try {
      const res = await contentApi.submitPastExam(examId, answersPayload);
      if (res) {
        setResult(res);
        refreshProgress();
      }
    } catch (e) {
      addToast(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!exam) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Exam not found</p>
        <Link href="/learn" className="text-[var(--primary)]">
          ← Back to courses
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-8">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white px-6 py-4">
          <Link href="/learn" className="text-[var(--primary)]">← Back to courses</Link>
          <h1 className="mt-2 text-lg font-semibold">Results – {exam.title}</h1>
        </header>
        <main className="p-6">
          <div className="mb-6 rounded-xl border border-[var(--border)] bg-white p-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Score</p>
            <p className="text-4xl font-bold text-[var(--primary)]">
              {result.score_percent}%
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.correct_count} / {result.total_questions} correct answers
            </p>
          </div>
          <section>
            <h2 className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">
              Per-question breakdown
            </h2>
            <ul className="space-y-4">
              {result.feedback.map((fb, idx) => {
                const q = questions.find((x) => x.id === fb.question_id);
                return (
                  <li
                    key={fb.question_id}
                    className={`rounded-xl border p-4 ${
                      fb.correct
                        ? "border-green-200 bg-green-50/50"
                        : "border-red-200 bg-red-50/50"
                    }`}
                  >
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">
                      Question {idx + 1}
                    </p>
                    {q && (
                      <div className="mt-1 text-sm">
                        <ContentWithMath content={q.question_text} small />
                      </div>
                    )}
                    <p className="mt-2 text-sm">
                      <span className="font-medium">
                        Correct answer: {fb.correct_option}
                      </span>
                    </p>
                    {fb.explanation && (
                      <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                        <ContentWithMath content={fb.explanation} small />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="mt-8">
            <Link
              href="/learn"
              className="block rounded-xl bg-[var(--primary)] py-3 text-center font-semibold text-white"
            >
              Back to courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/learn" className="text-[var(--primary)]">← Back</Link>
        <h1 className="mt-2 text-lg font-semibold">{exam.title}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {questions.length} question(s) – Answer then submit to see results
        </p>
      </header>
      <main className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {questions.map((q, idx) => (
            <fieldset
              key={q.id}
              className="rounded-xl border border-[var(--border)] bg-white p-4"
            >
              <legend className="text-xs font-medium text-[var(--muted-foreground)]">
                Question {idx + 1}
              </legend>
              <div className="mt-1 text-[var(--foreground)]">
                <ContentWithMath content={q.question_text} />
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
                        checked={answers[q.id] === opt}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        className="h-4 w-4 shrink-0"
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
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--primary)] py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit and see results"}
          </button>
        </form>
      </main>
    </div>
  );
}
