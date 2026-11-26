/* Cat Quest 3D games - shared overworld map + level select (classic script, works even if the 3D engine fails to load).
   CQMap.open(cfg) shows a full-screen map:
     cfg.title        heading, e.g. '🐾 Kitty Pac 3D'
     cfg.worlds       [{n:'Jungle Ruins', c1:'#6fd3a0', c2:'#effad0', g:'#2f8a3c', deco:'🌴🗿'}, ...]
     cfg.levels(w)    -> array of level ids in world w (in order)
     cfg.name(i)      -> level name
     cfg.isOpen(i)    -> unlocked?            (the 1019 code unlocks everything)
     cfg.stars(i)     -> 0..3 stars earned
     cfg.cur          -> level id to start on
     cfg.go(i)        -> play level i
     cfg.diff         optional {label:'Difficulty', opts:['Easy','Normal','Hard'], get:()=>n, set:n=>{}}
     cfg.extra        optional [{label:'∞ Endless', fn:()=>{}}] extra buttons
     cfg.onOpen / cfg.onClose / cfg.closable (default true)
   CQMap.result({title, sub, stars, next, retry, map}) shows a win / lose card.
   CQMap.unl() -> true after the 1019 code (shared with the main menu for this browsing session). */
(function () {
  var UK = 'cq_unl';
  function unl() { try { return sessionStorage.getItem(UK) === '1'; } catch (e) { return false; } }
  function setUnl(v) { try { if (v) sessionStorage.setItem(UK, '1'); else sessionStorage.removeItem(UK); } catch (e) { } }

  var css = '' +
    '#cqmap,#cqres{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;align-items:center;background:rgba(10,6,28,.94);color:#fff;font:600 14px system-ui,-apple-system,"Segoe UI",sans-serif;padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom));box-sizing:border-box;overflow:auto}' +
    '#cqmap *,#cqres *{border-radius:0!important;box-sizing:border-box}' +
    '#cqmap h1{margin:4px 0 6px;font-size:clamp(18px,4.6vw,26px);color:#ffd84a;text-shadow:0 2px 0 #000;text-align:center}' +
    '#cqmap .row{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:3px 0;max-width:920px}' +
    '#cqmap button,#cqres button{font:800 13px system-ui,sans-serif;color:#fff;background:#3a2d7a;border:2px solid #6a5ac8;padding:7px 11px;min-height:36px;cursor:pointer}' +
    '#cqmap button:hover,#cqres button:hover{background:#4a3a9a}' +
    '#cqmap button.on{background:#ffd84a;color:#1a1030;border-color:#fff3b0}' +
    '#cqmap button:focus-visible,#cqres button:focus-visible{outline:3px solid #ffd84a;outline-offset:2px}' +
    '#cqmap button.lk{opacity:.45}' +
    '#cqmap canvas{display:block;border:3px solid #6a5ac8;margin:4px 0;touch-action:manipulation;cursor:pointer;background:#1d1745}' +
    '#cqmap .info{min-height:20px;text-align:center;margin:2px 0;color:#e8e0ff}' +
    '#cqmap .go{background:linear-gradient(#ffb84a,#ff8a1c);color:#1a1030;border-color:#ffe0a0;font-size:18px;padding:9px 28px;min-height:46px}' +
    '#cqmap .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:4px;width:min(920px,100%);margin:6px 0}' +
    '#cqmap .grid button{padding:4px 0;min-height:42px;font-size:13px;line-height:1.1}' +
    '#cqmap .grid small{display:block;font-size:9px;color:#ffd84a}' +
    '#cqmap .gh{grid-column:1/-1;text-align:left;color:#ffd84a;font-size:12px;margin-top:6px}' +
    '#cqmap .x{position:absolute;top:max(8px,env(safe-area-inset-top));right:8px;min-width:40px}' +
    '#cqmap .code{width:84px;font:700 13px system-ui;padding:7px;background:#1d1745;color:#fff;border:2px solid #6a5ac8}' +
    '#cqmap .lbl{align-self:center;color:#c8b8ff;font-size:12px;margin-right:2px}' +
    '#cqres{justify-content:center;background:rgba(10,6,28,.8)}' +
    '#cqres .card{background:#231a52;border:3px solid #ffd84a;padding:18px 20px;text-align:center;max-width:92vw}' +
    '#cqres h2{margin:0 0 6px;color:#ffd84a;font-size:24px}#cqres p{margin:0 0 10px;white-space:pre-line}#cqres .st{font-size:30px;color:#ffd84a;letter-spacing:4px;margin-bottom:8px}' +
    '#cqmapbtn{position:fixed;z-index:60;top:max(8px,env(safe-area-inset-top));right:56px;font:800 13px system-ui,sans-serif;color:#fff;background:#3a2d7a;border:2px solid #6a5ac8;padding:6px 10px;min-height:34px;cursor:pointer;border-radius:0!important}#cqmapbtn:hover{background:#4a3a9a}' +
    '#cqres .b{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}#cqres .on{background:#ffd84a;color:#1a1030}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  var CW = 920, CH = 330, C = null, el = null, cv = null, ctx = null, W = 0, sel = 0, raf = 0, T0 = 0, mode = 'map', hot = [];
  function $(s) { return el.querySelector(s); }
  function worldOf(i) { for (var w = 0; w < C.worlds.length; w++) if (C.levels(w).indexOf(i) >= 0) return w; return 0; }
  function isOpen(i) { return unl() || C.isOpen(i); }
  function hsh(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function open(cfg) {
    close(true); C = cfg; mode = 'map';
    sel = cfg.cur != null ? cfg.cur : cfg.levels(0)[0]; W = worldOf(sel);
    el = document.createElement('div'); el.id = 'cqmap'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'World map');
    document.body.appendChild(el);
    build();
    T0 = performance.now(); loop();
    if (C.onOpen) try { C.onOpen(); } catch (e) { }
    setTimeout(function () { var g = el && el.querySelector('.go'); if (g) g.focus({ preventScroll: true }); }, 40);
  }
  function close(silent) {
    if (raf) cancelAnimationFrame(raf); raf = 0;
    if (el) { el.remove(); el = null; }
    var c = C; C = null;
    if (!silent && c && c.onClose) try { c.onClose(); } catch (e) { }
  }
  function build() {
    var w = C.worlds[W], h = '';
    h += '<h1>' + C.title + '</h1>';
    if (C.closable !== false) h += '<button class="x" data-a="x" aria-label="Close map">✕</button>';
    h += '<div class="row">' + '<button data-a="mode" data-v="map" class="' + (mode === 'map' ? 'on' : '') + '">🗺 Map</button><button data-a="mode" data-v="grid" class="' + (mode === 'grid' ? 'on' : '') + '">🔢 Level select</button>';
    (C.extra || []).forEach(function (x, k) { h += '<button data-a="extra" data-v="' + k + '">' + x.label + '</button>'; });
    h += '</div>';
    if (C.diff) { h += '<div class="row"><span class="lbl">' + (C.diff.label || 'Difficulty') + '</span>'; C.diff.opts.forEach(function (o, k) { h += '<button data-a="diff" data-v="' + k + '" class="' + (C.diff.get() === k ? 'on' : '') + '">' + o + '</button>'; }); h += '</div>'; }
    if (mode === 'map') {
      h += '<div class="row">';
      C.worlds.forEach(function (x, k) { var first = C.levels(k)[0], ok = isOpen(first); h += '<button data-a="w" data-v="' + k + '" class="' + (k === W ? 'on' : '') + (ok ? '' : ' lk') + '" title="' + x.n + '">' + (ok ? '' : '🔒') + (k + 1) + '</button>'; });
      CW = innerWidth < 640 && innerHeight > innerWidth ? 420 : 920; CH = CW === 420 ? 560 : 330;
      h += '</div><canvas width="' + CW + '" height="' + CH + '" style="aspect-ratio:' + CW + '/' + CH + ';width:min(' + (CW === 420 ? '100%,calc((100vh - 290px)*.75)' : '920px,100%') + ')" aria-label="Map of ' + w.n + '"></canvas><div class="info"></div>';
      h += '<div class="row"><button class="go" data-a="go">▶ PLAY</button></div>';
    } else {
      h += '<div class="grid">';
      C.worlds.forEach(function (x, k) {
        h += '<div class="gh">' + (k + 1) + ' · ' + x.n + '</div>';
        C.levels(k).forEach(function (i, n) { var ok = isOpen(i), s = C.stars(i) || 0; h += '<button data-a="lv" data-v="' + i + '" class="' + (i === sel ? 'on' : '') + (ok ? '' : ' lk') + '" title="' + esc(C.name(i)) + '">' + (ok ? (n + 1) : '🔒') + '<small>' + (s ? '★'.repeat(s) : '&nbsp;') + '</small></button>'; });
      });
      h += '</div>';
    }
    h += '<div class="row"><input class="code" type="text" inputmode="numeric" maxlength="4" placeholder="🔑 Code" aria-label="Unlock code"></div>';
    el.innerHTML = h;
    cv = el.querySelector('canvas'); ctx = cv ? cv.getContext('2d') : null;
    info();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function info() {
    var i = $('.info'); if (!i) return;
    var s = C.stars(sel) || 0, ok = isOpen(sel), L = C.levels(W);
    i.textContent = 'World ' + (W + 1) + ' · ' + C.worlds[W].n + ' · ' + (L.indexOf(sel) + 1) + '. ' + C.name(sel) + '   ' + '★'.repeat(s) + '☆'.repeat(3 - s) + (ok ? '' : '   🔒 locked');
    var g = $('.go'); if (g) g.textContent = ok ? '▶ PLAY' : '🔒 LOCKED';
  }
  function play(i) { if (!isOpen(i)) { flashInfo('🔒 Beat the level before it first'); return; } var c = C; close(true); try { c.go(i); } catch (e) { } }
  function flashInfo(t) { var i = $('.info'); if (i) { i.textContent = t; setTimeout(function () { if (el) info(); }, 1400); } }
  function pick(i) { sel = i; var w = worldOf(i); if (w !== W) { W = w; build(); } else info(); }

  // ---- map drawing ----
  function nodePos(k, n) { if (CW === 420) return [210 + Math.sin(k * 1.05 + W) * 120 + Math.cos(k * .6) * 20, CH - 50 - (n > 1 ? k * ((CH - 130) / (n - 1)) : 0)]; var x = 70 + (n > 1 ? k * (780 / (n - 1)) : 390), y = 175 + Math.sin(k * 1.05 + W) * 70 + Math.cos(k * .5) * 18; return [x, y]; }
  function draw(t) {
    if (!ctx) return;
    var w = C.worlds[W], g = ctx, L = C.levels(W), n = L.length;
    var gr = g.createLinearGradient(0, 0, 0, CH); gr.addColorStop(0, w.c1); gr.addColorStop(1, w.c2); g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
    // drifting clouds / sparkles
    g.fillStyle = 'rgba(255,255,255,.35)';
    for (var c = 0; c < 5; c++) { var cx = ((t * 12 + c * 230 + hsh(c + W) * 200) % (CW + 180)) - 90, cy = 40 + hsh(c * 3 + W) * (CH * .3); g.fillRect(cx, cy, 70, 14); g.fillRect(cx + 16, cy - 10, 38, 12); }
    // hills
    g.fillStyle = w.g; g.beginPath(); g.moveTo(0, CH);
    for (var x = 0; x <= CW; x += 20) g.lineTo(x, CH * .76 - Math.sin(x * .012 + W) * 26 - Math.sin(x * .031 + W * 2) * 12);
    g.lineTo(CW, CH); g.fill();
    // decorations (bob and sway)
    var deco = Array.from(w.deco || '🌳');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var d = 0; d < 16; d++) { var dx = 25 + hsh(d * 7 + W * 3) * (CW - 50), dy = 60 + hsh(d * 11 + W) * (CH - 80); var near = false; for (var k = 0; k < n; k++) { var p = nodePos(k, n); if (Math.abs(p[0] - dx) < 50 && Math.abs(p[1] - dy) < 46) near = true; } if (near) continue;
      g.save(); g.translate(dx, dy + Math.sin(t * 1.5 + d) * 3); g.rotate(Math.sin(t * 1.2 + d * 2) * .06); g.font = (22 + hsh(d + 5) * 14 | 0) + 'px system-ui'; g.fillText(deco[d % deco.length], 0, 0); g.restore(); }
    // path
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(20,10,40,.5)'; g.lineWidth = 20; g.beginPath(); for (k = 0; k < n; k++) { p = nodePos(k, n); k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    g.strokeStyle = '#f1dca0'; g.lineWidth = 13; g.stroke();
    g.setLineDash([3, 12]); g.lineDashOffset = -t * 20; g.strokeStyle = '#a8865a'; g.lineWidth = 3; g.stroke(); g.setLineDash([]);
    // nodes
    hot = [];
    for (k = 0; k < n; k++) {
      var i = L[k]; p = nodePos(k, n); var ok = isOpen(i), s = C.stars(i) || 0, on = i === sel, boss = k === n - 1, sz = boss ? 24 : 19;
      var bob = on ? Math.sin(t * 5) * 3 : 0;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(p[0] - sz + 3, p[1] - sz + 5, sz * 2, sz * 2);
      g.fillStyle = !ok ? '#6a6a80' : s ? '#ffd84a' : '#ff9a3a'; g.fillRect(p[0] - sz, p[1] - sz + bob, sz * 2, sz * 2);
      g.lineWidth = on ? 4 : 2; g.strokeStyle = on ? '#ffffff' : '#1a1030'; g.strokeRect(p[0] - sz, p[1] - sz + bob, sz * 2, sz * 2);
      g.fillStyle = '#1a1030'; g.font = '800 ' + (boss ? 18 : 15) + 'px system-ui'; g.fillText(ok ? (boss ? '👑' : String(k + 1)) : '🔒', p[0], p[1] + bob + 1);
      if (s) { g.fillStyle = '#ffd84a'; g.font = '800 12px system-ui'; g.fillText('★'.repeat(s), p[0], p[1] + sz + 11); }
      hot.push([p[0], p[1], sz + 6, i]);
    }
    // the cat on the chosen node
    var k0 = L.indexOf(sel); if (k0 >= 0) { p = nodePos(k0, n); g.font = '30px system-ui'; g.fillText('🐱', p[0], p[1] - 42 + Math.abs(Math.sin(t * 4)) * -6); }
    g.fillStyle = 'rgba(10,6,28,.6)'; g.fillRect(0, 0, CW, 30); g.fillStyle = '#ffd84a'; g.font = '800 16px system-ui'; g.textAlign = 'left'; g.fillText('WORLD ' + (W + 1) + ' · ' + w.n, 12, 16);
  }
  function loop() { raf = requestAnimationFrame(loop); if (el && mode === 'map') draw((performance.now() - T0) / 1000); }

  // ---- input ----
  document.addEventListener('click', function (e) {
    if (!el || !el.contains(e.target)) return;
    if (e.target.tagName === 'CANVAS') {
      var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * CW / r.width, y = (e.clientY - r.top) * CH / r.height;
      for (var k = 0; k < hot.length; k++) { var h = hot[k]; if (Math.abs(h[0] - x) < h[2] && Math.abs(h[1] - y) < h[2]) { if (h[3] === sel) play(sel); else pick(h[3]); return; } }
      return;
    }
    var b = e.target.closest('button[data-a]'); if (!b) return;
    var a = b.dataset.a, v = b.dataset.v;
    if (a === 'x') close();
    else if (a === 'go') play(sel);
    else if (a === 'w') { W = +v; var L = C.levels(W), best = L[0]; for (var j = 0; j < L.length; j++) if (isOpen(L[j])) best = L[j]; sel = best; build(); }
    else if (a === 'lv') { if (+v === sel) play(sel); else { sel = +v; W = worldOf(sel); build(); var f = el.querySelector('.grid .on'); if (f) f.focus(); } }
    else if (a === 'mode') { mode = v; build(); }
    else if (a === 'diff') { C.diff.set(+v); build(); }
    else if (a === 'extra') { var c = C; close(true); c.extra[+v].fn(); }
  }, true);
  document.addEventListener('input', function (e) {
    if (!el || !e.target.classList.contains('code')) return;
    if (e.target.value.trim() === '1019') { setUnl(!unl()); e.target.value = ''; build(); flashInfo(unl() ? '🔓 Everything unlocked!' : '🔒 Locked again'); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!el) return;
    if (e.target && e.target.tagName === 'INPUT') { if (e.key !== 'Escape') e.stopPropagation(); return; }
    var k = e.code, L = C.levels(W), at = L.indexOf(sel);
    e.stopPropagation();
    if (k === 'Escape') { e.preventDefault(); if (C.closable !== false) close(); return; }
    if (mode === 'map') {
      if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); var nx = at + (k === 'ArrowRight' ? 1 : -1); if (nx >= L.length && W < C.worlds.length - 1) { W++; sel = C.levels(W)[0]; build(); } else if (nx < 0 && W > 0) { W--; var L2 = C.levels(W); sel = L2[L2.length - 1]; build(); } else if (nx >= 0 && nx < L.length) { sel = L[nx]; info(); } return; }
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); var w2 = Math.max(0, Math.min(C.worlds.length - 1, W + (k === 'ArrowDown' ? 1 : -1))); if (w2 !== W) { W = w2; var L3 = C.levels(W); sel = L3[Math.min(at < 0 ? 0 : at, L3.length - 1)]; build(); } return; }
      if (k === 'Enter' || k === 'Space') { if (document.activeElement && el.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON' && !document.activeElement.classList.contains('go')) return; e.preventDefault(); play(sel); return; }
    } else if (/^Arrow/.test(k)) {
      e.preventDefault(); var bs = Array.from(el.querySelectorAll('.grid button')), cur = document.activeElement, ix = bs.indexOf(cur); if (ix < 0) { ix = bs.findIndex(function (b) { return b.classList.contains('on'); }); if (ix < 0) ix = 0; bs[ix].focus(); return; }
      var cols = Math.max(1, Math.round(el.querySelector('.grid').clientWidth / (cur.offsetWidth + 4)));
      ix += k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : k === 'ArrowDown' ? cols : -cols; ix = Math.max(0, Math.min(bs.length - 1, ix)); bs[ix].focus(); bs[ix].scrollIntoView({ block: 'nearest' });
    }
  }, true);
  // controller
  var pv = [], ax = '';
  setInterval(function () {
    if (!el) { pv = []; return; }
    var gp = null; try { var l = navigator.getGamepads ? navigator.getGamepads() : []; for (var q = 0; q < l.length; q++) if (l[q] && l[q].connected) { gp = l[q]; break; } } catch (e) { }
    if (!gp) return; var pr = gp.buttons.map(function (b) { return b.pressed; }), ed = function (i) { return pr[i] && !pv[i]; };
    var key = function (c) { document.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true })); };
    var sx = (gp.axes[0] || 0) < -.5 ? 'ArrowLeft' : (gp.axes[0] || 0) > .5 ? 'ArrowRight' : '', sy = (gp.axes[1] || 0) < -.5 ? 'ArrowUp' : (gp.axes[1] || 0) > .5 ? 'ArrowDown' : '', s = sx || sy;
    if (ed(14)) key('ArrowLeft'); if (ed(15)) key('ArrowRight'); if (ed(12)) key('ArrowUp'); if (ed(13)) key('ArrowDown'); if (s && s !== ax) key(s); ax = s;
    if (ed(0)) { var f = document.activeElement; if (mode === 'grid' && f && el.contains(f)) f.click(); else play(sel); }
    if (ed(1) && C && C.closable !== false) close();
    pv = pr;
  }, 60);

  // ---- win / lose card ----
  function result(o) {
    var old = document.getElementById('cqres'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'cqres';
    var h = '<div class="card"><h2>' + o.title + '</h2>' + (o.stars != null ? '<div class="st">' + '★'.repeat(o.stars) + '☆'.repeat(3 - o.stars) + '</div>' : '') + '<p>' + (o.sub || '') + '</p><div class="b">';
    var btns = [];
    if (o.next) btns.push(['Next level ▶', o.next, 1]);
    if (o.retry) btns.push([o.next ? 'Replay' : 'Try again', o.retry, !o.next]);
    if (o.map) btns.push(['🗺 Map', o.map]);
    btns.push(['Menu', function () { location.href = 'index.html'; }]);
    btns.forEach(function (b, k) { h += '<button data-k="' + k + '" class="' + (b[2] ? 'on' : '') + '">' + b[0] + '</button>'; });
    d.innerHTML = h + '</div></div>'; document.body.appendChild(d);
    d.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; d.remove(); btns[+b.dataset.k][1](); });
    setTimeout(function () { var f = d.querySelector('button'); if (f) f.focus(); }, 40);
  }

  // keep game key handlers away from the result card
  document.addEventListener('keydown', function (e) {
    var d = document.getElementById('cqres'); if (!d) return;
    var bs = Array.from(d.querySelectorAll('button')), ix = bs.indexOf(document.activeElement);
    if (e.code === 'ArrowRight' || e.code === 'ArrowDown') { e.preventDefault(); bs[(ix + 1) % bs.length].focus(); }
    else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') { e.preventDefault(); bs[(ix - 1 + bs.length) % bs.length].focus(); }
    else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); (ix >= 0 ? bs[ix] : bs[0]).click(); }
    e.stopPropagation();
  }, true);
  // floating 🗺 Map button
  function button(fn, opt) {
    var b = document.getElementById('cqmapbtn'); if (b) b.remove();
    b = document.createElement('button'); b.id = 'cqmapbtn'; b.type = 'button'; b.textContent = '🗺 Map';
    if (opt && opt.style) b.setAttribute('style', opt.style);
    b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); b.blur(); fn(); });
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { b.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    document.body.appendChild(b); return b;
  }
  window.CQMap = { open: open, close: close, result: result, unl: unl, button: button, isOpen: function () { return !!el; } };
})();
