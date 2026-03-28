import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { json } from "../common";

export function registerChatbotRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/chatbot/health",
    method: "GET",
    handler: httpAction(async (ctx) => {
      try {
        const r = await ctx.runAction(internal.chatbotNode.chatbotHealth, {});
        return json({
          ok: Boolean(r?.ok),
          providers: r,
        });
      } catch (e) {
        return json(
          {
            ok: false,
            error: e instanceof Error ? e.message : "LLM not configured",
          },
          500
        );
      }
    }),
  });
}
