import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function getBearer(request: Request): string | null {
  const h = request.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

export async function verifyAuth(
  ctx: ActionCtx,
  request: Request
): Promise<{ userId: string; email: string; role: string } | null> {
  const token = getBearer(request);
  if (!token) return null;
  return (await ctx.runAction(internal.jwtNode.verifyJwt, {
    token,
  })) as { userId: string; email: string; role: string } | null;
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || !email.trim()) return null;
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}
