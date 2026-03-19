"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, getErrorMessage, setAuthToken } from "@/lib/api";
import { useToast } from "@/components/Toast";

const ALLOWED_REDIRECT_PREFIXES = ["/dashboard", "/learn", "/stats", "/flashcards", "/subscribe", "/onboarding"];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await authApi.login(form);
      setAuthToken(access_token);
      const from = searchParams.get("from");
      const redirectTo =
        from && ALLOWED_REDIRECT_PREFIXES.some((p) => from === p || from.startsWith(`${p}/`))
          ? from
          : "/dashboard";
      router.push(redirectTo);
    } catch (err) {
      addToast(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-[var(--foreground)]">Log in</h1>
        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          Welcome back. Sign in to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-12"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--primary)] hover:bg-[var(--muted)]"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--primary)] py-3.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-[var(--background)]"><p className="text-[var(--muted-foreground)]">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
