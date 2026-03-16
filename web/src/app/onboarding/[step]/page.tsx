"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type IntensityKey = "soft" | "hard" | "adaptive";
type YearKey = "shs1" | "shs2" | "shs3";

export default function OnboardingStepPage() {
  const params = useParams();
  const router = useRouter();
  const step = Number(params.step);

  const [intensity, setIntensity] = useState<IntensityKey>("hard");
  const [year, setYear] = useState<YearKey>("shs3");

  if (step !== 1 && step !== 2) {
    router.replace("/onboarding/1");
    return null;
  }

  const progressPercent = step === 1 ? 50 : 100;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] px-6 pt-6 pb-8">
      {/* Top bar */}
      <header className="mb-4 flex items-center justify-between">
        <Link
          href={step === 1 ? "/otp" : "/onboarding/1"}
          className="text-sm text-[var(--primary)]"
        >
          ←
        </Link>
        <span className="text-sm font-semibold text-[var(--primary)]">
          Schola
        </span>
        <div className="w-4" />
      </header>

      {/* Step + progress */}
      <div className="mb-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>Step {step} of 2</span>
        <span className="font-semibold text-[var(--primary)]">
          PLAN YOUR PREP
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full rounded-full bg-[var(--border)]">
        <div
          className="h-1.5 rounded-full bg-[var(--primary)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {step === 1 ? (
        <StepIntensity intensity={intensity} onChange={setIntensity} onNext={() => router.push("/onboarding/2")} />
      ) : (
        <StepYear year={year} onChange={setYear} onNext={() => router.push("/setup")} />
      )}
    </div>
  );
}

function StepIntensity(props: {
  intensity: IntensityKey;
  onChange: (v: IntensityKey) => void;
  onNext: () => void;
}) {
  const { intensity, onChange, onNext } = props;

  return (
    <>
      <main className="flex flex-1 flex-col">
        <h1 className="mb-2 text-lg font-extrabold text-[var(--foreground)]">
          Choose Your Study Intensity
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
          Select a pace that fits your schedule and exam goals. You can change it later.
        </p>

        <div className="space-y-3">
          <IntensityCard
            label="Soft Pace"
            description="1-2 hours daily, steady revision."
            selected={intensity === "soft"}
            onClick={() => onChange("soft")}
          />
          <IntensityCard
            label="Hard Prep"
            description="3+ hours daily, ambitious exam focus."
            selected={intensity === "hard"}
            recommended
            onClick={() => onChange("hard")}
          />
          <IntensityCard
            label="Adaptive"
            description="Dynamic pace based on your mock scores."
            selected={intensity === "adaptive"}
            onClick={() => onChange("adaptive")}
          />
        </div>
      </main>

      <footer className="mt-6">
        <button
          type="button"
          onClick={onNext}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white hover:opacity-90"
        >
          Start Learning
        </button>
      </footer>
    </>
  );
}

function IntensityCard(props: {
  label: string;
  description: string;
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  const { label, description, selected, recommended, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-[var(--primary)] bg-[#e0f2ff]"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {label}
          </span>
          {recommended && (
            <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
              RECOMMENDED
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
      <span className="text-lg text-[var(--primary)]">
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}

function StepYear(props: {
  year: YearKey;
  onChange: (v: YearKey) => void;
  onNext: () => void;
}) {
  const { year, onChange, onNext } = props;

  return (
    <>
      <main className="flex flex-1 flex-col">
        <h1 className="mb-2 text-lg font-extrabold text-[var(--foreground)]">
          Tell us about your school year
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
          Pick your current Senior High School level to customize your study plan.
        </p>

        <div className="space-y-3">
          <YearCard
            label="SHS Year 1"
            description="Foundation: building the basics."
            selected={year === "shs1"}
            onClick={() => onChange("shs1")}
          />
          <YearCard
            label="SHS Year 2"
            description="Strengthen your Core."
            selected={year === "shs2"}
            onClick={() => onChange("shs2")}
          />
          <YearCard
            label="SHS Year 3"
            description="Intense WASSCE prep."
            selected={year === "shs3"}
            onClick={() => onChange("shs3")}
          />
        </div>
      </main>

      <footer className="mt-6">
        <button
          type="button"
          onClick={onNext}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white hover:opacity-90"
        >
          Continue
        </button>
      </footer>
    </>
  );
}

function YearCard(props: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { label, description, selected, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-[var(--primary)] bg-[#e0f2ff]"
          : "border-[var(--border)] bg-white"
      }`}
    >
      <div>
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {label}
        </span>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
      <span className="text-lg text-[var(--primary)]">
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
