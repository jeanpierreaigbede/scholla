"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    school_name: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.signup({
        full_name: form.full_name,
        email: form.email,
        school_name: form.school_name || undefined,
        password: form.password,
      });
      router.push(`/otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 pt-6 pb-8">
      {/* Top bar like Figma: back + centered title */}
      <header className="mb-6 flex items-center justify-between">
        <Link href="/onboarding/4" className="w-16 text-sm text-[var(--primary)]">
          ← Back
        </Link>
        <span className="text-sm font-semibold text-[var(--foreground)]">
          Create Your Account
        </span>
        <div className="w-16" />
      </header>

      <h1 className="text-2xl font-extrabold text-[var(--foreground)]">
        Create Your Account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        Join thousands of students through WASSCE mastery.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Email Address
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
            School Name
          </label>
          <input
            type="text"
            placeholder="Your school or institution"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3"
            value={form.school_name}
            onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Create a strong password"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-[var(--primary)]">Terms of Service</a> and{" "}
          <a href="#" className="text-[var(--primary)]">Privacy Policy</a>.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--primary)] py-4 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--primary)]">
          Log In
        </Link>
      </p>
    </div>
  );
}
