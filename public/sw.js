/* Kairos Drift service worker — hand-rolled (no Workbox/Serwist).
 *
 * Strategy:
 *  - install:  precache the app shell (routes + icons + manifest), skipWaiting.
 *  - activate: drop old cache versions, claim open clients.
 *  - fetch:
 *      • navigations         → network-first, fall back to cached route, then /offline
 *      • /_next/static & fonts → cache-first (content-hashed → safe to keep forever)
 *      • everything else      → straight to network
 *
 * Bump CACHE_VERSION whenever the precached shell needs to change; the old cache
 * is deleted on activate so stale assets never linger.
 */

const CACHE_VERSION = "kairos-drift-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/library",
  "/history",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Best-effort: don't fail the whole install if one asset 404s.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:woff2?|ttf|otf|png|jpg|jpeg|svg|webp|avif|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through

  // App-shell navigations: network-first so fresh content wins online, with a
  // cached route (then the offline page) as the fallback when the network fails.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_VERSION);
          return (
            (await cache.match(request)) ?? (await cache.match(OFFLINE_URL)) ?? Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Immutable, content-hashed assets: cache-first, fill the cache on first load.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_VERSION);
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })(),
    );
  }
});
