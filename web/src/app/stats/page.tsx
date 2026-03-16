import Link from "next/link";

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Stats</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        <p className="text-[var(--muted-foreground)]">
          Performance reports and detailed statistics will appear here (Phase 2/3).
        </p>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-[var(--border)] bg-[var(--primary)] text-white">
        <Link href="/dashboard" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">🏠 Home</Link>
        <Link href="/learn" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">📚 Learn</Link>
        <span className="flex flex-1 flex-col items-center py-3 text-sm font-medium">📊 Stats</span>
        <Link href="/dashboard/settings" className="flex flex-1 flex-col items-center py-3 text-sm opacity-80">⚙️ Settings</Link>
      </nav>
    </div>
  );
}
