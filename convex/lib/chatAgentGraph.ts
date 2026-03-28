"use node";

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { PatientProfile } from "../agents/types";
import {
  apifyWebSearch,
  exaSearch,
  type SearchSnippet,
} from "./search";
import {
  chatTrace,
  isChatTraceEnabled,
  type ChatTurnTrace,
} from "./chatTrace";

const HISTORY_PAIR_LIMIT = 10;
const FALLBACK_REPLY =
  "I'm having trouble responding right now. Please try again in a moment, or reach out to a trusted person or helpline if you need immediate support.";

function maxIterationsFromEnv(): number {
  const raw = process.env.CHAT_AGENT_MAX_ITERATIONS?.trim();
  const n = raw ? parseInt(raw, 10) : 5;
  if (!Number.isFinite(n)) return 5;
  return Math.min(15, Math.max(1, n));
}

/** LangGraph step budget: each tool round uses multiple internal steps. */
function recursionLimitForMaxIterations(maxIter: number): number {
  return Math.max(4, 2 * maxIter + 4);
}

function formatSnippets(
  sourceLabel: string,
  items: SearchSnippet[]
): string {
  if (items.length === 0) {
    return `No ${sourceLabel} results (check API key or try a different query).`;
  }
  return items
    .map(
      (r) =>
        `[${sourceLabel}] ${r.title}\nURL: ${r.url}\n${r.text.slice(0, 500)}`
    )
    .join("\n\n---\n\n");
}

function buildSystemPrompt(profile: PatientProfile): string {
  return `You are Saathi, a warm mental health companion on Sehat Saathi for Indian and Kashmiri students.

PATIENT CONTEXT (use for tone and personalization; do not repeat verbatim as a list):
- Sessions completed: ${profile.totalSessions}
- Known conditions: ${profile.conditions.join(", ") || "none yet"}
- Medications mentioned: ${profile.medications.join(", ") || "none yet"}
- Triggers: ${profile.triggers.join(", ") || "none yet"}
- Coping patterns that helped: ${profile.copingPatterns.join(", ") || "none yet"}
- PHQ-9: ${profile.phqScore ?? "not assessed"} | GAD: ${profile.gadScore ?? "not assessed"}
- Prior crisis flag in record: ${profile.crisisFlag ? "yes — be extra careful" : "no"}
- Preferred language code: ${profile.language}

TOOLS:
- exa_search: curated web search (trusted domains). Use for mental health resources, helplines, articles, techniques.
- apify_search: broader web search. Use when you need additional angles or Exa returned little.

Call tools only when the user needs current or specific external information. For pure venting or reflection, respond directly without tools.

SAFETY:
- If the user expresses suicidal ideation, self-harm, or wanting to die: acknowledge with care, ask if they are safe right now, and include India helplines: iCall 9152987821, Vandrevala 1860-2662-345, NIMHANS 080-46110007, Snehi 044-24640050.
- Never dismiss feelings. Keep responses concise (roughly 2–4 short paragraphs unless the user asks for detail).`;
}

function historyToMessages(
  history: { role: "user" | "assistant"; content: string }[]
): (HumanMessage | AIMessage)[] {
  const slice = history.slice(-HISTORY_PAIR_LIMIT * 2);
  const out: (HumanMessage | AIMessage)[] = [];
  for (const m of slice) {
    if (m.role === "user") out.push(new HumanMessage(m.content));
    else out.push(new AIMessage(m.content));
  }
  return out;
}

function lastAiText(messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m instanceof AIMessage) {
      const c = m.content;
      if (typeof c === "string" && c.trim()) return c;
      if (Array.isArray(c)) {
        const text = c
          .filter(
            (p): p is { type: "text"; text: string } =>
              typeof p === "object" &&
              p !== null &&
              "type" in p &&
              (p as { type: string }).type === "text" &&
              typeof (p as { text?: string }).text === "string"
          )
          .map((p) => p.text)
          .join("\n");
        if (text.trim()) return text;
      }
    }
  }
  return "";
}

function collectToolCallNames(messages: unknown[]): string[] {
  const names: string[] = [];
  for (const m of messages) {
    if (m instanceof AIMessage && m.tool_calls?.length) {
      for (const tc of m.tool_calls) {
        if (tc && typeof tc.name === "string") names.push(tc.name);
      }
    }
  }
  return names;
}

function createModel() {
  const provider = process.env.LLM_PROVIDER?.toLowerCase().trim();
  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set (LLM_PROVIDER=openai)");
    return new ChatOpenAI({
      apiKey: key,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o",
      temperature: 0.5,
    });
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY is not set");
  return new ChatGoogleGenerativeAI({
    apiKey: geminiKey,
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    temperature: 0.5,
  });
}

export type RunLoopAgentArgs = {
  profile: PatientProfile;
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  trace?: ChatTurnTrace;
};

export async function runLoopAgent(args: RunLoopAgentArgs): Promise<{
  text: string;
}> {
  const maxIter = maxIterationsFromEnv();
  const recursionLimit = recursionLimitForMaxIterations(maxIter);
  const conditions = args.profile.conditions;

  const exa_search = tool(
    async ({ query }: { query: string }) => {
      const items = await exaSearch(query, conditions);
      return formatSnippets("EXA", items);
    },
    {
      name: "exa_search",
      description:
        "Search trusted mental-health and resource sites (Exa). Use for helplines, articles, exercises, India-relevant support.",
      schema: z.object({
        query: z
          .string()
          .describe(
            "Search query focused on what the user needs (e.g. anxiety techniques India, student stress resources)."
          ),
      }),
    }
  );

  const apify_search = tool(
    async ({ query }: { query: string }) => {
      const items = await apifyWebSearch(query);
      return formatSnippets("APIFY", items);
    },
    {
      name: "apify_search",
      description:
        "Broader web search via Google scraper (Apify). Use when Exa is not enough or you need wider results.",
      schema: z.object({
        query: z
          .string()
          .describe("Web search query; include mental health context when relevant."),
      }),
    }
  );

  const llm = createModel();
  const agent = createReactAgent({
    llm,
    tools: [exa_search, apify_search],
    prompt: buildSystemPrompt(args.profile),
  });

  const prior = historyToMessages(args.history);
  const messages = [...prior, new HumanMessage(args.userMessage)];

  const result = await agent.invoke(
    { messages },
    { recursionLimit }
  );

  const outMessages = result.messages as unknown[];
  const text = lastAiText(outMessages).trim() || FALLBACK_REPLY;

  if (args.trace && isChatTraceEnabled()) {
    const toolCalls = collectToolCallNames(outMessages);
    chatTrace("loop_agent_done", {
      turnId: args.trace.turnId,
      maxIterationsConfigured: maxIter,
      recursionLimit,
      toolCallCount: toolCalls.length,
      toolCalls,
      replyLength: text.length,
    });
  }

  return { text };
}
