import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertValidSubjectKey } from "./lib/anonymousId";

export const getOverview = query({
  args: { subjectKey: v.string() },
  handler: async (ctx, { subjectKey }) => {
    assertValidSubjectKey(subjectKey);
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_anonymousId", (q) => q.eq("anonymousId", subjectKey.trim()))
      .first();
    if (!patient) {
      return {
        found: false as const,
        totalSessions: 0,
        lastMoodScore: null as number | null,
        lastEmotion: null as string | null,
        moodHistory: [] as { score: number; emotion: string; date: number }[],
        recentSessionCount: 0,
        crisisFlag: false,
        recentSessions: [] as {
          id: string;
          startedAt: number;
          messageCount: number;
        }[],
      };
    }
    const moodLogs = await ctx.db
      .query("moodLogs")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .order("desc")
      .take(30);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .order("desc")
      .take(10);
    const lastMood = moodLogs[0];
    return {
      found: true as const,
      totalSessions: patient.totalSessions,
      lastMoodScore: lastMood?.score ?? null,
      lastEmotion: lastMood?.emotion ?? null,
      moodHistory: moodLogs.map((m) => ({
        score: m.score,
        emotion: m.emotion,
        date: m.date,
      })),
      recentSessionCount: sessions.length,
      crisisFlag: patient.crisisFlag,
      recentSessions: sessions.map((s) => ({
        id: s._id,
        startedAt: s.startedAt,
        messageCount: s.messages.length,
      })),
    };
  },
});
