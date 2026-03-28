"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, Circle, User } from "lucide-react";

type Field = { key: string; label: string; weight: number };

const PROFILE_FIELDS: Field[] = [
  { key: "contactNo", label: "Contact number", weight: 10 },
  { key: "ageGroup", label: "Age group", weight: 15 },
  { key: "occupation", label: "Occupation / Role", weight: 15 },
  { key: "university", label: "Institution / University", weight: 15 },
  { key: "program", label: "Program / Field of study", weight: 15 },
  { key: "bio", label: "About you (bio)", weight: 15 },
  { key: "branch", label: "Branch / Specialisation", weight: 7 },
  { key: "semester", label: "Semester / Year", weight: 8 },
];

// Base % for mandatory fields being filled (name + email always present after signup)
const BASE_PCT = 20;

export default function ProfileCompletion() {
  const { user } = useAuth();
  if (!user) return null;

  const filled = PROFILE_FIELDS.filter((f) => {
    const val = (user as Record<string, unknown>)[f.key];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });
  const earnedWeight = filled.reduce((s, f) => s + f.weight, 0);
  // Cap at 100
  const pct = Math.min(100, BASE_PCT + earnedWeight);

  const missing = PROFILE_FIELDS.filter((f) => !filled.some((fi) => fi.key === f.key)).slice(0, 4);

  const color = pct >= 80 ? "#059669" : pct >= 50 ? "#0891b2" : "#ca8a04";

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <User size={18} color={color} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Profile Completion</span>
        </div>
        <Link href="/dashboard/profile" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>
          Complete Profile →
        </Link>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, marginBottom: 8, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 999,
          transition: "width 0.5s ease",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {pct < 100 ? `${pct}% complete` : "Profile complete!"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {pct}%
        </span>
      </div>

      {missing.length > 0 && pct < 100 && (
        <div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Suggested next steps:</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {missing.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}>
                <Circle size={10} color="#d1d5db" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {pct >= 100 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#059669" }}>
          <CheckCircle size={14} /> Your profile is fully personalised!
        </div>
      )}
    </div>
  );
}
