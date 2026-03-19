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

/**
 * Affiche du contenu Markdown avec formules LaTeX (inline $...$ et bloc $$...$$).
 * Utilise KaTeX pour les puissances, racines, fractions, etc.
 */
export function ContentWithMath({ content, className = "", small }: ContentWithMathProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={`content-with-math ${small ? "text-sm" : ""} ${className}`}
      data-content-with-math
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="mb-2 mt-4 text-xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="mb-2 list-inside list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-inside list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
