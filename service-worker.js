const CACHE_NAME = "stocksmart-v5";
const APP_FILES = ["./","./index.html","./manifest.json","./icon.png","https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES).catch(() => null))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)))); self.clients.claim(); });
self.addEventListener("fetch", event => { event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => { if (event.request.method === "GET") cache.put(event.request, copy).catch(() => null); }); return response; }).catch(() => caches.match("./index.html")))); });
