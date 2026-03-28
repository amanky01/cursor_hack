"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  User, Mail, Phone, GraduationCap, Briefcase,
  CheckCircle, ArrowLeft, Save
} from "lucide-react";
import Link from "next/link";

/* ── Profile completion logic ── */
type FieldDef = { key: string; label: string; weight: number };
const PROFILE_FIELDS: FieldDef[] = [
  { key: "contactNo", label: "Contact number", weight: 10 },
  { key: "ageGroup", label: "Age group", weight: 15 },
  { key: "occupation", label: "Occupation / Role", weight: 15 },
  { key: "university", label: "Institution", weight: 15 },
  { key: "program", label: "Program / Field of study", weight: 15 },
  { key: "bio", label: "About you (bio)", weight: 15 },
  { key: "branch", label: "Branch / Specialisation", weight: 7 },
  { key: "semester", label: "Year / Semester", weight: 8 },
];

function calcPct(user: Record<string, unknown>): number {
  const earned = PROFILE_FIELDS.reduce((s, f) => {
    const v = user[f.key];
    return v !== undefined && v !== null && String(v).trim() !== "" ? s + f.weight : s;
  }, 0);
  return Math.min(100, 20 + earned);
}

const AGE_GROUPS = [
  "Under 18",
  "18–24 (Young Adult)",
  "25–34 (Adult)",
  "35–44",
  "45–54",
  "55+ (Senior)",
];
const OCCUPATIONS = [
  "Student",
  "Working Professional",
  "Healthcare Worker",
  "Teacher / Educator",
  "Self-employed / Freelancer",
  "Homemaker",
  "Retired",
  "Other",
];

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, isLoading: authLoading } = useAuth();
  const updateProfile = useMutation(api.users.updateProfile);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contactNo: "",
    ageGroup: "",
    occupation: "",
    university: "",
    program: "",
    branch: "",
    semester: "",
    bio: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Populate form from user when loaded
  useEffect(() => {
    if (!user) return;
    const u = user as Record<string, unknown>;
    setForm({
      firstName: String(u.firstName ?? ""),
      lastName: String(u.lastName ?? ""),
      contactNo: u.contactNo !== undefined ? String(u.contactNo) : "",
      ageGroup: String(u.ageGroup ?? ""),
      occupation: String(u.occupation ?? ""),
      university: String(u.university ?? ""),
      program: String(u.program ?? ""),
      branch: String(u.branch ?? ""),
      semester: String(u.semester ?? ""),
      bio: String(u.bio ?? ""),
    });
  }, [user]);

  const pct = user ? calcPct({ ...user, ...form, contactNo: form.contactNo || undefined }) : 0;
  const color = pct >= 80 ? "#059669" : pct >= 50 ? "#0891b2" : "#ca8a04";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    setSaving(true);
    setError("");
    try {
      const contactNo = form.contactNo ? Number(form.contactNo) : undefined;
      await updateProfile({
        userId: user._id as Id<"users">,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        contactNo: contactNo && !isNaN(contactNo) ? contactNo : undefined,
        ageGroup: form.ageGroup || undefined,
        occupation: form.occupation || undefined,
        university: form.university || undefined,
        program: form.program || undefined,
        branch: form.branch || undefined,
        semester: form.semester || undefined,
        bio: form.bio || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <Layout title="Profile"><div style={{ padding: 32, textAlign: "center" }}>Loading...</div></Layout>;

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };
  const sel: React.CSSProperties = { ...inp, cursor: "pointer" };
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };
  const fieldRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
  const card: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 20 };
  const sectionTitle: React.CSSProperties = { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827", borderBottom: "1px solid #f3f4f6", paddingBottom: 10 };

  return (
    <Layout title="My Profile - Sehat-Saathi" description="Complete your profile for a personalised experience">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>

        {/* Back link */}
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Completion header */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.3rem" }}>My Profile</h1>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                More info = more personalised mental health support
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color }}>{pct}%</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>complete</div>
            </div>
          </div>
          <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
          {pct >= 100 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, color: "#059669" }}>
              <CheckCircle size={14} /> Profile fully complete — you'll get the most personalised experience!
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          {/* Mandatory fields */}
          <div style={card}>
            <h2 style={sectionTitle}><User size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Basic Info</h2>
            <div style={fieldRow}>
              <div>
                <label style={label}>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} style={inp} placeholder="First name" required />
              </div>
              <div>
                <label style={label}>Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} style={inp} placeholder="Last name" required />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>
                <Mail size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Email
              </label>
              <input value={user?.email ?? ""} style={{ ...inp, background: "#f9fafb", color: "#9ca3af" }} disabled />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>
                <Phone size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Contact Number
              </label>
              <input name="contactNo" value={form.contactNo} onChange={handleChange} style={inp} placeholder="e.g. 98765 43210" type="tel" inputMode="numeric" />
            </div>
          </div>

          {/* About you */}
          <div style={card}>
            <h2 style={sectionTitle}><Briefcase size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />About You</h2>
            <div style={fieldRow}>
              <div>
                <label style={label}>Age Group</label>
                <select name="ageGroup" value={form.ageGroup} onChange={handleChange} style={sel}>
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Occupation / Role</label>
                <select name="occupation" value={form.occupation} onChange={handleChange} style={sel}>
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>About You (Bio)</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                style={{ ...inp, resize: "vertical", minHeight: 80 }}
                placeholder="Tell us a bit about yourself — helps personalise your experience"
                rows={3}
              />
            </div>
          </div>

          {/* Education / Institution */}
          <div style={card}>
            <h2 style={sectionTitle}><GraduationCap size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Education / Institution</h2>
            <div style={fieldRow}>
              <div>
                <label style={label}>University / Institution</label>
                <input name="university" value={form.university} onChange={handleChange} style={inp} placeholder="e.g. NIT Srinagar, AIIMS Delhi" />
              </div>
              <div>
                <label style={label}>Program / Field</label>
                <input name="program" value={form.program} onChange={handleChange} style={inp} placeholder="e.g. B.Tech, MBBS, Business" />
              </div>
            </div>
            <div style={{ ...fieldRow, marginTop: 14 }}>
              <div>
                <label style={label}>Branch / Specialisation</label>
                <input name="branch" value={form.branch} onChange={handleChange} style={inp} placeholder="e.g. Computer Science, Psychology" />
              </div>
              <div>
                <label style={label}>Year / Semester</label>
                <input name="semester" value={form.semester} onChange={handleChange} style={inp} placeholder="e.g. 3rd Year, Semester 5" />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {saved && (
            <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#059669", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <CheckCircle size={14} /> Profile saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : <><Save size={16} /> Save Profile</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
