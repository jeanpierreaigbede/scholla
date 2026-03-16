"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Question = {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  order_index: number;
};

type Result = {
  score_percent: number;
  total_questions: number;
  correct_count: number;
  feedback: Array<{ question_id: number; correct: boolean; correct_option: string; explanation: string | null }>;
};

const OPTION_KEYS = ["A", "B", "C", "D"] as const;
function getOptionKey(q: Question): (typeof OPTION_KEYS)[number][] {
  const out: (typeof OPTION_KEYS)[number][] = [];
  if (q.option_a) out.push("A");
  if (q.option_b) out.push("B");
  if (q.option_c) out.push("C");
  if (q.option_d) out.push("D");
  return out;
}
function getOptionLabel(q: Question, opt: string): string {
  if (opt === "A") return q.option_a;
  if (opt === "B") return q.option_b;
  if (opt === "C") return q.option_c ?? "";
  return q.option_d ?? "";
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Number(params.quizId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId || isNaN(quizId)) {
      router.replace("/quiz");
      return;
    }
    api<Question[]>(`/quiz/${quizId}/questions`)
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [quizId, router]);

  async function handleSubmit() {
    const payload = {
      answers: Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: Number(question_id),
        selected_option,
      })),
    };
    setSubmitting(true);
    try {
      const res = await api<Result>(`/quiz/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res);
      setStep("result");
    } catch {
      setSubmitting(false);
    }
  }

  if (step === "result" && result) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <h1 className="text-xl font-bold">Quiz results</h1>
        <div className="mt-6 rounded-2xl bg-[var(--primary)] p-6 text-white">
          <p className="text-4xl font-bold">{result.score_percent}%</p>
          <p className="mt-1">
            {result.correct_count} / {result.total_questions} correct
          </p>
        </div>
        <ul className="mt-6 space-y-4">
          {result.feedback.map((f) => (
            <li key={f.question_id} className="rounded-xl border border-[var(--border)] bg-white p-4">
              <p className={f.correct ? "text-green-600" : "text-red-600"}>
                {f.correct ? "✓ Correct" : "✗ Wrong"} — Correct: {f.correct_option}
              </p>
              {f.explanation && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.explanation}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex gap-3">
          <Link href="/quiz" className="flex-1 rounded-xl bg-[var(--primary)] py-3 text-center font-medium text-white">
            Back to Quizzes
          </Link>
          <button
            onClick={() => { setStep("quiz"); setResult(null); setAnswers({}); }}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const current = questions[0];
  const progress = questions.length ? Object.keys(answers).length / questions.length : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/quiz" className="text-[var(--primary)]">← Back</Link>
        <span className="text-sm text-[var(--muted-foreground)]">
          {Object.keys(answers).length} / {questions.length}
        </span>
        <div className="w-8" />
      </header>
      <main className="p-6">
        <div className="mb-4 h-2 rounded-full bg-[var(--border)]">
          <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${progress * 100}%` }} />
        </div>
        {questions.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No questions in this quiz.</p>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium">{q.question_text}</p>
                <div className="mt-3 space-y-2">
                  {getOptionKey(q).map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className="h-4 w-4"
                      />
                      <span>{getOptionLabel(q, opt)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="w-full rounded-xl bg-[var(--primary)] py-4 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit quiz"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
