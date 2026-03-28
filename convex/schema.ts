import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("counsellor"),
      v.literal("admin")
    ),
    firstName: v.string(),
    lastName: v.string(),
    contactNo: v.optional(v.number()),
    university: v.optional(v.string()),
    program: v.optional(v.string()),
    branch: v.optional(v.string()),
    semester: v.optional(v.string()),
    qualifications: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),
    availability: v.optional(v.union(v.string(), v.array(v.string()))),
  }).index("by_email", ["email"]),

  stickyNotes: defineTable({
    userId: v.id("users"),
    content: v.string(),
    color: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    size: v.object({ width: v.number(), height: v.number() }),
    zIndex: v.number(),
    isVisible: v.boolean(),
  }).index("by_user", ["userId"]),
});
