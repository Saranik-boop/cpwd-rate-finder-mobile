// Offline helper. Only caches this app's own files; access checks with the server always go to the network.
const CACHE = 'cpwd-04df420f3689';
const FILES = ["./","index.html","app.css","capacitor.js","config.js","data.enc","diagram-kit.js","diagram-view.js","diagrams.js","doubt-engine.js","doubt-notes.js","doubt-ui.js","doubt.css","fuse.js","gate.css","gate.js","schedules.js","search-ui.js","updater.js","usage.js","version.js","manifest.webmanifest","apple-touch-icon.png","icon-192.png","pwa.js"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // server calls: never cached
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
