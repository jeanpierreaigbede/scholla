"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/components/Toast";

type Child = { id: number; full_name: string; email: string; school_name: string | null };

export default function ParentPortalPage() {
  const { addToast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api<{ children: Child[] }>("/parent/children")
      .then((r) => setChildren(r.children ?? []))
      .catch((e) => {
        setError(true);
        addToast(getErrorMessage(e));
      })
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
        <p className="text-sm text-[var(--muted-foreground)]">
          Connectez-vous avec un compte parent pour accéder au portail.
        </p>
        <Link href="/login" className="text-[var(--primary)]">Aller à la connexion</Link>
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
