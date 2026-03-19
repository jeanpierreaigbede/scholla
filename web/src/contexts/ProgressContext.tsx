"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { progressApi, type DashboardProgress, type NextTopic } from "@/lib/api";

type ProgressState = {
  dashboard: DashboardProgress | null;
  nextTopic: NextTopic | null;
  loading: boolean;
};

type ProgressContextValue = ProgressState & {
  refreshProgress: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardProgress | null>(null);
  const [nextTopic, setNextTopic] = useState<NextTopic | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProgress = useCallback(async () => {
    setLoading(true);
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[SCHOLA] Refreshing progress…");
    }
    try {
      const [dashboardData, nextTopicData] = await Promise.all([
        progressApi.getDashboard(),
        progressApi.getNextTopic(),
      ]);
      setDashboard(dashboardData);
      setNextTopic(nextTopicData ?? null);
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[SCHOLA] Dashboard:", {
          exam_readiness_percent: dashboardData?.exam_readiness_percent,
          exam_readiness_delta: dashboardData?.exam_readiness_delta,
          subject_count: dashboardData?.subject_progress?.length ?? 0,
        });
        // eslint-disable-next-line no-console
        console.log("[SCHOLA] Next topic:", nextTopicData ?? "none");
      }
    } catch (err) {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("[SCHOLA] Progress fetch failed:", err);
      }
      setDashboard(null);
      setNextTopic(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ProgressContextValue = {
    dashboard,
    nextTopic,
    loading,
    refreshProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
