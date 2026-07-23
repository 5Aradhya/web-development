const CACHE_NAME = "mywebsite-cache-v1";
const urlsToCache = [
    "index.html",
    "style.css",
    "script.js"
];

// Install: pehli baar service worker register hote waqt files cache karo
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

// Fetch: koi bhi request aaye, pehle cache check karo, warna network se lao
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
