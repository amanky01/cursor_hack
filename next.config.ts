import type { NextConfig } from "next";

const convexSite = process.env.CONVEX_SITE_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (!convexSite) {
      return [];
    }
    const base = convexSite.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
