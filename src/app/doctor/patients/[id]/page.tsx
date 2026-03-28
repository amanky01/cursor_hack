"use client";

import React from "react";
import { useParams } from "next/navigation";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import MoodSparkline from "@/components/saathi/MoodSparkline";
import { AlertTriangle, Heart, Pill, Zap, Brain, FileText, Mic, Calendar } from "lucide-react";
import type { Id } from "@cvx/_generated/dataModel";

const ACCENT = "#059669";
const ACCENT_LIGHT = "#ecfdf5";
const ACCENT_BORDER = "#a7f3d0";

type MoodHistoryRow = { score: number; emotion: string; triggers: string[]; notes: string | null; date: number };
type SessionSummaryRow = { id: Id<"sessions">; startedAt: number; messageCount: number; dominantEmotion: string | null; summary: string | null };
type CommitmentRow = { id: Id<"commitments">; text: string; status: string; detectedAt: number; followedUpAt: number | null };
type VoiceJournalRow = { id: Id<"voiceJournals">; createdAt: number; duration: number; summary: string | null; moodScore: number | null; emotion: string | null };
type PatientAppointmentRow = { id: Id<"appointments">; status: string; slot: number; notes: string | null; preferredDate: string | null };

const sectionCard: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${ACCENT_BORDER}`,
  borderRadius: 12,
  padding: 20,
};
const sectionTitle = (_iconColor: string): React.CSSProperties => ({
  margin: "0 0 12px",
  fontSize: 14,
  fontWeight: 800,
  color: "#064e3b",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  display: "flex",
  alignItems: "center",
  gap: 8,
});
const chip = (color: string, bg: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 700,
  color,
  background: bg,
  margin: "2px 3px",
});
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "7px 10px",
  background: ACCENT_LIGHT,
  color: "#065f46",
  fontWeight: 700,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const td: React.CSSProperties = { padding: "7px 10px", borderBottom: "1px solid #d1fae5", fontSize: 12 };

const STATUS_META: Record<string, { color: string; bg: string }> = {
  pending:   { color: "#92400e", bg: "#fef3c7" },
  confirmed: { color: "#065f46", bg: "#d1fae5" },
  completed: { color: "#1e40af", bg: "#dbeafe" },
  cancelled: { color: "#991b1b", bg: "#fee2e2" },
  followed_up: { color: "#5b21b6", bg: "#f5f3ff" },
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const detail = useQuery(
    api.doctorDashboard.getPatientDetail,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  if (!detail) {
    return (
      <DoctorLayout title="Patient Detail" description="Patient clinical record">
        <p style={{ color: "#6b7280", padding: 20 }}>Loading patient details...</p>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout title="Patient Detail - Doctor" description="Patient clinical record">
      <div style={{ display: "grid", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.3rem", color: "#064e3b" }}>Patient Record</h1>
            <code style={{ fontSize: 12, color: "#6b7280", background: ACCENT_LIGHT, padding: "2px 8px", borderRadius: 4 }}>
              {detail.profile.anonymousId}
            </code>
          </div>
          {detail.profile.crisisFlag && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#fee2e2",
              border: "2px solid #fca5a5",
              borderRadius: 8,
              color: "#991b1b",
              fontWeight: 800,
              fontSize: 13,
            }}>
              <AlertTriangle size={16} /> CRISIS FLAG ACTIVE
            </div>
          )}
        </div>

        {/* Profile grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={sectionCard}>
            <h3 style={sectionTitle("#dc2626")}><Heart size={14} color="#dc2626" /> Conditions</h3>
            <div>
              {detail.profile.conditions.length > 0
                ? detail.profile.conditions.map((c: string, i: number) => <span key={i} style={chip("#991b1b", "#fee2e2")}>{c}</span>)
                : <span style={{ color: "#9ca3af", fontSize: 13 }}>None recorded</span>}
            </div>
          </div>

          <div style={sectionCard}>
            <h3 style={sectionTitle("#7c3aed")}><Pill size={14} color="#7c3aed" /> Medications</h3>
            <div>
              {detail.profile.medications.length > 0
                ? detail.profile.medications.map((m: string, i: number) => <span key={i} style={chip("#5b21b6", "#f5f3ff")}>{m}</span>)
                : <span style={{ color: "#9ca3af", fontSize: 13 }}>None recorded</span>}
            </div>
          </div>

          <div style={sectionCard}>
            <h3 style={sectionTitle("#ca8a04")}><Zap size={14} color="#ca8a04" /> Triggers</h3>
            <div>
              {detail.profile.triggers.length > 0
                ? detail.profile.triggers.map((t: string, i: number) => <span key={i} style={chip("#92400e", "#fef3c7")}>{t}</span>)
                : <span style={{ color: "#9ca3af", fontSize: 13 }}>None recorded</span>}
            </div>
          </div>

          <div style={sectionCard}>
            <h3 style={sectionTitle(ACCENT)}><Brain size={14} color={ACCENT} /> Coping Patterns</h3>
            <div>
              {detail.profile.copingPatterns.length > 0
                ? detail.profile.copingPatterns.map((c: string, i: number) => <span key={i} style={chip("#065f46", ACCENT_LIGHT)}>{c}</span>)
                : <span style={{ color: "#9ca3af", fontSize: 13 }}>None recorded</span>}
            </div>
          </div>
        </div>

        {/* Mood History */}
        <div style={sectionCard}>
          <h3 style={sectionTitle(ACCENT)}>Mood History (Last 30 sessions)</h3>
          {detail.moodHistory.length > 0 ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <MoodSparkline data={detail.moodHistory} />
              </div>
              <div style={{ overflowX: "auto", maxHeight: 220, overflowY: "auto", borderRadius: 8, border: `1px solid ${ACCENT_BORDER}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Score</th>
                      <th style={th}>Emotion</th>
                      <th style={th}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.moodHistory.slice(0, 10).map((m: MoodHistoryRow, i: number) => (
                      <tr key={i}>
                        <td style={td}>{new Date(m.date).toLocaleDateString()}</td>
                        <td style={{ ...td, fontWeight: 800, color: ACCENT }}>{m.score}/10</td>
                        <td style={{ ...td, textTransform: "capitalize" }}>{m.emotion}</td>
                        <td style={{ ...td, color: "#6b7280" }}>{m.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>No mood data available.</p>
          )}
        </div>

        {/* Session Summaries */}
        <div style={sectionCard}>
          <h3 style={sectionTitle("#2563eb")}><FileText size={14} color="#2563eb" /> Session Summaries</h3>
          {detail.sessionSummaries.length > 0 ? (
            <div style={{ borderRadius: 8, border: `1px solid ${ACCENT_BORDER}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Messages</th>
                    <th style={th}>Emotion</th>
                    <th style={th}>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.sessionSummaries.map((s: SessionSummaryRow) => (
                    <tr key={s.id}>
                      <td style={td}>{new Date(s.startedAt).toLocaleDateString()}</td>
                      <td style={{ ...td, fontWeight: 700, color: ACCENT }}>{s.messageCount}</td>
                      <td style={{ ...td, textTransform: "capitalize" }}>{s.dominantEmotion || "—"}</td>
                      <td style={{ ...td, color: "#6b7280", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.summary || "No summary"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>No session data available.</p>
          )}
        </div>

        {/* Commitments */}
        <div style={sectionCard}>
          <h3 style={sectionTitle(ACCENT)}>Patient Commitments</h3>
          {detail.commitments.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {detail.commitments.map((c: CommitmentRow) => {
                const sm = STATUS_META[c.status] ?? STATUS_META.pending;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 12px",
                      background: ACCENT_LIGHT,
                      border: `1px solid ${ACCENT_BORDER}`,
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#064e3b" }}>{c.text}</span>
                    <span style={{ ...chip(sm.color, sm.bg), textTransform: "capitalize" as const }}>
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>No commitments recorded.</p>
          )}
        </div>

        {/* Voice Journals */}
        {detail.voiceJournalSummaries.length > 0 && (
          <div style={sectionCard}>
            <h3 style={sectionTitle("#7c3aed")}><Mic size={14} color="#7c3aed" /> Voice Journal Summaries</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {detail.voiceJournalSummaries.map((vj: VoiceJournalRow) => (
                <div
                  key={vj.id}
                  style={{ padding: "10px 14px", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                    <span>{new Date(vj.createdAt).toLocaleDateString()}</span>
                    <span>
                      {Math.round(vj.duration / 60)}min
                      {vj.moodScore !== null && <span style={{ marginLeft: 8, color: ACCENT, fontWeight: 700 }}>Mood: {vj.moodScore}/10</span>}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{vj.summary || "No summary available"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment History */}
        <div style={sectionCard}>
          <h3 style={sectionTitle("#ca8a04")}><Calendar size={14} color="#ca8a04" /> Appointment History</h3>
          {detail.appointments.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {detail.appointments.map((a: PatientAppointmentRow) => {
                const sm = STATUS_META[a.status] ?? STATUS_META.pending;
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 12px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.preferredDate || new Date(a.slot).toLocaleDateString()}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {a.notes && <span style={{ fontSize: 11, color: "#6b7280" }}>{a.notes}</span>}
                      <span style={{ ...chip(sm.color, sm.bg), textTransform: "capitalize" as const }}>{a.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>No appointment history with this patient.</p>
          )}
        </div>

      </div>
    </DoctorLayout>
  );
}
