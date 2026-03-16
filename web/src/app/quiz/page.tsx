"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Quiz = { id: number; module_id: number | null; title: string; description: string | null };

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Quiz[]>("/quiz")
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Quizzes</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        {loading ? (
          <p className="text-[var(--muted-foreground)]">Loading…</p>
        ) : quizzes.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No quizzes yet. Add some via the API or seed script.</p>
        ) : (
          <ul className="space-y-3">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/quiz/${q.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-white p-4"
                >
                  <span className="font-medium">{q.title}</span>
                  {q.description && (
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{q.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
