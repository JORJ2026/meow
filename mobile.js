/* ==========================================================
   Cat Quest · mobile layer
   - adaptive viewport (portrait / landscape, safe areas)
   - thumb deck: slider, d-pad, buttons (multi-touch)
   - picks the right controls for whatever is on screen
   Runs after game.js, so it can use its globals.
   ========================================================== */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const body = document.body, stage = $('stage'), canvas = $('g');
  const VH_ = 448;
  const FIX800 = new Set(['temple', 'maze', 'tpwin', 'mzwin', 'pong', 'pgwin', 'pac', 'pcwin', 'tet', 'ttwin']);
  const hidden = id => $(id).classList.contains('hide');
  const touchy = matchMedia('(hover:none) and (pointer:coarse)').matches || 'ontouchstart' in window;

  /* ---------- what is on screen? ---------- */
  function uiMode() {
    if (typeof paused !== 'undefined' && paused) return 'pause';
    if (!hidden('store')) return 'home';
    if (!hidden('menu') || !hidden('runsetup') || !hidden('gm') || !hidden('wm')) return 'sheet';
    return 'game';
  }
  function deckProfile(ui) {
    if (ui !== 'game' || !hidden('msg')) return '';
    const ph = S.ph || {};
    if (ph.show === 'off') return '';
    if (ph.show !== 'on' && !touchy) return '';
    switch (state) {
      case 'play': return RUN ? 'run' : 'plat';
      case 'world': return 'world';
      case 'temple': return 'lanes';
      case 'maze': case 'pac': return 'dpad';
      case 'pong': return 'pong';
      case 'tet': return 'tet';
    }
    return '';
  }
  const fitMode = () => (FIX800.has(state) ? '800' : 'fill');

  /* ---------- sizing ---------- */
  let sizeKey = '', perfK = 2;
  function setBacking(vw, k) {
    if (vw !== VW || RK !== k) {
      VW = vw; RK = k;
      canvas.width = Math.round(vw * k); canvas.height = Math.round(VH_ * k);
      try { VIG = null; } catch (_) {}
    }
  }
  function fit() {
    const r = stage.getBoundingClientRect();
    const sw = Math.max(1, r.width), sh = Math.max(1, r.height);
    const fix = fitMode() === '800';
    let vw = 800;
    if (!fix) vw = Math.max(360, Math.min(1100, Math.round(VH_ * sw / sh)));
    const sc = Math.min(sw / vw, sh / VH_);
    const cw = Math.floor(vw * sc), ch = Math.floor(VH_ * sc);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const k = Math.max(1, Math.min(perfK, (cw * dpr) / vw));
    setBacking(vw, Math.round(k * 4) / 4);
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    body.dataset.fit = fix ? '800' : 'fill';
  }
  function layout(force) {
    const W = window.innerWidth, H = window.innerHeight;
    const o = H > W * 1.02 ? 'p' : 'l';
    const ui = uiMode(), prof = deckProfile(ui);
    const sprOK = state === 'play' && !RUN ? '1' : '0';
    const key = [o, ui, prof, fitMode(), W, H, perfK, sprOK, state === 'play' ? 1 : 0].join('|');
    if (key === sizeKey && !force) return;
    if (body.dataset.deck !== prof) releaseAll();
    sizeKey = key;
    body.dataset.o = o; body.dataset.ui = ui; body.dataset.deck = prof; body.dataset.spr = sprOK;
    const room = W - 32 - (parseFloat(getComputedStyle(body).getPropertyValue('--sal')) || 0);
    document.documentElement.style.setProperty('--fit', Math.max(.7, Math.min(1, (W - 40) / 372)).toFixed(3));
    fit();
    labels();
  }
  let raf = 0;
  const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => layout(true)); };
  addEventListener('resize', relayout);
  addEventListener('orientationchange', () => { setTimeout(relayout, 120); setTimeout(relayout, 450); });
  if (window.visualViewport) visualViewport.addEventListener('resize', relayout);
  setInterval(() => layout(false), 120);

  /* ---------- deck DOM ---------- */
  const mv = $('mv'), acts = $('acts');
  mv.innerHTML =
    '<div class="mvs"><i data-d="l">◀</i><i data-d="r">▶</i></div>' +
    '<div class="mvd"><i data-d="u">▲</i><i data-d="l">◀</i><i data-d="r">▶</i><i data-d="d">▼</i></div>' +
    '<div class="mvu"><i data-d="u">▲</i><i data-d="d">▼</i></div>';
  acts.innerHTML =
    '<button class="ab" data-k="s" aria-label="Sprint">SPRINT</button>' +
    '<button class="ab" data-k="a" aria-label="Action">ACT</button>' +
    '<button class="ab" data-k="j" aria-label="Jump">JUMP</button>';

  const LAB = {
    plat: { j: 'JUMP', a: 'ACT', s: 'SPRINT' }, run: { j: 'JUMP', a: 'SLAM' }, world: { j: 'GO' },
    lanes: { j: 'JUMP', a: 'SLIDE' }, tet: { j: 'TURN', a: 'DROP' }
  };
  const SPECIAL = { slam: 'SLAM', dash: 'DASH', fly: 'FLY', glide: 'GLIDE', double: 'ACT', tank: 'ACT' };
  function labels() {
    const p = body.dataset.deck, L2 = LAB[p] || {};
    acts.querySelectorAll('.ab').forEach(b => {
      let t = L2[b.dataset.k];
      if (p === 'plat' && b.dataset.k === 'a') { try { t = SPECIAL[CATS[sel].sp] || 'ACT'; } catch (_) {} }
      if (t && b.textContent !== t) b.textContent = t;
    });
  }
  setInterval(labels, 400);

  /* ---------- input plumbing ---------- */
  const held = {};
  function set(k, v) {
    v = v ? 1 : 0;
    if (held[k] === v) return;
    held[k] = v;
    if (v && k !== 'l' && k !== 'r') tick1();
    setKey(k, v);
  }
  function tick1() { try { if (S.ph.vib) navigator.vibrate && navigator.vibrate(6); } catch (_) {} }
  function releaseAll() {
    for (const k in held) if (held[k]) { held[k] = 0; setKey(k, 0); }
    mv.querySelectorAll('i.on').forEach(i => i.classList.remove('on'));
    acts.querySelectorAll('.ab.dn').forEach(b => b.classList.remove('dn'));
    mvPtr = null;
  }
  window.cqReleaseAll = releaseAll;

  // action buttons: independent multi-touch
  acts.querySelectorAll('.ab').forEach(b => {
    const k = b.dataset.k, ids = new Set();
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); audioInit();
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
      ids.add(e.pointerId); b.classList.add('dn');
      if (!paused) { set(k, 1); if (typeof PG !== 'undefined' && PG) PG.tgt = null; }
    });
    const up = e => { ids.delete(e.pointerId); if (!ids.size) { b.classList.remove('dn'); set(k, 0); } };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });

  // movement zone: slider / d-pad / up-down pill. slide your thumb between directions.
  let mvPtr = null;
  function zoneEl() {
    const p = body.dataset.deck;
    return mv.querySelector(p === 'dpad' ? '.mvd' : p === 'pong' ? '.mvu' : '.mvs');
  }
  function mvUpdate(e) {
    const el = zoneEl(); if (!el) return;
    const r = el.getBoundingClientRect(), p = body.dataset.deck;
    let d = null;
    if (p === 'dpad') {
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) > r.width * 0.12) d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd');
    } else if (p === 'pong') {
      const y = (e.clientY - r.top) / r.height; d = y < 0.5 ? 'u' : 'd';
    } else {
      const x = (e.clientX - r.left) / r.width; d = x < 0.46 ? 'l' : x > 0.54 ? 'r' : null;
    }
    set('l', d === 'l'); set('r', d === 'r'); set('j', d === 'u'); set('a', d === 'd');
    el.querySelectorAll('i').forEach(i => i.classList.toggle('on', i.dataset.d === d));
  }
  mv.addEventListener('pointerdown', e => {
    if (mvPtr !== null || paused) return;
    e.preventDefault(); audioInit();
    mvPtr = e.pointerId;
    try { mv.setPointerCapture(e.pointerId); } catch (_) {}
    if (typeof PG !== 'undefined' && PG) PG.tgt = null;
    mvUpdate(e);
  });
  mv.addEventListener('pointermove', e => { if (e.pointerId === mvPtr) mvUpdate(e); });
  const mvEnd = e => {
    if (e.pointerId !== mvPtr) return;
    mvPtr = null;
    set('l', 0); set('r', 0); set('j', 0); set('a', 0);
    mv.querySelectorAll('i.on').forEach(i => i.classList.remove('on'));
  };
  mv.addEventListener('pointerup', mvEnd); mv.addEventListener('pointercancel', mvEnd); mv.addEventListener('lostpointercapture', mvEnd);
  addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

  /* ---------- settings from the pause menu ---------- */
  window.cqApplyPhone = function () {
    const p = S.ph;
    document.documentElement.style.setProperty('--ds', p.size || 1);
    document.documentElement.style.setProperty('--dop', p.op || 0.9);
    body.dataset.lh = p.lh ? '1' : '0';
    relayout();
  };
  cqApplyPhone();

  /* ---------- small device fixes ---------- */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault()));
  document.addEventListener('contextmenu', e => e.preventDefault());
  // no text selection / copy / drag-image menus on long-press (inputs excepted)
  const isField = e => e.target && e.target.closest && e.target.closest('input,textarea');
  ['selectstart', 'copy', 'cut', 'dragstart'].forEach(t => document.addEventListener(t, e => { if (!isField(e)) e.preventDefault(); }));
  document.addEventListener('dblclick', e => e.preventDefault());
  const fsOK = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
  if (!fsOK) $('fs').style.display = 'none';
  // slow phones: drop the render resolution a notch if frames run long
  let lastT = performance.now(), slow = 0, fast = 0;
  (function watch(now) {
    const dt = now - lastT; lastT = now;
    if (state === 'play' || state === 'temple' || state === 'maze' || state === 'pac' || state === 'pong') {
      if (dt > 26) { slow++; fast = 0; } else { fast++; if (fast > 120) slow = 0; }
      if (slow > 50 && perfK > 1) { perfK = 1; slow = 0; relayout(); }
    }
    requestAnimationFrame(watch);
  })(lastT);

  // character-switch button lives in the deck so it never covers the picture
  const swc = $('swc'); if (swc) $('deck').appendChild(swc);
  // pick-sheet shortcuts
  $('pklevels').onclick = () => $('wmbtn').click();
  $('pkintro').onclick = () => $('intro').click();

  layout(true);
})();
