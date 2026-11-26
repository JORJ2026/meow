// Shared final-polish layer for the 3D games: loading screen, offline / failed-download message,
// one consistent "‹ Store" button, no copy or zoom gestures, screen kept awake while playing.
(() => {
  // P1: data-saver / low battery phones render at 1x, everyone else is capped at 2x (3x screens cost a lot of battery for no visible gain)
  try { const real = window.devicePixelRatio || 1; let cap = Math.min(2, real);
    const low = () => { cap = 1; }; if (navigator.connection && navigator.connection.saveData) low();
    if (navigator.getBattery) navigator.getBattery().then(b => { if (!b.charging && b.level < .2) low(); }).catch(() => {});
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => Math.min(cap, real) }); } catch (_) {}
  // P2: remember this game for the store's "last played" highlight even when opened from a link
  try { const id = { 'tetris3d': 'tet', 'jewels': 'jewels', 'runner3d': 'run3d', 'maze3d': 'maze3d', 'pong3d': 'pong3d', 'pac3d': 'pac3d', 'frogger3d': 'frog3d' }[(location.pathname.split('/').pop() || '').replace('.html', '')]; if (id) localStorage.setItem('cq_lastgame', id); } catch (_) {}
  // real store screenshot: the first time a 3D game is played, grab one real frame for its store card
  const SHOT_ID = { 'tetris3d': 'tet', 'jewels': 'jewels', 'runner3d': 'run3d', 'maze3d': 'maze3d', 'pong3d': 'pong3d', 'pac3d': 'pac3d', 'frogger3d': 'frog3d' }[(location.pathname.split('/').pop() || '').replace('.html', '')];
  const needShot = false;   // turned off: the store uses the designed pictures in img/prev/
  if (needShot) {
    // keep the WebGL picture readable just for this visit, so it can be copied once
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, o) { if (/webgl/.test(type)) o = Object.assign({}, o, { preserveDrawingBuffer: true }); return gc.call(this, type, o); };
    const grab = () => { try {
      const src = [...document.querySelectorAll('canvas')].filter(c => c.width * c.height > 40000).sort((a, b) => b.width * b.height - a.width * a.height)[0]; if (!src) return false;
      const W = 640, H = 384, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const sw = src.width, sh = src.height, k = Math.max(W / sw, H / sh), dw = sw * k, dh = sh * k; g.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
      const px = g.getImageData(W / 2 - 40, H / 2 - 40, 80, 80).data; let lit = 0; for (let i = 0; i < px.length; i += 16) lit += px[i] + px[i + 1] + px[i + 2]; if (lit < 3000) return false;   // skip blank frames
      let url = c.toDataURL('image/webp', .72); if (!/^data:image\/webp/.test(url)) url = c.toDataURL('image/jpeg', .72);
      localStorage.setItem('cq_shot_' + SHOT_ID, url); return true; } catch (_) { return false; } };
    let tries = 0; const t = setInterval(() => { if (!document.hidden && (grab() || ++tries > 20)) clearInterval(t); }, 1500);   // first try after 1.5 s, keeps trying for 30 s
    setTimeout(() => {}, 0);
  }
  // P3: page title names the arcade
  if (!/Arcade/.test(document.title)) document.title += ' · Cat Quest Arcade';
  const name = (document.title || 'Loading').replace(/ · Cat Quest Arcade$/, '');
  const sp = document.createElement('div'); sp.id = 'p3splash'; sp.setAttribute('role', 'status');
  sp.innerHTML = '<div class="paw">🐾</div><h1></h1><p>Loading the 3D world…</p>'; sp.querySelector('h1').textContent = name;
  const add = () => document.body && document.body.appendChild(sp); if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  let failed = false;
  function fail(why) {
    if (failed) return; failed = true; sp.classList.remove('out');
    sp.innerHTML = '<div class="paw">📶</div><h1>Can\'t load the 3D engine</h1><p>' + why + '</p><div class="row"><button id="p3retry">↻ Try again</button><a href="index.html">‹ Store</a></div>';
    sp.querySelector('#p3retry').onclick = () => location.reload();
  }
  // a module (three.js from the web) that fails to download fires an error on its <script>, catchable at window
  addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'SCRIPT') fail(navigator.onLine ? 'The download failed. Check your connection and try again.' : 'You are offline. 3D games need internet the first time they are played.'); }, true);
  addEventListener('load', () => { if (failed) return; requestAnimationFrame(() => requestAnimationFrame(() => { sp.classList.add('out'); setTimeout(() => { if (!failed) sp.remove(); }, 400); })); });
  setTimeout(() => { if (!failed && document.readyState !== 'complete') sp.querySelector('p').textContent = 'Still loading… a slow connection can take a little while.'; }, 8000);
  // consistent back button
  document.addEventListener('DOMContentLoaded', () => { const b = document.getElementById('back'); if (b) { b.textContent = '‹ Store'; b.setAttribute('aria-label', 'Back to the store'); } });
  // no long-press menus, text selection or double-tap zoom
  ['contextmenu', 'selectstart', 'dragstart', 'gesturestart'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  let lt = 0; document.addEventListener('touchend', e => { const n = Date.now(); if (n - lt < 320 && !(e.target.closest && e.target.closest('button,a'))) e.preventDefault(); lt = n; }, { passive: false });
  // keep the screen awake while the page is visible
  let wl = null; const wake = async () => { try { if ('wakeLock' in navigator && !document.hidden) wl = await navigator.wakeLock.request('screen'); } catch (_) {} };
  document.addEventListener('pointerdown', () => { if (!wl) wake(); }, { once: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { wl = null; wake(); } });
  // P12: once loaded, the tab / app-switcher title shows the level you are on
  addEventListener('load', () => setTimeout(() => { const lv = document.getElementById('lv'); if (lv && lv.textContent.trim() && !/^(LV|Level)\s*\d/.test(lv.textContent.trim())) document.title = lv.textContent.trim().slice(0, 40) + ' · ' + name; }, 500));
  // P4: Android back / swipe-back goes to the store instead of leaving the app
  try { history.pushState({ p3: 1 }, ''); addEventListener('popstate', () => { location.href = 'index.html'; }); } catch (_) {}
  // P5: after returning to the app, the first tap only wakes the game (no accidental move or swap)
  const guard = document.createElement('div'); guard.id = 'p3guard'; guard.innerHTML = '<b>Tap to continue</b>';
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (!sp.isConnected || sp.classList.contains('out')) document.body.appendChild(guard); } });
  guard.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); guard.remove(); }, true);
  // P6: a short buzz on every button and link tap
  document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('button,a') && navigator.vibrate) try { navigator.vibrate(6); } catch (_) {} }, true);
  // P7: one gameplay tip on the loading screen
  const TIPS = { 'Cat Tetris': 'Swipe to move, tap to turn, swipe down to drop.', 'Cat Jewels': 'Swap two gems to make a line of three or more.', 'Run 3D': 'Swipe left and right to change lanes, up to jump.',
    'Maze 3D': 'Find the golden bowl. Keys open the matching doors.', 'Pong 3D': 'Drag your paddle. Hit with the paddle edge for a sharper angle.', 'Pac 3D': 'Eat every kibble; catnip lets you chase the dogs.', 'Cross Road 3D': 'Tap to hop forward, swipe to dodge sideways.' };
  const tipFor = Object.keys(TIPS).find(k => name.indexOf(k.replace(/^Cat /, '')) >= 0 || name === k);
  // P11: your best score on the loading screen
  try { const bk = { 'Cat Tetris': 'ct3-best', 'Cat Jewels': 'cj-best', 'Cross Road 3D': 'cf3-best' }[name]; const bv = bk && +localStorage.getItem(bk); if (bv) { const q = document.createElement('p'); q.className = 'tip'; q.textContent = '🏆 Your best: ' + bv; sp.appendChild(q); } } catch (_) {}
  if (tipFor) { const t = document.createElement('p'); t.className = 'tip'; t.textContent = '💡 ' + TIPS[tipFor]; sp.appendChild(t); }
  // stray promise errors (audio unlock, wake lock) never surface
  addEventListener('unhandledrejection', e => e.preventDefault());
})();
