/* Cat Quest service worker: cache-first so the game works offline once loaded. Bump V on every release. */
const V='cq-1.0.3';
const CORE=['./','index.html','mobile.css','mobile.js','game.js','store.js','improve.js','badges.js','polish3d.js','polish3d.css','crossroad2d.html','crossroad2d.css','crossroad2d.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  e.respondWith(caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(hit=>hit||fetch(r).then(res=>{
    if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}
    return res;}).catch(()=>caches.match('index.html'))));
});
