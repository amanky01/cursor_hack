"use client";

import React from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Shield, Stethoscope, ArrowRight } from "lucide-react";
import styles from "@/styles/pages/Auth.module.css";

const choiceBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  textDecoration: "none",
  borderRadius: "var(--radius-lg)",
  padding: "var(--spacing-lg) var(--spacing-xl)",
  fontSize: "1.05rem",
  fontWeight: 600,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "var(--shadow-md)",
};

export default function StaffPortalPage() {
  return (
    <Layout
      title="Staff sign-in — Sehat-Saathi"
      description="Choose admin or counsellor login for Sehat-Saathi staff."
    >
      <div className={styles.authContainer}>
        <div className={styles.authCard} style={{ maxWidth: 520 }}>
          <div className={styles.authHeader}>
            <h1 className={styles.title}>Staff portal</h1>
            <p className={styles.subtitle}>
              Sign in with the account type that matches your role. Students use{" "}
              <Link href="/login" className={styles.footerLink}>
                Login
              </Link>{" "}
              from the home flow.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link
              href="/login-admin"
              style={{
                ...choiceBase,
                marginTop: 0,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={22} strokeWidth={2} aria-hidden />
                Admin dashboard
              </span>
              <ArrowRight size={20} aria-hidden />
            </Link>

            <Link
              href="/login-doctor"
              style={{
                ...choiceBase,
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Stethoscope size={22} strokeWidth={2} aria-hidden />
                Doctor / counsellor
              </span>
              <ArrowRight size={20} aria-hidden />
            </Link>
          </div>

          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              Organisation still on Clerk for some routes?{" "}
              <Link href="/sign-in" className={styles.footerLink}>
                Open Clerk sign-in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
