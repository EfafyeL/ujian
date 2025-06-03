const CACHE_NAME = 'online-exam-proctor-v1';
// IMPORTANT: Update this list with all your critical local assets.
// Using relative paths for GitHub Pages compatibility.
const CACHE_ASSETS = [
  './', // Represents the root of your project, often resolves to index.html
  './index.html',
  // Caching index.tsx directly is less common for production.
  // Typically, you'd cache the compiled JS. Since we're using esm.sh,
  // index.html is more critical, and esm.sh scripts will be cached by the fetch handler.
  // We can keep index.tsx here if it helps, but ensure index.html is correctly served.
  './index.tsx', 
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
  // Add paths to other critical local assets like global CSS files if any
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // It's crucial that these paths are correct relative to the deployed service worker's location.
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
                cache.put(event.request, responseToCache); // Cache the navigated page
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve index.html from cache as a fallback for navigation.
          return caches.match('./index.html') 
            .then(response => response || caches.match('./')); // Fallback to root if index.html isn't explicitly cached under that key
        })
    );
    return;
  }

  // For other requests (JS, CSS, images, etc.), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || 
                (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) { // Do not cache opaque responses from CDNs unless careful
              return networkResponse;
            }
            
            // If fetching from esm.sh or other CDNs, their responses are typically 'cors' type.
            // We want to cache these.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(error => {
            console.error('Service Worker: Fetch error for non-navigation request:', event.request.url, error);
            // Optionally return a placeholder for broken images or specific fallbacks
        });
      })
  );
});