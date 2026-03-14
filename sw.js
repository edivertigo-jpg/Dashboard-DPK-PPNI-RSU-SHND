// ═══════════════════════════════════════════════════════════
//  SERVICE WORKER — DPK PPNI RSU SHND
//  Cache shell app agar bisa dibuka offline
// ═══════════════════════════════════════════════════════════

const CACHE_NAME  = 'dpk-ppni-v1';
const CACHE_URLS  = [
  './',
  './Dashboard_DPK_PPNI_SHND.html',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap'
];

// ── Install: cache semua asset utama ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('SW cache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: hapus cache lama ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network first, fallback ke cache ───────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Jangan cache request ke Google Apps Script (selalu network)
  if (url.includes('script.google.com') || url.includes('googleapis.com/drive')) {
    return; // biarkan browser handle langsung
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache response baru jika sukses
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: ambil dari cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback ke halaman utama
          return caches.match('./Dashboard_DPK_PPNI_SHND.html');
        });
      })
  );
});
