const CACHE_NAME = 'online-exam-proctor-v1';
// IMPORTANT: Update this list with all your critical local assets.
// '/index.tsx' is included as per your current setup where it's directly sourced.
// If you have a build step that outputs a different JS file (e.g., index.js, main.js),
// you should cache that file instead of '/index.tsx'.
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx', // Or the compiled main JS file
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Add paths to other critical local assets like global CSS files if any
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
  // to ensure users get the latest version of the page, falling back to cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, clone and cache the response for future offline use.
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
          // If network fails, try to serve from cache.
          return caches.match(event.request)
            .then(response => response || caches.match('/index.html')); // Fallback to home page
        })
    );
    return;
  }

  // For other requests (JS, CSS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !networkResponse.type === 'cors') {
              // Don't cache opaque responses or errors unless specifically handled
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
      .catch(error => {
        // Generic fallback, or you could have an offline.html page
        console.error('Service Worker: Fetch error:', error);
        // You might want to return a fallback for images/assets here
      })
  );
});
