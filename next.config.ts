import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables React's <ViewTransition> for animated cross-route navigation.
    viewTransition: true,
  },
  // No `output: "export"` — keep route handlers / middleware available for
  // future auth + cloud sync without a rewrite.
};

export default nextConfig;
