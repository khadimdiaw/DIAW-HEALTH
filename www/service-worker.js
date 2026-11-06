const CACHE_NAME = "diaw-health-v4.3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style-v4.css?v=20261106-2",
  "./supabase.js",
  "./supabase-config.js",
  "./auth.js",
  "./auth-ui.js",
  "./diagnostics/capteurs.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith("diaw-health-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone()).catch(() => {});
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === "navigate") {
          const page = await caches.match("./index.html");
          if (page) return page;
        }

        throw error;
      }
    })()
  );
});
