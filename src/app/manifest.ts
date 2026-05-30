import type { MetadataRoute } from "next";

/**
 * Web App Manifest, served by Next at /manifest.webmanifest (the <link rel> is
 * injected automatically). Makes the app installable; theme/background match the
 * cozy near-black surface so the OS chrome blends in.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kairos Drift",
    short_name: "Kairos",
    description:
      "Bốc một ý tưởng nhỏ cho đời sống cá nhân, làm khi thích, rồi ghi nhận lại mỗi lần hoàn thành.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "vi",
    background_color: "#11100f",
    theme_color: "#11100f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
