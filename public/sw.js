// Service worker: makes the app open offline. API calls are never cached.
// Changed a file? Bump the version (kitaklaro-v2, ...) so phones get the new copy.

const CACHE = 'kitaklaro-v4';
const FILES = [
  './',
  './index.html',
  './utang.html',
  './ubos.html',
  './manifest.json',
  './css/style.css',
  './js/api.js',
  './js/parser.js',
  './js/voice.js',
  './js/labels.js',
  './js/home.js',
  './js/utang.js',
  './js/ubos.js',
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
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
