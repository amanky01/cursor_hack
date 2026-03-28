"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatBubble from "@/components/saathi/ChatBubble";
import ChatInput from "@/components/saathi/ChatInput";
import CrisisBanner from "@/components/saathi/CrisisBanner";
import MoodSparkline from "@/components/saathi/MoodSparkline";
import VoiceJournalButton from "@/components/saathi/VoiceJournalButton";
import styles from "@/styles/components/saathi-chat.module.css";
import { useAuth } from "@/context/AuthContext";

type Variant = "compact" | "full";

type Props = {
  variant: Variant;
};

export default function MemorySaathiPanel({ variant }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; agentType?: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | undefined>();
  const [loading, setLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useAction(api.patientChat.sendMessage);

  const loginHref = `/login?returnUrl=${encodeURIComponent("/chat/memory")}`;

  // Derive a stable anonymousId from the authenticated user
  const anonymousId = user ? `jwt:${user._id}` : "";

  const moodData = useQuery(
    api.moodLogs.getRecentForPatient,
    anonymousId ? { anonymousId } : "skip"
  );

  const WELCOME = user
    ? `Hi ${user.firstName}! I'm Saathi, your mental health companion. Your conversations are remembered so I can support you better over time. How are you feeling today?`
    : "Hi there! I'm Saathi, your mental health companion. How are you feeling today?";

  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      setMessages([{ role: "assistant", content: WELCOME }]);
    }
  }, [isAuthenticated, messages.length, WELCOME]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Restore sessionId from localStorage for conversation continuity
  useEffect(() => {
    if (!anonymousId) return;
    const stored = localStorage.getItem(`saathi_memory_session_${anonymousId}`);
    if (stored) {
      setSessionId(stored as Id<"sessions">);
    }
  }, [anonymousId]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !anonymousId) return;

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
        localStorage.setItem(
          `saathi_memory_session_${anonymousId}`,
          result.sessionId
        );
        if (result.crisisDetected) setCrisisDetected(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, anonymousId, sessionId, sendMessage]
  );

  // ── Not authenticated: show sign-in prompt ──
  if (!isAuthenticated) {
    return (
      <div
        className={
          variant === "full"
            ? `${styles.surface} ${styles.flexColScreen}`
            : `${styles.surface} ${styles.flexColCompact}`
        }
      >
        {variant === "full" && (
          <header className={styles.header}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#7c6fcd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
                S
              </span>
            </div>
            <div style={{ marginLeft: 12, flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#2d2d2d" }}>
                Saathi · Memory Mode
              </p>
              <p style={{ fontSize: 12, color: "#8a8a8a" }}>
                Sign in to continue
              </p>
            </div>
            <Link href="/" style={{ fontSize: 12, color: "#6b6b6b" }}>
              Home
            </Link>
          </header>
        )}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            background: "#f8f6f2",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.5,
            }}
          >
            Memory mode remembers your conversation context when you are signed
            in. Sign in to chat with your personal Saathi.
          </p>
          <Link
            href={loginHref}
            style={{
              display: "inline-block",
              textAlign: "center",
              background: "var(--primary-600)",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Sign in
          </Link>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Or use <strong>Anonymous</strong> mode for a private chat without an
            account.
          </p>
        </div>
      </div>
    );
  }

  // ── Authenticated chat ──
  const surfaceClass =
    variant === "full"
      ? `${styles.surface} ${styles.flexColScreen}`
      : `${styles.surface} ${styles.flexColCompact}`;

  return (
    <div className={surfaceClass}>
      {variant === "full" && (
        <header className={styles.header}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#7c6fcd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
              S
            </span>
          </div>
          <div style={{ marginLeft: 12, flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#2d2d2d" }}>
              Saathi · Memory Mode
            </p>
            <p style={{ fontSize: 12, color: "#8a8a8a" }}>
              Conversations are remembered · {user?.firstName}
            </p>
          </div>
          <Link href="/" style={{ fontSize: 12, color: "#6b6b6b" }}>
            Home
          </Link>
        </header>
      )}

      {moodData && moodData.length >= 2 && (
        <div style={{ padding: "6px 16px", borderBottom: "1px solid #e8e4de", background: "#fff" }}>
          <MoodSparkline data={moodData} />
        </div>
      )}

      {crisisDetected && <CrisisBanner />}

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            agentType={msg.agentType}
          />
        ))}
        {loading && (
          <div style={{ padding: "8px 16px" }}>
            <span style={{ fontSize: 12, color: "#8a8a8a" }}>
              Saathi is thinking…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={loading}
        micSlot={
          anonymousId ? (
            <VoiceJournalButton
              anonymousId={anonymousId}
              disabled={loading}
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
          ) : undefined
        }
      />
    </div>
  );
}
