"use node";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 8) {
    throw new Error("JWT_SECRET must be set (min 8 chars) in Convex environment");
  }
  return secret;
}

export const hashPassword = internalAction({
  args: { password: v.string() },
  handler: async (_ctx, { password }) => {
    return await bcrypt.hash(password, 10);
  },
});

export const comparePassword = internalAction({
  args: { password: v.string(), passwordHash: v.string() },
  handler: async (_ctx, { password, passwordHash }) => {
    return await bcrypt.compare(password, passwordHash);
  },
});

export const signJwt = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (_ctx, args) => {
    return jwt.sign(
      { userId: args.userId, email: args.email, role: args.role },
      getSecret(),
      { expiresIn: "1d" }
    );
  },
});

export const verifyJwt = internalAction({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => {
    try {
      const decoded = jwt.verify(token, getSecret()) as {
        userId: string;
        email: string;
        role: string;
      };
      return decoded;
    } catch {
      return null;
    }
  },
});
