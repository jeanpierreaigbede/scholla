"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await authApi.login(form);
      if (typeof window !== "undefined") {
        localStorage.setItem("schola_token", access_token);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-8">
      <Link href="/" className="inline-block text-[var(--primary)] mb-6">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Log In</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Welcome back. Sign in to continue.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="example@email.com"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--primary)] py-4 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-[var(--muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[var(--primary)]">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
