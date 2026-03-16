"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await api<{ response: string }>("/tutor/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((m) => [...m, { role: "assistant", content: res.response }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, the tutor is unavailable. Make sure the API and AI engine are configured." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="text-[var(--primary)]">← Back</Link>
        <h1 className="text-lg font-semibold">Smart Tutor</h1>
        <div className="w-8" />
      </header>
      <main className="flex flex-1 flex-col overflow-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--muted-foreground)] py-8">
            Ask a question about your WASSCE syllabus. The tutor will respond when configured.
          </p>
        )}
        <ul className="space-y-4">
          {messages.map((msg, i) => (
            <li
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                {msg.content}
              </span>
            </li>
          ))}
        </ul>
        {loading && (
          <p className="text-sm text-[var(--muted-foreground)]">Thinking…</p>
        )}
        <div ref={bottomRef} />
      </main>
      <footer className="border-t border-[var(--border)] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
