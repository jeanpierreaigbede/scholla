"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Good morning,
          </p>
          <h1 className="text-sm font-semibold text-[var(--foreground)]">
            Welcome back, Sandra!
          </h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)] text-sm"
        >
          👤
        </Link>
      </header>

      {/* Content scrollable (molette / touch pour scroll normal) */}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-3 space-y-5 overscroll-y-auto">
        {/* Exam Readiness card */}
        <section className="rounded-2xl bg-[var(--primary)] p-4 text-white shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium opacity-80">
                Exam Readiness
              </p>
              <p className="mt-1 text-3xl font-bold">68%</p>
              <p className="mt-1 text-[11px] opacity-80">
                +5% from last week
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-400 text-xs">
              68%
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-[10px]">
            <div>
              <p className="opacity-80">MATHS</p>
              <div className="mt-1 h-1.5 rounded-full bg-white/30">
                <div className="h-1.5 w-[72%] rounded-full bg-green-400" />
              </div>
              <p className="mt-1">72%</p>
            </div>
            <div>
              <p className="opacity-80">SCIENCE</p>
              <div className="mt-1 h-1.5 rounded-full bg-white/30">
                <div className="h-1.5 w-[65%] rounded-full bg-green-400" />
              </div>
              <p className="mt-1">65%</p>
            </div>
            <div>
              <p className="opacity-80">ENGLISH</p>
              <div className="mt-1 h-1.5 rounded-full bg-white/30">
                <div className="h-1.5 w-[88%] rounded-full bg-green-400" />
              </div>
              <p className="mt-1">88%</p>
            </div>
          </div>
        </section>

        {/* Streak / Goal */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
            <span className="text-lg">🔥</span>
            <p className="mt-1 text-[10px] font-medium text-[var(--muted-foreground)]">
              DAILY STREAK
            </p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              12 Days
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
            <span className="text-lg">⏱</span>
            <p className="mt-1 text-[10px] font-medium text-[var(--muted-foreground)]">
              TODAY&apos;S GOAL
            </p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              45–60m
            </p>
          </div>
        </div>

        {/* Next Topic */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Next Topic to Master
            </h2>
            <Link href="/learn" className="text-[11px] text-[var(--primary)]">
              View Path
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold text-[var(--accent)]">
              CORE MATHEMATICS
            </p>
            <h3 className="mt-1 text-sm font-bold text-[var(--foreground)]">
              Circle Theorems
            </h3>
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
              Difficulty: Intermediate • 15 mins left
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                href="/learn"
                className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-center text-[11px] font-medium text-white"
              >
                Resume Lesson
              </Link>
              <Link
                href="/learn"
                className="flex-1 rounded-lg border border-[var(--border)] py-2 text-center text-[11px] font-medium text-[var(--foreground)]"
              >
                Resources
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="pb-2">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/flashcards"
              className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-[11px] shadow-sm"
            >
              <span className="text-2xl">🃏</span>
              <span className="font-medium">Flashcards</span>
            </Link>
            <Link
              href="/learn"
              className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-[11px] shadow-sm"
            >
              <span className="text-2xl">📖</span>
              <span className="font-medium">Courses</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      <nav className="flex shrink-0 h-14 border-t border-[var(--border)] bg-[var(--primary)] text-[11px] text-white">
        <Link
          href="/dashboard"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 font-medium"
        >
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <Link
          href="/learn"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 opacity-80"
        >
          <span>📚</span>
          <span>Learn</span>
        </Link>
        <Link
          href="/stats"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 opacity-80"
        >
          <span>📊</span>
          <span>Stats</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 opacity-80"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
