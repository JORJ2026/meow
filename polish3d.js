// Shared final-polish layer for the 3D games: loading screen, offline / failed-download message,
// one consistent "‹ Store" button, no copy or zoom gestures, screen kept awake while playing.
(() => {
  const name = (document.title || 'Loading').replace(/^Cat /, 'Cat ');
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
  // stray promise errors (audio unlock, wake lock) never surface
  addEventListener('unhandledrejection', e => e.preventDefault());
})();
