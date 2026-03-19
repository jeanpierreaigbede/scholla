"use client";

import { ToastProvider } from "@/components/Toast";
import { ProgressProvider } from "@/contexts/ProgressContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProgressProvider>
        <div className="flex min-h-dvh w-full flex-col">
          {children}
        </div>
      </ProgressProvider>
    </ToastProvider>
  );
}
