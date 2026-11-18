/* Pelayan luring SIMAK-BG — menyimpan kerangka aplikasi agar tetap terbuka tanpa sinyal.
   Data survei TIDAK disimpan di sini (tersimpan di localStorage perangkat). */
var VERSI = "simakbg-v26";
var ISI = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(ISI); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.map(function (n) { return (n === VERSI || n === "simakbg-peta") ? null : caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  var u = new URL(req.url);
  /* ubin peta dasar: ambil dari simpanan luring dulu, lalu jaringan (dan simpan) */
  if ((u.hostname === "server.arcgisonline.com" || u.hostname === "clarity.maptiles.arcgis.com" || u.hostname === "tile.openstreetmap.org") && u.pathname.indexOf("/tilemap/") < 0) {
    ev.respondWith(caches.open("simakbg-peta").then(function (c) {
      return c.match(req.url).then(function (r) {
        return r || fetch(req).then(function (b) { if (b && b.ok) c.put(req.url, b.clone()); return b; });
      });
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(function (tersimpan) {
    var jaringan = fetch(req).then(function (b) {
      if (b && b.ok) { var s = b.clone(); caches.open(VERSI).then(function (c) { c.put(req, s); }); }
      return b;
    }).catch(function () { return tersimpan; });
    return tersimpan || jaringan;
  }));
});
