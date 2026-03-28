"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export const chatbotChat = internalAction({
  args: {
    student_id: v.string(),
    message: v.string(),
    domain: v.optional(v.string()),
    update_profile: v.optional(v.boolean()),
  },
  handler: async (_ctx, args) => {
    const base =
      process.env.CHATBOT_SERVICE_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";
    const url = `${base}/chat/`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const key = process.env.CHATBOT_API_KEY;
    if (key) headers["X-API-Key"] = key;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        student_id: args.student_id,
        message: args.message,
        domain: args.domain,
        update_profile: args.update_profile,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Chatbot error ${res.status}: ${text}`);
    }
    return await res.json();
  },
});

export const chatbotHealth = internalAction({
  args: {},
  handler: async () => {
    const base =
      process.env.CHATBOT_SERVICE_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";
    try {
      const res = await fetch(`${base}/health/ping`, { method: "GET" });
      if (!res.ok) return { ok: false };
      const data = await res.json().catch(() => ({}));
      return { ok: true, data };
    } catch {
      return { ok: false };
    }
  },
});
