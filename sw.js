/* NEINDI ERP — service worker
   Version générée à chaque compilation : les téléphones déjà installés
   détectent toujours la nouvelle version. */
var VERSION = 'nerp-20261020-0155';
var SHELL = ['./', 'index.html', 'manifest.json', 'config.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  /* données Firebase : jamais en cache */
  if (/firebaseio\.com|firebasedatabase\.app|identitytoolkit|securetoken|googleapis\.com\/identitytoolkit/.test(url.host + url.pathname)) return;
  var sameOrigin = url.origin === self.location.origin;
  var isShell = sameOrigin && (req.mode === 'navigate' || /\/(index\.html|config\.js|manifest\.json)?$/.test(url.pathname) || /\.html$/.test(url.pathname));
  if (isShell) {
    /* réseau d'abord : la dernière version, sinon la copie locale */
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  /* icônes, polices, bibliothèques versionnées : cache d'abord */
  if (sameOrigin || /gstatic\.com|fonts\.googleapis\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    }));
  }
});
