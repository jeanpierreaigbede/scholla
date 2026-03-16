"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const { access_token } = await authApi.verifyOtp({ email, code });
      if (typeof window !== "undefined") {
        localStorage.setItem("schola_token", access_token);
      }
      router.push("/onboarding/1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] px-0 pt-0 pb-0">
      {/* Top soft gradient like Figma */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#e0f2ff] via-[#eef7ff] to-transparent" />

      <div className="relative px-6 pt-6 pb-8">
        <header className="mb-6 flex items-center">
          <Link href="/signup" className="text-sm text-[var(--primary)]">
            ←
          </Link>
          <div className="mx-auto text-sm font-semibold text-[var(--primary)]">
            Schola
          </div>
        </header>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/70 shadow-sm">
          <span className="text-xl text-[var(--primary)]">🔒</span>
        </div>

        <h1 className="text-xl font-extrabold text-[var(--foreground)]">
          Verify Your Account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          We&apos;ve sent a 6-digit code to your email/phone. Please enter it below to proceed.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Hidden real input, we display 6 boxes bound to `code` */}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="sr-only"
          />

          <div
            className="flex justify-between gap-2"
            onClick={() => {
              const el = document.querySelector<HTMLInputElement>("input[type='text'][autoComplete='one-time-code']");
              el?.focus();
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-12 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-lg font-semibold text-[var(--foreground)]"
              >
                {code[i] ?? ""}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-full bg-[var(--primary)] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Activate"}
          </button>

          <div className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            <p>Didn&apos;t receive the code?</p>
            <p className="mt-1">
              Resend Code <span className="font-semibold">00:60</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <OTPForm />
    </Suspense>
  );
}
