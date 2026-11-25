const W = 1280, H = 720;
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
function rgba(hex, a) {
  const h = (hex || '#ffffff').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
}
const FX = {
  fireflies(ctx, t, ac) {
    for (let i = 0; i < 24; i++) {
      const x = rnd(i, 1) * W + Math.sin(t * .4 + i) * 30, y = rnd(i, 2) * H * .8 + Math.cos(t * .3 + i) * 20;
      const a = .25 + .5 * (.5 + .5 * Math.sin(t * 2 + i * 1.7));
      ctx.fillStyle = rgba('#ffe9a0', a); ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 2) * .8, 0, 7); ctx.fill();
    }
  },
  stars(ctx, t, ac) {
    for (let i = 0; i < 40; i++) {
      const x = (rnd(i, 3) * W + t * (3 + i % 3)) % W, y = rnd(i, 4) * H * .7;
      ctx.fillStyle = rgba('#ffffff', .3 + .6 * Math.abs(Math.sin(t * 1.5 + i))); ctx.fillRect(x, y, 2, 2);
    }
  },
  steam(ctx, t, ac) {
    for (let i = 0; i < 18; i++) {
      const y = H - ((t * 30 + rnd(i, 5) * H) % H), x = rnd(i, 6) * W + Math.sin(t + i) * 22;
      const r = 14 + (H - y) * .05, a = .14 * Math.min(1, y / 200);
      ctx.fillStyle = rgba('#ffffff', a); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
  },
  ink(ctx, t, ac) {
    for (let i = 0; i < 12; i++) {
      const y = (rnd(i, 7) * H + t * 18) % (H + 60) - 30, x = rnd(i, 8) * W + Math.sin(t * .6 + i) * 40;
      ctx.fillStyle = rgba('#1b2433', .22); ctx.beginPath(); ctx.ellipse(x, y, 14 + i % 4 * 4, 9 + i % 3 * 3, Math.sin(t + i), 0, 7); ctx.fill();
    }
  },
  water(ctx, t, ac) {
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const y = H * .6 + rnd(i, 9) * H * .35, x = rnd(i, 10) * W + Math.sin(t * .8 + i) * 20;
      ctx.strokeStyle = rgba('#ffffff', .15 + .15 * Math.sin(t * 2 + i)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 + i % 3 * 20, y); ctx.stroke();
    }
  },
  leaves(ctx, t, ac) {
    for (let i = 0; i < 16; i++) {
      const y = (rnd(i, 11) * H + t * 40) % (H + 40) - 20, x = rnd(i, 12) * W + Math.sin(t * 1.3 + i) * 40;
      ctx.fillStyle = i % 3 ? rgba('#d8a14a', .85) : rgba('#8fc46a', .85);
      ctx.beginPath(); ctx.ellipse(x, y, 7, 3.5, t + i, 0, 7); ctx.fill();
    }
  },
  rain(ctx, t, ac) {
    ctx.strokeStyle = rgba('#cfe6ff', .35); ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 80; i++) {
      const x = rnd(i, 13) * W, y = (rnd(i, 14) * H + t * 700) % H;
      ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 18);
    }
    ctx.stroke();
  },
  dust(ctx, t, ac) {
    for (let i = 0; i < 30; i++) {
      const x = rnd(i, 15) * W + Math.sin(t * .3 + i) * 30, y = rnd(i, 16) * H * .85 + Math.cos(t * .25 + i) * 15;
      ctx.fillStyle = rgba('#fff4d8', .3 + .2 * Math.sin(t + i)); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill();
    }
  },
  spotlights(ctx, t, ac) {
    for (let i = 0; i < 3; i++) {
      const sx = 200 + 880 * (.5 + .5 * Math.sin(t * .3 + i * 2.1));
      const g = ctx.createLinearGradient(sx, 0, sx, H);
      g.addColorStop(0, rgba('#fff3d0', .16)); g.addColorStop(1, rgba('#fff3d0', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 12, 0); ctx.lineTo(sx + 12, 0); ctx.lineTo(sx + 160, H); ctx.lineTo(sx - 160, H); ctx.fill();
    }
  },
  butterflies(ctx, t, ac) {
    for (let i = 0; i < 8; i++) {
      const x = rnd(i, 17) * W + Math.sin(t * .5 + i) * 120, y = rnd(i, 18) * H * .6 + Math.cos(t * .7 + i) * 40;
      const flap = Math.abs(Math.sin(t * 10 + i));
      ctx.fillStyle = rgba('#f7b6d2', .9);
      ctx.beginPath(); ctx.ellipse(x - 4, y, 5 * flap + 1, 4, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 4, y, 5 * flap + 1, 4, 0, 0, 7); ctx.fill();
    }
  },
  snow(ctx, t, ac) {
    for (let i = 0; i < 60; i++) {
      const y = (rnd(i, 19) * H + t * 50) % H, x = rnd(i, 20) * W + Math.sin(t + i) * 12;
      ctx.fillStyle = rgba('#ffffff', .85); ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3) * .6, 0, 7); ctx.fill();
    }
  },
  sparks(ctx, t, ac) {
    for (let i = 0; i < 30; i++) {
      const y = H * .9 - ((t * 160 + rnd(i, 21) * H * .9) % (H * .9)), x = rnd(i, 22) * W + Math.sin(t * 3 + i) * 6;
      ctx.fillStyle = (i % 2 ? rgba('#ffb347', .9) : rgba('#fff1b0', .9)); ctx.fillRect(x, y, 2.5, 2.5);
    }
  },
  clouds(ctx, t, ac) {
    for (let i = 0; i < 4; i++) {
      const x = (rnd(i, 23) * (W + 400) + t * 12) % (W + 400) - 200, y = 40 + rnd(i, 24) * H * .3;
      ctx.fillStyle = rgba('#ffffff', .18);
      ctx.beginPath(); ctx.ellipse(x, y, 120, 36, 0, 0, 7); ctx.ellipse(x + 90, y + 8, 80, 28, 0, 0, 7); ctx.fill();
    }
  },
  ghosts(ctx, t, ac) {
    for (let i = 0; i < 5; i++) {
      const x = rnd(i, 25) * W + Math.sin(t * .4 + i) * 80, y = H * .3 + rnd(i, 26) * H * .3 + Math.sin(t * .7 + i) * 25;
      ctx.fillStyle = rgba('#e6f0ff', .18); ctx.beginPath(); ctx.arc(x, y, 28, Math.PI, 0); ctx.lineTo(x + 28, y + 30); ctx.lineTo(x - 28, y + 30); ctx.fill();
    }
  }
};
export class ArenaFx {
  constructor(effect, accent) { this.effect = effect; this.accent = accent; }
  draw(ctx, t) { const f = FX[this.effect]; if (f) f(ctx, t, this.accent); }
}
