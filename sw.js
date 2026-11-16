/* Pelayan luring SIMAK-BG — menyimpan kerangka aplikasi agar tetap terbuka tanpa sinyal.
   Data survei TIDAK disimpan di sini (tersimpan di localStorage perangkat). */
var VERSI = "simakbg-v16";
var ISI = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(ISI); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.map(function (n) { return n === VERSI ? null : caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(function (tersimpan) {
    var jaringan = fetch(req).then(function (b) {
      if (b && b.ok) { var s = b.clone(); caches.open(VERSI).then(function (c) { c.put(req, s); }); }
      return b;
    }).catch(function () { return tersimpan; });
    return tersimpan || jaringan;
  }));
});
