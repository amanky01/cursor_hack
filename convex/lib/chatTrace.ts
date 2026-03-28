"use node";

const PREFIX = "[sehat_chat]";

export type ChatTurnTrace = { turnId: string };

function envTruthy(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isChatTraceEnabled(): boolean {
  return envTruthy("SEHAT_CHAT_TRACE");
}

export function isChatTraceVerbose(): boolean {
  return envTruthy("SEHAT_CHAT_TRACE_VERBOSE");
}

export function chatTrace(
  event: string,
  payload: Record<string, unknown>
): void {
  if (!isChatTraceEnabled()) return;
  console.log(
    PREFIX,
    JSON.stringify({ ts: Date.now(), event, ...payload })
  );
}

export async function withTiming<T>(
  event: string,
  meta: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  if (!isChatTraceEnabled()) {
    return fn();
  }
  const t0 = Date.now();
  chatTrace(`${event}_start`, meta);
  try {
    const result = await fn();
    chatTrace(`${event}_end`, { ...meta, durationMs: Date.now() - t0 });
    return result;
  } catch (err) {
    chatTrace(`${event}_error`, {
      ...meta,
      durationMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export function anonymousIdSuffix(anonymousId: string): string {
  if (anonymousId.length <= 6) return anonymousId;
  return anonymousId.slice(-6);
}
