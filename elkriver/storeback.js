/* Cat Quest Arcade: small "back to the store" button next to the settings gear */
(function(){var b=document.createElement('a');b.href='../index.html';b.id='cqback';b.textContent='\u2039 Store';b.setAttribute('aria-label','Back to the Cat Quest store');
var s=document.createElement('style');s.textContent='#cqback{position:fixed;z-index:5;left:52px;top:9px;height:34px;padding:0 10px;display:flex;align-items:center;font:700 13px system-ui;color:#fff;text-decoration:none;background:rgba(10,12,28,.72);border:2px solid rgba(255,226,121,.55);border-radius:12px;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;margin-left:env(safe-area-inset-left,0px)}';
document.head.appendChild(s);document.body.appendChild(b);})();
