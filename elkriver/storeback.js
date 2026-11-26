/* Cat Quest Arcade: small "back to the store" button, kept right beside the settings gear
   (it follows the gear's size and spot, so it never sits on top of the game's own buttons) */
(function(){var b=document.createElement('a');b.href='../index.html';b.id='cqback';b.textContent='‹ Store';b.setAttribute('aria-label','Back to the Cat Quest store');
var s=document.createElement('style');s.textContent='#cqback{position:fixed;z-index:5;left:0;top:0;height:30px;padding:0 8px;display:flex;align-items:center;box-sizing:border-box;font:700 12px/1 system-ui;color:#fff;text-decoration:none;background:rgba(10,12,28,.72);border:1px solid rgba(255,226,121,.55);border-radius:0;white-space:nowrap;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}#cqback.hide{display:none}';
document.head.appendChild(s);document.body.appendChild(b);
function place(){var g=document.getElementById('gear');if(!g)return;b.classList.toggle('hide',g.classList.contains('hide'));var r=g.getBoundingClientRect();if(!r.width)return;
 b.style.height=Math.round(r.height)+'px';b.style.fontSize=Math.round(Math.max(11,Math.min(13,r.height*.36)))+'px';b.style.left=Math.round(r.right+6)+'px';b.style.top=Math.round(r.top)+'px'}
addEventListener('resize',function(){setTimeout(place,50)});setInterval(place,250);place();})();
