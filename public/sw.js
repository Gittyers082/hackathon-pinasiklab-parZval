// Service worker: makes the app open offline. API calls are never cached.
// Network first: online, phones always get the newest files (and the cache is refreshed);
// offline, the cached copy is used. Bump CACHE only when you add or remove a file in FILES.

const CACHE = 'kitaklaro-v12';
const FILES = [
  './',
  './index.html',
  './utang.html',
  './ubos.html',
  './ulat.html',
  './manifest.json',
  './css/style.css',
  './js/api.js',
  './js/parser.js',
  './js/voice.js',
  './js/nav.js',
  './js/labels.js',
  './js/home.js',
  './js/utang.js',
  './js/ubos.js',
  './js/ulat.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache the API or non-GET requests: let them go straight to the network.
  if (event.request.method !== 'GET' || url.pathname.includes('/api/')) return;
  if (url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
