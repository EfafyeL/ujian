const CACHE_NAME = 'online-exam-proctor-v1';
// IMPORTANT: Update this list with all your critical local assets.
// Using absolute paths from domain root, prefixed with /ujian/ for GitHub Pages compatibility.
const CACHE_ASSETS = [
  '/ujian/', // Represents the root of your project in the subdirectory
  '/ujian/index.html',
  '/ujian/index.tsx', 
  '/ujian/manifest.json',
  '/ujian/icons/icon-192x192.png',
  '/ujian/icons/icon-512x512.png'
  // Add paths to other critical local assets like global CSS files if any, prefixed with /ujian/
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // For navigation requests (HTML pages), use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve index.html from cache for the subdirectory.
          return caches.match('/ujian/index.html') 
            .then(response => response || caches.match('/ujian/')); // Fallback to subdirectory root
        })
    );
    return;
  }

  // For other requests (JS, CSS, images, etc.), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || 
                (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(error => {
            console.error('Service Worker: Fetch error for non-navigation request:', event.request.url, error);
        });
      })
  );
});