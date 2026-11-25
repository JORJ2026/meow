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
    { id: 'frog3d', name: 'Cross Road 3D', blurb: 'Hop the road and river', icon: '🚗', img: 'img/prev/run3d.webp', href: 'frogger3d.html' }
  ];
  const $ = id => document.getElementById(id);
  const store = $('store'), menu = $('menu');
  let chosen = null;

  const grid = $('sgrid');
  GAMES.forEach(g => {
    const c = document.createElement('div');
    c.className = 'scard';
    c.innerHTML = '<div class="sshot"><img alt="" loading="lazy" decoding="async" src="' + g.img + '"></div>' +
      '<div class="sinfo"><span class="sic">' + g.icon + '</span><div><b>' + g.name + '</b><small>' + g.blurb + '</small></div></div>';
    c.addEventListener('click', () => pick(g));
    grid.appendChild(c);
  });

  function home() {
    chosen = null;
    document.body.classList.remove('pick');
    menu.classList.add('hide');
    store.classList.remove('hide');
  }
  function pick(g) {
    chosen = g;
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
  window.cqStore = { home, pick, open: () => !store.classList.contains('hide') };
  store.classList.add('hide'); // shown after the title and intro (showMenu calls home)
})();
