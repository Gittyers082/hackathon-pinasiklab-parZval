/* KitaKlaro offline app files. API requests always go to the server. */
const PREFIX = 'kitaklaro-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + 'v20-phone';
const FILES = [
  './index.html', './benta.html', './records.html', './ubos.html', './utang.html', './ulat.html',
  './receipt.html', './kumpirmahin.html', './offline.html', './manifest.json',
  './css/style.css', './css/desktop.css', './css/pwa.css',
  './js/pwa.js', './js/nav.js', './js/labels.js', './js/api.js', './js/parser.js', './js/voice.js',
  './js/home.js', './js/dashboard.js', './js/records.js', './js/utang.js',
  './js/ubos.js', './js/ulat.js', './js/receipt-demo.js',
  './assets/kitaklaro-logo.png', './assets/receipt-sample.jpg',
  './icons/icon-192.png', './icons/icon-512.png',
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.startsWith(scope.pathname + 'api/')) return;
  const relative = './' + url.pathname.slice(scope.pathname.length);
  if (event.request.mode !== 'navigate' && !FILES.includes(relative)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        if (url.pathname === scope.pathname) return cache.match('./index.html');
        return cache.match('./offline.html');
      }
      return Response.error();
    }
  })());
});
