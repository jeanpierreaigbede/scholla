"use client";

import Link from "next/link";
import { clearAuthToken } from "@/lib/api";

export default function SettingsPage() {
  function handleLogout() {
    clearAuthToken();
    // Full reload so cached pages and client state are cleared; user lands on home
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="text-sm text-[var(--primary)] hover:underline">← Back to dashboard</Link>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Account</h1>
        <div className="w-24 sm:w-32" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          Manage your profile, subscription, and preferences.
        </p>

        <section className="mt-6 space-y-4">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Profile & account</h2>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-sm text-[var(--foreground)]">Update your profile, school, and study preferences.</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Profile editing coming soon.</p>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Subscription & billing</h2>
          <Link
            href="/subscribe"
            className="block rounded-xl border border-[var(--border)] bg-white p-4 font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)]/50"
          >
            Subscription & billing →
          </Link>
        </section>

        <section className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 font-medium text-red-700 hover:bg-red-100"
          >
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}
