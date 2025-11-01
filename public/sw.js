const CACHE_VERSION = 'v3.0.0-PHASE3-OFFLINE';
const CACHE_NAME = CACHE_VERSION;
const RUNTIME_CACHE = 'calibervault-runtime-v5';
const API_CACHE = 'calibervault-api-v1';
const IMAGE_CACHE = 'calibervault-images-v1';

const STATIC_CACHE_URLS = ['/', '/index.html', '/manifest.json', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(cacheNames.filter((name) => !cacheWhitelist.includes(name)).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => 
        cache.match(event.request).then((cached) => 
          cached || fetch(event.request).then((res) => { cache.put(event.request, res.clone()); return res; })
        )
      )
    );
    return;
  }

  if (event.request.url.includes('/rest/v1/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res.status === 200) caches.open(API_CACHE).then((cache) => cache.put(event.request, res.clone()));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => 
      cached || fetch(event.request).then((res) => {
        if (res.status === 200) caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, res.clone()));
        return res;
      }).catch(() => event.request.mode === 'navigate' ? caches.match('/offline.html') : null)
    )
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inventory') event.waitUntil(syncInventoryData());
});

async function syncInventoryData() {
  try {
    const cache = await caches.open('offline-actions');
    const requests = await cache.keys();
    for (const request of requests) {
      try { await fetch(request); await cache.delete(request); } 
      catch (e) { console.error('Sync failed:', request.url); }
    }
  } catch (e) { console.error('Background sync failed:', e); }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
