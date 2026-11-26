// Final polish for the store, pick sheet and 2D game shell. Items tagged G1..G16 (see IMPROVEMENTS.md).
(() => {
  const $ = id => document.getElementById(id), body = document.body;
  const games = () => (window.cqStore && cqStore.games) || [];
  // G1: toasts float above every screen (they used to hide behind the store)
  const t = $('toast'); if (t) { document.body.appendChild(t); t.classList.add('top'); t.addEventListener('click', () => t.classList.remove('on')); }   // G2: tap a toast to dismiss it
  // G3: the world you picked (Classic / Cat Worlds / The River) is remembered across launches
  try { const g = +localStorage.getItem('cq_grp'); if (g > 0 && g < 3 && typeof setGroup === 'function') setGroup(g);
    const _sg = setGroup; setGroup = function (g) { _sg(g); try { localStorage.setItem('cq_grp', String(g)); } catch (_) {} }; } catch (_) {}
  // world hint under the world buttons: says what PLAY will do with the current choice
  const wh = document.createElement('p'); wh.id = 'pkwhint'; const lg = $('lgroups'); if (lg) lg.after(wh);
  function whint() { if (!wh.isConnected) return; const g = typeof grp === 'number' ? grp : 0, run = body.dataset.game === 'run';
    let n = 0; try { n = (GROUPS[g][1].indexOf(+localStorage.getItem('cq_lv' + g)) + 1) || 1; } catch (_) {}
    wh.textContent = run ? ['Classic Dash: the original backyard run', 'Cat World Run: themed cat worlds', 'River Run: riverside zones', 'Boss Rush Run'][g]
      : ['Story map: every level in order', 'Plays the 50 Cat World levels · level ' + n, 'Plays the 50 River levels · level ' + n, 'Boss levels'][g]; }
  try { const _sg2 = setGroup; setGroup = function (g) { _sg2(g); whint(); }; } catch (_) {}
  new MutationObserver(whint).observe(body, { attributes: true, attributeFilter: ['data-game'] }); whint();
  // G4: "Continue" button for the game you played last
  const head = document.querySelector('#store .ovhead .shtools');
  function contBtn() {
    let id = null; try { id = localStorage.getItem('cq_lastgame'); } catch (_) {}
    const k = games().findIndex(g => g.id === id); let b = $('scont');
    if (k < 0) { if (b) b.remove(); return; }
    if (!b && head) { b = document.createElement('button'); b.className = 'b go'; b.id = 'scont'; head.prepend(b); }
    if (b) { b.textContent = '▶ ' + games()[k].name; b.setAttribute('aria-label', 'Continue ' + games()[k].name); b.onclick = () => { const c = document.querySelectorAll('#sgrid .scard')[k]; if (c) c.click(); }; }
  }
  // G5: opening the store scrolls the last-played game into view
  function toLast() { const c = document.querySelector('#sgrid .scard.last'); if (c) c.scrollIntoView({ block: 'nearest' }); }
  try { const _h = cqStore.home; cqStore.home = function () { _h.apply(this, arguments); contBtn(); setTimeout(toLast, 60); }; } catch (_) {}
  contBtn(); setTimeout(toLast, 200);
  // G6: the pick sheet shows the game's blurb and your progress under its name
  const nm = $('pkname');
  if (nm && !$('pksub')) { const s = document.createElement('small'); s.id = 'pksub'; nm.after(s); }
  new MutationObserver(() => { const id = body.dataset.game, g = games().find(x => x.id === id), s = $('pksub'); if (!g || !s) return;
    const k = games().indexOf(g), pr = document.querySelectorAll('#sgrid .scard')[k], badge = pr && pr.querySelector('.sprog');
    s.textContent = g.blurb + (badge && /cleared/.test(badge.textContent) ? ' · ' + badge.textContent : ''); }).observe(body, { attributes: true, attributeFilter: ['data-game'] });
  // G7: keyboard on the pick sheet: Enter plays, Escape goes back to the store
  addEventListener('keydown', e => {
    if ($('menu').classList.contains('hide') || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
    if (e.key === 'Enter') { e.preventDefault(); $('pkgo').click(); } else if (e.key === 'Escape') { e.preventDefault(); $('pkback').click(); }
  });
  // G8: the pause menu can open Save & load
  const pr = document.querySelector('#pause .actrow');
  if (pr && window.cqSave) { const b = document.createElement('button'); b.className = 'b'; b.textContent = '💾 Save'; b.onclick = () => cqSave.open(); pr.appendChild(b); }
  // G9: focus returns to the button that opened a dialog when it closes
  let opener = null; document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('button'); if (b) opener = b; }, true);
  new MutationObserver(ms => ms.forEach(m => { const el = m.target; if (el.classList && el.classList.contains('ov') && el.classList.contains('hide') && opener && opener.isConnected && !opener.closest('.hide')) try { opener.focus({ preventScroll: true }); } catch (_) {} }))
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
