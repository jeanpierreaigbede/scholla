import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] px-6 pt-6 pb-8">
      {/* Header logo */}
      <header className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--muted)]">
          <span className="text-lg text-[var(--primary)]">🎓</span>
        </div>
        <span className="text-lg font-semibold text-[var(--primary)]">Schola</span>
      </header>

      {/* Illustration */}
      <main className="mt-6 flex flex-1 flex-col items-center">
        <div className="mb-7 h-48 w-full max-w-[330px] rounded-[24px] bg-[var(--muted)]" />

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-extrabold leading-snug text-[var(--primary)]">
          Welcome to{" "}
          <span className="text-[var(--accent)]">Schola</span>
        </h1>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E5F7EC] px-4 py-1.5 text-[10px] font-semibold text-[#15803d]">
          <span>✓</span>
          <span>YOUR PATH TO WASSCE SUCCESS</span>
        </div>

        {/* Subtitle */}
        <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
          Empowering SHS students in Ghana to achieve academic excellence through
          personalized learning.
        </p>

        {/* CTA */}
        <div className="mt-auto w-full flex justify-center">
          <Link
            href="/signup"
            className="flex h-11 w-full max-w-[320px] items-center justify-center gap-2 rounded-[999px] bg-[var(--primary)] text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            Get Started
            <span aria-hidden>→</span>
          </Link>
        </div>
      </main>

      {/* Bottom gradient bar */}
      <footer className="mt-8 h-1 w-full rounded-full bg-gradient-to-r from-[#1e3a5f] via-[#f97316] to-[#22c55e]" />
    </div>
  );
}
