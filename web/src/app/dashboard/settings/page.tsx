"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("schola_token");
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-8" />
      </header>
      <main className="p-6 space-y-6">
        <section>
          <h2 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Account</h2>
          <p className="text-sm text-[var(--foreground)]">Manage your profile and preferences.</p>
        </section>
        <Link
          href="/subscribe"
          className="block rounded-xl border border-[var(--border)] p-4 font-medium"
        >
          Subscription & billing
        </Link>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-200 bg-red-50 py-3 font-medium text-red-700"
        >
          Log out
        </button>
      </main>
    </div>
  );
}
