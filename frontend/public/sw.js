/**
 * LifeOS Daily Planner - Service Worker
 * Fully compliant with Android Chrome PWA installability requirements
 * Offline fallback support + Static asset caching
 * STRICT SECURITY: Zero caching of sensitive user data or API calls
 */

const CACHE_NAME = 'lifeos-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon-64x64.png',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png'
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[LifeOS SW] Precaching application shell...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[LifeOS SW] Non-fatal precache item fetch issue:', err);
      });
    })
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[LifeOS SW] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: intercept requests for offline resilience
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // RULE 1: Never intercept or cache non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // RULE 2: Never cache sensitive user data, auth endpoints, or Supabase API calls
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/rest/v1/')
  ) {
    return;
  }

  // RULE 3: For HTML document requests (navigation), try network first, then cache, then root index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // RULE 4: For static assets, try cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful static responses (same-origin JS, CSS, images, fonts)
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.origin === self.location.origin || url.hostname.includes('fonts.gstatic.com'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[LifeOS SW] Offline fetch failure:', event.request.url);
      });
    })
  );
});

