"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, setAuthToken } from "@/lib/api";
import { useToast } from "@/components/Toast";

const RESEND_COOLDOWN_SEC = 60; // 1 minute, aligned with backend

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  useEffect(() => {
    if (email) {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  }, [email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendOtp({ email });
      setResendCooldown(RESEND_COOLDOWN_SEC);
      addToast("A new code has been sent to your email.", "success");
    } catch {
      addToast("Could not send a new code. Please try again later.");
    }
  }, [email, resendCooldown, addToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { access_token } = await authApi.verifyOtp({ email, code });
      setAuthToken(access_token);
      router.push("/onboarding/1");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <div className="relative min-h-dvh bg-[var(--background)]">
      {/* Top soft gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#e0f2ff] via-[#eef7ff] to-transparent sm:h-64" />

      <div className="relative flex min-h-dvh flex-col items-center px-4 py-8 sm:px-6">
        <header className="flex w-full max-w-sm items-center justify-between sm:max-w-md">
          <Link href="/signup" className="text-sm text-[var(--primary)] hover:underline" aria-label="Back to signup">
            ← Back
          </Link>
          <span className="text-sm font-semibold text-[var(--primary)]">Schola</span>
          <span className="w-12" aria-hidden />
        </header>

        <div className="mt-8 flex w-full max-w-sm flex-1 flex-col sm:max-w-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-sm">
            <span className="text-2xl" aria-hidden>🔒</span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-[var(--foreground)]">
            Verify your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            We&apos;ve sent a 6-digit code to <strong className="text-[var(--foreground)]">{email}</strong>. Enter it below.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="sr-only"
              aria-label="6-digit verification code"
            />

            <div
              className="flex justify-center gap-2"
              onClick={() => inputRef.current?.focus()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.focus();
              }}
              aria-label="Click to focus code input"
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const activeIndex = Math.min(code.length, 5);
                const isActive = isFocused && i === activeIndex;
                return (
                  <div
                    key={i}
                    className={`flex h-12 w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-white text-lg font-semibold text-[var(--foreground)] shadow-sm transition-colors sm:h-14 sm:w-12 ${
                      isActive
                        ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {code[i] ?? ""}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-[var(--primary)] py-3.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>

            <p className="text-center text-xs text-[var(--muted-foreground)]">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-semibold text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Resend {resendCooldown > 0 ? `(${formatCountdown(resendCooldown)})` : "code"}
              </button>
            </p>
          </form>
        </div>
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
