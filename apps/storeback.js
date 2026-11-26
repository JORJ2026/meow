/* Cat Quest Arcade: small "back to the store" tab on the left edge, out of the way of each app's own buttons */
(function () {
  if (document.getElementById('cqback')) return;
  var b = document.createElement('a'); b.href = '../../index.html'; b.id = 'cqback'; b.textContent = '‹ Store';
  b.setAttribute('aria-label', 'Back to the Cat Quest store');
  var s = document.createElement('style');
  s.textContent = '#cqback{position:fixed;z-index:2147483000;left:env(safe-area-inset-left,0px);top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;padding:10px 4px;font:700 11px/1 system-ui,sans-serif;color:#fff;text-decoration:none;background:rgba(10,12,28,.7);border:1px solid rgba(255,226,121,.6);border-left:0;border-radius:0;opacity:.7;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}#cqback:hover,#cqback:active{opacity:1}';
  document.head.appendChild(s);
  var add = function () { document.body.appendChild(b); };
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
