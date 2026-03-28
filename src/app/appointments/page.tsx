"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import { Stethoscope, Calendar, CheckCircle, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── Types ─────────────────────────────── */
type PortalCounsellor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string[];
  availability: string | string[];
};
type BookingConfirmation = {
  name: string;
  email: string;
  counsellorName: string;
  preferredDate: string;
  notes?: string;
};

function buildNotesFromSearchParams(
  sp: ReadonlyURLSearchParams | URLSearchParams
): string {
  const hospital = sp.get("hospital")?.trim();
  const city = sp.get("city")?.trim();
  const doctor = sp.get("doctor")?.trim();
  const specialty = sp.get("specialty")?.trim();
  const context = sp.get("context")?.trim();
  const notes = sp.get("notes")?.trim();
  const parts: string[] = [];
  if (hospital) {
    parts.push(
      `From hospital finder: ${hospital}${city ? ` (${city})` : ""}`
    );
  }
  if (doctor || specialty) {
    parts.push(`Interest: ${[doctor, specialty].filter(Boolean).join(" — ")}`);
  }
  if (context) parts.push(context);
  if (notes) parts.push(notes);
  return parts.join(". ");
}

/* ─── Styles ─────────────────────────────── */
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
};
const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
const sel: React.CSSProperties = { ...inp, cursor: "pointer" };
const lbl: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 4,
  display: "block",
};
const primaryBtn = (disabled = false): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 28px",
  background: disabled ? "#9ca3af" : "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
});

function AppointmentsPageInner() {
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    counsellorId: "",
    preferredDate: "",
    notes: "",
  });
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null
  );
  const [bookError, setBookError] = useState("");
  const [specialtyHint, setSpecialtyHint] = useState(false);
  const [formSession, setFormSession] = useState(0);

  const profilePrefillDone = useRef(false);
  const urlInitDone = useRef(false);

  useEffect(() => {
    profilePrefillDone.current = false;
    urlInitDone.current = false;
  }, [formSession]);

  const bookMutation = useMutation(api.guestAppointments.createGuest);
  const portalCounsellors = useQuery(api.adminAnalytics.listCounsellorsPublic) as
    | PortalCounsellor[]
    | undefined;

  /* Logged-in student: prefill contact fields once, only where empty */
  useEffect(() => {
    if (authLoading || profilePrefillDone.current || !user) return;
    if (user.role !== "student") {
      profilePrefillDone.current = true;
      return;
    }
    profilePrefillDone.current = true;
    setForm((f) => ({
      ...f,
      name:
        f.name ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        f.name,
      email: f.email || user.email || f.email,
      phone:
        f.phone ||
        (user.contactNo != null ? String(user.contactNo) : f.phone),
    }));
  }, [user, authLoading, formSession]);

  /* URL / hospital-finder context + counsellorId or specialty-based suggestion */
  useEffect(() => {
    if (portalCounsellors === undefined || urlInitDone.current) return;
    urlInitDone.current = true;

    const id = searchParams.get("counsellorId")?.trim();
    let pickedBySpecialty = false;

    if (id && portalCounsellors.some((c) => c._id === id)) {
      setForm((f) => ({ ...f, counsellorId: id }));
    } else if (portalCounsellors.length > 0) {
      const specialty = searchParams.get("specialty")?.trim();
      if (specialty) {
        const lower = specialty.toLowerCase();
        const match = portalCounsellors.find((c) =>
          (c.specialization ?? []).some((s) => {
            const sl = s.toLowerCase();
            return (
              sl === lower ||
              sl.includes(lower) ||
              lower.includes(sl)
            );
          })
        );
        if (match) {
          pickedBySpecialty = true;
          setForm((f) => ({
            ...f,
            counsellorId: f.counsellorId || match._id,
          }));
          setSpecialtyHint(true);
        }
      }
    }

    const built = buildNotesFromSearchParams(searchParams);
    if (built) {
      setForm((f) => ({ ...f, notes: f.notes ? f.notes : built }));
    }

    if (!pickedBySpecialty) setSpecialtyHint(false);
  }, [searchParams, portalCounsellors, formSession]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookError("");
    const counsellor = portalCounsellors?.find((c) => c._id === form.counsellorId);
    if (!counsellor) {
      setBookError("Please select a counsellor.");
      return;
    }
    setBooking(true);
    try {
      await bookMutation({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        department: (counsellor.specialization ?? []).join(", ") || "General Counselling",
        preferredDate: form.preferredDate,
        notes: form.notes || undefined,
        counsellorId: counsellor._id,
      });
      setConfirmation({
        name: form.name,
        email: form.email,
        counsellorName: `${counsellor.firstName} ${counsellor.lastName}`,
        preferredDate: form.preferredDate,
        notes: form.notes,
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        counsellorId: "",
        preferredDate: "",
        notes: "",
      });
      setSpecialtyHint(false);
      setFormSession((s) => s + 1);
    } catch (err) {
      setBookError(
        err instanceof Error ? err.message : "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout
      title="Appointments - Sehat-Saathi"
      description="Book appointments with our registered counsellors."
    >
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "32px 16px" }}>

        <div style={{ marginBottom: 24 }}>
          <Link
            href="/health"
            style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}
          >
            ← Back to Health Tools
          </Link>
          <h1 style={{ margin: "8px 0 4px", fontSize: "1.8rem", fontWeight: 800 }}>
            <Stethoscope
              size={22}
              style={{ verticalAlign: "middle", marginRight: 8, color: "#2563eb" }}
            />
            Book a Counsellor
          </h1>
          <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: 14 }}>
            Book directly with our registered portal counsellors.
          </p>
          <Link
            href="/health/hospitals"
            style={{ fontSize: 13, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}
          >
            <MapPin
              size={13}
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
            Looking for nearby hospitals? Use the Hospital Finder →
          </Link>
        </div>

        {confirmation ? (
          <div
            style={{
              ...card,
              border: "2px solid #bbf7d0",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", padding: "16px 0 12px" }}>
              <CheckCircle size={56} color="#059669" style={{ marginBottom: 12 }} />
              <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", color: "#064e3b" }}>
                Appointment Requested!
              </h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                Your request has been submitted. The counsellor will confirm your
                appointment.
              </p>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #a7f3d0",
                borderRadius: 10,
                padding: "16px 20px",
                margin: "16px 0",
              }}
            >
              {[
                ["Patient", confirmation.name],
                ["Email", confirmation.email],
                ["Counsellor", `Dr. ${confirmation.counsellorName}`],
                ["Preferred Date", confirmation.preferredDate],
                ...(confirmation.notes ? [["Notes", confirmation.notes]] : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    fontSize: 14,
                    borderBottom: "1px solid #d1fae5",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>{label}</span>
                  <strong style={{ maxWidth: "60%", textAlign: "right" }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "10px 14px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 8,
                fontSize: 13,
                color: "#92400e",
                marginBottom: 16,
              }}
            >
              A confirmation will be sent to{" "}
              <strong>{confirmation.email}</strong> once the counsellor reviews your
              request.
            </div>

            <button
              type="button"
              onClick={() => setConfirmation(null)}
              style={primaryBtn()}
            >
              <Calendar size={15} /> Book Another Appointment
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Our Counsellors
              </h3>
              {!portalCounsellors ? (
                <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading...</p>
              ) : portalCounsellors.length === 0 ? (
                <div
                  style={{
                    ...card,
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 13,
                    padding: 24,
                  }}
                >
                  No counsellors registered yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {portalCounsellors.map((c) => {
                    const selected = form.counsellorId === c._id;
                    return (
                      <div
                        key={c._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setForm({ ...form, counsellorId: c._id })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setForm({ ...form, counsellorId: c._id });
                          }
                        }}
                        style={{
                          ...card,
                          cursor: "pointer",
                          borderColor: selected ? "#2563eb" : "#e5e7eb",
                          borderWidth: selected ? 2 : 1,
                          background: selected ? "#eff6ff" : "#fff",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              Dr. {c.firstName} {c.lastName}
                            </div>
                            {c.specialization?.length > 0 && (
                              <div
                                style={{
                                  marginTop: 5,
                                  display: "flex",
                                  gap: 4,
                                  flexWrap: "wrap",
                                }}
                              >
                                {c.specialization.slice(0, 3).map((s, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: 10,
                                      background: "#dbeafe",
                                      color: "#1e40af",
                                      padding: "1px 7px",
                                      borderRadius: 10,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {selected && <CheckCircle size={18} color="#2563eb" />}
                        </div>
                        {c.availability && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: "#6b7280",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={11} />
                            {Array.isArray(c.availability)
                              ? c.availability.join(", ")
                              : c.availability}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>
                Your Details
              </h3>
              {user?.role === "student" && (
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>
                  Signed in as a student — your name and email can be pre-filled from
                  your profile. You can edit them before submitting.
                </p>
              )}
              <form onSubmit={handleBook} style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={inp}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label style={lbl}>Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={inp}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={inp}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label style={lbl}>Preferred Date *</label>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) =>
                        setForm({ ...form, preferredDate: e.target.value })
                      }
                      style={inp}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Counsellor *</label>
                  <select
                    value={form.counsellorId}
                    onChange={(e) => {
                      setForm({ ...form, counsellorId: e.target.value });
                      setSpecialtyHint(false);
                    }}
                    style={sel}
                    required
                  >
                    <option value="">— Select a counsellor —</option>
                    {portalCounsellors?.map((c) => (
                      <option key={c._id} value={c._id}>
                        Dr. {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                  {specialtyHint && (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                      Suggested based on specialty from Hospital Finder — change if you
                      prefer someone else.
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={
                      { ...inp, resize: "vertical", minHeight: 72 } as React.CSSProperties
                    }
                    placeholder="Symptoms, concerns, or any context..."
                    rows={3}
                  />
                </div>

                {bookError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      color: "#dc2626",
                      fontSize: 13,
                    }}
                  >
                    {bookError}
                  </div>
                )}

                <div>
                  <button type="submit" disabled={booking} style={primaryBtn(booking)}>
                    {booking ? (
                      "Booking..."
                    ) : (
                      <>
                        <Calendar size={15} /> Request Appointment
                      </>
                    )}
                  </button>
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
                    You&apos;ll receive a confirmation once the counsellor accepts your
                    request.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function AppointmentsPageFallback() {
  return (
    <Layout
      title="Appointments - Sehat-Saathi"
      description="Book appointments with our registered counsellors."
    >
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "48px 16px", textAlign: "center", color: "#6b7280" }}>
        Loading…
      </div>
    </Layout>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsPageFallback />}>
      <AppointmentsPageInner />
    </Suspense>
  );
}
