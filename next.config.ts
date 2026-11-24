import type { NextConfig } from "next";

const cmsImageOrigin = new URL(process.env.STRAPI_URL || "http://localhost:1337");
const localCms = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(cmsImageOrigin.hostname);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 100],
    remotePatterns: [{
      protocol: cmsImageOrigin.protocol.slice(0, -1) as "http" | "https",
      hostname: cmsImageOrigin.hostname,
      port: cmsImageOrigin.port,
      pathname: "/uploads/**",
      search: "",
    }],
    dangerouslyAllowLocalIP: localCms,
  },
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  async headers() {
    const cms = new URL(
      process.env.CMS_PREVIEW_ORIGIN ||
        process.env.STRAPI_URL ||
        "http://localhost:1337",
    );
    const origins = new Set([cms.origin]);
    if (["localhost", "127.0.0.1"].includes(cms.hostname)) {
      origins.add(`http://localhost:${cms.port || "1337"}`);
      origins.add(`http://127.0.0.1:${cms.port || "1337"}`);
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${[...origins].join(" ")}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
