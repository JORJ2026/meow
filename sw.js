/* Cat Quest Arcade service worker. Bump V on every release.
   S1 pages: network first (updates show up at once), cached copy when offline
   S2 scripts, styles, images: served from cache instantly and refreshed in the background
   S3 three.js from the CDN is cached after the first 3D game, so every 3D game then works offline
   S4 the whole 2D arcade and the store pictures are stored on install
   S5 Inkbound art is cached as it is used, so arenas you have played work offline
   S6 partial (206) and error responses are never cached */
const JSON_SONGS = ["music/nelly-country-grammar.mid", "music/notorious-big-big-poppa.mid", "music/mc-hammer-u-cant-touch-this.mid", "music/dr-dre-forgot-about-dre.mid", "music/snoop-dogg-murder-was-the-case.mid", "music/dr-dre-aint-nuthin-but-a-g-thang.mid", "music/jay-z-hard-knock-life.mid", "music/will-smith-gettin-jiggy-with-it.mid", "music/eminem-guilty-conscience.mid", "music/eminem-bad-meets-evil.mid", "music/jay-z-big-pimpin.mid", "music/eminem-my-name-is.mid", "music/vanilla-ice-ice-ice-baby.mid", "music/p-diddy-ill-be-missing-you.mid", "music/will-smith-wild-wild-west.mid", "music/eminem-the-real-slim-shady.mid", "music/p-diddy-mo-money-mo-problems.mid", "music/eminem-under-the-influence.mid", "music/dr-dre-still-dre.mid", "music/beastie-boys-fight-for-your-right-to-party.mid", "music/beastie-boys-sabotage.mid", "music/coolio-gangstas-paradise.mid", "music/dmx-ruff-ryders-anthem.mid", "music/marvin-gaye-i-heard-it-through-the-grapevine.mid"];
const V = 'cq-1.5.3', RT = 'cq-rt-1', LIB = 'cq-lib-1';
const CORE = ['./', 'index.html', 'mobile.css', 'mobile.js', 'game.js', 'store.js', 'improve.js', 'badges.js', 'release.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'midi.js', 'portrait.js', 'desktop.js', 'music/playlist.json', ...JSON_SONGS, 'crossroad2d.html', 'crossroad2d.css', 'crossroad2d.js', 'polish3d.js', 'polish3d.css',
  ...['story', 'run', 'temple', 'maze', 'pong', 'pac', 'tet', 'jewels', 'run3d', 'maze3d', 'pong3d', 'pac3d', 'frog3d', 'cross2d', 'inkbound', 'elkriver', 'lanternwoods', 'farmingsim', 'paint', 'texteditor', 'catarcade', 'oldschool', 'midi'].map(n => 'img/prev/' + n + '.webp')];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => ![V, RT, LIB].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const ok = r => r && r.status === 200 && (r.type === 'basic' || r.type === 'cors');
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'esm.sh') {                                                    // S3
    e.respondWith(caches.open(LIB).then(c => c.match(r).then(hit => hit || fetch(r).then(res => { if (ok(res)) c.put(r, res.clone()); return res; }))));
    return;
  }
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {                                                      // S1
    e.respondWith(fetch(r).then(res => { if (ok(res)) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(h => h || caches.match('index.html'))));
    return;
  }
  if (/\.(js|css|webmanifest)$/.test(u.pathname)) {                                // code: network first, so a new release is used at once
    e.respondWith(fetch(r).then(res => { if (ok(res)) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {                                       // S2, S5 (images and other media)
    const net = fetch(r).then(res => { if (ok(res)) { const cp = res.clone(); caches.open(hit ? V : RT).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
