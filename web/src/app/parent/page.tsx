"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Child = { id: number; full_name: string; email: string; school_name: string | null };

export default function ParentPortalPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ children: Child[] }>("/parent/children")
      .then((r) => setChildren(r.children))
      .catch((e) => setError(e instanceof Error ? e.message : "Unauthorized"))
      .finally(() => setLoading(false));
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
          Log in with a parent account to view the portal. Parents can link to student accounts via the API.
        </p>
        <Link href="/login" className="text-[var(--primary)]">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/" className="text-[var(--primary)]">← Schola</Link>
        <h1 className="text-lg font-semibold">Parent Portal</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        <h2 className="mb-4 font-bold text-[var(--foreground)]">Your children</h2>
        {children.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">
            No linked students yet. Link a student account via the backend (parent_student_links table).
          </p>
        ) : (
          <ul className="space-y-3">
            {children.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/parent/children/${c.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-white p-4"
                >
                  <span className="font-medium">{c.full_name}</span>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.school_name || c.email}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
