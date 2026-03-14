const CACHE_NAME = 'dpk-ppni-shnd-v5';

const CACHE_ASSETS = [
  '/Dashboard-DPK-PPNI-RSU-SHND/',
  '/Dashboard-DPK-PPNI-RSU-SHND/index.html',
  '/Dashboard-DPK-PPNI-RSU-SHND/manifest.json',
  '/Dashboard-DPK-PPNI-RSU-SHND/icon-192.png',
  '/Dashboard-DPK-PPNI-RSU-SHND/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('drive.google.com') ||
      url.hostname.includes('lh3.googleusercontent.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/Dashboard-DPK-PPNI-RSU-SHND/index.html');
          }
        });
      })
  );
});
