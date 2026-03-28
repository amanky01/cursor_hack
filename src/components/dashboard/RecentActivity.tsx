"use client";

import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle } from "lucide-react";
import { useDashboardSubjectKey } from "@/hooks/useDashboardSubjectKey";
import styles from "../../styles/components/dashboard/RecentActivity.module.css";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: typeof CheckCircle;
  color: string;
};

const RecentActivity: React.FC = () => {
  const subjectKey = useDashboardSubjectKey();
  const overview = useQuery(
    api.dashboard.getOverview,
    subjectKey ? { subjectKey } : "skip"
  );

  const activities: ActivityItem[] = useMemo(() => {
    if (!overview?.recentSessions?.length) return [];
    return overview.recentSessions.map(
      (s: { id: string; startedAt: number; messageCount: number }) => ({
        id: s.id,
        title: `Chat session`,
        description: `${s.messageCount} message${s.messageCount === 1 ? "" : "s"}`,
        time: formatDistanceToNow(s.startedAt, { addSuffix: true }),
        icon: CheckCircle,
        color: "var(--primary-500)",
      })
    );
  }, [overview?.recentSessions]);

  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !subjectKey) {
    return null;
  }

  if (overview === undefined) {
    return (
      <div className={styles.recentActivity}>
        <p style={{ color: "#6b7280" }}>Loading activity…</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.recentActivity}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent activity</h2>
          <p className={styles.subtitle}>
            Saathi chat sessions will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent activity</h2>
        <p className={styles.subtitle}>Your latest Saathi sessions</p>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className={styles.activityItem}>
              <div
                className={styles.activityIcon}
                style={{ backgroundColor: `${activity.color}15` }}
              >
                <Icon size={20} style={{ color: activity.color }} />
              </div>
              <div className={styles.activityContent}>
                <h3 className={styles.activityTitle}>{activity.title}</h3>
                <p className={styles.activityDescription}>
                  {activity.description}
                </p>
                <div className={styles.activityTime}>
                  <Clock size={14} />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
