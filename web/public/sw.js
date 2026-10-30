/* KitaKlaro service worker.
   A store sits where data drops out, so pages must open with no network.
   Next fingerprints everything under /_next/static, so those files never
   change and can be served from the cache forever. Pages are fetched fresh
   when the network answers quickly, and from the cache when it does not. */

var CACHE = 'kitaklaro-web-v2';
var SCOPE = self.registration.scope;
var SHELL = ['./', 'login/', 'manifest.webmanifest', 'icons/icon-192.png'];

// On a first visit the page has already loaded its CSS and JS before this
// worker was active, so the fetch handler below never sees them. Without more,
// going offline right after the first visit would leave cached HTML with no
// styles and no scripts. So install also reads each cached page and caches the
// fingerprinted files it points at (matches both /_next/static/... and the
// relative static/... form in the page's inline data).
var ASSET_RE = /static\/[\w\-\/.]+\.(?:js|css|woff2)/g;

function precacheShell(cache) {
  return Promise.all(
    SHELL.map(function (path) {
      var url = new URL(path, SCOPE);
      return fetch(url)
        .then(function (response) {
          if (!response.ok) return;
          var isHtml = (response.headers.get('content-type') || '').indexOf('text/html') !== -1;
          var copy = response.clone();
          return cache.put(url, copy).then(function () {
            if (!isHtml) return;
            return response.text().then(function (html) {
              var seen = {};
              (html.match(ASSET_RE) || []).forEach(function (hit) {
                seen[hit] = true;
              });
              // One at a time, so a single 404 cannot fail the whole install.
              return Promise.all(
                Object.keys(seen).map(function (hit) {
                  return cache.add(new URL('_next/' + hit, SCOPE)).catch(function (err) {
                    console.warn('[sw] could not cache', hit, err && err.message);
                  });
                })
              );
            });
          });
        })
        .catch(function (err) {
          console.warn('[sw] could not precache', path, err && err.message);
        });
    })
  );
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(precacheShell)
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            return key === CACHE ? null : caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function fromNetworkThenCache(request, timeoutMs) {
  return new Promise(function (resolve) {
    var settled = false;
    var timer = setTimeout(function () {
      if (settled) return;
      caches.match(request).then(function (hit) {
        if (hit && !settled) {
          settled = true;
          resolve(hit);
        }
      });
    }, timeoutMs);

    fetch(request)
      .then(function (response) {
        clearTimeout(timer);
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(request, copy);
        });
        if (!settled) {
          settled = true;
          resolve(response);
        }
      })
      .catch(function () {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        caches.match(request).then(function (hit) {
          resolve(hit || caches.match(new URL('./', SCOPE)));
        });
      });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fromNetworkThenCache(request, 3000));
    return;
  }

  // Everything else is either fingerprinted or rarely changes: cache first.
  event.respondWith(
    caches.match(request).then(function (hit) {
      return (
        hit ||
        fetch(request).then(function (response) {
          if (response && response.status === 200) {
            var copy = response.clone();
            caches.open(CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
      );
    })
  );
});
