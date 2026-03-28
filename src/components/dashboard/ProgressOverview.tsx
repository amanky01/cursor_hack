"use client";

import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";
import { useDashboardSubjectKey } from "@/hooks/useDashboardSubjectKey";
import styles from "../../styles/components/dashboard/ProgressOverview.module.css";

const ProgressOverview: React.FC = () => {
  const subjectKey = useDashboardSubjectKey();
  const overview = useQuery(
    api.dashboard.getOverview,
    subjectKey ? { subjectKey } : "skip"
  );

  const progressData = useMemo(() => {
    const moodVal =
      overview?.lastMoodScore != null ? String(overview.lastMoodScore) : "—";
    const sessionsVal =
      overview != null ? String(overview.totalSessions) : "—";
    const checkIns =
      overview?.moodHistory?.length != null
        ? String(overview.moodHistory.length)
        : "—";
    const crisisNote = overview?.crisisFlag
      ? "Reach out to support"
      : "You’re doing okay";

    return [
      {
        title: "Mood score (last log)",
        value: moodVal,
        change:
          overview?.lastEmotion != null
            ? overview.lastEmotion
            : "Use Saathi chat to log mood",
        trend: "up" as const,
        icon: TrendingUp,
        color: "var(--success-500)",
      },
      {
        title: "Sessions completed",
        value: sessionsVal,
        change: "From Saathi conversations",
        trend: "up" as const,
        icon: Calendar,
        color: "var(--primary-500)",
      },
      {
        title: "Mood logs (chat)",
        value: checkIns,
        change: "Extracted from recent chats",
        trend: "up" as const,
        icon: Target,
        color: "var(--primary-600)",
      },
      {
        title: "Safety",
        value: overview?.crisisFlag ? "Flagged" : "Clear",
        change: crisisNote,
        trend: "up" as const,
        icon: Award,
        color: overview?.crisisFlag
          ? "var(--warning-500)"
          : "var(--success-500)",
      },
    ];
  }, [overview]);

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <div className={styles.progressOverview}>
        <p style={{ color: "#6b7280" }}>
          Add <code>NEXT_PUBLIC_CONVEX_URL</code> to show live progress.
        </p>
      </div>
    );
  }

  if (!subjectKey) {
    return (
      <div className={styles.progressOverview}>
        <p style={{ color: "#6b7280" }}>
          Sign in or start Saathi once to see your progress here.
        </p>
      </div>
    );
  }

  if (overview === undefined) {
    return (
      <div className={styles.progressOverview}>
        <p style={{ color: "#6b7280" }}>Loading progress…</p>
      </div>
    );
  }

  return (
    <div className={styles.progressOverview}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Progress</h2>
        <p className={styles.subtitle}>
          {overview.found
            ? "Tracked from your Saathi sessions and mood signals in chat"
            : "No Saathi profile yet — open Saathi chat to begin"}
        </p>
      </div>

      <div className={styles.grid}>
        {progressData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={styles.progressCard}>
              <div className={styles.cardHeader}>
                <div
                  className={styles.iconContainer}
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={24} style={{ color: item.color }} />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.cardValue}>{item.value}</div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={`${styles.change} ${styles[item.trend]}`}>
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressOverview;
