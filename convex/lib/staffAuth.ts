import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

type Identity = NonNullable<Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>>;

/** Clerk JWT template should expose role (e.g. public_metadata.role). */
export function clerkRoleFromIdentity(identity: Identity): string | undefined {
  const rec = identity as Identity & {
    role?: string;
    public_metadata?: { role?: string };
  };
  if (typeof rec.role === "string" && rec.role.length > 0) return rec.role;
  const pm = rec.public_metadata?.role;
  if (typeof pm === "string" && pm.length > 0) return pm;
  return undefined;
}

export async function requireIdentity(
  ctx: AnyCtx
): Promise<Identity> {
  const id = await ctx.auth.getUserIdentity();
  if (!id) {
    throw new Error("Unauthorized");
  }
  return id;
}

export async function requireClerkAdmin(ctx: AnyCtx): Promise<Identity> {
  const id = await requireIdentity(ctx);
  const role = clerkRoleFromIdentity(id);
  if (role !== "admin") {
    throw new Error("Forbidden: admin only");
  }
  return id;
}
