"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Deck = {
  id: number;
  module_id: number | null;
  title: string;
  description: string | null;
  card_count: number;
};

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Deck[]>("/flashcards/decks")
      .then(setDecks)
      .catch(() => setDecks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Flashcards</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        {loading ? (
          <p className="text-[var(--muted-foreground)]">Loading…</p>
        ) : decks.length === 0 ? (
          <p className="text-[var(--muted-foreground)]">No decks yet. Add some via the API or seed.</p>
        ) : (
          <ul className="space-y-3">
            {decks.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/flashcards/${d.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-white p-4"
                >
                  <span className="font-medium">{d.title}</span>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {d.card_count} card{d.card_count !== 1 ? "s" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--border)] bg-[var(--primary)] text-white">
        <Link href="/dashboard" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">🏠 Home</Link>
        <Link href="/learn" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">📚 Learn</Link>
        <Link href="/stats" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">📊 Stats</Link>
        <Link href="/dashboard/settings" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">⚙️ Settings</Link>
      </nav>
    </div>
  );
}
