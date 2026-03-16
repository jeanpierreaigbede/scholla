import Link from "next/link";

export default function SetupCompletionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--background)] px-6 pt-20 pb-8">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl text-[#16a34a]">
        ✓
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-[var(--foreground)]">
        You&apos;re all set!
      </h1>
      <p className="mb-10 max-w-sm text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
        Your account is ready. Start learning and track your progress toward WASSCE success.
      </p>
      <Link
        href="/dashboard"
        className="w-full max-w-sm rounded-full bg-[var(--primary)] py-4 text-center text-sm font-semibold text-white hover:opacity-90"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
