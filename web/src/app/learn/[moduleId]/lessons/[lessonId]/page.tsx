"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contentApi, progressApi, type Lesson } from "@/lib/api";
import { ContentWithMath } from "@/components/ContentWithMath";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      router.replace("/learn");
      return;
    }
    async function load() {
      try {
        const data = await contentApi.getLesson(lessonId);
        setLesson(data);
      } catch {
        setLesson(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId, router]);

  async function markComplete() {
    if (!lesson) return;
    setCompleting(true);
    try {
      await progressApi.completeLesson(lessonId);
      router.push(`/learn/${moduleId}`);
    } catch {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--muted-foreground)]">Lesson not found</p>
        <Link href={`/learn/${moduleId}`} className="text-[var(--primary)]">← Back to module</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4">
        <Link href={`/learn/${moduleId}`} className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold line-clamp-1">{lesson.title}</h1>
        <div className="w-8" />
      </header>
      <main className="p-6">
        <article className="prose prose-slate max-w-none text-[var(--foreground)]">
          <ContentWithMath content={lesson.content} />
        </article>
        <div className="mt-8 flex gap-3">
          <button
            onClick={markComplete}
            disabled={completing}
            className="flex-1 rounded-xl bg-[var(--primary)] py-3 font-semibold text-white disabled:opacity-50"
          >
            {completing ? "Saving…" : "Mark as complete"}
          </button>
          <Link
            href={`/learn/${moduleId}`}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-center font-medium"
          >
            Back to module
          </Link>
        </div>
      </main>
    </div>
  );
}
