/* CCF SERVICE WORKER — B1.1
   Network-first/pass-through: habilita el requisito técnico de PWA sin cachear
   la aplicación ni arriesgar versiones antiguas del sistema financiero.
*/
self.addEventListener('install', function(event){ self.skipWaiting(); });
self.addEventListener('activate', function(event){ event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
