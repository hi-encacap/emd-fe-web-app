"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

/**
 * Registers the service worker — production only, so Turbopack dev HMR is never
 * intercepted by a cache. Renders nothing.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error: unknown) => logger.error("Service worker registration failed", error));
    };

    // Wait for load so registration never competes with first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
