// AutoAssist Service Worker v2
// Nu face cache la HTML - doar la assets statice

const CACHE_NAME = 'autoassist-v2';
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NU intercepta redirect-urile OAuth - lasă browserul să le gestioneze direct
  if (
    url.search.includes('code=') ||
    url.search.includes('access_token') ||
    url.search.includes('token_type') ||
    url.search.includes('error=') ||
    url.hash?.includes('access_token') ||
    url.pathname.includes('callback') ||
    url.pathname.includes('auth/v1')
  ) {
    return; // Fără event.respondWith = browserul gestionează normal
  }

  // Nu face cache la HTML, API calls sau Supabase
  if (
    event.request.mode === 'navigate' ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('anthropic.com') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache pentru iconite si manifest
  if (STATIC_ASSETS.some(a => url.pathname.endsWith(a))) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Restul - network first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Notificari push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'AutoAssist', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.url || '/',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
