"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2, Clock, Stethoscope, Calendar, User, Mail, Phone,
  AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import styles from "@/styles/pages/Contact.module.css";

type PortalCounsellor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string[];
  availability: string | string[];
};

type BookingConfirmation = {
  patientName: string;
  email: string;
  counsellorName: string;
  specialization: string[];
  preferredDate: string;
  notes?: string;
};

/* ─── helpers ──────────────────────────────── */
function availabilityLines(av: string | string[]): string[] {
  if (Array.isArray(av)) return av.filter(Boolean);
  return av
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ─── inline styles ─────────────────────────── */
const card = (selected = false, unavailable = false): React.CSSProperties => ({
  background: "#fff",
  border: `${selected ? 2 : 1.5}px solid ${selected ? "#2563eb" : unavailable ? "#fecaca" : "#e5e7eb"}`,
  borderRadius: 12,
  padding: "16px 18px",
  cursor: unavailable ? "not-allowed" : "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxShadow: selected ? "0 0 0 3px #dbeafe" : "none",
  opacity: unavailable ? 0.6 : 1,
});
const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 5,
  display: "block",
};
const chip = (color: string, bg: string): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  color,
  background: bg,
  padding: "2px 8px",
  borderRadius: 10,
  display: "inline-block",
});

function AppointmentsInner() {
  const { user, isLoading: authLoading } = useAuth();
  const reduce = useReducedMotion();
  const prefillDone = useRef(false);

  const counsellors = useQuery(api.adminAnalytics.listCounsellorsPublic) as PortalCounsellor[] | undefined;

  /* form state */
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* submission */
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const bookMutation = useMutation(api.guestAppointments.createGuest);

  /* booked dates for selected counsellor */
  const bookedDates = useQuery(
    api.guestAppointments.getBookedDates,
    selectedId ? { counsellorId: selectedId } : "skip"
  ) as string[] | undefined;

  const selectedCounsellor = counsellors?.find((c) => c._id === selectedId);
  const dateConflict = !!(preferredDate && bookedDates?.includes(preferredDate));
  const minDate = new Date().toISOString().slice(0, 10);

  /* prefill logged-in user */
  useEffect(() => {
    if (authLoading || prefillDone.current || !user) return;
    prefillDone.current = true;
    setName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
    setEmail(user.email ?? "");
    setPhone(user.contactNo != null ? String(user.contactNo) : "");
  }, [user, authLoading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCounsellor) { setError("Please select a counsellor."); return; }
    if (dateConflict) { setError("This counsellor already has a booking on that date. Please pick another day."); return; }
    setError("");
    setSubmitting(true);
    try {
      await bookMutation({
        name,
        email,
        phone: phone || undefined,
        department: selectedCounsellor.specialization.join(", ") || "General Counselling",
        preferredDate,
        notes: notes || undefined,
        counsellorId: selectedCounsellor._id,
      });
      setConfirmation({
        patientName: name,
        email,
        counsellorName: `${selectedCounsellor.firstName} ${selectedCounsellor.lastName}`,
        specialization: selectedCounsellor.specialization,
        preferredDate,
        notes: notes || undefined,
      });
      setName(""); setEmail(""); setPhone("");
      setSelectedId(""); setPreferredDate(""); setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Book a Counsellor — Sehat-Saathi" description="Book a session with a registered portal counsellor.">
      <div className={`${styles.contact} ${styles.healthFlow} ambient-health-tools-dark`}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Book a Counsellor</h1>
              <p className={styles.heroSubtitle}>
                <Link href="/health" className={styles.healthBackLink}>← Back to Health tools</Link>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.contactForm}>
          <div className={styles.container}>
            <div className={styles.formContainer} style={{ maxWidth: 860 }}>

              {/* ── Confirmation screen ── */}
              <AnimatePresence mode="wait">
                {confirmation && (
                  <motion.div
                    key="confirm"
                    initial={reduce ? undefined : { opacity: 0, y: 16 }}
                    animate={reduce ? undefined : { opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    style={{ background: "#fff", border: "2px solid #bbf7d0", borderRadius: 14, padding: 28, marginBottom: 24 }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <CheckCircle2 size={52} color="#059669" style={{ marginBottom: 10 }} />
                      <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", color: "#064e3b" }}>Appointment Requested!</h2>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                        Your request is submitted. The counsellor will confirm shortly.
                      </p>
                    </div>

                    <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                      {[
                        ["Patient", confirmation.patientName],
                        ["Email", confirmation.email],
                        ["Counsellor", `Dr. ${confirmation.counsellorName}`],
                        ["Specialization", confirmation.specialization.join(", ") || "General Counselling"],
                        ["Preferred Date", confirmation.preferredDate],
                        ...(confirmation.notes ? [["Notes", confirmation.notes]] : []),
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, borderBottom: "1px solid #d1fae5" }}>
                          <span style={{ color: "#6b7280" }}>{label}</span>
                          <strong style={{ maxWidth: "60%", textAlign: "right" }}>{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e", marginBottom: 18 }}>
                      A confirmation will be sent to <strong>{confirmation.email}</strong> once the counsellor accepts.
                    </div>

                    <button
                      onClick={() => setConfirmation(null)}
                      style={{ padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                    >
                      Book Another
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!confirmation && (
                <>
                  {/* ── Step 1: Pick counsellor ── */}
                  <div style={{ marginBottom: 28 }}>
                    <h2 className={styles.formTitle} style={{ marginBottom: 4 }}>Step 1 — Choose a counsellor</h2>
                    <p className={styles.formSubtitle} style={{ marginBottom: 16 }}>
                      Select a counsellor based on their specialization and availability.
                    </p>

                    {counsellors === undefined && (
                      <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading counsellors…</p>
                    )}
                    {counsellors?.length === 0 && (
                      <div style={{ padding: "20px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, color: "#6b7280", fontSize: 13 }}>
                        No counsellors registered yet. Check back soon.
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                      {counsellors?.map((c) => {
                        const isSelected = selectedId === c._id;
                        const avLines = availabilityLines(c.availability);
                        const isExpanded = expandedId === c._id;

                        return (
                          <div
                            key={c._id}
                            style={card(isSelected)}
                            onClick={() => { setSelectedId(c._id); setPreferredDate(""); }}
                          >
                            {/* Header row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                                  Dr. {c.firstName} {c.lastName}
                                </div>
                                {c.specialization.length > 0 && (
                                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                    {c.specialization.slice(0, 3).map((s, i) => (
                                      <span key={i} style={chip("#1e40af", "#dbeafe")}>{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {isSelected && <CheckCircle2 size={18} color="#2563eb" />}
                            </div>

                            {/* Availability summary */}
                            {avLines.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : c._id); }}
                                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280", fontWeight: 600 }}
                                >
                                  <Clock size={12} />
                                  Availability
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                                {isExpanded && (
                                  <ul style={{ margin: "6px 0 0 16px", padding: 0, listStyle: "disc", fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
                                    {avLines.map((line, i) => <li key={i}>{line}</li>)}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Step 2: Your details + date ── */}
                  {selectedCounsellor && (
                    <motion.div
                      key="form"
                      initial={reduce ? undefined : { opacity: 0, y: 12 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                    >
                      <h2 className={styles.formTitle} style={{ marginBottom: 4 }}>Step 2 — Your details</h2>
                      <p className={styles.formSubtitle} style={{ marginBottom: 18 }}>
                        Booking with <strong>Dr. {selectedCounsellor.firstName} {selectedCounsellor.lastName}</strong>
                      </p>

                      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                          <div>
                            <label style={lbl}>
                              <User size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Full Name *
                            </label>
                            <input value={name} onChange={(e) => setName(e.target.value)} style={inp} required placeholder="Your full name" />
                          </div>
                          <div>
                            <label style={lbl}>
                              <Mail size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Email *
                            </label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} required placeholder="your@email.com" />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                          <div>
                            <label style={lbl}>
                              <Phone size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Phone (optional)
                            </label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} placeholder="+91 98765 43210" />
                          </div>
                          <div>
                            <label style={lbl}>
                              <Calendar size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Preferred Date *
                            </label>
                            <input
                              type="date"
                              value={preferredDate}
                              min={minDate}
                              onChange={(e) => { setPreferredDate(e.target.value); setError(""); }}
                              style={{ ...inp, borderColor: dateConflict ? "#f87171" : "#d1d5db" }}
                              required
                            />
                            {dateConflict && (
                              <p style={{ margin: "5px 0 0", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                                <AlertCircle size={12} /> This counsellor is already booked on this date. Please pick another day.
                              </p>
                            )}
                            {preferredDate && !dateConflict && bookedDates !== undefined && (
                              <p style={{ margin: "5px 0 0", fontSize: 12, color: "#059669", display: "flex", alignItems: "center", gap: 4 }}>
                                <CheckCircle2 size={12} /> Available on this date
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label style={lbl}>
                            <Stethoscope size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Notes (optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ ...inp, resize: "vertical", minHeight: 72 } as React.CSSProperties}
                            rows={3}
                            placeholder="Describe your concern, symptoms, or anything you'd like the counsellor to know"
                          />
                        </div>

                        {error && (
                          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                            <AlertCircle size={14} /> {error}
                          </div>
                        )}

                        <div>
                          <button
                            type="submit"
                            disabled={submitting || dateConflict}
                            style={{
                              padding: "11px 32px",
                              background: submitting || dateConflict ? "#9ca3af" : "#2563eb",
                              color: "#fff", border: "none", borderRadius: 8,
                              fontSize: 14, fontWeight: 700,
                              cursor: submitting || dateConflict ? "not-allowed" : "pointer",
                            }}
                          >
                            {submitting ? "Requesting…" : "Request Appointment"}
                          </button>
                          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
                            You will receive confirmation once the counsellor accepts your request.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <Layout title="Appointments — Sehat-Saathi" description="">
        <div style={{ padding: "48px 16px", textAlign: "center", color: "#6b7280" }}>Loading…</div>
      </Layout>
    }>
      <AppointmentsInner />
    </Suspense>
  );
}
