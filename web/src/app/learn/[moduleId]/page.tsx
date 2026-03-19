"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contentApi, progressApi, type Lesson, type Module } from "@/lib/api";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modulesInSubject, setModulesInSubject] = useState<Module[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const [mod, less, completions] = await Promise.all([
          contentApi.getModule(moduleId),
          contentApi.listLessons(moduleId),
          progressApi.listCompletions(),
        ]);
        setModuleData(mod);
        setLessons(less);
        setCompletedLessonIds(new Set(completions.map((c) => c.lesson_id)));
        if (mod?.subject_id) {
          const mods = await contentApi.listModules(mod.subject_id);
          setModulesInSubject(mods ?? []);
        }
      } catch {
        setModuleData(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!moduleData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Module not found</p>
        <Link href="/learn" className="text-[var(--primary)]">← Back to Learn</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/learn" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">{moduleData.name}</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        {moduleData.description && (
          <p className="mb-6 text-[var(--muted-foreground)]">{moduleData.description}</p>
        )}
        {lessons.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-[var(--muted)]">
              <div
                className="h-2 rounded-full bg-[var(--success)] transition-all"
                style={{
                  width: `${(lessons.filter((l) => completedLessonIds.has(l.id)).length / lessons.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              {lessons.filter((l) => completedLessonIds.has(l.id)).length}/{lessons.length} completed
            </span>
          </div>
        )}
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {moduleData.estimated_minutes} min • {lessons.length} lesson(s)
        </p>
        <ul className="space-y-2">
          {lessons.map((l) => {
            const completed = completedLessonIds.has(l.id);
            return (
              <li key={l.id}>
                <Link
                  href={`/learn/${moduleId}/lessons/${l.id}`}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                    completed
                      ? "border-[var(--success)]/50 bg-[var(--success)]/5"
                      : "border-[var(--border)] bg-white hover:border-[var(--primary)]/30"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
                      completed ? "bg-[var(--success)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                    aria-hidden
                  >
                    {completed ? "✓" : ""}
                  </span>
                  <span className="font-medium">{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {lessons.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">
            No lessons in this module yet. Add lessons via the API.
          </p>
        )}
        {lessons.length > 0 &&
          lessons.every((l) => completedLessonIds.has(l.id)) &&
          (() => {
            const sorted = [...modulesInSubject].sort((a, b) => a.order_index - b.order_index);
            const idx = sorted.findIndex((m) => m.id === moduleId);
            const nextModule = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
            if (!nextModule) return null;
            return (
              <div className="mt-8">
                <Link
                  href={`/learn/${nextModule.id}`}
                  className="block w-full rounded-xl bg-[var(--primary)] py-3 text-center font-semibold text-white hover:opacity-90"
                >
                  Next chapter →
                </Link>
              </div>
            );
          })()}
      </main>
    </div>
  );
}
