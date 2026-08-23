const CACHE_NAME = 'mineral-cabinet-v20260822-specimen-card-fix';
const CORE = ['./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const cache=await caches.open(CACHE_NAME);
        cache.put('./index.html',fresh.clone());
        return fresh;
      }catch(_){
        return (await caches.match(req)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached) return cached;
    try{
      const fresh=await fetch(req);
      if(fresh && fresh.ok && new URL(req.url).origin===self.location.origin){
        const cache=await caches.open(CACHE_NAME); cache.put(req,fresh.clone());
      }
      return fresh;
    }catch(_){ return cached || Response.error(); }
  })());
});
