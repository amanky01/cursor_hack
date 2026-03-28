/**
 * Apify REST API via fetch — avoids apify-client, which does require("proxy-agent")
 * and breaks under Convex's Node bundler.
 *
 * @see https://docs.apify.com/api/v2
 */

const APIFY_V2 = "https://api.apify.com/v2";

function actorIdForUrl(actorId: string): string {
  if (actorId.includes("~")) return actorId;
  return actorId.replace("/", "~");
}

type ApifyRunEnvelope = {
  data?: {
    id?: string;
    status?: string;
    defaultDatasetId?: string;
  };
};

export async function apifyListDatasetItems(
  apiKey: string,
  datasetId: string,
  options: { limit?: number; clean?: boolean } = {}
): Promise<unknown[]> {
  const limit = options.limit ?? 1000;
  const clean = options.clean === true ? "1" : "0";
  const url = `${APIFY_V2}/datasets/${encodeURIComponent(datasetId)}/items?format=json&clean=${clean}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Apify dataset items ${res.status}: ${text.slice(0, 400)}`);
  }
  try {
    const data = JSON.parse(text) as unknown;
    return Array.isArray(data) ? data : [];
  } catch {
    throw new Error(`Apify dataset items: invalid JSON (${text.slice(0, 120)})`);
  }
}

export type ApifyRunSyncResult = {
  datasetId: string;
  /** Apify run status when the wait window ended (e.g. SUCCEEDED, RUNNING, TIMED-OUT). */
  status?: string;
};

/**
 * Runs an actor and waits up to waitSecs for finish; returns default dataset id.
 */
export async function apifyRunActorSync(
  apiKey: string,
  actorId: string,
  input: Record<string, unknown>,
  waitSecs: number
): Promise<ApifyRunSyncResult> {
  const path = encodeURIComponent(actorIdForUrl(actorId));
  const wait = Math.min(Math.max(1, waitSecs), 300);
  const url = `${APIFY_V2}/acts/${path}/runs?waitForFinish=${wait}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Apify run actor ${res.status}: ${text.slice(0, 500)}`);
  }
  let envelope: ApifyRunEnvelope;
  try {
    envelope = JSON.parse(text) as ApifyRunEnvelope;
  } catch {
    throw new Error(`Apify run: invalid JSON (${text.slice(0, 200)})`);
  }
  const datasetId = envelope.data?.defaultDatasetId;
  const status = envelope.data?.status;
  if (!datasetId) {
    const st = status ?? "?";
    throw new Error(
      `Apify run has no defaultDatasetId (status=${st}). Try APIFY_HOSPITAL_DATASET_ID from a finished Apify run.`
    );
  }
  return { datasetId, status };
}
