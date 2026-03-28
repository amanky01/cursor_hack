import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

function sanitizeUser(doc: {
  _id: Id<"users">;
  passwordHash: string;
  email: string;
  role: "student" | "counsellor" | "admin";
  firstName: string;
  lastName: string;
  contactNo?: number;
  university?: string;
  program?: string;
  branch?: string;
  semester?: string;
  qualifications?: string;
  specialization?: string[];
  availability?: string | string[];
}) {
  const {
    passwordHash: _p,
    _id,
    ...rest
  } = doc;
  return { _id, ...rest };
}

export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
  },
});

export const getById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const createStudent = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactNo: v.number(),
    university: v.string(),
    program: v.string(),
    branch: v.optional(v.string()),
    semester: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      return { ok: false as const, code: "exists" as const };
    }
    const id = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      role: "student",
      firstName: args.firstName,
      lastName: args.lastName,
      contactNo: args.contactNo,
      university: args.university,
      program: args.program,
      branch: args.branch,
      semester: args.semester,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("insert failed");
    return { ok: true as const, user: sanitizeUser(doc) };
  },
});

export const listStudents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.filter((u) => u.role === "student").map(sanitizeUser);
  },
});

const studentPatchKeys = new Set([
  "firstName",
  "lastName",
  "contactNo",
  "university",
  "program",
  "branch",
  "semester",
  "passwordHash",
]);

export const updateStudent = internalMutation({
  args: {
    userId: v.id("users"),
    patch: v.any(),
  },
  handler: async (ctx, { userId, patch }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "student") {
      return { ok: false as const, code: "not_found" as const };
    }
    const raw = { ...(patch as Record<string, unknown>) };
    delete raw.password;
    delete raw.role;
    delete raw.email;
    const next: Record<string, unknown> = {};
    for (const key of studentPatchKeys) {
      if (raw[key] !== undefined) next[key] = raw[key];
    }
    if (Object.keys(next).length === 0) {
      return { ok: true as const, user: sanitizeUser(user) };
    }
    await ctx.db.patch(userId, next as Record<string, unknown>);
    const updated = await ctx.db.get(userId);
    if (!updated) return { ok: false as const, code: "not_found" as const };
    return { ok: true as const, user: sanitizeUser(updated) };
  },
});

export const deleteStudent = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "student") {
      return { ok: false as const };
    }
    await ctx.db.delete(userId);
    return { ok: true as const };
  },
});

export const listCounsellors = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.filter((u) => u.role === "counsellor").map(sanitizeUser);
  },
});

export const createCounsellor = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactNo: v.number(),
    qualifications: v.string(),
    specialization: v.optional(v.array(v.string())),
    availability: v.union(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      return { ok: false as const, code: "exists" as const };
    }
    const id = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      role: "counsellor",
      firstName: args.firstName,
      lastName: args.lastName,
      contactNo: args.contactNo,
      qualifications: args.qualifications,
      specialization: args.specialization ?? [],
      availability: args.availability,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("insert failed");
    return { ok: true as const, counsellor: sanitizeUser(doc) };
  },
});

const counsellorPatchKeys = new Set([
  "firstName",
  "lastName",
  "contactNo",
  "email",
  "qualifications",
  "specialization",
  "availability",
  "passwordHash",
]);

export const updateCounsellor = internalMutation({
  args: {
    counsellorId: v.id("users"),
    patch: v.any(),
  },
  handler: async (ctx, { counsellorId, patch }) => {
    const user = await ctx.db.get(counsellorId);
    if (!user || user.role !== "counsellor") {
      return { ok: false as const, code: "not_found" as const };
    }
    const raw = { ...(patch as Record<string, unknown>) };
    delete raw.password;
    const next: Record<string, unknown> = {};
    for (const key of counsellorPatchKeys) {
      if (raw[key] !== undefined) next[key] = raw[key];
    }
    if (next.email !== undefined) {
      next.email = String(next.email).trim().toLowerCase();
    }
    if (Object.keys(next).length === 0) {
      return { ok: true as const, counsellor: sanitizeUser(user) };
    }
    await ctx.db.patch(counsellorId, next as Record<string, unknown>);
    const updated = await ctx.db.get(counsellorId);
    if (!updated) return { ok: false as const, code: "not_found" as const };
    return { ok: true as const, counsellor: sanitizeUser(updated) };
  },
});

export const deleteCounsellor = internalMutation({
  args: { counsellorId: v.id("users") },
  handler: async (ctx, { counsellorId }) => {
    const user = await ctx.db.get(counsellorId);
    if (!user || user.role !== "counsellor") {
      return { ok: false as const };
    }
    await ctx.db.delete(counsellorId);
    return { ok: true as const };
  },
});

export const createAdmin = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      return { ok: false as const, code: "exists" as const };
    }
    const id = await ctx.db.insert("users", {
      email,
      passwordHash: args.passwordHash,
      role: "admin",
      firstName: args.firstName,
      lastName: args.lastName,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("insert failed");
    return { ok: true as const, user: sanitizeUser(doc) };
  },
});
