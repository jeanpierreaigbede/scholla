"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type ContentWithMathProps = {
  content: string;
  className?: string;
  /** Pour les petits blocs (ex: options de QCM, explications) */
  small?: boolean;
};

/** Ensures "Step N:" and "Example N:" start on a new line and are visually distinct. */
function formatLessonContent(raw: string): string {
  if (!raw?.trim()) return raw;
  return (
    raw
      // Step 1: / Step 2: → new paragraph + bold label
      .replace(/\n(Step\s+\d+):/gi, "\n\n**$1:**")
      // Example 1: / Example 2: → new paragraph + bold label
      .replace(/\n(Example\s+\d+):/gi, "\n\n**$1:**")
      // Normalize multiple newlines (max 2)
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Affiche du contenu Markdown avec formules LaTeX (inline $...$ et bloc $$...$$).
 * Utilise KaTeX pour les puissances, racines, fractions, etc.
 * For full lesson content, formats steps and examples for clearer display.
 */
export function ContentWithMath({ content, className = "", small }: ContentWithMathProps) {
  if (!content?.trim()) return null;
  const formatted = small ? content : formatLessonContent(content);

  return (
    <div
      className={`content-with-math ${small ? "text-sm" : ""} ${className}`}
      data-content-with-math
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="mb-3 mt-6 text-xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-6 text-lg font-semibold border-b border-[var(--border)] pb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="mb-3 list-inside list-disc space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-inside list-decimal space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          code: ({ className: codeClass, children }) => {
            const isMath = codeClass?.includes("math");
            if (isMath) return <code className={codeClass}>{children}</code>;
            return (
              <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            );
          },
        }}
      >
        {formatted}
      </ReactMarkdown>
    </div>
  );
}
