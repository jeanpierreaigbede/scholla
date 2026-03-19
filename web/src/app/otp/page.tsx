"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
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
      if (typeof window !== "undefined") {
        localStorage.setItem("schola_token", access_token);
      }
      router.push("/onboarding/1");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <div className="relative min-h-screen bg-[var(--background)] px-0 pt-0 pb-0">
      {/* Top soft gradient like Figma */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#e0f2ff] via-[#eef7ff] to-transparent" />

      <div className="relative px-6 pt-6 pb-8">
        <header className="mb-6 flex items-center">
          <Link href="/signup" className="text-sm text-[var(--primary)] hover:underline" aria-label="Back to signup">
            ← Back
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Hidden real input, we display 6 boxes bound to `code` */}
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
            className="flex justify-between gap-2"
            onClick={() => {
              inputRef.current?.focus();
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const activeIndex = Math.min(code.length, 5);
              const isActive = isFocused && i === activeIndex;
              return (
                <div
                  key={i}
                  className={`flex h-12 w-10 items-center justify-center rounded-lg border-2 bg-white text-lg font-semibold text-[var(--foreground)] transition-colors ${
                    isActive
                      ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
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
            className="w-full rounded-full bg-[var(--primary)] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Activate"}
          </button>

          <div className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            <p>Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="mt-1 font-semibold text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend code {resendCooldown > 0 ? `(${formatCountdown(resendCooldown)})` : ""}
            </button>
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
