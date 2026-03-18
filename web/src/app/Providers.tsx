"use client";

import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh w-full flex-col">
        {children}
      </div>
    </ToastProvider>
  );
}
