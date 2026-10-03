/* Control Financiero PWA — B1.3
 * Scope: /
 * Network-first strategy. No financial data is cached.
 */
const CACHE_NAME = 'ccf-shell-b1-3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle same-origin GET navigation requests.
  // Everything else goes directly to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
  }
});
