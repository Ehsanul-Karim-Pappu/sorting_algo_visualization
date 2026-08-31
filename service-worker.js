const CACHE_NAME = "sortscope-learning-lab-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./algorithms.js",
  "./manifest.webmanifest",
  "./icons/sortscope-icon.svg",
  "./algorithms/catalog.js",
  "./algorithms/shared.js",
  "./algorithms/trace-detail.js",
  "./algorithms/bubble.js",
  "./algorithms/cocktail.js",
  "./algorithms/selection.js",
  "./algorithms/insertion.js",
  "./algorithms/merge.js",
  "./algorithms/quick.js",
  "./algorithms/quick-three.js",
  "./algorithms/heap.js",
  "./algorithms/shell.js",
  "./algorithms/counting.js",
  "./algorithms/radix.js",
  "./algorithms/timsort.js",
  "./algorithms/introsort.js",
  "./algorithms/bucket.js",
  "./algorithms/bitonic.js",
  "./learning/code-samples.js",
  "./learning/complexity.js",
  "./learning/exporter.js",
  "./learning/lessons.js",
  "./learning/race.js",
  "./learning/variables.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
