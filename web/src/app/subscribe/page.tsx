"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Subscription = { plan: string; active: boolean; expires_at: string | null };

export default function SubscribePage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Subscription>("/payments/subscription")
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
      <h1 className="mt-4 text-2xl font-bold">Subscription</h1>
      {loading ? (
        <p className="mt-4 text-[var(--muted-foreground)]">Loading…</p>
      ) : (
        <>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Current plan: <strong>{sub?.plan ?? "free"}</strong>
            {sub?.active ? " (active)" : ""}
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <h2 className="font-semibold">Monthly — 20 GHS/month</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Full access to all content and features.</p>
              <button className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white" disabled>
                Coming soon (Paystack)
              </button>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <h2 className="font-semibold">WASSCE Season Pass</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">One-time payment for 4 months up to exam.</p>
              <button className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white" disabled>
                Coming soon (Paystack)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
