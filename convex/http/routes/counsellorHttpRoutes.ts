import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { json, verifyAuth } from "../common";

export function registerCounsellorHttpRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/counsellor/getUser",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ message: "No token Provided" }, 401);
      }
      if (auth.role !== "counsellor") {
        return json({ success: false, message: "Unauthorized" }, 403);
      }
      return new Response("get assigned user/student", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }),
  });
}
