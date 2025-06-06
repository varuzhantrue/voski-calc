// IMPORTANT: Increment this cache name whenever you make changes to your app's files
const CACHE_NAME = 'jewelry-calculator-v2'; // Changed from v1 to v2
const urlsToCache = [
    '/', // Caches the root URL
    '/index.html', // Caches the main HTML file
    '/manifest.json', // Caches the manifest file
    '/service-worker.js', // Caches the service worker itself
    'https://cdn.tailwindcss.com' // Cache Tailwind CSS CDN
    // If you have custom icon files (e.g., app-icon-192.png, app-icon-512.png),
    // make sure to add their relative paths here as well:
    // '/app-icon-192.png',
    // '/app-icon-512.png'
];

// Install event: caches the necessary files
self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Forces the waiting service worker to become the active service worker
            .catch(error => {
                console.error('Service Worker: Cache addAll failed', error);
            })
    );
});

// Activate event: cleans up old caches and takes control of clients
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => clients.claim()) // Makes the active service worker take control of all clients immediately
        .catch(error => {
            console.error('Service Worker: Activation failed', error);
        })
    );
});

// Fetch event: serves cached content when available, otherwise fetches from network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // No cache hit - fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).catch(error => {
                    console.error('Service Worker: Fetch failed for:', event.request.url, error);
                    // You could return an offline page here if desired
                });
            })
    );
});
