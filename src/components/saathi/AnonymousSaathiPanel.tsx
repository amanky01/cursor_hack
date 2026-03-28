"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatBubble from "@/components/saathi/ChatBubble";
import ChatInput from "@/components/saathi/ChatInput";
import CrisisBanner from "@/components/saathi/CrisisBanner";
import VoiceJournalButton from "@/components/saathi/VoiceJournalButton";
import SaathiHeaderToolbar from "@/components/saathi/SaathiHeaderToolbar";
import SaathiLanguageGate from "@/components/saathi/SaathiLanguageGate";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useTheme } from "@/context/ThemeContext";
import { getChatbotHealth } from "@/services/chat_service";
import styles from "@/styles/components/saathi-chat.module.css";
import { Bot } from "lucide-react";

const WELCOME =
  "Namaste. I am Saathi, your mental health companion. This is a private space — you can share anything here. How are you feeling today?";

type Variant = "compact" | "full";

type Props = {
  variant: Variant;
  /** When true with variant="full", fill Layout main instead of min-height:100vh */
  layoutEmbedded?: boolean;
  /** When true (e.g. floating dock), hide the large compact language strip; use header language menu instead. */
  hideCompactLanguageStrip?: boolean;
  /** Increment to resync anonymous id / language state from localStorage after external changes. */
  languageSyncNonce?: number;
  onNeedsLanguageChange?: (needs: boolean) => void;
};

export default function AnonymousSaathiPanel({
  variant,
  layoutEmbedded = false,
  hideCompactLanguageStrip = false,
  languageSyncNonce,
  onNeedsLanguageChange,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; agentType?: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | undefined>();
  const [loading, setLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [anonymousId, setAnonymousId] = useState("");
  const [missingConvex, setMissingConvex] = useState(false);
  const [needsLanguage, setNeedsLanguage] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const languageSyncSkipRef = useRef(true);

  const sendMessage = useAction(api.patientChat.sendMessage);
  const getOrCreatePatient = useMutation(api.patients.getOrCreatePatient);

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

  useEffect(() => {
    onNeedsLanguageChange?.(needsLanguage);
  }, [needsLanguage, onNeedsLanguageChange]);

  useEffect(() => {
    if (languageSyncNonce === undefined) return;
    if (languageSyncSkipRef.current) {
      languageSyncSkipRef.current = false;
      return;
    }
    const id =
      typeof window !== "undefined" ? localStorage.getItem("saathi_id") ?? "" : "";
    if (!id) {
      setNeedsLanguage(true);
      setAnonymousId("");
      setMessages([]);
      setSessionId(undefined);
    } else {
      setNeedsLanguage(false);
      syncIdAndWelcome();
    }
  }, [languageSyncNonce, syncIdAndWelcome]);

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

  const handleLanguageReady = () => {
    syncIdAndWelcome();
  };

  const handlePickLanguage = useCallback(
    async (language: string) => {
      let id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `saathi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const existing = localStorage.getItem("saathi_id");
      if (existing) id = existing;
      else localStorage.setItem("saathi_id", id);
      await getOrCreatePatient({ anonymousId: id, language });
      setNeedsLanguage(false);
      syncIdAndWelcome();
    },
    [getOrCreatePatient, syncIdAndWelcome]
  );

  const handleChangeLanguage = () => {
    localStorage.removeItem("saathi_id");
    setAnonymousId("");
    setNeedsLanguage(true);
    setMessages([]);
    setSessionId(undefined);
  };

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

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!anonymousId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Choose a language from the header: hover or tap the language icon, then pick English, हिंदी, اردو, or کٲشُر.",
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
      ? `${styles.surface} ${
          layoutEmbedded
            ? `${styles.flexColInLayout} ${styles.anonymousEmbedSurface}`
            : `${styles.flexColScreen} ${styles.surfaceGradientScreen}`
        }`
      : `${styles.surface} ${styles.flexColCompact}`;

  const showLangHeaderHint =
    needsLanguage &&
    messages.length === 0 &&
    (variant === "full" || (variant === "compact" && hideCompactLanguageStrip));

  const embedChatCard = variant === "full" && layoutEmbedded;

  const messagesClassName = embedChatCard
    ? `${styles.messages} ${styles.messagesInCard}`
    : styles.messages;

  const micSlot =
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
    ) : undefined;

  const messagesBody = (
    <>
      {showLangHeaderHint ? (
        <p
          className={`${styles.langEmptyHint} ${embedChatCard ? styles.langEmptyHintInCard : ""}`}
        >
          Hover or tap the <strong>language icon</strong> in the header to open a compact menu —
          then choose your language to begin.
        </p>
      ) : null}
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

  return (
    <div className={surfaceClass}>
      {variant === "full" && (
        <header className={styles.anonymousHeaderStrip}>
          <div className={styles.anonymousBotCorner}>
            <div className={styles.anonymousBotAvatarWrap}>
              <Bot className={styles.anonymousBotIcon} strokeWidth={2} aria-hidden />
              <span
                className={`${styles.anonStatusDot} ${isOnline ? styles.anonStatusOnline : styles.anonStatusOffline}`}
                title={isOnline ? "Online — assistant reachable" : "Offline — assistant unreachable"}
                aria-label={isOnline ? "Status: online" : "Status: offline"}
              />
            </div>
          </div>
          <SaathiHeaderToolbar
            mode="anonymous"
            chrome={
              layoutEmbedded && theme === "dark" ? "onGradient" : "sheet"
            }
            onToggleMode={() => router.push("/chat/memory")}
            centerAction="minimize"
            onCenterClick={handleLeaveFullPageChat}
            onClose={handleCloseFullPageChat}
            languageMenu={{
              onSelectLanguage: handlePickLanguage,
              onRequestClear: handleChangeLanguage,
              needsAttention: needsLanguage,
            }}
            showHomeLink
            className={styles.anonymousHeaderToolbar}
          />
        </header>
      )}

      {needsLanguage && variant === "compact" && !hideCompactLanguageStrip && (
        <div className={styles.languageGateStrip}>
          <SaathiLanguageGate onReady={handleLanguageReady} compact />
        </div>
      )}

      {crisisDetected && <CrisisBanner />}

      {embedChatCard ? (
        <div className={styles.anonymousMainShell}>
          <div className={styles.anonymousChatCard}>
            <div className={messagesClassName}>{messagesBody}</div>
            <ChatInput onSend={handleSend} disabled={loading || needsLanguage} micSlot={micSlot} />
          </div>
        </div>
      ) : (
        <>
          <div className={messagesClassName}>{messagesBody}</div>
          <ChatInput onSend={handleSend} disabled={loading || needsLanguage} micSlot={micSlot} />
        </>
      )}
    </div>
  );
}
