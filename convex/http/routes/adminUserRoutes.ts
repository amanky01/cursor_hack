import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { json, verifyAuth } from "../common";

export function registerAdminUserRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/admin/user",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "No token Provided" }, 401);
      }
      if (auth.role !== "admin") {
        return json({ message: "Access denied: Admins only" }, 403);
      }
      const users = await ctx.runQuery(internal.users.listStudents, {});
      return json({
        success: true,
        message: "All users fetched successfully",
        users,
      });
    }),
  });

  http.route({
    pathPrefix: "/api/admin/user/",
    method: "PUT",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "No token Provided" }, 401);
      }
      if (auth.role !== "admin") {
        return json({ message: "Access denied: Admins only" }, 403);
      }
      const path = new URL(request.url).pathname;
      const idStr = path.slice("/api/admin/user/".length);
      if (!idStr) return json({ message: "User not found" }, 404);
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        body = {};
      }
      let patch = { ...body };
      if (typeof body.password === "string" && body.password.length > 0) {
        const passwordHash = await ctx.runAction(internal.jwtNode.hashPassword, {
          password: body.password as string,
        });
        patch = { ...body, passwordHash };
        delete patch.password;
      }
      const result = await ctx.runMutation(internal.users.updateStudent, {
        userId: idStr as Id<"users">,
        patch,
      });
      if (!result.ok) {
        return json({ message: "User not found" }, 404);
      }
      return json({
        success: true,
        message: "User updated successfully",
        user: result.user,
      });
    }),
  });

  http.route({
    pathPrefix: "/api/admin/user/",
    method: "DELETE",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "No token Provided" }, 401);
      }
      if (auth.role !== "admin") {
        return json({ message: "Access denied: Admins only" }, 403);
      }
      const path = new URL(request.url).pathname;
      const idStr = path.slice("/api/admin/user/".length);
      if (!idStr) return json({ message: "User not found" }, 404);
      const result = await ctx.runMutation(internal.users.deleteStudent, {
        userId: idStr as Id<"users">,
      });
      if (!result.ok) {
        return json({ message: "User not found" }, 404);
      }
      return json({
        success: true,
        msg: "User deleted successfully",
      });
    }),
  });
}
