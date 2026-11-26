// Store progress badges: each card shows how many levels you have cleared.
(() => {
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (_) { return d; } };
  const prog = () => ls('cq_prog', {});
  const P = { story: { n: () => { try { return SEQ.length; } catch (_) { return 125; } } }, run: { n: () => 50 }, temple: { n: () => 100 }, maze: { n: () => 100 }, pong: { n: () => 100 }, pac: { n: () => 100 },
    maze3d: { n: () => 100 }, pac3d: { n: () => 100 }, frog3d: { n: () => 55 }, cross2d: { n: () => 50 } };
  function badges() {
    const games = (window.cqStore && cqStore.games) || [], cards = document.querySelectorAll('#sgrid .scard');
    games.forEach((gm, k) => { const p = P[gm.id], c = cards[k]; if (!p || !c || gm.id === 'inkbound' || gm.id === 'pong3d') return;
      let n = 0, done = 0; try { n = p.n(); done = clearedOf(gm.id); } catch (_) { return; }
      let b = c.querySelector('.sprog'); if (!b) { b = document.createElement('span'); b.className = 'sprog'; c.querySelector('.sshot').appendChild(b); }
      b.textContent = done >= n ? '★ All ' + n + ' cleared' : done > 0 ? done + ' / ' + n + ' cleared' : n + ' levels'; });
  }
  function clearedOf(id) {
    const pr = prog(), k = { maze3d: 'maze', pac3d: 'pac', frog3d: 'frog' }[id] || id;
    if (id === 'story') { try { return S.story.at || 0; } catch (_) { return 0; } }
    if (id === 'run') { try { return RC.stg.at || 0; } catch (_) { return 0; } }
    if (id === 'cross2d') return ls('cq_cr2', { at: 0 }).at || 0;
    return (pr[k] && pr[k].at) || 0;
  }
  // 3D cards switch to the real screenshot captured on this phone the first time the game was played
  function realShots() { const games = (window.cqStore && cqStore.games) || [], cards = document.querySelectorAll('#sgrid .scard');
    games.forEach((g, k) => { let u = null; try { u = localStorage.getItem('cq_shot_' + g.id); } catch (_) {} const im = cards[k] && cards[k].querySelector('.sshot img'); if (u && im && im.src !== u) { im.src = u; im.classList.add('ld'); } }); }
  realShots(); document.addEventListener('visibilitychange', () => { if (!document.hidden) realShots(); }); addEventListener('pageshow', realShots);
  setTimeout(badges, 300); document.addEventListener('visibilitychange', () => { if (!document.hidden) badges(); });
  try { const _h = cqStore.home; cqStore.home = function () { _h.apply(this, arguments); badges(); }; } catch (_) {}
})();
