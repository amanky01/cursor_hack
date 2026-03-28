import type { HttpRouter } from "convex/server";
import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { json, validateEmail, verifyAuth } from "../common";

export function registerAdminCounsellorHttpRoutes(http: HttpRouter): void {
  http.route({
    path: "/api/admin/counsellor",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "No token Provided" }, 401);
      }
      if (auth.role !== "admin") {
        return json({ message: "Access denied: Admins only" }, 403);
      }
      const counsellors = await ctx.runQuery(internal.users.listCounsellors, {});
      return json({
        success: true,
        message: "All counsellors fetched successfully",
        counsellors,
      });
    }),
  });

  http.route({
    path: "/api/admin/counsellor",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const auth = await verifyAuth(ctx, request);
      if (!auth) {
        return json({ success: false, message: "No token Provided" }, 401);
      }
      if (auth.role !== "admin") {
        return json({ message: "Access denied: Admins only" }, 403);
      }
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return json({ success: false, message: "Invalid JSON" }, 400);
      }
      const errors: { msg: string; path: string }[] = [];
      const firstName =
        typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName =
        typeof body.lastName === "string" ? body.lastName.trim() : "";
      const email = validateEmail(body.email);
      const password = typeof body.password === "string" ? body.password : "";
      const qualifications =
        typeof body.qualifications === "string"
          ? body.qualifications.trim()
          : "";
      const contactRaw = body.contactNo;
      const contactNo =
        typeof contactRaw === "number"
          ? contactRaw
          : typeof contactRaw === "string"
            ? Number(contactRaw)
            : NaN;
      const availability = body.availability;
      const hasAvail =
        (typeof availability === "string" && availability.trim()) ||
        (Array.isArray(availability) && availability.length > 0);
      if (!firstName)
        errors.push({ msg: "First name is required", path: "firstName" });
      if (!lastName)
        errors.push({ msg: "Last name is required", path: "lastName" });
      if (Number.isNaN(contactNo)) {
        errors.push({ msg: "Contact number is required", path: "contactNo" });
      }
      if (!email) errors.push({ msg: "Valid email is required", path: "email" });
      if (!password.trim())
        errors.push({ msg: "Password is required", path: "password" });
      if (!qualifications) {
        errors.push({
          msg: "Qualifications are required",
          path: "qualifications",
        });
      }
      if (!hasAvail) {
        errors.push({ msg: "Availability is required", path: "availability" });
      }
      if (errors.length) {
        return json(
          { success: false, message: "Field is required", errors },
          400
        );
      }
      const specialization = Array.isArray(body.specialization)
        ? (body.specialization as string[])
        : undefined;
      const passwordHash = await ctx.runAction(internal.jwtNode.hashPassword, {
        password,
      });
      const availNormalized = Array.isArray(availability)
        ? availability
        : String(availability);
      const result = await ctx.runMutation(internal.users.createCounsellor, {
        email: email!,
        passwordHash,
        firstName,
        lastName,
        contactNo,
        qualifications,
        specialization,
        availability: availNormalized,
      });
      if (!result.ok) {
        return json({ success: false, message: "Email already exists" }, 400);
      }
      return json({
        success: true,
        message: "Counsellor created successfully",
        counsellor: result.counsellor,
      });
    }),
  });

  http.route({
    pathPrefix: "/api/admin/counsellor/",
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
      const idStr = path.slice("/api/admin/counsellor/".length);
      if (!idStr) {
        return json({ success: false, message: "Counsellor not found" }, 404);
      }
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
      const result = await ctx.runMutation(internal.users.updateCounsellor, {
        counsellorId: idStr as Id<"users">,
        patch,
      });
      if (!result.ok) {
        return json({ success: false, message: "Counsellor not found" }, 404);
      }
      return json({
        success: true,
        message: "Counsellor updated successfully",
        counsellor: result.counsellor,
      });
    }),
  });

  http.route({
    pathPrefix: "/api/admin/counsellor/",
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
      const idStr = path.slice("/api/admin/counsellor/".length);
      if (!idStr) {
        return json({ success: false, message: "Counsellor not found" }, 404);
      }
      const result = await ctx.runMutation(internal.users.deleteCounsellor, {
        counsellorId: idStr as Id<"users">,
      });
      if (!result.ok) {
        return json({ success: false, message: "Counsellor not found" }, 404);
      }
      return json({
        success: true,
        message: "Counsellor deleted successfully",
      });
    }),
  });
}
