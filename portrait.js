/* Portrait zoom for the wide 2D games (Temple Dash, Kitty Maze, Kitty Pac).
   On a portrait phone their 800x448 picture is a thin strip with empty space above and below.
   While you play, this zooms the picture to fill that space and follows the cat, and keeps
   the top strip of the picture (hearts, score, timer) visible at normal size above it.
   Pong is left alone so both paddles stay in view. Everything returns to normal in landscape,
   in menus, and on the win / game-over screens. */
(() => {
  const cv = document.getElementById('g'), stage = document.getElementById('stage');
  if (!cv || !stage) return;
  const BAND = 50;                                   // canvas units of the top HUD strip that stay visible
  const hud = document.createElement('canvas'); hud.id = 'pzhud';
  hud.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:3;display:none';
  stage.appendChild(hud);
  const st = document.createElement('style');
  st.textContent = 'body.pzoom #stage::after{display:none!important}body.pzoom #g{transform-origin:0 0;will-change:transform}';
  document.head.appendChild(st);
  let cur = null, on = false;
  const g = n => { try { return eval(n); } catch (_) { return undefined; } };   // reads the game's own top-level variables

  function focus(s) {                                // where the cat is, in canvas units (800 x 448)
    if (s === 'temple') { const T = g('TP'); if (!T || T.over) return null; return { x: 400, y: 330, z: 2 }; }
    if (s === 'maze') { const Z = g('MZ'); if (!Z || Z.over) return null; return { x: Z.px - Z.cam[0], y: Z.py - Z.cam[1], z: 2.1 }; }
    if (s === 'pac') {
      const Z = g('PC'); if (!Z || Z.over || !Z.p) return null; const P = Z.p, T = g('PTS') || 21;
      return { x: (g('PGX') || 0) + (P.tx + P.dx * (P.p || 0) + .5) * T, y: (g('PGY') || 0) + (P.ty + P.dy * (P.p || 0) + .5) * T, z: 1.9 };
    }
    return null;
  }
  function reset() {
    if (!on) return; on = false; cur = null;
    document.body.classList.remove('pzoom'); cv.style.transform = ''; hud.style.display = 'none';
  }
  function frame() {
    requestAnimationFrame(frame);
    const s = g('state'), port = innerHeight > innerWidth * 1.02, paused = g('paused');
    const f = port && !paused ? focus(s) : null;
    if (!f) { reset(); return; }
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const cw = parseFloat(cv.style.width) || cv.clientWidth, ch = parseFloat(cv.style.height) || cv.clientHeight;
    if (!cw || !ch || sh < ch * 1.25) { reset(); return; }   // not enough spare room to be worth zooming
    const u = cw / 800;                                // css px per canvas unit at normal size
    const bandH = Math.round(BAND * u);
    const zMax = (sh - bandH) / ch;                    // fill the height under the HUD strip
    const z = Math.max(1, Math.min(f.z, zMax));
    // canvas natural position inside the stage (it is centred by flexbox)
    const L = (sw - cw) / 2, T0 = (sh - ch) / 2;
    let dx = sw / 2 - L - f.x * u * z;                 // put the cat in the middle...
    dx = Math.min(-L, Math.max(sw - L - cw * z, dx));  // ...without showing empty space at the sides
    const viewH = sh - bandH;
    let dy;
    if (ch * z <= viewH) dy = bandH + (viewH - ch * z) / 2 - T0;
    else { dy = bandH + viewH / 2 - T0 - f.y * u * z; dy = Math.min(bandH - T0, Math.max(sh - T0 - ch * z, dy)); }
    if (!cur) cur = { dx, dy, z };
    const k = .18; cur.dx += (dx - cur.dx) * k; cur.dy += (dy - cur.dy) * k; cur.z += (z - cur.z) * k;
    if (!on) { on = true; document.body.classList.add('pzoom'); hud.style.display = 'block'; }
    cv.style.transform = 'translate(' + cur.dx.toFixed(1) + 'px,' + cur.dy.toFixed(1) + 'px) scale(' + cur.z.toFixed(3) + ')';
    // HUD strip: copy the top of the picture, unzoomed, across the top of the stage
    const dpr = Math.min(devicePixelRatio || 1, 2), hw = Math.round(cw), hh = bandH;
    if (hud.width !== hw * dpr || hud.height !== hh * dpr) { hud.width = hw * dpr; hud.height = hh * dpr; hud.style.width = hw + 'px'; hud.style.height = hh + 'px'; }
    hud.style.left = Math.round(L) + 'px';
    const hc = hud.getContext('2d');
    try { hc.drawImage(cv, 0, 0, cv.width, cv.height * BAND / 448, 0, 0, hud.width, hud.height); } catch (_) { }
  }
  requestAnimationFrame(frame);
})();
