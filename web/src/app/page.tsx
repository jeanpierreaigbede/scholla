import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <span className="text-lg">🎓</span>
            </div>
            <span className="text-lg font-semibold text-[var(--foreground)]">Schola</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4">
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] sm:inline-block"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] sm:inline-block"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--muted)]/50 to-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
                Your path to{" "}
                <span className="text-[var(--accent)]">WASSCE</span> success
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)]">
                Empowering Senior High School students in Ghana with personalized learning, practice tests, and progress tracking—all in one place.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 sm:w-auto"
                >
                  Get started
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] px-6 py-3.5 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] sm:w-auto"
                >
                  How it works
                </Link>
              </div>
            </div>
            {/* Hero visual placeholder */}
            <div className="mx-auto mt-12 max-w-3xl">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)] shadow-lg">
                <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]">
                  <span className="text-sm font-medium">Product preview / illustration</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project / Mission */}
        <section className="border-b border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Built for Ghanaian SHS students
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                Schola helps you prepare for the West African Senior School Certificate Examination (WASSCE) with structured courses, quizzes, flashcards, and a dashboard that tracks your readiness. Study at your own pace and see your progress grow.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              Everything you need to excel
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-[var(--muted-foreground)]">
              Access learning tools and track your progress from one place.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  📚
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Structured courses</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Follow subjects and modules aligned with the WASSCE syllabus. Learn step by step with clear lessons.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  📝
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Quizzes & practice</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Test your knowledge with quizzes and practice exams. Get instant feedback and improve over time.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  🃏
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Flashcards</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Reinforce key concepts with flashcards. Review and memorize at your own pace.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  📊
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Exam readiness</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  See your readiness by subject on your dashboard. Track streaks and daily goals.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  🎯
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Personalized path</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  The dashboard suggests the next topic to master and helps you stay on track.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-2xl">
                  🔒
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">Your account</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Create an account to save progress, access all features, and use the app on any device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to access the dashboard */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              How to access your dashboard
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-[var(--muted-foreground)]">
              Create an account in a few steps, then sign in to use the full app.
            </p>
            <div className="mx-auto mt-12 max-w-2xl space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Create your account</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Click “Create account”, enter your name, email, school, and a password. We’ll send you a verification code by email.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Verify your email</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Enter the 6-digit code from the email. After verification, you can sign in anytime.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Sign in and use the dashboard</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Log in with your email and password. You’ll land on your dashboard where you can start learning, take quizzes, use flashcards, and track your progress.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white shadow-md hover:opacity-90"
              >
                Create account
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[var(--muted)]/50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
                  <span>🎓</span>
                </div>
                <span className="font-semibold text-[var(--foreground)]">Schola</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
                <a href="#features" className="hover:text-[var(--foreground)]">Features</a>
                <a href="#how-it-works" className="hover:text-[var(--foreground)]">How it works</a>
                <Link href="/login" className="hover:text-[var(--foreground)]">Log in</Link>
                <Link href="/signup" className="font-medium text-[var(--primary)] hover:underline">Create account</Link>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} Schola. Your path to WASSCE success.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
