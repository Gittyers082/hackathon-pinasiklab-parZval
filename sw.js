/* KitaKlaro service worker.
   The store sits where data drops out, so the app has to open with no
   network at all. Everything it needs is precached on first visit; after
   that the shell is served from the cache and never waits on the radio. */

var CACHE = 'kitaklaro-v3';

var SHELL = [
  './',
  './index.html',
  './app.html',
  './login.html',
  './css/app.css',
  './css/landing.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if one file 404s, so each is added
      // on its own: a missing icon should not cost us offline support.
      .then(function (cache) {
        return Promise.all(SHELL.map(function (url) {
          return cache.add(url).catch(function () { return null; });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: try the network briefly so a deploy is picked up, but fall
  // straight back to the cached shell the moment it fails or stalls.
  if (req.mode === 'navigate') {
    ev.respondWith(
      Promise.race([
        fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        }),
        new Promise(function (resolve) {
          setTimeout(function () {
            resolve(caches.match(req).then(function (hit) {
              return hit || caches.match('./app.html');
            }));
          }, 2500);
        })
      ]).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./app.html');
        });
      })
    );
    return;
  }

  // Everything else: cache first. These files only change on deploy.
  ev.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
