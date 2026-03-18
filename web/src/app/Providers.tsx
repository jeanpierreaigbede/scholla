"use client";

import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-full min-h-0 flex-col">
        {children}
      </div>
    </ToastProvider>
  );
}
