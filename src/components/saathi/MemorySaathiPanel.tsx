"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import ChatBubble from "@/components/saathi/ChatBubble";
import ChatInput from "@/components/saathi/ChatInput";
import CrisisBanner from "@/components/saathi/CrisisBanner";
import MemoryDrawer from "@/components/saathi/MemoryDrawer";
import SaathiHeaderToolbar from "@/components/saathi/SaathiHeaderToolbar";
import VoiceJournalButton from "@/components/saathi/VoiceJournalButton";
import TypingIndicator from "@/components/chat/TypingIndicator";
import styles from "@/styles/components/saathi-chat.module.css";
import uiStyles from "@/styles/components/ui/ChatInterface.module.css";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getChatbotHealth } from "@/services/chat_service";

type Variant = "compact" | "full";

type Props = {
  variant: Variant;
  /** Under site Layout main (e.g. /chat/memory): flat canvas + composer like /saathi */
  layoutEmbedded?: boolean;
};

export default function MemorySaathiPanel({
  variant,
  layoutEmbedded = false,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; agentType?: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | undefined>();
  const [loading, setLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [domain, setDomain] = useState<
    "stress" | "burnout" | "career" | "relationships"
  >("stress");
  const bottomRef = useRef<HTMLDivElement>(null);

  const anonymousId = user ? `jwt:${user._id}` : "";

  const sendMessage = useAction(api.patientChat.sendMessage);
  const getOrCreatePatient = useMutation(api.patients.getOrCreatePatient);
  const patientProfile = useQuery(
    api.patients.getProfileByAnonymousId,
    anonymousId ? { anonymousId } : "skip"
  );

  const loginHref = `/login?returnUrl=${encodeURIComponent("/chat/memory")}`;

  const WELCOME = user
    ? `Hi ${user.firstName}! I'm Saathi, your mental health companion. Your conversations are remembered so I can support you better over time. How are you feeling today?`
    : "Hi there! I'm Saathi, your mental health companion. How are you feeling today?";

  const memorySessionKey = anonymousId
    ? `saathi_memory_session_${anonymousId}`
    : null;
  const storedMemorySessionId =
    typeof window !== "undefined" && memorySessionKey
      ? localStorage.getItem(memorySessionKey)
      : null;

  const shouldHydrateMemorySession = Boolean(
    isAuthenticated && anonymousId && storedMemorySessionId
  );

  const memorySessionDoc = useQuery(
    api.sessions.getSessionForPatient,
    shouldHydrateMemorySession
      ? {
          anonymousId,
          sessionId: storedMemorySessionId as Id<"sessions">,
        }
      : "skip"
  );

  useEffect(() => {
    if (!isAuthenticated || !anonymousId) return;

    if (shouldHydrateMemorySession && memorySessionDoc === undefined) {
      return;
    }

    if (shouldHydrateMemorySession && memorySessionDoc === null) {
      if (memorySessionKey) localStorage.removeItem(memorySessionKey);
      setSessionId(undefined);
      setMessages([{ role: "assistant", content: WELCOME }]);
      return;
    }

    if (
      memorySessionDoc &&
      memorySessionDoc.messages &&
      memorySessionDoc.messages.length > 0
    ) {
      setMessages(
        memorySessionDoc.messages.map(
          (m: {
            role: "user" | "assistant";
            content: string;
            agentUsed?: string;
          }) => ({
            role: m.role,
            content: m.content,
            agentType: m.agentUsed,
          })
        )
      );
      setSessionId(memorySessionDoc._id);
      return;
    }

    setMessages((prev) =>
      prev.length === 0 ? [{ role: "assistant", content: WELCOME }] : prev
    );
  }, [
    isAuthenticated,
    anonymousId,
    shouldHydrateMemorySession,
    memorySessionDoc,
    memorySessionKey,
    WELCOME,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleLeaveFullPageChat = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleCloseFullPageChat = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const handleMemoryLanguage = useCallback(
    async (language: string) => {
      if (!user?._id) return;
      await getOrCreatePatient({
        anonymousId: `jwt:${user._id}`,
        language,
      });
    },
    [getOrCreatePatient, user?._id]
  );

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const ok = await getChatbotHealth();
      if (mounted) setIsOnline(ok);
    };
    void check();
    const id = setInterval(check, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !anonymousId) return;

      const displayText = text.trim();
      const outbound =
        domain === "stress"
          ? displayText
          : `[Topic: ${domain}] ${displayText}`;

      setMessages((prev) => [...prev, { role: "user", content: displayText }]);
      setLoading(true);

      try {
        const result = await sendMessage({
          anonymousId,
          sessionId,
          message: outbound,
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
    [loading, anonymousId, sessionId, sendMessage, domain]
  );

  const containerClass =
    variant === "compact"
      ? `${uiStyles.chatContainer} ${uiStyles.memoryEmbed}`
      : layoutEmbedded
        ? `${styles.surface} ${styles.flexColInLayout} ${styles.anonymousEmbedSurface}`
        : `${uiStyles.chatContainer} ${uiStyles.memoryFullPage}`;

  const embedShell = variant === "full" && layoutEmbedded;

  const messagesClassName = embedShell
    ? `${styles.messages} ${styles.messagesInCard}`
    : styles.messages;

  const micSlot =
    anonymousId ? (
      <div className={styles.voiceJournalSlot}>
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
      </div>
    ) : undefined;

  const messagesBody = (
    <>
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
    </>
  );

  if (!isAuthenticated) {
    return (
      <div className={containerClass}>
        <div className={uiStyles.memoryGate}>
          <div className={uiStyles.memoryGateTop}>
            <div className={uiStyles.memoryGateIcon} aria-hidden>
              <Bot size={22} strokeWidth={2} />
            </div>
            <div className={uiStyles.memoryGateTitles}>
              <h2 className={uiStyles.memoryGateTitle}>Sehat-Saathi</h2>
              <p className={uiStyles.memoryGateSubtitle}>Memory · Sign in to continue</p>
            </div>
            {variant === "full" && (
              <Link href="/" className={uiStyles.memoryGateHome}>
                Home
              </Link>
            )}
          </div>
          <div className={uiStyles.memoryGateBody}>
            <p className={uiStyles.memoryGateCopy}>
              Memory mode remembers your conversation when you&apos;re signed in, so Saathi can
              stay consistent with you over time.
            </p>
            <Link href={loginHref} className={uiStyles.memoryGateCta}>
              Sign in
            </Link>
            <p className={uiStyles.memoryGateFoot}>
              Or tap the <strong>ghost icon</strong> in the chat header for Anonymous chat without
              an account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div
        className={`${uiStyles.memoryChromeStrip}${
          embedShell ? ` ${styles.memoryEmbedChrome}` : ""
        }`}
      >
        <div className={uiStyles.memoryBotCorner}>
          <div className={uiStyles.memoryBotAvatarWrap}>
            <Bot className={uiStyles.memoryBotIcon} strokeWidth={2} aria-hidden />
            <span
              className={`${uiStyles.statusBadge} ${isOnline ? uiStyles.statusBadgeOnline : uiStyles.statusBadgeOffline}`}
              title={isOnline ? "Online — assistant reachable" : "Offline — assistant unreachable"}
              aria-label={isOnline ? "Status: online" : "Status: offline"}
            />
          </div>
        </div>
        <div className={uiStyles.memoryTopicCluster}>
          <label htmlFor="domain-select-memory" className={uiStyles.domainLabel}>
            Topic:
          </label>
          <select
            id="domain-select-memory"
            value={domain}
            onChange={(e) =>
              setDomain(
                e.target.value as "stress" | "burnout" | "career" | "relationships"
              )
            }
            className={uiStyles.domainSelect}
            aria-label="Select conversation topic"
          >
            <option value="stress">Stress</option>
            <option value="burnout">Burnout</option>
            <option value="career">Career</option>
            <option value="relationships">Relationships</option>
          </select>
        </div>
        {variant === "full" ? (
          <SaathiHeaderToolbar
            chrome={embedShell && theme === "dark" ? "onGradient" : "sheet"}
            mode="memory"
            onToggleMode={() => router.push("/chat")}
            centerAction="minimize"
            onCenterClick={handleLeaveFullPageChat}
            onClose={handleCloseFullPageChat}
            showHomeLink
            languageMenu={{ onSelectLanguage: handleMemoryLanguage }}
            className={`${uiStyles.memoryHeaderToolbar}${
              embedShell ? ` ${styles.anonymousHeaderToolbar}` : ""
            }`}
            onMemoryClick={() => setMemoryOpen(true)}
            memoryHasContent={Boolean(patientProfile?.memoryNote)}
          />
        ) : null}
      </div>

      {crisisDetected && <CrisisBanner />}

      {embedShell ? (
        <div className={styles.anonymousMainShell}>
          <div className={styles.anonymousChatCard}>
            <div className={messagesClassName}>{messagesBody}</div>
            <ChatInput onSend={handleSend} disabled={loading} micSlot={micSlot} />
          </div>
        </div>
      ) : (
        <>
          <div className={messagesClassName}>{messagesBody}</div>
          <ChatInput onSend={handleSend} disabled={loading} micSlot={micSlot} />
        </>
      )}
      {memoryOpen && anonymousId && (
        <MemoryDrawer
          anonymousId={anonymousId}
          onClose={() => setMemoryOpen(false)}
        />
      )}
    </div>
  );
}
