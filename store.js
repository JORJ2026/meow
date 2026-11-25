// Cat App Store: the home screen. Pick a game, then pick a cat and options in the menu.
(() => {
  const GAMES = [
    { id: 'story', name: 'Cat Quest', blurb: 'Story adventure', icon: '🐾', img: 'img/prev/story.png' },
    { id: 'run', name: 'Cat Run', blurb: 'Endless running', icon: '🏃', img: 'img/prev/run.png' },
    { id: 'temple', name: 'Temple Dash', blurb: 'Kitty temple run', icon: '🏛', img: 'img/prev/temple.png' },
    { id: 'maze', name: 'Kitty Maze', blurb: 'Find the way out', icon: '🧩', img: 'img/prev/maze.png' },
    { id: 'pong', name: 'Kitty Pong', blurb: 'Paddle battle', icon: '🏓', img: 'img/prev/pong.png' },
    { id: 'pac', name: 'Kitty Pac', blurb: 'Collect the treats', icon: '🐾', img: 'img/prev/pac.png' },
    { id: 'tet', name: 'Kitty Tetris', blurb: 'Stack the tins in 3D', icon: '🧱', img: 'img/prev/tet.png' },
    { id: 'jewels', name: 'Cat Jewels', blurb: 'Match-3 in 3D', icon: '💎', img: 'img/prev/jewels.png' },
    { id: 'run3d', name: 'Run 3D', blurb: 'Temple run in 3D', icon: '🏃', img: 'img/prev/run3d.png' },
    { id: 'maze3d', name: 'Maze 3D', blurb: 'Fog-of-war maze', icon: '🧩', img: 'img/prev/maze.png' },
    { id: 'pong3d', name: 'Pong 3D', blurb: 'Yarn ball, first to 5', icon: '🏓', img: 'img/prev/pong.png' },
    { id: 'pac3d', name: 'Pac 3D', blurb: 'Kibble maze in 3D', icon: '🐾', img: 'img/prev/pac.png' }
  ];
  const $ = id => document.getElementById(id);
  const store = $('store'), menu = $('menu');
  let chosen = null;

  const grid = $('sgrid');
  GAMES.forEach(g => {
    const c = document.createElement('div');
    c.className = 'scard';
    c.innerHTML = '<div class="sshot"><img alt="" src="' + g.img + '"></div>' +
      '<div class="sinfo"><span class="sic">' + g.icon + '</span><div><b>' + g.name + '</b><small>' + g.blurb + '</small></div>' +
      '<button class="sget">GET</button></div>';
    c.addEventListener('click', () => pick(g));
    c.querySelector('.sget').addEventListener('click', e => { e.stopPropagation(); pick(g); });
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
    $('pkname').textContent = g.name;
    document.body.classList.add('pick');
    store.classList.add('hide');
    menu.classList.remove('hide');
    $('msg').classList.add('hide');
  }
  $('pkback').onclick = home;
  $('pkgo').onclick = () => {
    if (!chosen) return home();
    const el = $(chosen.id);
    if (el) el.click();
  };
  window.cqStore = { home, pick, open: () => !store.classList.contains('hide') };
  home();
})();
