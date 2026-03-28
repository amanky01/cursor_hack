"use client";

import { useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import styles from "@/styles/components/saathi-chat.module.css";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "ur", label: "اردو" },
  { code: "ks", label: "کٲشُر" },
] as const;

type Props = {
  onReady: () => void;
  compact?: boolean;
};

export default function SaathiLanguageGate({ onReady, compact }: Props) {
  const getOrCreate = useMutation(api.patients.getOrCreatePatient);

  const handleStart = async (language: string) => {
    let id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `saathi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const existing = localStorage.getItem("saathi_id");
    if (existing) id = existing;
    else localStorage.setItem("saathi_id", id);
    await getOrCreate({ anonymousId: id, language });
    onReady();
  };

  return (
    <div
      style={
        compact
          ? { padding: "12px 16px", textAlign: "left" as const }
          : { textAlign: "center" as const }
      }
    >
      <p
        style={{
          fontSize: compact ? 13 : 14,
          color: "#6b6b6b",
          marginBottom: compact ? 8 : 12,
        }}
      >
        Choose your language / زبان منتخب کریں
      </p>
      <div className={styles.langGrid}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => void handleStart(lang.code)}
            className={styles.langBtn}
            style={compact ? { padding: "10px 12px", fontSize: 13 } : undefined}
          >
            {lang.label}
          </button>
        ))}
      </div>
      {!compact && (
        <p style={{ fontSize: 12, color: "#8a8a8a", marginTop: 16 }}>
          In crisis right now?{" "}
          <a href="tel:9152987821" style={{ color: "#7c6fcd" }}>
            Call iCall: 9152987821
          </a>
        </p>
      )}
    </div>
  );
}
