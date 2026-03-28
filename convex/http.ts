import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { json } from "./http/common";
import { registerAllHttpRoutes } from "./http/registerAll";

const http = httpRouter();
registerAllHttpRoutes(http);

// Hospitals from Apify (uses APIFY_API_KEY on Convex); used by Next /api rewrites.
http.route({
  path: "/api/apify/hospitals",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const hospitals = await ctx.runAction(
        internal.hospitalsNode.fetchApifyHospitals,
        {}
      );
      return json({ hospitals });
    } catch (e) {
      console.error("[http /api/apify/hospitals]", e);
      return json({ hospitals: [] });
    }
  }),
});

export default http;
