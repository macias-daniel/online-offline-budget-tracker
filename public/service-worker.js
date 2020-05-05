const FILES_TO_CACHE = [
  "/",
  "index.html",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "styles.css",
  "icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  "index.js",
  "db.js",
  "icons/icon-192x192.png",
  "manifest.json"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files Cached")
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

//On server activation get rid of old cache
self.addEventListener("activate", (evt) => {

  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


//On server requests
self.addEventListener("fetch", (evt) => {
  if (evt.request.url.includes("/api/")
    && evt.request.method === "GET") {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {

              if (response.status === 200) {
                cache.put(evt.request, response.clone());
              }
              return response;
            })
            .catch(() => {
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    })
  );
});