import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const COLORS = new Set([
  "#ffd700",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
]);

function toClient(doc: {
  _id: Id<"stickyNotes">;
  userId: Id<"users">;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isVisible: boolean;
  _creationTime: number;
}) {
  return {
    _id: doc._id,
    userId: doc.userId,
    content: doc.content,
    color: doc.color,
    position: doc.position,
    size: doc.size,
    zIndex: doc.zIndex,
    isVisible: doc.isVisible,
    createdAt: new Date(doc._creationTime).toISOString(),
    updatedAt: new Date(doc._creationTime).toISOString(),
  };
}

export const listForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const notes = await ctx.db
      .query("stickyNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return notes
      .filter((n) => n.isVisible)
      .sort((a, b) => b._creationTime - a._creationTime)
      .map(toClient);
  },
});

export const createForUser = internalMutation({
  args: {
    userId: v.id("users"),
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    position: v.optional(
      v.object({ x: v.number(), y: v.number() })
    ),
    size: v.optional(
      v.object({ width: v.number(), height: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const visible = await ctx.db
      .query("stickyNotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const count = visible.filter((n) => n.isVisible).length;
    if (count >= 10) {
      return { ok: false as const, code: "limit" as const };
    }
    let maxZ = 0;
    for (const n of visible) {
      if (n.zIndex > maxZ) maxZ = n.zIndex;
    }
    const color =
      args.color && COLORS.has(args.color) ? args.color : "#ffd700";
    const id = await ctx.db.insert("stickyNotes", {
      userId: args.userId,
      content: args.content ?? "New note...",
      color,
      position: args.position ?? { x: 100, y: 100 },
      size: args.size ?? { width: 200, height: 200 },
      zIndex: maxZ + 1,
      isVisible: true,
    });
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("insert failed");
    return { ok: true as const, data: toClient(doc) };
  },
});

export const updateForUser = internalMutation({
  args: {
    userId: v.id("users"),
    noteId: v.id("stickyNotes"),
    patch: v.any(),
  },
  handler: async (ctx, { userId, noteId, patch }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      return { ok: false as const, code: "not_found" as const };
    }
    const allowed: Record<string, unknown> = {};
    if (patch.content !== undefined) allowed.content = String(patch.content);
    if (patch.color !== undefined && COLORS.has(String(patch.color))) {
      allowed.color = patch.color;
    }
    if (patch.position) allowed.position = patch.position;
    if (patch.size) allowed.size = patch.size;
    if (patch.zIndex !== undefined) allowed.zIndex = Number(patch.zIndex);
    if (patch.isVisible !== undefined) allowed.isVisible = Boolean(patch.isVisible);
    await ctx.db.patch(noteId, allowed);
    const doc = await ctx.db.get(noteId);
    if (!doc) return { ok: false as const, code: "not_found" as const };
    return { ok: true as const, data: toClient(doc) };
  },
});

export const softDeleteForUser = internalMutation({
  args: { userId: v.id("users"), noteId: v.id("stickyNotes") },
  handler: async (ctx, { userId, noteId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      return { ok: false as const, code: "not_found" as const };
    }
    await ctx.db.patch(noteId, { isVisible: false });
    return { ok: true as const };
  },
});

export const bringToFrontForUser = internalMutation({
  args: { userId: v.id("users"), noteId: v.id("stickyNotes") },
  handler: async (ctx, { userId, noteId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      return { ok: false as const, code: "not_found" as const };
    }
    const all = await ctx.db
      .query("stickyNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    let maxZ = 0;
    for (const n of all) {
      if (n.zIndex > maxZ) maxZ = n.zIndex;
    }
    await ctx.db.patch(noteId, { zIndex: maxZ + 1 });
    const doc = await ctx.db.get(noteId);
    if (!doc) return { ok: false as const, code: "not_found" as const };
    return { ok: true as const, data: toClient(doc) };
  },
});
