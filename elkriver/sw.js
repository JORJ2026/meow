/* Elk River Bandit service worker — VERSION is stamped by scripts/build-web.js on release. */
const VERSION="1.1.1";
const CACHE="erb-"+VERSION;
const CORE=["./","index.html","style.css","launch.css","app.js","midi.js","launch.js","config.js","version.js","manifest.webmanifest","favicon.ico","404.html",
"icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png",
"info/how-to-play.html","info/support.html","info/privacy.html","info/terms.html","info/credits.html","info/changelog.html","info/info.css"];
const BIG=["img/dumpster.png","img/mode-free.png","img/mode-platformer.png","img/mode-runner.png","img/mode-spelling.png",
"audio/jump.mp3","audio/slide.mp3","audio/spin.mp3","audio/coin.mp3","audio/hit.mp3","audio/100-womps.mp3","audio/intro-polka.mp3","../midi.js","../music/playlist.json","../music/nelly-country-grammar.mid","../music/notorious-big-big-poppa.mid","../music/mc-hammer-u-cant-touch-this.mid","../music/dr-dre-forgot-about-dre.mid","../music/snoop-dogg-murder-was-the-case.mid","../music/dr-dre-aint-nuthin-but-a-g-thang.mid","../music/jay-z-hard-knock-life.mid","../music/will-smith-gettin-jiggy-with-it.mid","../music/eminem-guilty-conscience.mid","../music/eminem-bad-meets-evil.mid","../music/jay-z-big-pimpin.mid","../music/eminem-my-name-is.mid","../music/vanilla-ice-ice-ice-baby.mid","../music/p-diddy-ill-be-missing-you.mid","../music/will-smith-wild-wild-west.mid","../music/eminem-the-real-slim-shady.mid","../music/p-diddy-mo-money-mo-problems.mid","../music/eminem-under-the-influence.mid","../music/dr-dre-still-dre.mid","../music/beastie-boys-fight-for-your-right-to-party.mid","../music/beastie-boys-sabotage.mid","../music/coolio-gangstas-paradise.mid","../music/dmx-ruff-ryders-anthem.mid","../music/marvin-gaye-i-heard-it-through-the-grapevine.mid"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);await Promise.all(BIG.map(u=>c.add(u).catch(()=>{})))})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("erb-")&&k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener("message",e=>{if(e.data==="SKIP_WAITING")self.skipWaiting()});
async function rangeResponse(req,res){
  const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get("range")||"");if(!m)return res;
  const buf=await res.arrayBuffer(),size=buf.byteLength;
  let s=m[1]===""?size-parseInt(m[2],10):parseInt(m[1],10),en=m[1]===""||m[2]===""?size-1:parseInt(m[2],10);
  s=Math.max(0,s);en=Math.min(size-1,en);
  if(s>en)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+size}});
  return new Response(buf.slice(s,en+1),{status:206,statusText:"Partial Content",headers:{"Content-Type":res.headers.get("Content-Type")||"application/octet-stream","Content-Range":`bytes ${s}-${en}/${size}`,"Content-Length":String(en-s+1)}});
}
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;                     // GitHub API etc. always live
  if(req.mode==="navigate"){
    e.respondWith((async()=>{try{const r=await fetch(req);if(r.ok){const c=await caches.open(CACHE);c.put(req,r.clone())}return r}
      catch(_){const c=await caches.open(CACHE);return (await c.match(req,{ignoreSearch:true}))||(await c.match("index.html"))||Response.error()}})());return}
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);let res=await c.match(req,{ignoreSearch:true});
    if(!res){try{res=await fetch(url.href);if(res.ok&&res.status===200)c.put(url.href,res.clone())}catch(_){return Response.error()}}
    return req.headers.has("range")?rangeResponse(req,res):res})());
});
