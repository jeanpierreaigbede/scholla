"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, getErrorMessage } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await authApi.login(form);
      if (typeof window !== "undefined") {
        localStorage.setItem("schola_token", access_token);
      }
      router.push("/dashboard");
    } catch (err) {
      addToast(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Log in</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
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
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-16"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-[11px] font-semibold text-[var(--primary)] hover:opacity-90"
              >
                {showPassword ? "Hide" : "Show"}
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
