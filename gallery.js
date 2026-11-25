// Level gallery: one thumb-friendly level picker for every game in the store.
// Each card shows a real screenshot (or a drawn map) of the level, its name, stars and lock state.
(() => {
  const $ = id => document.getElementById(id);
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (_) { return d; } };
  const prog = () => ls('cq_prog', {});
  const unl = () => { try { return !!UNL; } catch (_) { return false; } };
  const W10 = ['Jungle Ruins', 'Sand Temple', 'Ice Palace', 'Lava Keep', 'Candy Vault', 'Moon Shrine', 'Spooky Crypt', 'Sky Ruins', 'Star Temple', 'Coral Halls'];
  const FR_TH = ['Desert Dash', 'Frosty Pass', 'Candy Lane', 'Lava Land', 'Spooky Night', 'Jungle Run', 'Beach Break', 'Neon City', 'Toy Town', 'Rainbow Sky'];
  const FR_COL = [['#e6c27a', '#7a6a55', '#2fb6c9'], ['#f4fbff', '#6b7a8c', '#a8e0ff'], ['#ffb3d9', '#8a5a8f', '#ff9be0'], ['#5a3a3a', '#2b2b33', '#ff5a1f'], ['#3b4a3b', '#2a2a3a', '#3b2a6a'], ['#4fae4f', '#5b4a2f', '#3aa07a'], ['#f5e2a8', '#9a8b73', '#27c4e8'], ['#1f2a4a', '#101018', '#1fe0ff'], ['#9be37a', '#e0524a', '#4aa8ff'], ['#c9a7ff', '#6b6bd0', '#7be0c0']];
  const CR2W = ['Meadow Morning', 'Dusty Desert', 'Frosty Fields', 'Candy Town', 'Lava Rocks', 'Spooky Night', 'Jungle Trail', 'Beach Boardwalk', 'Neon City', 'Rainbow Sky'];
  const CR2N = ['First Steps', 'Getting Busy', 'Rush Hour', 'Tricky Crossing', 'Boss Road'];
  const PONG3 = [['Kitten', 'Gentle serve, slow rallies'], ['Tabby', 'A little quicker'], ['Alley Cat', 'Classic speed'], ['Tiger', 'Fast yarn, quick dog'], ['Lion', 'Blistering — good luck!']];
  const nm = (k, i, f) => { try { return NAMEF[k](i); } catch (_) { return f || ('Level ' + (i + 1)); } };
  const st = (o, i) => (o && o.st && o.st[i]) || 0;
  const play2d = (fn) => { $('store').classList.add('hide'); $('menu').classList.add('hide'); document.body.classList.remove('pick'); close(); try { audioInit(); } catch (_) {} fn(); };
  const go = url => { close(); location.href = url; };
  const tenWorlds = (i) => W10[Math.floor(i / 10)] || '';
  const P = {
    story: { n: () => { try { return SEQ.length; } catch (_) { return 125; } }, img: i => 'img/lv/story/' + i + '.webp',
      name: i => { try { return nodeInfo(i).name; } catch (_) { return 'Level ' + (i + 1); } },
      group: i => { try { return 'World ' + (SEQ[i].w + 1); } catch (_) { return ''; } },
      open: i => { try { return i <= (S.story.at || 0); } catch (_) { return i === 0; } }, stars: () => 0,
      play: i => play2d(() => { OWM = 'story'; enterNode(i); }) },
    run: { n: () => 50, img: i => 'img/lv/run/' + i + '.webp', name: i => { try { return stageDef(i).name; } catch (_) { return 'Stage ' + (i + 1); } },
      group: i => 'Stages ' + (Math.floor(i / 10) * 10 + 1) + '–' + (Math.floor(i / 10) * 10 + 10),
      open: i => { try { return i <= RC.stg.at; } catch (_) { return i === 0; } }, stars: i => { try { return RC.stg.stars[i] || 0; } catch (_) { return 0; } },
      play: i => play2d(() => startStage(i)) }
  };
  for (const k of ['temple', 'maze', 'pong', 'pac']) P[k] = {
    n: () => 100, img: i => 'img/lv/' + k + '/' + i + '.webp', name: i => nm(k, i), group: i => 'World ' + (Math.floor(i / 10) + 1) + (k === 'temple' ? ' · ' + tenWorlds(i) : ''),
    open: i => { const o = prog()[k] || { at: 0 }; return i <= (o.at || 0) || i % 10 === 0; }, stars: i => st(prog()[k], i),
    play: i => play2d(() => STARTF[k](i)) };
  P.maze3d = Object.assign({}, P.maze, { play: i => go('maze3d.html?i=' + i), note: 'Same layouts as Kitty Maze, explored in 3D' });
  P.pac3d = Object.assign({}, P.pac, { play: i => go('pac3d.html?i=' + i), note: 'Same mazes as Kitty Pac, in 3D' });
  P.frog3d = { n: () => 55, draw: (i, c) => drawFrog(i, c), name: i => i < 5 ? 'Meadow ' + (i + 1) : FR_TH[Math.floor((i - 5) / 5)] + ' ' + ((i - 5) % 5 + 1),
    group: i => i < 5 ? 'Classic' : FR_TH[Math.floor((i - 5) / 5)], open: i => i <= ((prog().frog || {}).at || 0), stars: () => 0, play: i => go('frogger3d.html?level=' + (i + 1)) };
  P.cross2d = { n: () => 50, img: i => 'img/lv/cross2d/' + i + '.webp', tall: 1, name: i => CR2N[i % 5], group: i => CR2W[Math.floor(i / 5)],
    open: i => i <= (ls('cq_cr2', { at: 0 }).at || 0), stars: i => (ls('cq_cr2', { stars: {} }).stars || {})[i + 1] || 0, play: i => go('crossroad2d.html?level=' + (i + 1)) };
  P.pong3d = { n: () => 5, draw: (i, c) => drawSpeed(i, c), name: i => PONG3[i][0], sub: i => PONG3[i][1], group: () => 'Difficulty', open: () => true, stars: () => 0, play: i => go('pong3d.html?lv=' + i) };
  P.inkbound = { n: () => INK.length, img: i => 'inkbound/' + INK[i].image, name: i => INK[i].name, group: () => 'Arenas', open: () => true, stars: () => 0, play: i => go('inkbound/index.html?stage=' + encodeURIComponent(INK[i].key)) };
  let INK = [];
  import('./inkbound/stage-data.js').then(m => { INK = Object.values(m.environments); }).catch(() => {});
  const ENDLESS = { tet: 'Endless: the speed climbs as you clear lines.', jewels: 'Endless match-3: chase your best score.', run3d: 'Endless runner: how far can you go?' };

  // drawn thumbnails for games whose levels are generated in 3D
  function drawFrog(i, c) {
    const L = i + 1, k = L <= 5 ? null : FR_COL[Math.floor((L - 6) / 5)], g = c.getContext('2d'), W = c.width, H = c.height, rows = 12;
    let s = L * 9301 + 49297; const r = () => (s = (s * 233280 + 1) % 2147483647) / 2147483647;
    for (let y = 0; y < rows; y++) {
      const t = y === 0 || y === rows - 1 ? 'g' : r() < .45 ? 'r' : r() < .6 ? 'w' : 'g', yy = H - (y + 1) * H / rows;
      g.fillStyle = t === 'g' ? (k ? k[0] : (y % 2 ? '#8fd26a' : '#7ccb5c')) : t === 'r' ? (k ? k[1] : '#4b5162') : (k ? k[2] : '#2e8fd0'); g.fillRect(0, yy, W, H / rows + 1);
      if (t === 'r') { g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = 4; x < W; x += 18) g.fillRect(x, yy + H / rows / 2 - 1, 8, 2); g.fillStyle = ['#ff5d5d', '#ffd84a', '#5dd0ff'][y % 3]; g.fillRect((r() * W) | 0, yy + 2, 22, H / rows - 4); }
      if (t === 'w') { g.fillStyle = '#a86b35'; g.fillRect((r() * W * .7) | 0, yy + 2, 40, H / rows - 4); }
    }
    g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(W / 2, H / rows / 2, 5, 0, 7); g.fill();
  }
  function drawSpeed(i, c) {
    const g = c.getContext('2d'), W = c.width, H = c.height;
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a2260'); gr.addColorStop(1, ['#2f9e44', '#3a86ff', '#ffb23a', '#ff6b3a', '#e63946'][i]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.strokeRect(10, 10, W - 20, H - 20); g.beginPath(); g.moveTo(W / 2, 10); g.lineTo(W / 2, H - 10); g.stroke();
    for (let k = 0; k < 5; k++) { g.fillStyle = k <= i ? '#ffd84a' : 'rgba(255,255,255,.2)'; g.fillRect(W / 2 - 50 + k * 22, H - 30, 16, 12); }
    g.fillStyle = '#ff77b7'; g.beginPath(); g.arc(W * .3 + i * 20, H * .45, 9, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,119,183,.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * .3 + i * 20 - 10, H * .45); g.lineTo(W * .3 + i * 20 - 24 - i * 14, H * .45); g.stroke();
  }

  // ---------- overlay ----------
  const ov = document.createElement('div'); ov.id = 'gal'; ov.className = 'ov hide'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Level gallery');
  ov.innerHTML = '<header class="ovhead galhead"><button class="b" id="galx" aria-label="Back">‹</button><h1 id="galt">Levels</h1><span id="galc"></span></header><div id="galtabs"></div><div id="galgrid"></div>';
  document.body.appendChild(ov);
  let cur = null, io = null;
  function close() { ov.classList.add('hide'); }
  function open(id) {
    const p = P[id]; cur = id;
    const gm = window.cqStore && cqStore.games && cqStore.games.find(x => x.id === id); $('galt').textContent = (gm ? gm.name : 'Levels') + ' · Levels';
    const grid = $('galgrid'), tabs = $('galtabs'); grid.innerHTML = ''; tabs.innerHTML = '';
    if (!p) { grid.innerHTML = '<div class="galnote">' + (ENDLESS[id] || 'This game has no separate levels.') + '<br><br><button class="b big go" id="galplay">▶ PLAY</button></div>'; $('galc').textContent = ''; ov.classList.remove('hide'); $('galplay').onclick = () => { close(); $('pkgo').click(); }; return; }
    const n = p.n(); let done = 0, groups = [], last = null;
    if (p.note) grid.insertAdjacentHTML('beforeend', '<div class="galnote small">' + p.note + '</div>');
    for (let i = 0; i < n; i++) {
      const gname = p.group(i); if (gname !== last) { last = gname; groups.push([gname, i]); const h = document.createElement('div'); h.className = 'galgrp'; h.id = 'galg' + (groups.length - 1); h.textContent = gname; grid.appendChild(h); }
      const ok = p.open(i) || unl(), s = p.stars(i); if (ok) done = i;
      const b = document.createElement('button'); b.className = 'galcard' + (ok ? '' : ' lock') + (p.tall ? ' tall' : ''); b.dataset.i = i;
      b.setAttribute('aria-label', (i + 1) + '. ' + p.name(i) + (ok ? '' : ', locked'));
      b.innerHTML = '<div class="galimg">' + (p.img ? '<img alt="" loading="lazy" decoding="async" src="' + p.img(i) + '">' : '<canvas width="240" height="134"></canvas>') + (ok ? '' : '<span class="galk">🔒</span>') + '</div><div class="galtx"><b>' + (i + 1) + '</b><span>' + p.name(i) + '</span>' + (s ? '<i>' + '★'.repeat(s) + '☆'.repeat(3 - s) + '</i>' : (p.sub ? '<i class="galsub">' + p.sub(i) + '</i>' : '')) + '</div>';
      b.onclick = () => { if (!(p.open(i) || unl())) { try { toast('🔒 Clear the level before it first'); } catch (_) {} return; } p.play(i); };
      grid.appendChild(b);
    }
    if (groups.length > 1) groups.forEach(([g, at], k) => { const t = document.createElement('button'); t.className = 'b'; t.textContent = g.replace(/^World /, 'W').replace(/^Stages /, ''); t.title = g; t.onclick = () => $('galg' + k).scrollIntoView({ behavior: 'smooth', block: 'start' }); tabs.appendChild(t); });
    $('galc').textContent = (done + 1) + ' / ' + n + ' open';
    if (io) io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const cv = e.target.querySelector('canvas'); if (cv && !cv.dataset.d) { cv.dataset.d = 1; p.draw(+e.target.dataset.i, cv); } }), { root: grid, rootMargin: '300px' });
    if (p.draw) grid.querySelectorAll('.galcard').forEach(c => io.observe(c));
    ov.classList.remove('hide');
    requestAnimationFrame(() => { const t = grid.querySelector('.galcard[data-i="' + done + '"]'); if (t) t.scrollIntoView({ block: 'center' }); });
  }
  $('galx').onclick = close;
  addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.classList.contains('hide')) { e.stopPropagation(); close(); } }, true);
  // the pick sheet's Levels button opens the gallery for whichever game is picked
  const lv = $('pklevels'); if (lv) { lv.textContent = '🗺 Level gallery'; lv.onclick = () => open(document.body.dataset.game || 'story'); }
  window.cqGallery = { open, close, has: id => !!P[id] };
})();
