"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  contentApi,
  progressApi,
  type Subject,
  type Module,
  type PastExam,
  type SubjectProgress,
} from "@/lib/api";

export default function SubjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [pastExams, setPastExams] = useState<PastExam[]>([]);
  const [progress, setProgress] = useState<SubjectProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const [subj, mods, exams, prog] = await Promise.all([
          contentApi.getSubject(subjectId),
          contentApi.listModules(subjectId),
          contentApi.listPastExams(subjectId),
          progressApi.getSubjectProgress(subjectId).catch(() => null),
        ]);
        setSubject(subj);
        setModules(mods);
        setPastExams(exams);
        setProgress(prog);
      } catch {
        setSubject(null);
        setModules([]);
        setPastExams([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Course not found</p>
        <Link href="/learn" className="text-[var(--primary)]">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const totalActivities = (progress?.lessons_total ?? 0) + (progress?.past_exams_total ?? 0);
  const percent = progress?.progress_percent ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/learn" className="text-[var(--primary)]">← Back to courses</Link>
        <h1 className="mt-2 text-xl font-bold text-[var(--foreground)]">{subject.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Course overview · {modules.length} chapter(s)
          {pastExams.length > 0 && ` · ${pastExams.length} practice exam(s)`}
        </p>
      </header>
      <main className="p-6">
        <section className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
            Your progress
          </h2>
          {totalActivities > 0 ? (
            <>
              <p className="mt-2 text-3xl font-bold text-[var(--primary)]">
                {Math.round(percent)}%
              </p>
              <div className="mt-2 h-3 w-full rounded-full bg-[var(--muted)]">
                <div
                  className="h-3 rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {progress?.lessons_completed ?? 0} / {progress?.lessons_total ?? 0} lessons
                {(progress?.past_exams_total ?? 0) > 0 &&
                  ` · ${progress?.past_exams_completed ?? 0} / ${progress?.past_exams_total ?? 0} exam(s) taken`}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Start a chapter to see your progress.
            </p>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">
            Chapters
          </h2>
          <p className="mb-4 text-sm text-[var(--foreground)]">
            Work through chapters in order to master the syllabus.
          </p>
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/learn/${m.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-white p-4 transition hover:border-[var(--primary)]/30"
                >
                  <span className="font-medium">{m.name}</span>
                  {m.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                      {m.description}
                    </p>
                  )}
                  <span className="mt-2 inline-block text-xs text-[var(--muted-foreground)]">
                    {m.estimated_minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {pastExams.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">
              Practice exams
            </h2>
            <ul className="space-y-2">
              {pastExams.map((exam) => (
                <li key={exam.id}>
                  <Link
                    href={`/learn/past-exams/${exam.id}`}
                    className="block rounded-xl border border-[var(--border)] bg-white p-4 text-[var(--primary)] transition hover:border-[var(--primary)]/30"
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
          </section>
        )}
      </main>
    </div>
  );
}
