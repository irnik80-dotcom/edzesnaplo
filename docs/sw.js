// Offline működés: az app fájljai és a Firebase-könyvtárak gyorsítótárban.
// Új verzió kiadásakor a VER értékét növeld (a build-site.mjs ezt automatikusan megteszi).
const VER = 'gym-202611171926';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './auth.js', './firebase-config.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VER).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    // saját fájlok: előbb a hálózat (friss verzió), offline a gyorsítótár
    // a böngésző HTTP-gyorsítótárát megkerülve mindig a legfrissebb verziót kérjük
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => { const c = r.clone(); caches.open(VER).then((x) => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
  } else if (u.hostname === 'www.gstatic.com') {
    // Firebase SDK: verziózott, nem változik
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((n) => { const c = n.clone(); caches.open(VER).then((x) => x.put(e.request, c)); return n; })));
  }
});
