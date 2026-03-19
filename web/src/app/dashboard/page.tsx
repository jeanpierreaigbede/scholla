"use client";

import Link from "next/link";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* Web header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-semibold text-[var(--foreground)]">Schola</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] bg-[var(--muted)]"
            >
              Home
            </Link>
            <Link
              href="/learn"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Learn
            </Link>
            <Link
              href="/stats"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Stats
            </Link>
            <Link
              href="/dashboard/settings"
              className="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Account"
            >
              <span className="text-lg" aria-hidden>👤</span>
              <span className="hidden sm:inline">Account</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome */}
        <p className="text-sm text-[var(--muted-foreground)]">
          {getGreeting()}, welcome back.
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Your preparation dashboard
        </h1>

        {/* Exam Readiness + Streak/Goal row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <section className="rounded-2xl bg-[var(--primary)] p-5 text-white shadow-lg sm:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Exam preparation</p>
                <p className="mt-1 text-4xl font-bold">68%</p>
                <p className="mt-1 text-sm opacity-90">+5% from last week</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-400 text-sm font-bold">
                68%
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="opacity-90">Maths</p>
                <div className="mt-1.5 h-2 rounded-full bg-white/30">
                  <div className="h-2 w-[72%] rounded-full bg-green-400" />
                </div>
                <p className="mt-1 font-medium">72%</p>
              </div>
              <div>
                <p className="opacity-90">Science</p>
                <div className="mt-1.5 h-2 rounded-full bg-white/30">
                  <div className="h-2 w-[65%] rounded-full bg-green-400" />
                </div>
                <p className="mt-1 font-medium">65%</p>
              </div>
              <div>
                <p className="opacity-90">English</p>
                <div className="mt-1.5 h-2 rounded-full bg-white/30">
                  <div className="h-2 w-[88%] rounded-full bg-green-400" />
                </div>
                <p className="mt-1 font-medium">88%</p>
              </div>
            </div>
          </section>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <span className="text-2xl">🔥</span>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Daily streak
              </p>
              <p className="text-xl font-bold text-[var(--foreground)]">12 days</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <span className="text-2xl">⏱</span>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Today&apos;s goal
              </p>
              <p className="text-xl font-bold text-[var(--foreground)]">45–60 min</p>
            </div>
          </div>
        </div>

        {/* Next Topic + Quick Actions */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Next topic to master
              </h2>
              <Link href="/learn" className="text-sm font-medium text-[var(--primary)] hover:underline">
                View path →
              </Link>
            </div>
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Core Mathematics
              </p>
              <h3 className="mt-1 text-lg font-bold text-[var(--foreground)]">
                Circle theorems
              </h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Intermediate · ~15 min left
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/learn"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Resume lesson
                </Link>
                <Link
                  href="/learn"
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  Resources
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/learn"
                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-colors hover:bg-[var(--muted)]/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  📖
                </span>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Courses</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Lessons & modules</p>
                </div>
              </Link>
              <Link
                href="/flashcards"
                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-colors hover:bg-[var(--muted)]/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  🃏
                </span>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Flashcards</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Review & memorize</p>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Mobile bottom nav (only on small screens, for thumb reach) */}
        <nav className="mt-10 flex border-t border-[var(--border)] bg-[var(--background)] py-3 sm:hidden">
          <div className="flex w-full justify-around">
            <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-[var(--primary)]">
              <span className="text-lg">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link href="/learn" className="flex flex-col items-center gap-0.5 text-[var(--muted-foreground)]">
              <span className="text-lg">📚</span>
              <span className="text-xs">Learn</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center gap-0.5 text-[var(--muted-foreground)]">
              <span className="text-lg">📊</span>
              <span className="text-xs">Stats</span>
            </Link>
            <Link href="/dashboard/settings" className="flex flex-col items-center gap-0.5 text-[var(--muted-foreground)]">
              <span className="text-lg">👤</span>
              <span className="text-xs">Account</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
