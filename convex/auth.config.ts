import type { AuthConfig } from "convex/server";

/**
 * Clerk → Convex: create a JWT template named "convex" in Clerk Dashboard
 * (audience "convex") and add claim: "role": "{{user.public_metadata.role}}"
 * so admin routes can call requireClerkAdmin().
 *
 * Set CLERK_JWT_ISSUER_DOMAIN in Convex env to your Clerk Frontend API URL
 * (e.g. https://YOUR_INSTANCE.clerk.accounts.dev).
 */
/** Set in Convex env; placeholder keeps `convex dev` usable until configured. */
const domain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ?? "https://clerk-not-configured.invalid";

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
