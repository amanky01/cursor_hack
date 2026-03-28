import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { json } from "../common";

export function registerHealthRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/health",
    method: "GET",
    handler: httpAction(async () =>
      json({ ok: true, service: "sehat-saathi-convex" })
    ),
  });
}
