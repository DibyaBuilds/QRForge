const CACHE = 'qrforge-v1';
const CORE = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'libs/qrcode.min.js',
  'libs/jsQR.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(req).then((res) => {
      // Online: use fresh file + save a copy for offline
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      // Offline: serve from cache
      caches.match(req).then((hit) => hit || caches.match('index.html'))
    )
  );
});