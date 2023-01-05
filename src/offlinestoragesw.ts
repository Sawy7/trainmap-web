self.addEventListener("install", (e) => {
    e.waitUntil(
        caches
        .open("test-store")
        .then((cache) =>
            cache.addAll([
                "/",
                "/index.html",
                "/style.css",
                "/custom-leaflet.css",
                "/index.js",
                "assets",
                "custom-assets"
            ])
        )
    );
});

self.addEventListener("fetch", (e) => {
    console.log("fetched:", e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});