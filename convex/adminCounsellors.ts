// @ts-nocheck — breaks TS circular inference: api.d.ts imports this module while it imports `internal` from api.
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireClerkAdmin } from "./lib/staffAuth";

export const listForAdmin = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    await requireClerkAdmin(ctx);
    const all = await ctx.db.query("users").collect();
    return all
      .filter((u) => u.role === "counsellor")
      .map(({ passwordHash: _p, ...rest }) => rest);
  },
});

export const deleteAsAdmin = mutation({
  args: { counsellorId: v.id("users") },
  returns: v.object({ success: v.literal(true) }),
  handler: async (ctx, { counsellorId }) => {
    await requireClerkAdmin(ctx);
    const result = await ctx.runMutation(internal.users.deleteCounsellor, {
      counsellorId,
    });
    if (!result.ok) {
      throw new Error("Counsellor not found");
    }
    return { success: true as const };
  },
});

export const createAsAdmin = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    contactNo: v.number(),
    email: v.string(),
    password: v.string(),
    qualifications: v.string(),
    specialization: v.optional(v.array(v.string())),
    availability: v.union(v.string(), v.array(v.string())),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await requireClerkAdmin(ctx);
    const email = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email is required");
    }
    if (!args.password.trim()) {
      throw new Error("Password is required");
    }
    const passwordHash: string = await ctx.runAction(
      internal.jwtNode.hashPassword,
      {
        password: args.password,
      }
    );
    const result: { ok: true; counsellor: unknown } | { ok: false } =
      await ctx.runMutation(internal.users.createCounsellor, {
        email,
        passwordHash,
        firstName: args.firstName.trim(),
        lastName: args.lastName.trim(),
        contactNo: args.contactNo,
        qualifications: args.qualifications.trim(),
        specialization: args.specialization,
        availability: args.availability,
      });
    if (!result.ok) {
      throw new Error("Email already exists");
    }
    return { success: true as const, counsellor: result.counsellor };
  },
});

export const updateAsAdmin = action({
  args: {
    counsellorId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    contactNo: v.optional(v.number()),
    email: v.optional(v.string()),
    qualifications: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),
    availability: v.optional(v.union(v.string(), v.array(v.string()))),
    password: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await requireClerkAdmin(ctx);
    const { counsellorId, password, ...rest } = args;
    let patch: Record<string, unknown> = { ...rest };
    for (const k of Object.keys(patch)) {
      if (patch[k] === undefined) delete patch[k];
    }
    if (typeof password === "string" && password.length > 0) {
      const passwordHash: string = await ctx.runAction(
        internal.jwtNode.hashPassword,
        {
          password,
        }
      );
      patch = { ...patch, passwordHash };
    }
    if (patch.email !== undefined) {
      patch.email = String(patch.email).trim().toLowerCase();
    }
    const result: { ok: true; counsellor: unknown } | { ok: false } =
      await ctx.runMutation(internal.users.updateCounsellor, {
        counsellorId,
        patch,
      });
    if (!result.ok) {
      throw new Error("Counsellor not found");
    }
    return { success: true as const, counsellor: result.counsellor };
  },
});
