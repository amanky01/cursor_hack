"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SaathiLanguageGate from "@/components/saathi/SaathiLanguageGate";
import styles from "@/styles/components/saathi-chat.module.css";

export default function SaathiOnboardingPage() {
  const router = useRouter();

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className={styles.onboarding}>
        <div className={styles.onboardingInner}>
          <p style={{ color: "#2d2d2d", marginBottom: 16 }}>
            Add <code>NEXT_PUBLIC_CONVEX_URL</code> to <code>.env.local</code>{" "}
            (your <code>.convex.cloud</code> URL) to use anonymous Saathi.
          </p>
          <Link href="/" style={{ color: "#7c6fcd" }}>
            Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.onboarding}>
      <div className={styles.onboardingInner}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 500,
              color: "#2d2d2d",
              letterSpacing: "-0.02em",
            }}
          >
            Sehat Saathi
          </h1>
          <p style={{ color: "#6b6b6b", fontSize: "1.125rem", marginTop: 8 }}>
            सेहत साथی · صحت ساتھی
          </p>
          <p
            style={{
              color: "#8a8a8a",
              fontSize: "0.875rem",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            A safe, anonymous space to talk about how you feel. No account
            needed.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1px solid #e8e4de",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 12, color: "#6b6b6b" }}>Your privacy</p>
          <p style={{ fontSize: 12, color: "#8a8a8a", marginTop: 4 }}>
            An anonymous ID on this device links your chats. Convex stores
            session history when configured.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <SaathiLanguageGate
            onReady={() => router.push("/chat")}
            compact={false}
          />
        </div>

        <p style={{ fontSize: 12, color: "#8a8a8a" }}>
          You can also open chat anytime from the chat icon (bottom-right).
        </p>
      </div>
    </main>
  );
}
