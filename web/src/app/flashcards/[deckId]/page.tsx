"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Card = { id: number; deck_id: number; front: string; back: string; order_index: number };

export default function FlashcardDeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = Number(params.deckId);
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!deckId || isNaN(deckId)) {
      router.replace("/flashcards");
      return;
    }
    api<Card[]>(`/flashcards/decks/${deckId}/cards`)
      .then(setCards)
      .catch(() => setCards([]));
  }, [deckId, router]);

  const card = cards[index];
  const hasNext = index < cards.length - 1;
  const hasPrev = index > 0;

  if (!card && cards.length === 0 && deckId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">No cards in this deck.</p>
        <Link href="/flashcards" className="text-[var(--primary)]">← Back to decks</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/flashcards" className="text-[var(--primary)]">← Back</Link>
        <span className="text-sm text-[var(--muted-foreground)]">
          {index + 1} / {cards.length}
        </span>
        <div className="w-8" />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        {card && (
          <>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-full max-w-md min-h-[200px] rounded-2xl border-2 border-[var(--border)] bg-white p-6 text-left shadow-sm"
            >
              <p className="text-lg font-medium">
                {flipped ? card.back : card.front}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Tap to {flipped ? "show question" : "show answer"}
              </p>
            </button>
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => { setIndex((i) => i - 1); setFlipped(false); }}
                disabled={!hasPrev}
                className="rounded-xl border border-[var(--border)] px-6 py-2 font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => { setIndex((i) => i + 1); setFlipped(false); }}
                disabled={!hasNext}
                className="rounded-xl bg-[var(--primary)] px-6 py-2 font-medium text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
