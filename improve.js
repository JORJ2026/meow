/* Cat Quest · reliability, battery and polish layer (see IMPROVEMENTS.md for the numbered list) */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (_) { return false; } }
  };

  /* 1 offline play: service worker (https / localhost only) */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* 2 a crash never leaves a dead screen: show a toast and keep the loop alive */
  let errN = 0;
  addEventListener('error', e => { if (++errN < 4) { try { toast('⚠️ Something hiccuped: ' + String(e.message || '').slice(0, 40)); } catch (_) {} } });
  /* 3 swallow stray promise rejections (audio / wake lock / fullscreen) */
  addEventListener('unhandledrejection', e => e.preventDefault());

  /* 4 Android back button / swipe-back pauses or steps back instead of leaving the game */
  try {
    history.replaceState({ cq: 1 }, '');
    history.pushState({ cq: 2 }, '');
    addEventListener('popstate', () => {
      history.pushState({ cq: 2 }, '');
      if (!$('wm').classList.contains('hide')) return $('wmclose').click();
      if (!$('runsetup').classList.contains('hide')) return $('rsback').click();
      if (!$('gm').classList.contains('hide')) return $('gmback').click();
      if (typeof paused !== 'undefined' && paused) return togglePause(false);
      if (!$('menu').classList.contains('hide')) return $('pkback').click();
      if (!$('store').classList.contains('hide')) return;
      if (['play', 'temple', 'maze', 'pong', 'pac', 'world'].includes(state)) togglePause(true);
    });
  } catch (_) {}

  /* 5 held controls are released whenever pause opens (no stuck buttons) */
  const _tp = togglePause;
  togglePause = function (f) { try { cqReleaseAll(); } catch (_) {} return _tp(f); };

  /* 6 iOS audio unlock on first touch, 7 resume audio when the app returns */
  const unlock = () => { try { audioInit(); if (AC && AC.state !== 'running') AC.resume(); } catch (_) {} };
  addEventListener('touchend', unlock, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) unlock(); });

  /* 8 sound setting is remembered */
  try {
    if (ls.get('cq_muted', '0') === '1') { muted = true; $('mute').textContent = '🔇'; }
    $('mute').addEventListener('click', () => { ls.set('cq_muted', muted ? '1' : '0'); $('mute').setAttribute('aria-pressed', String(muted)); });
    /* 9 mute button announces its state */
    $('mute').setAttribute('aria-pressed', String(muted));
  } catch (_) {}

  /* 10 low battery drops render resolution, 11 data-saver does too */
  try {
    navigator.getBattery && navigator.getBattery().then(b => {
      const chk = () => { if (!b.charging && b.level < 0.2) cqSetPerf(1); };
      chk(); b.addEventListener('levelchange', chk);
    });
    if (navigator.connection && navigator.connection.saveData) cqSetPerf(1);
  } catch (_) {}

  /* 12 reduced-motion: no screen shake */
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  setInterval(() => { if (rm.matches) { try { shake = 0; } catch (_) {} } }, 80);

  /* 13 already installed / fullscreen: hide the fullscreen button */
  if (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone) $('fs').style.display = 'none';

  /* 14 launch counter, 15 one-time "add to home screen" tip on iOS Safari */
  const launches = (+ls.get('cq_launch', '0') || 0) + 1; ls.set('cq_launch', String(launches));
  const iOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (iOS && !navigator.standalone && launches === 3 && ls.get('cq_a2hs', '0') !== '1') {
    setTimeout(() => { try { toast('Tip: Share ▸ Add to Home Screen for full-screen play'); ls.set('cq_a2hs', '1'); } catch (_) {} }, 4000);
  }

  /* 16 private mode / storage blocked: tell the player once */
  if (!ls.set('cq_probe', '1')) setTimeout(() => { try { toast('Progress can’t be saved in private mode'); } catch (_) {} }, 3000);

  /* 17 turning the phone mid-level pauses instead of killing you */
  addEventListener('orientationchange', () => { if (['play', 'temple', 'maze', 'pong', 'pac'].includes(state) && !paused) togglePause(true); });

  /* 18 save settings when the page is hidden (iOS can discard tabs), 19 pause on pagehide */
  addEventListener('pagehide', () => { try { saveS(); if (!paused && ['play', 'temple', 'maze', 'pong', 'pac'].includes(state)) togglePause(true); } catch (_) {} });

  /* 20 wake lock is re-acquired after the app returns (the old one never was) */
  let wl = null;
  async function wake() {
    try {
      const playing = !paused && ['play', 'temple', 'maze', 'pong', 'pac', 'world'].includes(state);
      if (playing && !wl && navigator.wakeLock && !document.hidden) {
        wl = await navigator.wakeLock.request('screen');
        wl.addEventListener('release', () => { wl = null; });
      } else if (!playing && wl) { await wl.release(); wl = null; }
    } catch (_) { wl = null; }
  }
  setInterval(wake, 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });

  /* 21 clamp stored touch settings to sane values */
  try {
    const p = S.ph; p.size = Math.max(0.6, Math.min(1.5, +p.size || 1)); p.op = Math.max(0.3, Math.min(1, +p.op || 0.9));
    cqApplyPhone();
  } catch (_) {}

  /* 22 deep links: index.html?game=story|run|temple|maze|pong|pac opens the pick sheet */
  try {
    const q = new URLSearchParams(location.search).get('game');
    if (q) {
      const t = setInterval(() => {
        if (state === 'menu' && !$('store').classList.contains('hide')) {
          clearInterval(t);
          const i = ['story', 'run', 'temple', 'maze', 'pong', 'pac', 'tet', 'jewels'].indexOf(q);
          const c = document.querySelectorAll('.scard')[i]; c && c.click();
        }
      }, 300);
      setTimeout(() => clearInterval(t), 20000);
    }
  } catch (_) {}

  /* 23 tiny FPS meter with ?fps=1 */
  if (/[?&]fps=1/.test(location.search)) {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:6px;top:calc(env(safe-area-inset-top) + 4px);z-index:99;font:700 11px monospace;color:#8f8;background:#0008;padding:2px 5px;border-radius:4px;pointer-events:none';
    document.body.appendChild(d);
    let n = 0, t0 = performance.now();
    (function f(t) { n++; if (t - t0 > 500) { d.textContent = Math.round(n * 1000 / (t - t0)) + ' fps · ' + VW + '×448 @' + RK + 'x'; n = 0; t0 = t; } requestAnimationFrame(f); })(t0);
  }

  /* 24 vibration is rate-limited so it never buzzes continuously */
  try {
    const v = navigator.vibrate && navigator.vibrate.bind(navigator); let lv = 0;
    if (v) navigator.vibrate = p => { const n = performance.now(); if (n - lv < 40) return true; lv = n; return v(p); };
  } catch (_) {}

  /* 25 page title follows the screen */
  setInterval(() => {
    const t = state === 'play' ? 'Cat Quest · Playing' : state === 'world' ? 'Cat Quest · Map' : 'Cat Quest';
    if (document.title !== t) document.title = t;
  }, 1500);

  /* 26 two-finger zoom and iOS rubber-band scrolling are blocked everywhere except real scroll areas */
  document.addEventListener('touchmove', e => {
    if (e.touches.length > 1 || !(e.target.closest && e.target.closest('#sgrid,.sheetbody,#pbody,#rsbody,#wmbody,#ptabs'))) e.preventDefault();
  }, { passive: false });

  /* 27 audio can't pile up: cap simultaneous tones */
  try {
    const _t = tone; let live = 0;
    tone = function (f, d, ty, vol, sl) { if (live > 10) return; live++; setTimeout(() => live--, d * 1000 + 30); return _t(f, d, ty, vol, sl); };
  } catch (_) {}

  /* 28 keep the picture awake: resume the loop if the tab was throttled */
  document.addEventListener('visibilitychange', () => { try { for (const k in keys) keys[k] = 0; } catch (_) {} });
})();
