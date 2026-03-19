"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  contentApi,
  progressApi,
  getErrorMessage,
  type Subject,
  type Module,
  type PastExam,
  type SubjectProgress,
} from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function LearnPage() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modulesBySubject, setModulesBySubject] = useState<Record<string, Module[]>>({});
  const [pastExamsBySubject, setPastExamsBySubject] = useState<Record<string, PastExam[]>>({});
  const [progressBySubject, setProgressBySubject] = useState<Record<string, SubjectProgress | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const subj = await contentApi.listSubjects();
        setSubjects(subj);
        for (const s of subj) {
          const [mods, exams, progress] = await Promise.all([
            contentApi.listModules(s.id),
            contentApi.listPastExams(s.id),
            progressApi.getSubjectProgress(s.id).catch(() => null),
          ]);
          setModulesBySubject((prev) => ({ ...prev, [s.id]: mods }));
          setPastExamsBySubject((prev) => ({ ...prev, [s.id]: exams }));
          setProgressBySubject((prev) => ({ ...prev, [s.id]: progress }));
        }
      } catch (e) {
        setError(true);
        addToast(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          Content unavailable. Showing placeholder.
        </p>
        <PlaceholderLearn />
        <Link href="/dashboard" className="text-[var(--primary)]">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-semibold">Learn</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        {subjects.length === 0 ? (
          <PlaceholderLearn />
        ) : (
          <div className="space-y-8">
            {subjects.map((s) => {
              const progress = progressBySubject[s.id];
              const mods = modulesBySubject[s.id] || [];
              const exams = pastExamsBySubject[s.id] || [];
              const totalActivities = (progress?.lessons_total ?? 0) + (progress?.past_exams_total ?? 0);
              const percent = progress?.progress_percent ?? 0;
              return (
                <section key={s.id} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Link href={`/learn/subjects/${s.id}`} className="font-semibold text-[var(--foreground)] hover:underline">
                      {s.name}
                    </Link>
                    {totalActivities > 0 && (
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {Math.round(percent)}%
                      </span>
                    )}
                  </div>
                  {totalActivities > 0 && (
                    <div className="mb-4">
                      <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                        <div
                          className="h-2 rounded-full bg-[var(--primary)] transition-all"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {progress?.lessons_completed ?? 0}/{progress?.lessons_total ?? 0} lessons
                        {(progress?.past_exams_total ?? 0) > 0 &&
                          ` · ${progress?.past_exams_completed ?? 0}/${progress?.past_exams_total ?? 0} exam(s)`}
                      </p>
                    </div>
                  )}
                  <p className="mb-3 text-xs font-medium text-[var(--muted-foreground)]">
                    Chapters
                  </p>
                  <ul className="space-y-2">
                    {mods.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/learn/${m.id}`}
                          className="block rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]/30"
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                            {m.estimated_minutes} min
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {exams.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">
                        Past exams
                      </p>
                      <ul className="space-y-2">
                        {exams.map((exam) => (
                          <li key={exam.id}>
                            <Link
                              href={`/learn/past-exams/${exam.id}`}
                              className="block rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--primary)] transition hover:border-[var(--primary)]/30"
                            >
                              📝 {exam.title}
                              {exam.year != null && (
                                <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                                  ({exam.year})
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function PlaceholderLearn() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
          OVERALL PROGRESS
        </h2>
        <p className="mt-2 text-3xl font-bold">0%</p>
        <div className="mt-2 h-2 rounded-full bg-[var(--border)]">
          <div className="h-2 w-0 rounded-full bg-[var(--primary)]" />
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          0 of 0 modules completed
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">
          RESUME LEARNING
        </p>
        <p className="mt-1 font-semibold">No module in progress</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Start from the list below or add content via the API.
        </p>
      </div>
      <section>
        <h2 className="mb-3 font-bold text-[var(--foreground)]">Learning Modules</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          No subjects yet. Seed the database with subjects and modules to see them here.
        </p>
      </section>
    </div>
  );
}
