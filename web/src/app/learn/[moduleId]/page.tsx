"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contentApi, type Lesson, type Module } from "@/lib/api";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const [mod, less] = await Promise.all([
          contentApi.getModule(moduleId),
          contentApi.listLessons(moduleId),
        ]);
        setModuleData(mod);
        setLessons(less);
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
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {moduleData.estimated_minutes} min • {lessons.length} lesson(s)
        </p>
        <ul className="space-y-2">
          {lessons.map((l) => (
            <li key={l.id}>
              <Link
                href={`/learn/${moduleId}/lessons/${l.id}`}
                className="block rounded-xl border border-[var(--border)] bg-white p-4"
              >
                <span className="font-medium">{l.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        {lessons.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">
            No lessons in this module yet. Add lessons via the API.
          </p>
        )}
      </main>
    </div>
  );
}
