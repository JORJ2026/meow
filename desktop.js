/* Desktop mode switch (☰ menu). Off by default, so phones keep the touch layout they have now.
   On: no on-screen thumb buttons, the game picture uses the whole screen - play with keyboard or controller.
   The choice is remembered on this device. */
(() => {
  const KEY = 'cq_desktop', b = document.getElementById('pdesk');
  let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (_) {}
  function apply() {
    document.body.classList.toggle('desk', on);
    if (b) { b.textContent = '🖥 Desktop mode: ' + (on ? 'On' : 'Off'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', on); }
    try { dispatchEvent(new Event('resize')); } catch (_) {}
  }
  if (b) b.addEventListener('click', e => {
    e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) {}
    apply(); try { toast(on ? '🖥 Desktop mode on: keyboard or controller' : '📱 Touch buttons back'); } catch (_) {}
  });
  apply();
})();
