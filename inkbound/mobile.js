// Inkbound phone layer: full-screen arena while a match runs, no copy/zoom gestures, Android back pauses.
(() => {
  const $ = s => document.querySelector(s), body = document.body;
  const shown = el => el && getComputedStyle(el).display !== 'none';
  function sync() {
    const play = !shown($('#overlay')) && !shown($('#pauseMenu')) && !document.querySelector('dialog[open]');
    body.classList.toggle('ib-play', play && matchMedia('(pointer:coarse)').matches);
  }
  // ?stage=key from the store's level gallery picks that arena
  const want = new URLSearchParams(location.search).get('stage');
  if (want) { let tries = 0; const t = setInterval(() => { const b = document.querySelector('#stageRow [data-key="' + CSS.escape(want) + '"]'); if (b) { b.click(); clearInterval(t); } else if (++tries > 40) clearInterval(t); }, 100); }
  let coached = false; try { coached = !!localStorage.getItem('ib-coached'); } catch (_) {}
  function coach() { if (coached || !matchMedia('(pointer:coarse)').matches) return; coached = true; try { localStorage.setItem('ib-coached', '1'); } catch (_) {}
    const c = document.createElement('div'); c.id = 'ibCoach'; c.innerHTML = '◀ ▶ move · ↑ jump · <b>J</b> attack · <b>K</b> special · <b>C</b> combo<br><small>◈ shield · G grab · F dive</small>'; document.body.appendChild(c); setTimeout(() => c.remove(), 5000); }
  setInterval(() => { if (body.classList.contains('ib-play')) coach(); }, 300);
  setInterval(sync, 150); addEventListener('resize', sync);
  $('#ibPause').onclick = () => { const b = $('#pauseBtn'); if (b) b.click(); setTimeout(sync, 50); };
  ['contextmenu', 'selectstart', 'dragstart', 'gesturestart'].forEach(t => document.addEventListener(t, e => { if (!(e.target.closest && e.target.closest('input,textarea'))) e.preventDefault(); }));
  let lastT = 0; document.addEventListener('touchend', e => { const n = Date.now(); if (n - lastT < 320 && !(e.target.closest && e.target.closest('input'))) e.preventDefault(); lastT = n; }, { passive: false });
  document.addEventListener('visibilitychange', () => { if (document.hidden && body.classList.contains('ib-play')) { const b = $('#pauseBtn'); if (b) b.click(); } });
  try { history.pushState({ ib: 1 }, ''); addEventListener('popstate', () => { if (body.classList.contains('ib-play')) { const b = $('#pauseBtn'); if (b) b.click(); history.pushState({ ib: 1 }, ''); } else location.href = '../index.html'; }); } catch (_) {}
})();
