import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables React's <ViewTransition> for animated cross-route navigation.
    viewTransition: true,
  },
  // No `output: "export"` — keep route handlers / middleware available for
  // future auth + cloud sync without a rewrite.
  async headers() {
    return [
      {
        // Never let the browser cache the service worker itself, so an updated
        // SW is always fetched; allow it to control the whole origin.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
