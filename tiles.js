// Menu tile previews: hover (mouse) or long press (touch) shows a gameplay screenshot.
(() => {
  const M = {
    story: 'img/prev/story.png', run: 'img/prev/run.png', temple: 'img/prev/temple.png',
    maze: 'img/prev/maze.png', pong: 'img/prev/pong.png', pac: 'img/prev/pac.png',
    tet: 'img/prev/tet.png', jewels: 'img/prev/jewels.png', run3d: 'img/prev/run3d.png', maze3d: 'img/prev/maze.png', pong3d: 'img/prev/pong.png', pac3d: 'img/prev/pac.png'
  };
  const box = document.createElement('div');
  box.id = 'tprev';
  const im = document.createElement('img');
  im.alt = '';
  box.appendChild(im);
  document.body.appendChild(box);

  const tiles = Object.keys(M).map(id => document.getElementById(id)).filter(Boolean);
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let timer = 0, longFired = false, sx = 0, sy = 0;

  function place(el) {
    const r = el.getBoundingClientRect();
    const iw = Math.min(300, innerWidth * 0.62);
    const h = iw * 9 / 16 + 14;
    const half = (iw + 14) / 2;
    const cx = Math.max(half + 8, Math.min(innerWidth - half - 8, r.left + r.width / 2));
    const above = r.top > h + 16;
    box.style.left = cx + 'px';
    box.style.top = (above ? r.top - 8 : r.bottom + 8) + 'px';
    box.style.transform = above ? 'translate(-50%,-100%)' : 'translate(-50%,0)';
  }
  function show(el) {
    const src = M[el.id];
    if (!src) return;
    if (im.getAttribute('src') !== src) im.src = src;
    box.style.display = 'block';
    place(el);
  }
  function hide() { box.style.display = 'none'; }

  tiles.forEach(el => {
    if (fine) {
      el.addEventListener('mouseenter', () => show(el));
      el.addEventListener('mouseleave', hide);
    }
    el.addEventListener('touchstart', e => {
      longFired = false;
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY;
      clearTimeout(timer);
      timer = setTimeout(() => { longFired = true; show(el); }, 420);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - sx, t.clientY - sy) > 10) clearTimeout(timer);
    }, { passive: true });
    el.addEventListener('touchend', () => { clearTimeout(timer); if (longFired) hide(); });
    el.addEventListener('touchcancel', () => { clearTimeout(timer); longFired = false; hide(); });
    el.addEventListener('contextmenu', e => e.preventDefault());
  });

  // a long press previews the game but must not start it
  document.addEventListener('click', e => {
    if (!longFired) return;
    if (e.target.closest && e.target.closest('#menu .mleft>.prow>.b.big')) {
      e.stopPropagation(); e.preventDefault();
    }
    longFired = false;
  }, true);
  addEventListener('resize', hide);
  addEventListener('pointerdown', hide, true);
})();
