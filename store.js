// Cat App Store: the home screen. Pick a game, then pick a cat and options in the menu.
(() => {
  const GAMES = [
    { id: 'story', name: 'Cat Quest', blurb: 'Story adventure', icon: '🐾', img: 'img/prev/story.webp' },
    { id: 'run', name: 'Cat Run', blurb: 'Endless running', icon: '🏃', img: 'img/prev/run.webp' },
    { id: 'temple', name: 'Temple Dash', blurb: 'Kitty temple run', icon: '🏛', img: 'img/prev/temple.webp' },
    { id: 'maze', name: 'Kitty Maze', blurb: 'Find the way out', icon: '🧩', img: 'img/prev/maze.webp' },
    { id: 'pong', name: 'Kitty Pong', blurb: 'Paddle battle', icon: '🏓', img: 'img/prev/pong.webp' },
    { id: 'pac', name: 'Kitty Pac', blurb: 'Collect the treats', icon: '🐾', img: 'img/prev/pac.webp' },
    { id: 'tet', name: 'Kitty Tetris', blurb: 'Stack the tins in 3D', icon: '🧱', img: 'img/prev/tet.webp' },
    { id: 'jewels', name: 'Cat Jewels', blurb: 'Match-3 in 3D', icon: '💎', img: 'img/prev/jewels.webp' },
    { id: 'run3d', name: 'Run 3D', blurb: 'Temple run in 3D', icon: '🏃', img: 'img/prev/run3d.webp' },
    { id: 'maze3d', name: 'Maze 3D', blurb: 'Fog-of-war maze', icon: '🧩', img: 'img/prev/maze3d.webp' },
    { id: 'pong3d', name: 'Pong 3D', blurb: 'Yarn ball, first to 5', icon: '🏓', img: 'img/prev/pong3d.webp' },
    { id: 'pac3d', name: 'Pac 3D', blurb: 'Kibble maze in 3D', icon: '🐾', img: 'img/prev/pac3d.webp' },
    { id: 'frog3d', name: 'Cross Road 3D', blurb: '55 levels in 10 themed worlds', icon: '🚗', img: 'img/prev/frog3d.webp', href: 'frogger3d.html' },
    { id: 'cross2d', name: 'Cross Road 2D', blurb: '50 levels · roads, rails, rivers', icon: '🛣️', img: 'img/prev/cross2d.webp', href: 'crossroad2d.html' },
    { id: 'inkbound', name: 'Inkbound', blurb: 'Classic-cartoon platform fighter', icon: '🖋️', img: 'img/prev/inkbound.webp', href: 'inkbound/index.html' }
  ];
  const $ = id => document.getElementById(id);
  const store = $('store'), menu = $('menu');
  let chosen = null;

  const grid = $('sgrid');
  let lastId = null; try { lastId = localStorage.getItem('cq_lastgame'); } catch (_) {}
  let busy = 0, scrollY0 = 0;
  GAMES.forEach((g, gi) => {
    const c = document.createElement('div');
    c.className = 'scard' + (g.id === lastId ? ' last' : '');
    c.setAttribute('role', 'button'); c.tabIndex = 0; c.setAttribute('aria-label', g.name + ', ' + g.blurb);
    c.innerHTML = '<div class="sshot"><img alt="' + g.name + ' screenshot" width="640" height="384" ' + (gi < 4 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" draggable="false" src="' + g.img + '">' + (g.id === lastId ? '<span class="lastbadge">Last played</span>' : '') + '</div>' +
      '<div class="sinfo"><span class="sic" aria-hidden="true">' + g.icon + '</span><div><b>' + g.name + '</b><small>' + g.blurb + '</small></div></div>';
    const go = () => { const n = Date.now(); if (n - busy < 400) return; busy = n; pick(g); };
    c.addEventListener('click', go);
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    grid.appendChild(c);
  });

  function home() {
    chosen = null;
    requestAnimationFrame(() => { grid.scrollTop = scrollY0; });
    document.body.classList.remove('pick');
    menu.classList.add('hide');
    store.classList.remove('hide');
  }
  function pick(g) {
    chosen = g;
    scrollY0 = grid.scrollTop;
    try { localStorage.setItem('cq_lastgame', g.id); } catch (_) {}
    if (g.href || /^(jewels|run3d|maze3d|pong3d|pac3d|tet)$/.test(g.id)) { const f = g.href || (g.id === 'tet' ? 'tetris3d.html' : g.id === 'run3d' ? 'runner3d.html' : g.id + '.html'); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = f; document.head.appendChild(l); }
    document.body.dataset.game = g.id;
    $('pkname').textContent = g.name;
    document.body.classList.add('pick');
    store.classList.add('hide');
    menu.classList.remove('hide');
    $('msg').classList.add('hide');
  }
  $('pkback').onclick = home;
  $('pkgo').onclick = () => {
    if (!chosen) return home();
    if (chosen.href) { location.href = chosen.href; return; }
    const el = $(chosen.id);
    if (el) el.click();
  };
  window.cqStore = { games: GAMES, home, pick, open: () => !store.classList.contains('hide') };
  store.classList.add('hide'); // shown after the title and intro (showMenu calls home)
})();
