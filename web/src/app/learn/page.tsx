"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Subject = { id: number; name: string; slug: string; order_index: number };
type Module = {
  id: number;
  subject_id: number;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  estimated_minutes: number;
  status?: string;
};

export default function LearnPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modulesBySubject, setModulesBySubject] = useState<Record<number, Module[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const subj = await api<Subject[]>("/content/subjects");
        setSubjects(subj);
        for (const s of subj) {
          const mods = await api<Module[]>(`/content/subjects/${s.id}/modules`);
          setModulesBySubject((prev) => ({ ...prev, [s.id]: mods }));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Make sure you are logged in and the API is running. Showing placeholder.
        </p>
        <PlaceholderLearn />
        <Link href="/dashboard" className="text-[var(--primary)]">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Learn</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        {subjects.length === 0 ? (
          <PlaceholderLearn />
        ) : (
          <div className="space-y-8">
            {subjects.map((s) => (
              <section key={s.id}>
                <h2 className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">
                  {s.name}
                </h2>
                <ul className="space-y-2">
                  {(modulesBySubject[s.id] || []).map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/learn/${m.id}`}
                        className="block rounded-xl border border-[var(--border)] bg-white p-4"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                          {m.estimated_minutes} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--border)] bg-[var(--primary)] text-white">
        <Link href="/dashboard" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">
          🏠 Home
        </Link>
        <span className="flex flex-1 flex-col items-center py-3 text-sm font-medium opacity-100">
          📚 Learn
        </span>
        <Link href="/stats" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">
          📊 Stats
        </Link>
        <Link href="/dashboard/settings" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">
          ⚙️ Settings
        </Link>
      </nav>
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
