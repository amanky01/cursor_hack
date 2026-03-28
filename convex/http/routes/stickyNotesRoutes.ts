import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { json, verifyAuth } from "../common";

export function registerStickyNotesRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/sticky-notes",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "Unauthorized" }, 401);
      }
      const data = await ctx.runQuery(internal.stickyNotes.listForUser, {
        userId: auth.userId as Id<"users">,
      });
      return json({ success: true, data });
    }),
  });

  http.route({
    path: "/api/sticky-notes",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "Unauthorized" }, 401);
      }
      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        body = {};
      }
      const result = await ctx.runMutation(internal.stickyNotes.createForUser, {
        userId: auth.userId as Id<"users">,
        content: body.content as string | undefined,
        color: body.color as string | undefined,
        position: body.position as { x: number; y: number } | undefined,
        size: body.size as { width: number; height: number } | undefined,
      });
      if (!result.ok) {
        return json(
          {
            success: false,
            message: "Maximum 10 sticky notes allowed per user",
          },
          400
        );
      }
      return json({ success: true, data: result.data }, 201);
    }),
  });

  http.route({
    pathPrefix: "/api/sticky-notes/",
    method: "PUT",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "Unauthorized" }, 401);
      }
      const path = new URL(request.url).pathname;
      const rest = path.slice("/api/sticky-notes/".length);
      const bringToFront = rest.endsWith("/bring-to-front");
      const idStr = bringToFront
        ? rest.slice(0, -"/bring-to-front".length)
        : rest;
      if (!idStr) return json({ success: false, message: "Not found" }, 404);
      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        body = {};
      }
      if (bringToFront) {
        const result = await ctx.runMutation(
          internal.stickyNotes.bringToFrontForUser,
          {
            userId: auth.userId as Id<"users">,
            noteId: idStr as Id<"stickyNotes">,
          }
        );
        if (!result.ok) {
          return json(
            { success: false, message: "Sticky note not found" },
            404
          );
        }
        return json({ success: true, data: result.data });
      }
      const result = await ctx.runMutation(internal.stickyNotes.updateForUser, {
        userId: auth.userId as Id<"users">,
        noteId: idStr as Id<"stickyNotes">,
        patch: body,
      });
      if (!result.ok) {
        return json({ success: false, message: "Sticky note not found" }, 404);
      }
      return json({ success: true, data: result.data });
    }),
  });

  http.route({
    pathPrefix: "/api/sticky-notes/",
    method: "DELETE",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "Unauthorized" }, 401);
      }
      const path = new URL(request.url).pathname;
      const idStr = path.slice("/api/sticky-notes/".length);
      if (!idStr || idStr.includes("/")) {
        return json({ success: false, message: "Not found" }, 404);
      }
      const result = await ctx.runMutation(
        internal.stickyNotes.softDeleteForUser,
        {
          userId: auth.userId as Id<"users">,
          noteId: idStr as Id<"stickyNotes">,
        }
      );
      if (!result.ok) {
        return json({ success: false, message: "Sticky note not found" }, 404);
      }
      return json({
        success: true,
        message: "Sticky note deleted successfully",
      });
    }),
  });
}
