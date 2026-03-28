"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatBubble from "@/components/saathi/ChatBubble";
import ChatInput from "@/components/saathi/ChatInput";
import CrisisBanner from "@/components/saathi/CrisisBanner";
import MoodSparkline from "@/components/saathi/MoodSparkline";
import VoiceJournalButton from "@/components/saathi/VoiceJournalButton";
import SaathiLanguageGate from "@/components/saathi/SaathiLanguageGate";
import TypingIndicator from "@/components/chat/TypingIndicator";
import styles from "@/styles/components/saathi-chat.module.css";
import { Activity } from "lucide-react";

const WELCOME =
  "Namaste. I am Saathi, your mental health companion. This is a private space — you can share anything here. How are you feeling today?";

type Variant = "compact" | "full";

type Props = {
  variant: Variant;
  /** When true with variant="full", fill Layout main instead of min-height:100vh */
  layoutEmbedded?: boolean;
};

export default function AnonymousSaathiPanel({
  variant,
  layoutEmbedded = false,
}: Props) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; agentType?: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | undefined>();
  const [loading, setLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [anonymousId, setAnonymousId] = useState("");
  const [missingConvex, setMissingConvex] = useState(false);
  const [needsLanguage, setNeedsLanguage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousSaathiIdRef = useRef<string | null>(null);

  const sendMessage = useAction(api.patientChat.sendMessage);
  const moodData = useQuery(
    api.moodLogs.getRecentForPatient,
    anonymousId ? { anonymousId } : "skip"
  );

  const syncIdAndWelcome = useCallback(() => {
    const id = localStorage.getItem("saathi_id") ?? "";
    setAnonymousId(id);
    if (id) {
      setNeedsLanguage(false);
      setMessages((prev) =>
        prev.length === 0
          ? [{ role: "assistant" as const, content: WELCOME }]
          : prev
      );
    }
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      setMissingConvex(true);
      return;
    }
    const id = localStorage.getItem("saathi_id") ?? "";
    if (!id) {
      setNeedsLanguage(true);
      setAnonymousId("");
      setMessages([]);
    } else {
      setAnonymousId(id);
      setNeedsLanguage(false);
      setMessages([{ role: "assistant", content: WELCOME }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, needsLanguage]);

  const handleLanguageReady = () => {
    previousSaathiIdRef.current = null;
    syncIdAndWelcome();
  };

  const handleChangeLanguage = () => {
    try {
      previousSaathiIdRef.current = localStorage.getItem("saathi_id");
    } catch {
      previousSaathiIdRef.current = null;
    }
    localStorage.removeItem("saathi_id");
    setAnonymousId("");
    setNeedsLanguage(true);
    setMessages([]);
    setSessionId(undefined);
  };

  const cancelLanguagePicker = useCallback(() => {
    const prev = previousSaathiIdRef.current;
    if (prev) {
      try {
        localStorage.setItem("saathi_id", prev);
      } catch {
        /* ignore */
      }
      previousSaathiIdRef.current = null;
      setNeedsLanguage(false);
      syncIdAndWelcome();
    } else {
      setNeedsLanguage(false);
    }
  }, [syncIdAndWelcome]);

  useEffect(() => {
    if (!needsLanguage || variant !== "full") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelLanguagePicker();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [needsLanguage, variant, cancelLanguagePicker]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!anonymousId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Choose a language above to start chatting.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const result = await sendMessage({
        anonymousId,
        sessionId,
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.response,
          agentType: result.agentType,
        },
      ]);
      setSessionId(result.sessionId);
      if (result.crisisDetected) setCrisisDetected(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I am having trouble connecting. Check Convex env (GEMINI_API_KEY or OPENAI_API_KEY with LLM_PROVIDER) and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (missingConvex) {
    return (
      <div
        className={styles.onboarding}
        style={{ textAlign: "center", gap: 16, minHeight: variant === "compact" ? 200 : undefined }}
      >
        <p style={{ color: "#2d2d2d", maxWidth: 400 }}>
          Set <code>NEXT_PUBLIC_CONVEX_URL</code> in <code>.env.local</code> to
          enable anonymous chat.
        </p>
        <Link href="/saathi" style={{ color: "#7c6fcd" }}>
          Back to Saathi
        </Link>
      </div>
    );
  }

  const surfaceClass =
    variant === "full"
      ? `${styles.surface} ${layoutEmbedded ? styles.flexColInLayout : styles.flexColScreen}`
      : `${styles.surface} ${styles.flexColCompact}`;

  return (
    <div className={surfaceClass}>
      {variant === "full" && (
        <header className={styles.header}>
          <div className={styles.headerAvatar} aria-hidden>
            <span className={styles.headerHeartbeat}>
              <Activity size={20} strokeWidth={2.5} />
            </span>
          </div>
          <div className={styles.headerBrand}>
            <p className={styles.headerTitle}>Saathi • Your Health Companion</p>
            <p className={styles.headerSub}>Mental health companion · Anonymous</p>
          </div>
          <button
            type="button"
            onClick={handleChangeLanguage}
            className={styles.headerLink}
            style={{ cursor: "pointer", fontFamily: "inherit" }}
            aria-expanded={needsLanguage}
            aria-haspopup="dialog"
          >
            Language
          </button>
          <Link href="/" className={styles.headerLinkMuted}>
            Home
          </Link>
        </header>
      )}

      {moodData && moodData.length >= 2 && (
        <div style={{ padding: "6px 16px", borderBottom: "1px solid #e8e4de", background: "#fff" }}>
          <MoodSparkline data={moodData} />
        </div>
      )}

      {needsLanguage && variant === "compact" && (
        <div
          style={{
            flexShrink: 0,
            borderBottom: "1px solid #e8e4de",
            background: "#fff",
          }}
        >
          <SaathiLanguageGate onReady={handleLanguageReady} compact />
        </div>
      )}

      {crisisDetected && <CrisisBanner />}

      <div className={styles.chatMain}>
        {needsLanguage && variant === "full" && (
          <div
            className={styles.langOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="saathi-lang-dialog-title"
          >
            <button
              type="button"
              className={styles.langOverlayBackdrop}
              aria-label="Close language picker"
              onClick={cancelLanguagePicker}
            />
            <div
              className={styles.langOverlayCard}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.langOverlayClose}
                onClick={cancelLanguagePicker}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="saathi-lang-dialog-title" className={styles.langOverlayTitle}>
                Choose language
              </h2>
              <p className={styles.langOverlaySub}>
                You remain on Saathi. Pick a language to continue chatting.
              </p>
              <SaathiLanguageGate
                onReady={handleLanguageReady}
                compact={false}
                showHeading={false}
                showFooterCrisis
              />
            </div>
          </div>
        )}

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              agentType={msg.agentType}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={loading || needsLanguage}
        micSlot={
          anonymousId ? (
            <div className={styles.voiceJournalSlot}>
              <VoiceJournalButton
                anonymousId={anonymousId}
                disabled={loading || needsLanguage}
                onResult={(result) => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "user" as const,
                      content: `[Voice Journal] ${result.transcription}`,
                    },
                    {
                      role: "assistant" as const,
                      content: result.summary,
                    },
                  ]);
                  if (result.crisisDetected) setCrisisDetected(true);
                }}
              />
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
