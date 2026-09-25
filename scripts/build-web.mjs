// Builds the web version (for iPhone and any browser) into docs/app/, served by GitHub Pages at
// https://saranik-boop.github.io/cpwd-rate-finder-mobile/app/
// Same screens, same server, same approval flow as the Android app. Run after changing www/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT = 'docs/app';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const files = ['app.css', 'gate.css', 'capacitor.js', 'config.js', 'fuse.js', 'search-ui.js', 'gate.js', 'data.enc'];
for (const f of files) fs.copyFileSync(path.join('www', f), path.join(OUT, f));
for (const f of fs.readdirSync('resources/web')) fs.copyFileSync(path.join('resources/web', f), path.join(OUT, f));

// index.html: add home-screen (PWA) tags and the offline helper.
let html = fs.readFileSync('www/index.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="app.css">', [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<link rel="icon" href="icon-192.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="CPWD Rates">',
  '<meta name="robots" content="noindex, nofollow">',
  '<link rel="stylesheet" href="app.css">',
].join('\n'));
html = html.replace('<script src="gate.js"></script>', '<script src="gate.js"></script>\n<script src="pwa.js"></script>');
fs.writeFileSync(path.join(OUT, 'index.html'), html);

fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify({
  name: 'CPWD Rate Finder',
  short_name: 'CPWD Rates',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#f4f6f9',
  theme_color: '#0f6e4f',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));

fs.writeFileSync(path.join(OUT, 'pwa.js'),
`// Registers the offline helper so the app opens without internet after first use.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
// iPhone: a Home Screen app keeps its own storage, separate from Safari. Ask people to add it to the
// Home Screen first and request access from the icon, otherwise they would need approval twice.
(function () {
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (!isIOS || standalone) return;
  var box = document.createElement('div');
  box.className = 'gnote';
  box.style.marginBottom = '4px';
  box.innerHTML = '<b>iPhone: do this first.</b> Tap the <b>Share</b> button (square with an arrow) at the bottom of Safari, then <b>Add to Home Screen</b>. Open the app from the new <b>CPWD Rates</b> icon and send your request there. A request sent from Safari will not carry over to the icon.';
  var req = document.getElementById('scrRequest');
  if (req) req.insertBefore(box, req.querySelector('.gform'));
})();
`);

// Offline cache: version = hash of all files, so every rebuild refreshes phones automatically.
const cached = ['./', 'index.html', ...files, 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'pwa.js'];
const h = crypto.createHash('sha256');
for (const f of fs.readdirSync(OUT).sort()) h.update(fs.readFileSync(path.join(OUT, f)));
const version = h.digest('hex').slice(0, 12);

fs.writeFileSync(path.join(OUT, 'sw.js'),
`// Offline helper. Only caches this app's own files; access checks with the server always go to the network.
const CACHE = 'cpwd-${version}';
const FILES = ${JSON.stringify(cached)};
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
`);
console.log('web app built in', OUT, 'cache', version);
