"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Heart } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SaathiLanguageGate from "@/components/saathi/SaathiLanguageGate";
import AnonymousSaathiPanel from "@/components/saathi/AnonymousSaathiPanel";
import styles from "@/styles/components/saathi-chat.module.css";

type Phase = "checking" | "onboarding" | "chat";

export default function SaathiPage() {
  const [phase, setPhase] = useState<Phase>("checking");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      setPhase("onboarding");
      return;
    }
    try {
      setPhase(localStorage.getItem("saathi_id") ? "chat" : "onboarding");
    } catch {
      setPhase("onboarding");
    }
  }, []);

  const fadeProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.18 },
      };

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <Layout
        title="Saathi - Sehat-Saathi"
        description="Anonymous mental health companion — configure Convex to enable chat."
        hideFooter
      >
        <main className={`${styles.onboarding} ${styles.onboardingInLayout}`}>
          <div className={styles.onboardingInner}>
            <p className={styles.saathiMissing}>
              Add <code>NEXT_PUBLIC_CONVEX_URL</code> to <code>.env.local</code> (your{" "}
              <code>.convex.cloud</code> URL) to use anonymous Saathi.
            </p>
            <Link href="/" className={styles.saathiHomeLink}>
              ← Back to home
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout
      title="Saathi - Sehat-Saathi"
      description="A safe, anonymous space to talk about how you feel. No account needed."
      hideFooter
    >
      <div className={styles.saathiLayoutHost}>
        {phase === "checking" ? (
          <div
            style={{
              flex: 1,
              minHeight: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gray-500, #64748b)",
              fontSize: 14,
            }}
            aria-busy="true"
          >
            Loading Saathi…
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {phase === "onboarding" && (
              <motion.main
                key="onboarding"
                className={`${styles.onboarding} ${styles.onboardingInLayout}`}
                {...fadeProps}
              >
                <div className={styles.onboardingInner}>
                  <div className={styles.saathiBrand}>
                    <div className={styles.saathiBrandIcons} aria-hidden>
                      <Heart size={20} strokeWidth={2} color="var(--primary-500)" />
                      <Activity size={20} strokeWidth={2} color="var(--primary-500)" />
                    </div>
                    <h1 className={styles.saathiTitle}>Sehat Saathi</h1>
                    <p className={styles.saathiScript}>सेहत साथی · صحت ساتھی</p>
                    <p className={styles.saathiTagline}>
                      A safe, anonymous space to talk about how you feel. No account needed.
                    </p>
                  </div>

                  <div className={styles.saathiPrivacyCard}>
                    <p className={styles.saathiPrivacyTitle}>Your privacy</p>
                    <p className={styles.saathiPrivacyBody}>
                      An anonymous ID on this device links your chats. Convex stores session history when
                      configured.
                    </p>
                  </div>

                  <div className={styles.saathiGateSlot}>
                    <SaathiLanguageGate onReady={() => setPhase("chat")} compact={false} />
                  </div>

                  <p className={styles.saathiFootHint}>
                    After you choose a language, chat opens on this same page below the site menu.
                  </p>
                </div>
              </motion.main>
            )}
            {phase === "chat" && (
              <motion.div
                key="chat"
                className={styles.saathiLayoutHost}
                {...fadeProps}
              >
                <AnonymousSaathiPanel variant="full" layoutEmbedded />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
}
