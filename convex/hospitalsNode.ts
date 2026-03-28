"use node";

import { internalAction } from "./_generated/server";
import {
  apifyListDatasetItems,
  apifyRunActorSync,
} from "./lib/apifyRest";
import { mapRawApifyItemToHospital } from "./lib/hospitalMap";

/** Store default: Apify Google Maps Scraper is `compass/crawler-google-places` (not apify/google-maps-scraper). */
const DEFAULT_MAPS_ACTOR = "compass/crawler-google-places";

function buildActorInput(actorId: string): Record<string, unknown> {
  const q =
    process.env.APIFY_HOSPITAL_SEARCH_QUERY?.trim() || "hospitals in India";

  const raw = process.env.APIFY_HOSPITAL_ACTOR_INPUT?.trim();
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* use generated input */
    }
  }

  const id = actorId.toLowerCase();
  const locationQuery =
    process.env.APIFY_HOSPITAL_LOCATION_QUERY?.trim() || undefined;

  // compass/crawler-google-places expects searchStringsArray (not searchStrings).
  if (
    id.includes("compass") ||
    id.includes("crawler-google-places") ||
    id.includes("google-maps-scraper")
  ) {
    const input: Record<string, unknown> = {
      searchStringsArray: [q],
      maxCrawledPlacesPerSearch: 20,
      language: "en",
    };
    if (locationQuery) {
      input.locationQuery = locationQuery;
    }
    return input;
  }
  return {
    searchStringsArray: [q],
    maxCrawledPlacesPerSearch: 20,
    language: "en",
    ...(locationQuery ? { locationQuery } : {}),
  };
}

/**
 * Loads hospitals from Apify on Convex (uses APIFY_API_KEY).
 *
 * Priority:
 * 1. APIFY_HOSPITAL_DATASET_ID — read dataset (fast, no actor run).
 * 2. Else APIFY_HOSPITAL_ACTOR_ID — run that actor.
 * 3. Else run DEFAULT_MAPS_ACTOR (compass/crawler-google-places), unless opted out.
 *
 * Opt out of automatic Maps runs: APIFY_HOSPITAL_AUTO_RUN_DEFAULTS=false
 * (then you must set a dataset ID or explicit actor, or the list stays empty.)
 */
export const fetchApifyHospitals = internalAction({
  args: {},
  handler: async () => {
    const apiKey = process.env.APIFY_API_KEY?.trim();
    if (!apiKey) {
      console.warn(
        "[hospitalsNode] APIFY_API_KEY not set on Convex; returning no hospitals."
      );
      return [];
    }

    const datasetId = process.env.APIFY_HOSPITAL_DATASET_ID?.trim();
    const explicitActor = process.env.APIFY_HOSPITAL_ACTOR_ID?.trim();
    const disableDefaultMaps =
      process.env.APIFY_HOSPITAL_AUTO_RUN_DEFAULTS === "false" ||
      process.env.APIFY_HOSPITAL_AUTO_RUN_DEFAULTS === "0";

    if (!datasetId && !explicitActor && disableDefaultMaps) {
      console.warn(
        "[hospitalsNode] Default Maps run disabled. Set APIFY_HOSPITAL_DATASET_ID or APIFY_HOSPITAL_ACTOR_ID, or remove APIFY_HOSPITAL_AUTO_RUN_DEFAULTS=false."
      );
      return [];
    }

    try {
      let items: unknown[] = [];

      if (datasetId) {
        items = await apifyListDatasetItems(apiKey, datasetId, {
          clean: true,
          limit: 1000,
        });
      } else {
        const actorToRun = explicitActor || DEFAULT_MAPS_ACTOR;
        const input = buildActorInput(actorToRun);
        const waitSecs = Math.min(
          Math.max(
            60,
            Number.parseInt(
              process.env.APIFY_HOSPITAL_WAIT_SECS?.trim() ?? "",
              10
            ) || 180
          ),
          300
        );
        console.log("[hospitalsNode] running actor", actorToRun, {
          waitSecs,
          inputKeys: Object.keys(input),
        });
        const { datasetId: outDatasetId, status: runStatus } =
          await apifyRunActorSync(apiKey, actorToRun, input, waitSecs);
        items = await apifyListDatasetItems(apiKey, outDatasetId, {
          clean: true,
          limit: 1000,
        });
        if (items.length === 0) {
          console.warn(
            "[hospitalsNode] 0 dataset rows; Apify run status=",
            runStatus ?? "?",
            "— if RUNNING/TIMED-OUT, raise APIFY_HOSPITAL_WAIT_SECS (max 300) or set APIFY_HOSPITAL_DATASET_ID from a finished run."
          );
        }
      }

      console.log("[hospitalsNode] raw items", items.length);

      const mapped = items
        .map((raw, i) => mapRawApifyItemToHospital(raw, i))
        .filter((x): x is NonNullable<typeof x> => x != null);

      if (items.length > 0 && mapped.length === 0) {
        const first = items[0];
        console.warn(
          "[hospitalsNode] No rows mapped to hospitals. First item keys:",
          first != null && typeof first === "object"
            ? Object.keys(first as object)
            : typeof first
        );
      }

      return mapped;
    } catch (e) {
      console.error("[hospitalsNode] Apify error", e);
      return [];
    }
  },
});
