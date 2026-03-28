"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Convex dashboard key: registered students use `jwt:<users._id>` (same as AI chat);
 * anonymous Saathi uses `localStorage.saathi_id`.
 */
export function useDashboardSubjectKey(): string | null {
  const { user } = useAuth();
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    if (user?._id) return `jwt:${user._id}`;
    const anon = localStorage.getItem("saathi_id");
    return anon?.trim() || null;
  }, [user?._id]);
}
