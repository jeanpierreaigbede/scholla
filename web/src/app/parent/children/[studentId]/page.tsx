"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Progress = {
  student_id: number;
  exam_readiness_percent: number;
  modules_completed: number;
  weekly_report: string;
};

export default function ParentChildProgressPage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || isNaN(studentId)) return;
    api<Progress>(`/parent/children/${studentId}/progress`)
      .then(setProgress)
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!progress) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Could not load progress.</p>
        <Link href="/parent" className="text-[var(--primary)]">← Back to portal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <Link href="/parent" className="text-[var(--primary)]">← Back</Link>
      <h1 className="mt-4 text-xl font-bold">Student progress</h1>
      <div className="mt-6 rounded-2xl bg-[var(--primary)] p-6 text-white">
        <p className="text-sm opacity-90">Exam Readiness</p>
        <p className="text-4xl font-bold">{progress.exam_readiness_percent}%</p>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Modules completed: {progress.modules_completed}
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {progress.weekly_report}
      </p>
    </div>
  );
}
