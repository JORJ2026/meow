'use strict';
/* Cross Road 2D: 50 hand-tuned procedural levels in 10 themed worlds.
   Hop the cat up through roads, rails, rivers, ice and conveyor belts to the bowl.
   Visual upgrades are tagged V1..V40 in the comments. */
(() => {
const COLS = 7, SPAN_PAD = 4, LEVELS = 50;
const $ = id => document.getElementById(id);
const TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const seeded = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const hsh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------- progress ---------- */
let SV = { at: 0, stars: {}, fish: 0, mute: 0 };
try { const o = JSON.parse(localStorage.getItem('cq_cr2') || 'null'); if (o) SV = Object.assign(SV, o); } catch (_) {}
const save = () => { try { localStorage.setItem('cq_cr2', JSON.stringify(SV)); } catch (_) {} };

/* ---------- cats (same colours as the main game) ---------- */
const CATS = [
  { body: '#25252d', tux: 1, eye: '#9fe870', collar: '#e63946', s: 1 },
  { body: '#8e949f', stripe: '#555b68', eye: '#ffc247', collar: '#3a86ff', s: 1 },
  { body: '#9a9fa9', stripe: '#5d6370', eye: '#ffc247', collar: '#2ec27e', s: .92 },
  { body: '#25252d', tux: 1, eye: '#9fe870', collar: '#ff77b7', s: .85 },
  { body: '#25252d', tux: 1, eye: '#ffe14a', collar: '#ff4d6d', s: .92 },
  { body: '#f7f4ee', patch: '#7a4a2a', eye: '#7a4420', collar: '#ffd84a', s: .92 }
];
let CAT = CATS[0]; try { CAT = CATS[(+localStorage.getItem('cq_sel') || 0) % CATS.length]; } catch (_) {}

/* ---------- ten worlds (V2: per-world palettes) ---------- */
const TH = [
  { n: 'Meadow Morning', g1: '#79c85a', g2: '#6fbd50', road: '#4b5162', water: '#3a9ad9', deep: '#2a7bb8', sky: '#bfe9ff', deco: 'tree', cars: ['#ff5d5d', '#ffd84a', '#5dd0ff', '#b07cff', '#ff9f43', '#f4f4f4'], part: 'leaf', w: { road: 4, river: 2 } },
  { n: 'Dusty Desert', g1: '#e8c887', g2: '#dcbb78', road: '#7a6a55', water: '#2fb6c9', deep: '#1f94a8', sky: '#ffe0a8', deco: 'cactus', cars: ['#e07a3f', '#f2c14e', '#c1440e', '#f4f4f4'], part: 'sand', w: { road: 4, river: 2, rail: 1 }, tint: 'rgba(255,170,60,.10)' },
  { n: 'Frosty Fields', g1: '#eef7ff', g2: '#dcecf7', road: '#6b7a8c', water: '#8fd0f0', deep: '#6ab4dc', sky: '#d6f0ff', deco: 'pine', cars: ['#5da8ff', '#ffffff', '#7fd6ff', '#ff5d5d'], part: 'snow', w: { road: 3, river: 1, ice: 3 }, tint: 'rgba(160,210,255,.10)' },
  { n: 'Candy Town', g1: '#ffb3d9', g2: '#ffa3cf', road: '#9a5a9f', water: '#ff9be0', deep: '#f07ac8', sky: '#ffe0f2', deco: 'lolli', cars: ['#ff7eb6', '#8ff0d0', '#fff176', '#b388ff'], part: 'petal', w: { road: 3, river: 2, belt: 2 }, tint: 'rgba(255,140,200,.08)' },
  { n: 'Lava Rocks', g1: '#5a3a3a', g2: '#4e3232', road: '#2b2b33', water: '#ff5a1f', deep: '#d03a0a', sky: '#3a1a1a', deco: 'rock', cars: ['#ff4d2e', '#6a6a78', '#ffb347', '#d8d8e0'], part: 'ember', w: { road: 2, river: 3, rail: 1, belt: 1 }, tint: 'rgba(255,60,20,.12)', lava: 1 },
  { n: 'Spooky Night', g1: '#3b4a3b', g2: '#344234', road: '#2a2a3a', water: '#3b2a6a', deep: '#2a1d52', sky: '#1c1740', deco: 'dead', cars: ['#ff9f43', '#b07cff', '#8a8a9a', '#7cffb0'], part: 'firefly', w: { road: 3, river: 2, rail: 2 }, night: 1 },
  { n: 'Jungle Trail', g1: '#4fae4f', g2: '#45a245', road: '#5b4a2f', water: '#3aa07a', deep: '#2a8a66', sky: '#a8f0b8', deco: 'palm', cars: ['#ffd84a', '#ff7a3a', '#f4f4f4', '#3ab0ff'], part: 'leaf', w: { road: 3, river: 3, belt: 1 }, tint: 'rgba(60,255,120,.07)' },
  { n: 'Beach Boardwalk', g1: '#f5e2a8', g2: '#efd896', road: '#9a8b73', water: '#27c4e8', deep: '#18a4c8', sky: '#bff3ff', deco: 'umbrella', cars: ['#ff6b6b', '#ffd84a', '#5dd0ff', '#ffffff'], part: 'bubble', w: { road: 3, river: 3, rail: 1 } },
  { n: 'Neon City', g1: '#1f2a4a', g2: '#1a2440', road: '#101018', water: '#1fe0ff', deep: '#0a90b0', sky: '#14102e', deco: 'lamp', cars: ['#ff2fd2', '#2fffe0', '#ffe62f', '#7a5cff'], part: 'rain', w: { road: 4, river: 1, rail: 3, belt: 2 }, night: 1, tint: 'rgba(120,60,255,.10)' },
  { n: 'Rainbow Sky', g1: '#c9a7ff', g2: '#bd98f7', road: '#6b6bd0', water: '#7be0c0', deep: '#4fc0a0', sky: '#ffe6f7', deco: 'star', cars: ['#ff6b6b', '#ffd84a', '#6bff9a', '#6bb7ff', '#d46bff'], part: 'sparkle', w: { road: 3, river: 2, rail: 1, ice: 1, belt: 1 }, tint: 'rgba(255,160,255,.07)' }
];
const NAMES5 = ['First Steps', 'Getting Busy', 'Rush Hour', 'Tricky Crossing', 'Boss Road'];

/* ---------- level generator (seeded: the same level every time) ---------- */
function genLevel(L) {
  const wi = Math.floor((L - 1) / 5), j = (L - 1) % 5, d = (L - 1) / (LEVELS - 1), th = TH[wi], R = seeded(L * 7919 + 13);
  const rows = 12 + Math.floor(d * 9) + (j >= 3 ? 1 : 0);              // rows incl. start (0) and goal (top)
  const lanes = [];
  const baseSpd = 1.1 + d * 2.6 + j * .08;
  let prevHaz = 0, prevFree = [0, 1, 2, 3, 4, 5, 6];
  const pick = () => { const e = Object.entries(th.w); let t = e.reduce((a, b) => a + b[1], 0), x = R() * t; for (const [k, v] of e) { x -= v; if (x <= 0) return k; } return 'road'; };
  for (let r = 0; r < rows; r++) {
    let type = 'grass';
    if (r === rows - 1) type = 'goal';
    else if (r > 0) {
      const needGrass = prevHaz >= 2 + (R() < .35 ? 1 : 0) + (d < .3 ? 0 : 0) || r === 1 && R() < .25 || r === rows - 2 && R() < .5;
      type = needGrass ? 'grass' : pick();
      if (r === rows - 2 && type !== 'grass') type = 'grass';
    }
    const ln = { r, type, dir: R() < .5 ? 1 : -1, objs: [], period: 0, t: R() * 50, obs: [], fish: [] };
    const spd = baseSpd * (.75 + R() * .55);
    if (type === 'road') {
      ln.speed = spd * 1.15;
      const kinds = ['car', 'car', 'truck', 'bike'];
      if (d > .15) kinds.push('bus'); if (th.night || d > .4) kinds.push('police'); if (d > .55) kinds.push('bike', 'truck');
      let x = 0; const n = 3 + Math.floor(R() * 2) + (d > .5 ? 1 : 0), gapMin = 2.1 + (1 - d) * 1.3, gapMax = gapMin + 2.2 + R();
      for (let i = 0; i < n; i++) { const k = kinds[Math.floor(R() * kinds.length)], w = { car: 1.15, truck: 1.7, bus: 2.3, bike: .75, police: 1.15 }[k]; ln.objs.push({ k, x, w, c: th.cars[Math.floor(R() * th.cars.length)], ph: R() * 6 }); x += w + gapMin + R() * (gapMax - gapMin); }
      ln.period = x;
    } else if (type === 'river') {
      ln.speed = spd * .55;
      let x = 0; const n = 4 + Math.floor(R() * 2);
      for (let i = 0; i < n; i++) {
        const q = R(), k = d > .22 && q < .3 ? 'turtle' : d > .1 && q < .5 ? 'lily' : 'log';
        const w = k === 'log' ? 2 + Math.floor(R() * 3) : k === 'turtle' ? 2 + Math.floor(R() * 2) : 1;
        ln.objs.push({ k, x, w, ph: R() * 6, dive: d > .4 ? 1 : 0 }); x += w + 1.3 + R() * (1.6 - Math.min(.7, d));
      }
      ln.period = x;
    } else if (type === 'rail') {
      ln.speed = 17; ln.len = 7 + Math.floor(R() * 4); ln.cycle = 4.2 - d * 1.4 + R() * 1.5; ln.t = R() * ln.cycle;
    } else if (type === 'belt') {
      ln.speed = (.9 + d * 1.2) * ln.dir;
    }
    if (type === 'grass' || type === 'ice' || type === 'goal') {
      const cnt = type === 'goal' ? 4 : 3 + Math.floor(R() * 3), free = [];
      const keep = prevFree[Math.floor(R() * prevFree.length)];
      const cols = [0, 1, 2, 3, 4, 5, 6].filter(c => c !== keep); const blocked = [];
      for (let i = 0; i < (r === 0 ? 0 : (type === 'goal' ? 3 : 7 - cnt)); i++) { if (!cols.length) break; blocked.push(cols.splice(Math.floor(R() * cols.length), 1)[0]); }
      ln.obs = blocked.map(c => ({ c, v: Math.floor(R() * 3) }));
      for (let c = 0; c < COLS; c++) if (!blocked.includes(c)) free.push(c);
      prevFree = free; ln.free = free;
      if (type !== 'goal' && r > 0 && R() < .55) ln.fish.push({ c: free[Math.floor(R() * free.length)], got: 0, ph: R() * 6 });
      if (type === 'goal') ln.bowl = keep;
    } else prevFree = [0, 1, 2, 3, 4, 5, 6];
    if (type === 'road' && R() < .4) ln.fish.push({ c: Math.floor(R() * COLS), got: 0, ph: R() * 6 });
    prevHaz = (type === 'grass' || type === 'goal' || type === 'ice') ? 0 : prevHaz + 1;
    lanes.push(ln);
  }
  // extras: roaming dog on a grass row (later levels)
  const dogs = [];
  if (d > .3) lanes.forEach(l => { if (l.type === 'grass' && l.r > 1 && l.r < rows - 2 && R() < .22 + d * .2 && dogs.length < 3) dogs.push({ r: l.r, x: R() * COLS, dir: R() < .5 ? 1 : -1, sp: 1.2 + d * 1.3 }); });
  const total = lanes.reduce((a, l) => a + l.fish.length, 0);
  return { L, th, wi, j, rows, lanes, dogs, title: th.n + ' · ' + NAMES5[j], fishTotal: total };
}

/* ---------- audio ---------- */
let AC = null;
function tone(f, d, ty, v, sl) {
  if (SV.mute) return;
  if (!AC && navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain(); o.type = ty || 'square'; o.frequency.value = f; if (sl) o.frequency.linearRampToValueAtTime(f + sl, AC.currentTime + d);
    g.gain.value = v || .05; g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch (_) {}
}
const sfx = {
  hop: () => tone(440 + (G ? G.maxR / G.rows * 220 : 0) + Math.random() * 60, .07, 'square', .035, 160), coin: () => { tone(988, .08, 'square', .04); setTimeout(() => tone(1319, .12, 'square', .04), 70); },
  splat: () => tone(120, .25, 'sawtooth', .07, -80), splash: () => tone(300, .3, 'sine', .06, -220), bell: () => tone(1240, .09, 'triangle', .05),
  whoosh: () => tone(700, .18, 'sawtooth', .025, -500), honk: () => { tone(330, .12, 'square', .04); setTimeout(() => tone(330, .16, 'square', .04), 150); }, caw: () => tone(1500, .2, 'sawtooth', .03, -700), slide: () => tone(900, .2, 'sine', .03, -600),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .16, 'square', .05), i * 110)), bump: () => tone(160, .08, 'square', .04)
};
const vib = n => { if (!SV.mute && navigator.vibrate) try { navigator.vibrate(n); } catch (_) {} };

/* ---------- canvas + layout ---------- */
const cv = $('cv'), ctx = cv.getContext('2d', { alpha: false });
let CW = 0, CH = 0, U = 48, DPR = 1, OX = 0;
function resize() {
  const W = innerWidth, H = innerHeight, land = W > H * 1.05;
  document.body.dataset.o = land ? 'l' : 'p';
  const deckH = (!land && matchMedia('(pointer:coarse)').matches) ? 150 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0) : 0;
  CW = W; CH = Math.max(200, H - deckH); DPR = Math.min(devicePixelRatio || 1, LOWP ? 1 : 2.5);
  cv.style.width = CW + 'px'; cv.style.height = CH + 'px'; cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
  U = Math.floor(Math.min(CW / COLS, CH / (land ? 8.5 : 10.5)));        // tile size in CSS px
  OX = Math.floor((CW - COLS * U) / 2);
  $('deck').hidden = !(G && G.state !== 'title' && matchMedia('(pointer:coarse)').matches);
}
addEventListener('resize', resize);

/* ---------- game state ---------- */
let G = null, LOWP = !!(navigator.connection && navigator.connection.saveData);
if (navigator.getBattery) navigator.getBattery().then(b => { if (!b.charging && b.level < .2) { LOWP = true; resize(); } }).catch(() => {});               // current level state
const P = { x: 3, r: 0, hx: 3, hr: 0, tx: 3, tr: 0, hop: 1, face: 1, riding: null, slide: 0, alive: 1, face_d: 0, sq: 0, blink: 0, idle: 0, bump: 0 };
let parts = [], pops = [], shake = 0, flash = 0, fade = 0, camR = 0, camTgt = 0, clock = 0, paused = false, last = 0, hawk = null, clouds = [];
const HOP = .12;
const PRT = [];            // ambient world particles (V30)
function newClouds() { clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 2.4 - 2, y: (i * 3.7) % 10, w: 2.5 + i % 3, sp: .15 + i * .04 })); }  // V38

function startLevel(L) {
  G = genLevel(L); G.state = 'play'; G.lives = 3; G.fish = 0; G.hops = 0; G.t = 0; G.cp = 0; G.maxR = 0; G.lost = 0;
  P.x = P.tx = P.hx = 3; P.r = P.tr = P.hr = 0; P.hop = 1; P.riding = null; P.slide = 0; P.alive = 1; P.sq = 0; P.idle = 0; P.face = 1;
  camR = camTgt = camClamp(0); hawk = null; parts = []; pops = []; PRT.length = 0; newClouds();
  for (let i = 0; i < 40; i++) PRT.push({ x: Math.random() * COLS * 1.4 - .7, y: Math.random() * 20, vx: 0, vy: 0, p: Math.random() * 6, s: .6 + Math.random() * .8 });
  $('title').classList.add('hide'); $('msg').classList.add('hide'); $('hud').hidden = false; resize();
  $('hlv').textContent = 'Level ' + L + '/' + LEVELS; $('hwn').textContent = G.title; updHud();
  const b = $('banner'); b.innerHTML = G.th.n + '<small>Level ' + L + ' · ' + NAMES5[G.j] + '</small>'; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');   // V34
  fade = 1;                                                                                       // V35
  if (L === 1 && !SV.coached) { const c = document.createElement('div'); c.id = 'coach'; c.innerHTML = '👆 <b>Tap or swipe up</b> to hop<br><small>swipe sideways to dodge · reach the 🥣 bowl</small>'; document.body.appendChild(c); SV.coached = 1; save(); const kill = () => { c.classList.add('out'); setTimeout(() => c.remove(), 400); removeEventListener('pointerdown', kill); }; setTimeout(() => addEventListener('pointerdown', kill), 300); setTimeout(kill, 6000); }
  paused = false;
}
function updHud() { /* V33: HUD pills, hearts and the progress bar to the bowl */
  $('hfish').textContent = '🐟 ' + G.fish + '/' + G.fishTotal; $('hlives').textContent = '❤️'.repeat(Math.max(0, G.lives)) + '🖤'.repeat(Math.max(0, 3 - G.lives)); $('hlives').classList.toggle('last', G.lives === 1);
  $('progf').style.width = Math.round(G.maxR / (G.rows - 1) * 100) + '%';
}

function camClamp(v) { const half = CH / 2 / U; if (G.rows <= half * 2) return G.rows / 2; return clamp(v, half, G.rows - half); }
/* ---------- lane helpers ---------- */
const laneAt = r => G.lanes[clamp(Math.round(r), 0, G.rows - 1)];
function objX(l, o) { const p = l.period; let x = (o.x + l.dir * l.speed * l.t) % p; if (x < 0) x += p; return x - SPAN_PAD - 1 + (COLS + 2 * SPAN_PAD + 2 - p) * 0 ; }
function objCenter(l, o) { const p = Math.max(l.period, COLS + 2 * SPAN_PAD), off = (o.x + l.dir * l.speed * l.t); let x = ((off % p) + p) % p; return x - SPAN_PAD + o.w / 2; }
function wrapPeriod(l) { return Math.max(l.period, COLS + 2 * SPAN_PAD); }
function turtleDown(o, t) { return o.dive && ((t * .35 + o.ph) % 3) > 2.1; }   // submerged for part of the cycle
function turtleWarn(o, t) { return o.dive && ((t * .35 + o.ph) % 3) > 1.7 && ((t * .35 + o.ph) % 3) <= 2.1; }
function trainState(l) {                                           // returns {warn, x0, x1} for a rail lane
  const c = l.cycle, ph = l.t % c, warn = ph > c - 1.7, run = (l.len + COLS + 2) / l.speed, since = ph - (c - 1.7);
  let x0 = null;
  if (ph > c - 1.7 + .0) { /* warning phase */ }
  const tr = (l.t % (c + run)) ;
  // train runs during the last "run" seconds of an extended cycle
  const cyc = c + run, q = l.t % cyc, tw = q > c - 1.7 && q < c;     // warning window
  const k = (q - c) / run;
  if (q >= c) { const px = k * (COLS + 2 + l.len); x0 = l.dir > 0 ? -l.len - 1 + px : COLS + 1 - px; }
  return { warn: tw, x0, x1: x0 === null ? null : x0 + l.len, k: q >= c ? k : -1 };
}

/* ---------- movement ---------- */
let queued = null;
function tryHop(dx, dr) {
  if (!G || G.state !== 'play' || paused || !P.alive) return;
  if (P.hop < 1) { queued = [dx, dr]; return; }
  const ln = laneAt(P.r);
  let nx = P.x + dx, nr = P.r + dr;
  if (dx !== 0 && ln.type !== 'river' && ln.type !== 'belt') nx = Math.round(P.x) + dx;
  if (dr !== 0 && laneAt(nr) && laneAt(nr).type !== 'river' && laneAt(nr).type !== 'belt') nx = Math.round(P.x);
  if (nr < 0 || nr > G.rows - 1 || nx < -.1 || nx > COLS - .9) { P.bump = 1; sfx.bump(); return; }
  const tl = laneAt(nr);
  if ((tl.type === 'grass' || tl.type === 'ice' || tl.type === 'goal') && tl.obs.some(o => o.c === Math.round(nx))) { P.bump = 1; P.face = dx || P.face; sfx.bump(); return; }
  for (const dg of G.dogs) if (dg.r === nr && Math.abs(dg.x - nx) < .6) { P.bump = 1; return; }
  startHop(nx, nr, dx);
}
function startHop(nx, nr, dx) {
  P.hx = P.x; P.hr = P.r; P.tx = nx; P.tr = nr; P.hop = 0; P.riding = null; P.slide = (dx !== 0 && laneAt(nr).type === 'ice') ? dx : 0;
  if (dx) P.face = dx; P.idle = 0; G.hops++; sfx.hop(); vib(4); P.sq = 1; if (hawk) hawk = null;
}
function land() {
  P.x = P.tx; P.r = P.tr; P.hop = 1; P.sq = -1;
  const ln = laneAt(P.r);
  // V23: dust puffs on landing
  for (let i = 0; i < 5; i++) addP(P.x + .5, P.r + .15, (Math.random() - .5) * 1.4, Math.random() * .8, .35, ln.type === 'river' ? '#ffffff' : '#fff6d8', 'dust');
  if (G.th.part === 'snow' && (ln.type === 'grass' || ln.type === 'ice')) { (G.prints || (G.prints = [])).push([P.x + .5, P.r + .2, P.face]); if (G.prints.length > 14) G.prints.shift(); }
  if (P.r > G.maxR) { G.maxR = P.r; updHud(); }
  if (ln.type === 'grass' || ln.type === 'ice') { G.cp = P.r; }
  if (ln.type === 'grass' || ln.type === 'ice' || ln.type === 'goal') P.x = Math.round(P.x) === P.x ? P.x : (P.slide ? P.x : P.x);
  if (ln.type === 'river') {
    const hit = ln.objs.find(o => !(o.k === 'turtle' && turtleDown(o, G.t)) && Math.abs(objCenter(ln, o) + (o.w / 2 - o.w / 2) - (P.x + .5)) < o.w / 2 + .2);
    if (hit) { P.riding = { o: hit, off: (P.x + .5) - objCenter(ln, hit) }; addRing(P.x + .5, P.r + .45); } else return die('water');
  } else if (ln.type === 'ice' && P.slide) {
    const nx = P.x + P.slide;
    if (nx >= 0 && nx <= COLS - 1 && !ln.obs.some(o => o.c === Math.round(nx))) { sfx.slide(); P.tx = nx; P.tr = P.r; P.hx = P.x; P.hr = P.r; P.hop = 0; P.hopSlide = 1; return; }
    P.slide = 0;
  }
  for (const f of ln.fish) if (!f.got && Math.abs(f.c - Math.round(P.x)) < .6) { f.got = 1; G.fish++; popTxt('+10', P.x + .5, P.r + 1, '#ffd84a'); sfx.coin(); vib(8); updHud(); for (let i = 0; i < 8; i++) addP(f.c + .5, P.r + .5, (Math.random() - .5) * 3, Math.random() * 2.5, .5, '#ffd84a', 'spark'); }
  if (ln.type === 'goal') return win();
  if (queued) { const q = queued; queued = null; tryHop(q[0], q[1]); }
}
function die(kind) {
  if (!P.alive || G.state !== 'play') return;
  P.alive = 0; G.state = 'dead'; G.slow = .35; G.dt = 0; G.lives--; G.lost++; G.kind = kind; shake = .6; flash = 1; vib([40, 30, 40]);
  P.riding = null;
  if (kind === 'water') { sfx.splash(); for (let i = 0; i < 16; i++) addP(P.x + .5, P.r + .5, (Math.random() - .5) * 4, 1.5 + Math.random() * 3, .7, '#cfeeff', 'drop'); addRing(P.x + .5, P.r + .5); }  // V17
  else if (kind === 'train') { sfx.splat(); for (let i = 0; i < 14; i++) addP(P.x + .5, P.r + .5, (Math.random() - .5) * 6, Math.random() * 3, .7, '#ff8fa3', 'spark'); }
  else { sfx.splat(); for (let i = 0; i < 10; i++) addP(P.x + .5, P.r + .5, (Math.random() - .5) * 3, Math.random() * 2, .6, '#ffffff', 'spark'); } // V24
  updHud(); const h = $('hlives'); h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump');
}
function respawn() {
  P.x = P.tx = P.hx = 3; P.r = P.tr = P.hr = G.cp; P.hop = 1; P.alive = 1; P.sq = 0; P.idle = 0; P.riding = null; G.state = 'play';
  const ln = laneAt(P.r); if (ln.obs && ln.obs.some(o => o.c === 3)) { const f = ln.free[0]; P.x = P.tx = P.hx = f; }
}
function win() {
  G.time = G.t; const bt = (SV.best || (SV.best = {}))[G.L]; G.newBest = !bt || G.time < bt; if (G.newBest) SV.best[G.L] = Math.round(G.time * 10) / 10;
  G.state = 'win'; G.dt = 0; const L = G.L, noLoss = G.lost === 0, many = G.fishTotal === 0 || G.fish >= Math.ceil(G.fishTotal * .6), stars = 1 + (noLoss ? 1 : 0) + (many ? 1 : 0);
  sfx.win(); vib([30, 40, 30]);
  for (let i = 0; i < 60; i++) addP(laneAt(G.rows - 1).bowl + .5, G.rows - .5, (Math.random() - .5) * 8, 2 + Math.random() * 6, 1.4, ['#ffd84a', '#ff77b7', '#6ee7ff', '#9fe870', '#c08bff'][i % 5], 'conf'); // V28
  G.stars = stars;
  SV.stars[L] = Math.max(SV.stars[L] || 0, stars); SV.at = Math.max(SV.at, L); SV.fish += G.fish; save();
}

/* ---------- particles / pops ---------- */
function addP(x, y, vx, vy, life, col, type) { if (parts.length > 220) return; parts.push({ x, y, vx, vy, l: 0, m: life, c: col, t: type, r: Math.random() * TAU }); }
function addRing(x, y) { parts.push({ x, y, vx: 0, vy: 0, l: 0, m: .6, c: '#ffffff', t: 'ring', r: 0 }); }
function popTxt(s, x, y, c) { pops.push({ s, x, y, c, l: 0 }); }   // V27

/* ---------- update ---------- */
function update(dt) {
  if (G && G.slow > 0) { G.slow -= dt; dt *= .3; }
  clock += dt;
  if (!G || paused) return;
  if (G.state === 'play' || G.state === 'dead' || G.state === 'win') G.t += dt;
  for (const l of G.lanes) l.t += dt;
  for (const dg of G.dogs) { dg.x += dg.dir * dg.sp * dt; if (dg.x < 0) { dg.x = 0; dg.dir = 1; } if (dg.x > COLS - 1) { dg.x = COLS - 1; dg.dir = -1; } }
  if (G.state === 'play') {
    // hop animation
    if (P.hop < 1) {
      P.hop = Math.min(1, P.hop + dt / (P.hopSlide ? .07 : HOP));
      if (P.hop >= 1) { const sl = P.hopSlide; P.hopSlide = 0; land(); }
    } else {
      const ln = laneAt(P.r);
      if (P.riding) { const o = P.riding.o; if (o.k === 'turtle' && turtleDown(o, G.t)) die('water'); else { P.x = objCenter(ln, o) + P.riding.off - .5; if (P.x < -.5 || P.x > COLS - .5) die('carried'); } }
      if (ln.type === 'belt') { P.x += ln.speed * dt; if (P.x < -.5 || P.x > COLS - .5) die('carried'); }
      else if (ln.type === 'grass' || ln.type === 'ice') { const tx = Math.round(P.x); P.x += (tx - P.x) * Math.min(1, dt * 14); }
      P.idle += dt;
      if (G.L >= 6 && !hawk && P.idle > 5.5 && P.r < G.rows - 1) { hawk = { t: 0 }; sfx.caw(); }   // V36, X4 hawk cry
      if (hawk) { hawk.t += dt; if (hawk.t > 2.2) { die('hawk'); hawk = null; } }
    }
    // hazards: cars, trains, dogs (continuous, uses the cat's interpolated position)
    const cr = P.hop < 1 ? P.hr + (P.tr - P.hr) * P.hop : P.r, cx = (P.hop < 1 ? P.hx + (P.tx - P.hx) * P.hop : P.x) + .5;
    for (const r of [Math.floor(cr + .3), Math.ceil(cr - .3)]) {
      const ln = G.lanes[r]; if (!ln) continue;
      if (Math.abs(r - cr) > .7) continue;
      if (ln.type === 'road') for (const o of ln.objs) { const gap = Math.abs(objCenter(ln, o) - cx) - o.w / 2; if (gap < .22) { die('car'); break; } if (gap < .5 && Math.abs(r - cr) < .3 && !o.nm) { o.nm = 1; setTimeout(() => o.nm = 0, 1500); if (P.alive && G.state === 'play') popTxt('close!', cx - .5, r + 1.2, '#ff9fd0'); sfx.whoosh(); } }
      if (ln.type === 'rail') { const ts = trainState(ln); if (ts.x0 !== null && cx > ts.x0 - .1 && cx < ts.x1 + .1) die('train'); }
      if (ln.type === 'river' && P.hop >= 1 && !P.riding) die('water');
    }
    for (const dg of G.dogs) if (Math.abs(dg.r - cr) < .6 && Math.abs(dg.x + .5 - cx) < .55) die('dog');
    // rail bells while warning
    for (const l of G.lanes) if (l.type === 'rail') { const ts = trainState(l); if (ts.k >= 0 && ts.k < .05 && !l.honked && Math.abs(l.r - P.r) < 6) { l.honked = 1; sfx.honk(); } if (ts.k < 0) l.honked = 0; if (ts.warn && Math.abs(l.r - P.r) < 8 && Math.floor(G.t * 6) !== Math.floor((G.t - dt) * 6)) sfx.bell(); }
    camTgt = camClamp(P.r + (P.hop < 1 ? (P.tr - P.r) * P.hop : 0) + 2.2);  // V32: look-ahead
  } else if (G.state === 'dead') {
    G.dt += dt; if (G.dt > .9) { if (G.lives <= 0) { G.state = 'over'; showLose(); } else { respawn(); } }
  } else if (G.state === 'win') { G.dt += dt; if (G.dt > 1.1 && !G.shown) { G.shown = 1; showWin(); } }
  camR += (camTgt - camR) * Math.min(1, dt * 6);
  shake *= Math.pow(.02, dt); flash = Math.max(0, flash - dt * 2.4); fade = Math.max(0, fade - dt * 1.6);
  P.sq *= Math.pow(.001, dt); P.bump = Math.max(0, P.bump - dt * 5); P.blink = (clock % 3.2) < .12 ? 1 : 0;
  for (const c of clouds) { c.x += c.sp * dt; if (c.x > COLS + 3) c.x = -4; }
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.l += dt; if (p.l >= p.m) { parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; if (p.t !== 'ring') p.vy -= (p.t === 'conf' ? 7 : 9) * dt; }
  for (let i = pops.length - 1; i >= 0; i--) { pops[i].l += dt; pops[i].y += dt * 1.2; if (pops[i].l > 1) pops.splice(i, 1); }
  for (const q of PRT) { q.p += dt; q.y -= (G.th.part === 'snow' || G.th.part === 'rain' || G.th.part === 'leaf' || G.th.part === 'petal' || G.th.part === 'sand' ? 1 : -.4) * q.s * dt * (G.th.part === 'rain' ? 6 : 1); if (G.th.part === 'ember' || G.th.part === 'bubble' || G.th.part === 'sparkle' || G.th.part === 'firefly') { q.y += q.s * dt * .5; } if (q.y < -1) q.y = G.rows + 2; if (q.y > G.rows + 3) q.y = -1; }
}

/* ---------- rendering helpers ---------- */
const sx = x => OX + x * U;
const syTop = r => CH / 2 - (r + 1 - camR) * U;
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
function shadeCol(hex, k) { const n = parseInt(hex.slice(1), 16), r = clamp(((n >> 16) & 255) + k, 0, 255), g = clamp(((n >> 8) & 255) + k, 0, 255), b = clamp((n & 255) + k, 0, 255); return 'rgb(' + r + ',' + g + ',' + b + ')'; }

/* V3/V4/V5/V39/V40: grass with checker tones, blades, flowers and a beveled edge */
function drawGrass(l, y, th) {
  const r = l.r;
  for (let c = -6; c < COLS + 6; c++) { ctx.fillStyle = ((c + r) & 1) ? th.g1 : th.g2; ctx.fillRect(sx(c), y, U + 1, U + 1); }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, y, CW, 2); ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.fillRect(0, y + U - 2, CW, 2);                   // V39 bevel
  for (let i = 0; i < 18; i++) {                                                                                                                              // V4 grass blades (sway V40)
    const bx = sx(-5 + hsh(r * 31 + i) * (COLS + 10)), by = y + U * (.15 + hsh(r * 17 + i * 3) * .75), sw = REDUCED ? 0 : Math.sin(clock * 2 + i + r) * 1.5;
    ctx.strokeStyle = 'rgba(0,0,0,.13)'; ctx.lineWidth = Math.max(1, U * .035); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + sw, by - U * .13); ctx.stroke();
  }
  if (th.deco !== 'rock' && th.deco !== 'lamp') for (let i = 0; i < 4; i++) { const fx = sx(-2 + hsh(r * 7 + i * 5) * (COLS + 4)), fy = y + U * (.2 + hsh(r * 3 + i) * .6); ctx.fillStyle = ['#fff176', '#ff8fc7', '#ffffff', '#b388ff'][Math.floor(hsh(r + i * 9) * 4)]; ctx.beginPath(); ctx.arc(fx, fy, U * .045, 0, TAU); ctx.fill(); }  // V5 flowers
}
/* V6: themed obstacles with soft shadows */
function drawProp(kind, deco, cx, y, v) {
  const b = y + U * .88, sw = REDUCED ? 0 : Math.sin(clock * 1.5 + cx) * U * .02;
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(cx, b, U * .32, U * .1, 0, 0, TAU); ctx.fill();
  const col = (a, c) => { ctx.fillStyle = a; return c; };
  if (deco === 'tree') { ctx.fillStyle = '#7a4a22'; ctx.fillRect(cx - U * .06, b - U * .4, U * .12, U * .4); ctx.fillStyle = '#2f8a3c'; ctx.beginPath(); ctx.arc(cx + sw, b - U * .6, U * .3, 0, TAU); ctx.fill(); ctx.fillStyle = '#3fa24d'; ctx.beginPath(); ctx.arc(cx - U * .08 + sw, b - U * .68, U * .16, 0, TAU); ctx.fill(); }
  else if (deco === 'cactus') { ctx.fillStyle = '#3f9a4a'; rr(ctx, cx - U * .08, b - U * .7, U * .16, U * .7, U * .08); ctx.fill(); rr(ctx, cx + U * .08, b - U * .5, U * .2, U * .1, U * .05); ctx.fill(); rr(ctx, cx + U * .2, b - U * .6, U * .09, U * .2, U * .04); ctx.fill(); }
  else if (deco === 'pine') { ctx.fillStyle = '#6b4a2b'; ctx.fillRect(cx - U * .05, b - U * .25, U * .1, U * .25); for (let i = 0; i < 3; i++) { ctx.fillStyle = i ? '#2f8a5c' : '#e8f6ff'; ctx.beginPath(); ctx.moveTo(cx + sw, b - U * (.95 - i * .0)); ctx.moveTo(cx + sw, b - U * (.9 - i * .2)); ctx.lineTo(cx - U * (.18 + i * .08), b - U * (.3 + i * .15)); ctx.lineTo(cx + U * (.18 + i * .08), b - U * (.3 + i * .15)); ctx.fill(); } }
  else if (deco === 'lolli') { ctx.fillStyle = '#fff'; ctx.fillRect(cx - U * .03, b - U * .5, U * .06, U * .5); ctx.fillStyle = '#ff5fa8'; ctx.beginPath(); ctx.arc(cx + sw, b - U * .6, U * .26, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = U * .05; ctx.beginPath(); ctx.arc(cx + sw, b - U * .6, U * .14, 0, TAU * .8); ctx.stroke(); }
  else if (deco === 'rock') { ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.moveTo(cx - U * .3, b); ctx.lineTo(cx - U * .2, b - U * .4); ctx.lineTo(cx + U * .05, b - U * .5); ctx.lineTo(cx + U * .3, b - U * .2); ctx.lineTo(cx + U * .3, b); ctx.fill(); ctx.fillStyle = '#ff6a2a'; ctx.beginPath(); ctx.arc(cx - U * .02, b - U * .3, U * .06, 0, TAU); ctx.fill(); }
  else if (deco === 'dead') { ctx.strokeStyle = '#4a3a30'; ctx.lineWidth = U * .09; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, b); ctx.lineTo(cx + sw, b - U * .6); ctx.moveTo(cx + sw, b - U * .4); ctx.lineTo(cx + U * .2, b - U * .6); ctx.moveTo(cx + sw, b - U * .3); ctx.lineTo(cx - U * .2, b - U * .5); ctx.stroke(); }
  else if (deco === 'palm') { ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = U * .1; ctx.beginPath(); ctx.moveTo(cx, b); ctx.quadraticCurveTo(cx + U * .1, b - U * .4, cx + sw, b - U * .7); ctx.stroke(); ctx.fillStyle = '#2fa84f'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .6 + sw * .02; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * U * .2, b - U * .72 + Math.sin(a) * U * .2, U * .22, U * .07, a, 0, TAU); ctx.fill(); } }
  else if (deco === 'umbrella') { ctx.fillStyle = '#fff'; ctx.fillRect(cx - U * .02, b - U * .65, U * .04, U * .65); ctx.fillStyle = v ? '#ff6b6b' : '#ffd84a'; ctx.beginPath(); ctx.arc(cx, b - U * .65, U * .32, Math.PI, 0); ctx.fill(); }
  else if (deco === 'lamp') { ctx.fillStyle = '#2a2f55'; ctx.fillRect(cx - U * .03, b - U * .8, U * .06, U * .8); ctx.fillStyle = '#2fffe0'; ctx.shadowColor = '#2fffe0'; ctx.shadowBlur = U * .4; ctx.beginPath(); ctx.arc(cx, b - U * .85, U * .1, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; }
  else { ctx.fillStyle = '#ffd84a'; ctx.shadowColor = '#ffb000'; ctx.shadowBlur = U * .2; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * TAU / 10, rd = i % 2 ? U * .13 : U * .3; ctx.lineTo(cx + Math.cos(a) * rd, b - U * .5 + Math.sin(a) * rd); } ctx.fill(); ctx.shadowBlur = 0; }
}
/* V7/V8/V9: asphalt with dashes, edge lines, speckles and crosswalk bars */
function drawRoad(l, y, th) {
  ctx.fillStyle = th.road; ctx.fillRect(0, y, CW, U + 1);
  for (let i = 0; i < 26; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (hsh(l.r * 13 + i) * .07) + ')'; ctx.fillRect(hsh(l.r * 5 + i * 3) * CW, y + hsh(l.r * 9 + i) * U, 2, 2); }   // V8
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, y + 1, CW, 2); ctx.fillRect(0, y + U - 3, CW, 2);
  ctx.fillStyle = 'rgba(255,230,120,.55)'; for (let x = -1; x < CW / U + 2; x++) ctx.fillRect(OX % (U * 1.5) + x * U * 1.5, y + U / 2 - 1.5, U * .7, 3);
  if (hsh(l.r * 3.3) < .22) { ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 6; i++) ctx.fillRect(sx(.5 + i * 1.2), y + 4, U * .5, U - 8); }          // V9 zebra
}
/* V13/V16: water with moving waves, shore foam and glints */
function drawWater(l, y, th) {
  const g = ctx.createLinearGradient(0, y, 0, y + U); g.addColorStop(0, th.water); g.addColorStop(1, th.deep); ctx.fillStyle = g; ctx.fillRect(0, y, CW, U + 1);
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = Math.max(1, U * .035);
  for (let i = 0; i < 9; i++) { const wx = ((i * U * 1.9 + clock * U * .5 * l.dir + l.r * 37) % (CW + U * 2)) - U; const wy = y + U * (.25 + (i % 3) * .25); ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + U * .2, wy - U * .08, wx + U * .4, wy); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, y, CW, 3); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(0, y + U - 3, CW, 3);                                          // foam edges
  if (th.lava) { ctx.fillStyle = 'rgba(255,220,100,.35)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(((i * 211 + clock * 18 + l.r * 97) % (CW + 40)) - 20, y + U * (.2 + hsh(i + l.r) * .6), U * .06, 0, TAU); ctx.fill(); } }
  for (let i = 0; i < 3 && !REDUCED; i++) { const a = (Math.sin(clock * 3 + i * 2 + l.r) + 1) / 2; ctx.fillStyle = 'rgba(255,255,255,' + (a * .6) + ')'; ctx.fillRect(sx(hsh(l.r + i * 3.1) * COLS), y + U * (.2 + hsh(l.r * 2 + i) * .6), 2, 2); }   // V40 glints
}
/* V18: rails with ties, signal lights and a long train with windows and smoke */
function drawRail(l, y, th) {
  drawGravel(l, y, th);
  ctx.fillStyle = '#5a4630'; for (let x = -1; x < CW / (U * .35) + 1; x++) ctx.fillRect(x * U * .35, y + U * .18, U * .14, U * .64);
  ctx.fillStyle = '#c9ced8'; ctx.fillRect(0, y + U * .3, CW, U * .06); ctx.fillRect(0, y + U * .64, CW, U * .06);
  const ts = trainState(l);
  const on = ts.warn && Math.floor(clock * 6) % 2 === 0;
  for (const side of [0, 1]) { const lx = side ? sx(COLS) + U * .25 : sx(0) - U * .25; ctx.fillStyle = '#333'; ctx.fillRect(lx - 2, y + U * .15, 4, U * .5); ctx.fillStyle = on === !!side || (ts.warn && !on === !side) ? '#ff2d2d' : '#5a1a1a'; if (ts.warn) { ctx.shadowColor = '#ff2d2d'; ctx.shadowBlur = U * .3; } ctx.beginPath(); ctx.arc(lx, y + U * .2, U * .07, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; }
  if (ts.warn) { ctx.fillStyle = 'rgba(255,60,60,' + (.12 + .1 * Math.sin(clock * 12)) + ')'; ctx.fillRect(sx(0), y, COLS * U, U); }
  if (ts.x0 !== null) {
    const x0 = sx(ts.x0), w = l.len * U, d = l.dir;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x0, y + U * .8, w, U * .08);
    const cars = Math.max(1, Math.floor(l.len / 2));
    for (let i = 0; i < cars; i++) { const cx0 = x0 + (d > 0 ? (cars - 1 - i) : i) * (w / cars), isHead = i === 0; const ww = w / cars - 3;
      ctx.fillStyle = isHead ? '#d83a3a' : '#e8e8ee'; rr(ctx, cx0, y + U * .1, ww, U * .78, U * .1); ctx.fill(); ctx.fillStyle = '#2a3550'; for (let k = 0; k < 4; k++) ctx.fillRect(cx0 + ww * (.1 + k * .22), y + U * .22, ww * .14, U * .25);
      ctx.fillStyle = '#3a3f50'; ctx.fillRect(cx0, y + U * .72, ww, U * .1); }
    ctx.fillStyle = '#ffe98a'; ctx.beginPath(); const hx = d > 0 ? x0 + w : x0; ctx.arc(hx, y + U * .5, U * .09, 0, TAU); ctx.fill();
    for (let i = 0; i < 3; i++) addSmoke(ts.x0 + (d > 0 ? l.len - 1 : 1), l.r + 1);
  }
}
function drawGravel(l, y, th) { ctx.fillStyle = shadeCol(th.road, 18); ctx.fillRect(0, y, CW, U + 1); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(0,0,0,' + (hsh(l.r * 3 + i) * .18) + ')'; ctx.fillRect(hsh(l.r * 5 + i * 3) * CW, y + hsh(l.r * 9 + i * 2) * U, 3, 2); } }
function addSmoke(x, y) { if (Math.random() < .08) addP(x, y - .3, (Math.random() - .5) * .6, .8, 1, '#dddddd', 'smoke'); }
/* V19: glossy ice with sparkles; V20: animated conveyor chevrons */
function drawIce(l, y, th) {
  const g = ctx.createLinearGradient(0, y, 0, y + U); g.addColorStop(0, '#d6f2ff'); g.addColorStop(1, '#a8dcf5'); ctx.fillStyle = g; ctx.fillRect(0, y, CW, U + 1);
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const ix = sx(hsh(l.r * 4 + i) * COLS); ctx.beginPath(); ctx.moveTo(ix, y + U * .8); ctx.lineTo(ix + U * .5, y + U * .2); ctx.stroke(); }
  for (let i = 0; i < 4 && !REDUCED; i++) { const a = Math.max(0, Math.sin(clock * 2.5 + i * 1.7 + l.r)); ctx.fillStyle = 'rgba(255,255,255,' + a + ')'; ctx.fillRect(sx(hsh(l.r + i) * COLS), y + U * hsh(l.r * 2 + i), 3, 3); }
}
function drawBelt(l, y) {
  ctx.fillStyle = '#4a4f60'; ctx.fillRect(0, y, CW, U + 1); ctx.fillStyle = '#2a2d3a'; ctx.fillRect(0, y, CW, U * .12); ctx.fillRect(0, y + U * .88, CW, U * .12);
  ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = U * .09; ctx.lineJoin = 'round'; const off = (clock * U * 1.4 * Math.sign(l.speed)) % (U * .8);
  for (let x = -2; x < CW / (U * .8) + 2; x++) { const bx = x * U * .8 + off, d = Math.sign(l.speed); ctx.beginPath(); ctx.moveTo(bx - d * U * .1, y + U * .3); ctx.lineTo(bx + d * U * .12, y + U * .5); ctx.lineTo(bx - d * U * .1, y + U * .7); ctx.stroke(); }
}
/* V10: vehicles (car, truck, bus, bike, police) with windows, wheels, headlights and shadows (V12) */
function drawVeh(o, cx, y, dir, night) {
  const w = o.w * U, x = cx * 1 - w / 2, h = U * .62, top = y + U * .2, f = dir;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx, top + h + U * .04, w * .5, U * .07, 0, 0, TAU); ctx.fill();
  const wheel = wx => { ctx.fillStyle = '#1a1a20'; ctx.beginPath(); ctx.arc(wx, top + h - U * .02, U * .1, 0, TAU); ctx.fill(); ctx.fillStyle = '#aaa'; ctx.beginPath(); ctx.arc(wx, top + h - U * .02, U * .04, 0, TAU); ctx.fill(); };
  if (o.k === 'bike') {
    ctx.strokeStyle = o.c; ctx.lineWidth = U * .06; ctx.beginPath(); ctx.arc(x + w * .2, top + h - U * .1, U * .12, 0, TAU); ctx.arc(x + w * .8, top + h - U * .1, U * .12, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w * .2, top + h - U * .1); ctx.lineTo(x + w * .5, top + U * .2); ctx.lineTo(x + w * .8, top + h - U * .1); ctx.stroke(); ctx.fillStyle = '#ffcba4'; ctx.beginPath(); ctx.arc(x + w * .5, top + U * .1, U * .09, 0, TAU); ctx.fill(); ctx.fillStyle = o.c; ctx.fillRect(x + w * .42, top + U * .18, U * .14, U * .22);
    return;
  }
  const body = o.k === 'police' ? '#f4f4f4' : o.c;
  ctx.fillStyle = body; rr(ctx, x, top + h * .3, w, h * .7, U * .1); ctx.fill();
  if (o.k === 'truck') { ctx.fillStyle = shadeCol(o.c.length === 7 ? o.c : '#888888', -30); ctx.fillRect(x + (f > 0 ? 0 : w * .35), top, w * .65, h * .7); ctx.fillStyle = body; rr(ctx, x + (f > 0 ? w * .66 : 0), top + h * .15, w * .34, h * .85, U * .08); ctx.fill(); }
  else if (o.k === 'bus') { ctx.fillStyle = body; rr(ctx, x, top, w, h, U * .12); ctx.fill(); ctx.fillStyle = '#bfe3ff'; for (let i = 0; i < 4; i++) ctx.fillRect(x + w * (.08 + i * .22), top + h * .15, w * .15, h * .3); }
  else { ctx.fillStyle = '#bfe3ff'; rr(ctx, x + w * (f > 0 ? .3 : .12), top + h * .05, w * .55, h * .4, U * .08); ctx.fill(); ctx.fillStyle = shadeCol('#bfe3ff', -50); ctx.fillRect(x + w * .5 - 1, top + h * .08, 2, h * .34); }
  if (o.k === 'police') { ctx.fillStyle = '#1d3a8a'; ctx.fillRect(x + U * .05, top + h * .62, w - U * .1, U * .07); const fl = Math.floor(clock * 8 + o.ph) % 2; ctx.fillStyle = fl ? '#ff3b3b' : '#3b6bff'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = U * .3; ctx.fillRect(x + w * .4, top + h * .02, w * .2, U * .07); ctx.shadowBlur = 0; }
  wheel(x + w * .22); wheel(x + w * .78);
  const hx = f > 0 ? x + w : x;
  ctx.fillStyle = '#fff7b0'; ctx.beginPath(); ctx.arc(hx - f * U * .04, top + h * .62, U * .05, 0, TAU); ctx.fill();
  if (night) { const g = ctx.createLinearGradient(hx, 0, hx + f * U * 2, 0); g.addColorStop(0, 'rgba(255,247,176,.45)'); g.addColorStop(1, 'rgba(255,247,176,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, top + h * .55); ctx.lineTo(hx + f * U * 2, top + h * .1); ctx.lineTo(hx + f * U * 2, top + h * 1.05); ctx.fill(); }   // V11
}
/* V14/V15: logs with rings, turtles with shells that dive, lily pads with flowers */
function drawPlat(o, cx, y, t) {
  const w = o.w * U, x = cx - w / 2;
  if (o.k === 'log') {
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx, y + U * .78, w * .5, U * .1, 0, 0, TAU); ctx.fill();
    const g = ctx.createLinearGradient(0, y + U * .2, 0, y + U * .8); g.addColorStop(0, '#c0884a'); g.addColorStop(1, '#8a5a2b'); ctx.fillStyle = g; rr(ctx, x, y + U * .2, w, U * .6, U * .3); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,10,.35)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + w * (.2 + i * .28), y + U * .28); ctx.lineTo(x + w * (.2 + i * .28) + U * .1, y + U * .72); ctx.stroke(); }
    for (const e of [x + U * .3, x + w - U * .3]) { ctx.fillStyle = '#e0b070'; ctx.beginPath(); ctx.ellipse(e, y + U * .5, U * .12, U * .26, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8a5a2b'; ctx.beginPath(); ctx.ellipse(e, y + U * .5, U * .06, U * .14, 0, 0, TAU); ctx.stroke(); }
  } else if (o.k === 'turtle') {
    const down = turtleDown(o, t), warn = turtleWarn(o, t), n = o.w;
    for (let i = 0; i < n; i++) { const tx = x + (i + .5) * U, bob = REDUCED ? 0 : Math.sin(clock * 3 + i + o.ph) * U * .02, a = down ? .25 : 1, sink = down ? U * .12 : warn ? U * .06 : 0; ctx.globalAlpha = a;
      ctx.fillStyle = warn && Math.floor(clock * 8) % 2 ? '#c8e06a' : '#3f9a5c'; ctx.beginPath(); ctx.ellipse(tx, y + U * .55 + bob + sink, U * .36, U * .26, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a7a44'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(tx + (k - 1) * U * .16, y + U * .55 + bob + sink, U * .07, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6dbf7a'; ctx.beginPath(); ctx.arc(tx + o.w * 0 + U * .36 * (o.dir || 1), y + U * .5 + bob + sink, U * .1, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  } else {
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx, y + U * .6, U * .4, U * .3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4fbf5a'; ctx.beginPath(); ctx.arc(cx, y + U * .5, U * .36, .3, TAU - .3); ctx.lineTo(cx, y + U * .5); ctx.fill(); ctx.fillStyle = '#ff8fc7'; ctx.beginPath(); ctx.arc(cx - U * .08, y + U * .42, U * .08, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff176'; ctx.beginPath(); ctx.arc(cx - U * .08, y + U * .42, U * .03, 0, TAU); ctx.fill();
  }
}
/* V21/V22: the cat: blinking eyes, swaying tail, squash and stretch, hop arc and a facing tilt */
function drawCat(cx, cy, s, st) {
  const c = CAT, sc = s * c.s, face = P.face, sq = st.sq, k = 1 + sq * .22, sw = Math.sin(clock * 5) * .35;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc * (1 - sq * .12) * k * 0 + sc * (1 - sq * .1), sc * (1 + sq * .14));
  ctx.rotate(st.tilt || 0);
  const u = U;
  ctx.strokeStyle = c.body; ctx.lineWidth = u * .09; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-u * .15 * face, -u * .2); ctx.quadraticCurveTo(-u * .5 * face, -u * .2 + sw * u * .2, -u * .38 * face, -u * .55 + sw * u * .2); ctx.stroke();   // tail
  ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, -u * .22, u * .26, u * .22, 0, 0, TAU); ctx.fill();                                                            // body
  if (c.tux) { ctx.fillStyle = '#f2eaf6'; ctx.beginPath(); ctx.ellipse(0, -u * .17, u * .13, u * .15, 0, 0, TAU); ctx.fill(); }
  if (c.stripe) { ctx.strokeStyle = c.stripe; ctx.lineWidth = u * .04; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * u * .1, -u * .38); ctx.lineTo(i * u * .1, -u * .26); ctx.stroke(); } }
  ctx.fillStyle = c.body; ctx.beginPath(); ctx.arc(0, -u * .52, u * .22, 0, TAU); ctx.fill();                                                                                 // head
  for (const e of [-1, 1]) { ctx.beginPath(); ctx.moveTo(e * u * .09, -u * .68); ctx.lineTo(e * u * .24, -u * .88); ctx.lineTo(e * u * .24, -u * .6); ctx.fill(); ctx.fillStyle = '#ffb3c8'; ctx.beginPath(); ctx.moveTo(e * u * .13, -u * .68); ctx.lineTo(e * u * .21, -u * .8); ctx.lineTo(e * u * .21, -u * .64); ctx.fill(); ctx.fillStyle = c.body; }
  if (c.patch) { ctx.fillStyle = c.patch; ctx.beginPath(); ctx.arc(-u * .1, -u * .56, u * .09, 0, TAU); ctx.fill(); }
  ctx.fillStyle = c.collar; rr(ctx, -u * .16, -u * .34, u * .32, u * .06, u * .03); ctx.fill();                                                                                 // collar
  const dead = !st.alive;
  if (dead) { ctx.strokeStyle = '#111'; ctx.lineWidth = u * .03; for (const e of [-1, 1]) { ctx.beginPath(); ctx.moveTo(e * u * .13 - u * .04, -u * .56); ctx.lineTo(e * u * .13 + u * .04, -u * .5); ctx.moveTo(e * u * .13 + u * .04, -u * .56); ctx.lineTo(e * u * .13 - u * .04, -u * .5); ctx.stroke(); } }
  else for (const e of [-1, 1]) { const ex = e * u * .1 + face * u * .02; if (P.blink) { ctx.strokeStyle = '#111'; ctx.lineWidth = u * .03; ctx.beginPath(); ctx.moveTo(ex - u * .05, -u * .54); ctx.lineTo(ex + u * .05, -u * .54); ctx.stroke(); } else { ctx.fillStyle = c.eye; ctx.beginPath(); ctx.ellipse(ex, -u * .54, u * .06, u * .07, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(ex - u * .012 + face * u * .015, -u * .59, u * .024, u * .1); } }
  ctx.fillStyle = '#ff9fb4'; ctx.beginPath(); ctx.arc(0, -u * .46, u * .025, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; for (const e of [-1, 1]) for (const dy of [-.02, .02]) { ctx.beginPath(); ctx.moveTo(e * u * .1, -u * .46 + dy * u); ctx.lineTo(e * u * .3, -u * .46 + dy * u * 2.5); ctx.stroke(); }
  ctx.restore();
}
/* V29/V30/V38: ambient particles, cloud shadows and the night / tint overlay */
function drawAmbient(th) {
  for (const c of clouds) { ctx.fillStyle = th.night ? 'rgba(0,0,0,.0)' : 'rgba(0,0,0,.07)'; ctx.beginPath(); ctx.ellipse(sx(c.x), CH / 2 - (c.y - camR) * U, c.w * U * .5, U * .7, 0, 0, TAU); ctx.fill(); }
  for (const q of PRT) {
    const px = sx(q.x + (REDUCED ? 0 : Math.sin(q.p) * .3)), py = CH / 2 - (q.y - camR) * U; if (py < -10 || py > CH + 10) continue;
    switch (th.part) {
      case 'snow': ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(px, py, U * .035 * q.s, 0, TAU); ctx.fill(); break;
      case 'rain': ctx.strokeStyle = 'rgba(160,200,255,.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 2, py + U * .25); ctx.stroke(); break;
      case 'leaf': ctx.fillStyle = 'rgba(120,200,80,.75)'; ctx.save(); ctx.translate(px, py); ctx.rotate(q.p); ctx.fillRect(-3, -1.5, 6, 3); ctx.restore(); break;
      case 'petal': ctx.fillStyle = 'rgba(255,180,220,.85)'; ctx.beginPath(); ctx.ellipse(px, py, U * .05, U * .03, q.p, 0, TAU); ctx.fill(); break;
      case 'sand': ctx.fillStyle = 'rgba(255,230,160,.6)'; ctx.fillRect(px, py, 2, 2); break;
      case 'ember': ctx.fillStyle = 'rgba(255,150,50,' + (.5 + .4 * Math.sin(q.p * 3)) + ')'; ctx.beginPath(); ctx.arc(px, py, U * .03 * q.s, 0, TAU); ctx.fill(); break;
      case 'firefly': ctx.fillStyle = 'rgba(255,255,150,' + (.4 + .5 * Math.sin(q.p * 2)) + ')'; ctx.shadowColor = '#ffff96'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(px, py, U * .03, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; break;
      case 'bubble': ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(px, py, U * .05 * q.s, 0, TAU); ctx.stroke(); break;
      default: ctx.fillStyle = 'rgba(255,255,200,' + (.4 + .5 * Math.sin(q.p * 4)) + ')'; ctx.fillRect(px - 1, py - 4, 2, 8); ctx.fillRect(px - 4, py - 1, 8, 2);
    }
  }
  if (th.tint) { ctx.fillStyle = th.tint; ctx.fillRect(0, 0, CW, CH); }
  if (th.night) { ctx.fillStyle = 'rgba(8,6,40,.38)'; ctx.fillRect(0, 0, CW, CH); }
}
function drawHawk() {
  if (!hawk) return; const k = hawk.t / 2.2, x = sx(P.x + .5), y = CH / 2 - (P.r + .5 - camR) * U;
  ctx.fillStyle = 'rgba(0,0,0,' + (.15 + k * .3) + ')'; ctx.beginPath(); ctx.ellipse(x, y, U * (.2 + k * .6), U * (.1 + k * .3), 0, 0, TAU); ctx.fill();
  if (hawk.t > .2 && Math.floor(clock * 8) % 2) { ctx.fillStyle = '#ff3b3b'; ctx.font = '900 ' + Math.round(U * .6) + 'px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', x, y - U * .9); }   // V36
}
function drawParts() {
  for (const p of parts) {
    const k = p.l / p.m, x = sx(p.x), y = CH / 2 - (p.y - camR) * U;
    if (p.t === 'ring') { ctx.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, U * (.2 + k * .8), U * (.1 + k * .4), 0, 0, TAU); ctx.stroke(); continue; }
    ctx.globalAlpha = 1 - k; ctx.fillStyle = p.c;
    if (p.t === 'conf') { ctx.save(); ctx.translate(x, y); ctx.rotate(p.r + p.l * 8); ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
    else if (p.t === 'smoke') { ctx.beginPath(); ctx.arc(x, y, U * (.08 + k * .2), 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x, y, U * (p.t === 'drop' ? .05 : .04), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}

/* ---------- main render ---------- */
function render() {
  const th = G ? G.th : TH[0];
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = th.sky; ctx.fillRect(0, 0, CW, CH);
  if (!G) return;
  const shx = shake > .01 /* V25 screen shake */ ? (Math.random() - .5) * shake * U * .3 : 0, shy = shake > .01 ? (Math.random() - .5) * shake * U * .3 : 0;
  ctx.save(); ctx.translate(shx, shy);
  const r0 = Math.max(0, Math.floor(camR - CH / 2 / U) - 1), r1 = Math.min(G.rows - 1, Math.ceil(camR + CH / 2 / U) + 1);
  // lanes (bottom row of screen first so nearer rows overlap farther ones)
  for (let r = r0; r <= r1; r++) {
    const l = G.lanes[r], y = syTop(r);
    if (l.type === 'grass' || l.type === 'goal') drawGrass(l, y, th);
    else if (l.type === 'road') drawRoad(l, y, th);
    else if (l.type === 'river') drawWater(l, y, th);
    else if (l.type === 'rail') drawRail(l, y, th);
    else if (l.type === 'ice') drawIce(l, y, th);
    else if (l.type === 'belt') drawBelt(l, y);
  }
  if (G.prints) for (const [px, pr, f] of G.prints) { ctx.fillStyle = 'rgba(120,150,190,.35)'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx(px) + d * U * .08, CH / 2 - (pr - camR) * U, U * .05, U * .035, 0, 0, TAU); ctx.fill(); } }
  // objects, props, pickups, cat in row order (top rows first so lower rows overlap)
  ctx.save(); ctx.beginPath(); ctx.rect(OX - U * .5, 0, COLS * U + U, CH); ctx.clip();
  const catRow = P.hop < 1 ? P.hr + (P.tr - P.hr) * P.hop : P.r;
  const drawCatNow = () => {
    const cx = P.hop < 1 ? P.hx + (P.tx - P.hx) * P.hop : P.x, cr = catRow, arc = P.hop < 1 && !P.hopSlide ? Math.sin(P.hop * Math.PI) * .35 : (G.state === 'win' ? Math.abs(Math.sin(clock * 9)) * .3 : 0);
    const px = sx(cx + .5), py = CH / 2 - (cr - camR) * U - U * .08 - arc * U;
    ctx.fillStyle = 'rgba(0,0,0,' + (.28 - arc * .3) + ')'; ctx.beginPath(); ctx.ellipse(px, CH / 2 - (cr - camR) * U - U * .1, U * (.26 - arc * .2), U * .08, 0, 0, TAU); ctx.fill();   // shadow follows hop height
    const bump = P.bump ? Math.sin(P.bump * 12) * U * .05 : 0;
    if (!P.alive) { ctx.save(); ctx.translate(px, py + U * .08); ctx.scale(1.25, .35); ctx.translate(-px, -py - U * .08); drawCat(px, py + U * .08, 1, { sq: 0, alive: 0, tilt: 0 }); ctx.restore(); }          // V24 squish
    else drawCat(px + bump, py, 1, { sq: P.sq, alive: 1, tilt: P.hop < 1 ? P.face * .12 * Math.sin(P.hop * Math.PI) : 0 });
  };
  let catDone = false;
  for (let r = r1; r >= r0; r--) {
    const l = G.lanes[r], y = syTop(r);
    if (l.type === 'road') for (const o of l.objs) { const vx = sx(objCenter(l, o));
      if (l.speed > 2.6 && !REDUCED) { ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { const yy = y + U * (.35 + k * .15), x0 = vx - l.dir * o.w * U * .55; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 - l.dir * U * (.4 + k * .15) * (l.speed / 4), yy); ctx.stroke(); } }   // V31 speed streaks
      drawVeh(o, vx, y, l.dir, th.night); }
    else if (l.type === 'river') for (const o of l.objs) { o.dir = l.dir; drawPlat(o, sx(objCenter(l, o)), y, G.t); }
    else if (l.type === 'grass' || l.type === 'ice' || l.type === 'goal') {
      for (const ob of l.obs) drawProp('', th.deco, sx(ob.c + .5), y, ob.v);
      if (l.type === 'goal') drawBowl(sx(l.bowl + .5), y);
    }
    for (const f of l.fish) if (!f.got) drawFish(sx(f.c + .5), y + U * .5 + (REDUCED ? 0 : Math.sin(clock * 3 + f.ph) * U * .05), f.ph);   // V26
    for (const dg of G.dogs) if (dg.r === r) drawDog(sx(dg.x + .5), y, dg.dir);
    if (!catDone && catRow >= r - .5 && catRow < r + .5) { drawCatNow(); catDone = true; }
  }
  if (!catDone) drawCatNow();
  ctx.restore();
  // V1: lanes run past the board edges and the sides are dimmed (landscape)
  if (OX > 2) { ctx.fillStyle = 'rgba(10,6,40,.42)'; ctx.fillRect(0, 0, OX, CH); ctx.fillRect(OX + COLS * U, 0, CW - OX - COLS * U, CH); }
  drawParts(); drawHawk();
  ctx.restore();
  drawAmbient(th);
  for (const p of pops) { ctx.globalAlpha = 1 - p.l; ctx.fillStyle = p.c; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 4; ctx.font = '900 ' + Math.round(U * .42) + 'px system-ui'; ctx.textAlign = 'center'; const px = sx(p.x), py = CH / 2 - (p.y - camR) * U; ctx.strokeText(p.s, px, py); ctx.fillText(p.s, px, py); ctx.globalAlpha = 1; }   // V27
  // V29 vignette
  const vg = ctx.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * .35, CW / 2, CH / 2, Math.max(CW, CH) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,20,.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, CW, CH);
  if (flash > 0) { ctx.fillStyle = 'rgba(255,60,80,' + flash * .35 + ')'; ctx.fillRect(0, 0, CW, CH); }
  if (fade > 0) { ctx.fillStyle = 'rgba(10,6,40,' + fade + ')'; ctx.fillRect(0, 0, CW, CH); }
}
function drawFish(x, y, ph) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(clock * 2 + ph) * .15); ctx.shadowColor = '#ffd84a'; ctx.shadowBlur = U * .2;
  ctx.fillStyle = '#ffb23a'; ctx.beginPath(); ctx.ellipse(0, 0, U * .2, U * .12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(U * .16, 0); ctx.lineTo(U * .3, -U * .1); ctx.lineTo(U * .3, U * .1); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-U * .09, -U * .02, U * .03, 0, TAU); ctx.fill(); ctx.restore();
}
function drawDog(x, y, dir) {
  ctx.save(); ctx.translate(x, y + U * .85); ctx.scale(dir, 1); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, U * .3, U * .08, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#a8703a'; rr(ctx, -U * .28, -U * .42, U * .5, U * .26, U * .1); ctx.fill(); ctx.beginPath(); ctx.arc(U * .26, -U * .4, U * .15, 0, TAU); ctx.fill(); ctx.fillStyle = '#6a4220'; ctx.fillRect(U * .3, -U * .52, U * .08, U * .18); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(U * .3, -U * .43, U * .025, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#a8703a'; ctx.lineWidth = U * .07; const sw = Math.sin(clock * 14) * U * .06; ctx.beginPath(); ctx.moveTo(-U * .18, -U * .16); ctx.lineTo(-U * .18 + sw, 0); ctx.moveTo(U * .12, -U * .16); ctx.lineTo(U * .12 - sw, 0); ctx.stroke(); ctx.restore();
}
function drawBowl(x, y) {
  const b = y + U * .7, g = ctx.createRadialGradient(x, b - U * .2, 0, x, b - U * .2, U * .9); g.addColorStop(0, 'rgba(255,230,120,.7)'); g.addColorStop(1, 'rgba(255,230,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - U, y - U * .3, U * 2, U * 1.4);   // V28 glow
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, b + U * .08, U * .34, U * .09, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.ellipse(x, b - U * .08, U * .34, U * .12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - U * .34, b - U * .08); ctx.quadraticCurveTo(x, b + U * .3, x + U * .34, b - U * .08); ctx.fill();
  ctx.fillStyle = '#ff9d4a'; ctx.beginPath(); ctx.ellipse(x, b - U * .1, U * .27, U * .08, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - U * .08, b - U * .12, U * .04, 0, TAU); ctx.arc(x + U * .1, b - U * .1, U * .03, 0, TAU); ctx.fill();
  if (!REDUCED) for (let i = 0; i < 3; i++) { const k = ((clock * .8 + i / 3) % 1); ctx.strokeStyle = 'rgba(255,255,255,' + (.6 * (1 - k)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + (i - 1) * U * .14, b - U * .2 - k * U * .5); ctx.quadraticCurveTo(x + (i - 1) * U * .14 + U * .06, b - U * .3 - k * U * .5, x + (i - 1) * U * .14, b - U * .4 - k * U * .5); ctx.stroke(); }
}

/* ---------- UI: title grid, messages ---------- */
function buildGrid() {
  const g = $('lgrid'); g.innerHTML = '';
  const nextL = Math.min(LEVELS, SV.at + 1);
  for (let L = 1; L <= LEVELS; L++) {
    if ((L - 1) % 5 === 0) { const w = document.createElement('div'); w.className = 'wl'; w.textContent = TH[(L - 1) / 5].n; g.appendChild(w); }
    const b = document.createElement('button'), ok = L <= SV.at + 1, st = SV.stars[L] || 0;
    b.style.setProperty('--c', TH[Math.floor((L - 1) / 5)].g1 === '#eef7ff' ? '#8fd0f0' : TH[Math.floor((L - 1) / 5)].g1);
    b.innerHTML = (ok ? L : '🔒') + '<small>' + (st ? '★'.repeat(st) + '☆'.repeat(3 - st) : '') + '</small>';
    b.disabled = !ok; b.setAttribute('aria-label', 'Level ' + L + (ok ? '' : ' locked')); if (L === nextL) b.className = 'next';
    b.onclick = () => startLevel(L); g.appendChild(b);
  }
  $('bcont').textContent = SV.at >= LEVELS ? '★ All cleared! Replay level 50' : (SV.at ? '▶ Continue · Level ' + nextL : '▶ Play Level 1');
  $('bcont').onclick = () => startLevel(Math.min(LEVELS, nextL));
  $('tsub').textContent = 'Hop the roads, rails and rivers to the bowl · ' + SV.at + '/' + LEVELS + ' cleared · ★ ' + Object.values(SV.stars).reduce((a, b) => a + b, 0) + '/150 · 🐟 ' + SV.fish;
}
function showTitle() { if (G) G.state = 'title'; $('hud').hidden = true; $('deck').hidden = true; $('msg').classList.add('hide'); buildGrid(); $('title').classList.remove('hide'); const nx = $('lgrid').querySelector('.next'); if (nx) nx.scrollIntoView({ block: 'center' }); }
function msg(title, sub, stars, btns) {
  $('mt').textContent = title; $('ms').textContent = sub; const ms = $('mstars'); ms.innerHTML = stars == null ? '' : [1, 2, 3].map(k => '<i class="' + (k <= stars ? 'on' : '') + '" style="--k:' + k + '">★</i>').join('');
  const row = $('mb'); row.innerHTML = ''; setTimeout(() => { const b = row.querySelector('.on'); if (b) b.focus(); }, 50); btns.forEach(([l, f, on]) => { const b = document.createElement('button'); b.textContent = l; if (on) b.className = 'on'; b.onclick = f; row.appendChild(b); }); $('msg').classList.remove('hide');
}
function showWin() { /* V37: animated stars on the clear screen (CSS) */ const L = G.L; msg(L >= LEVELS ? 'All 50 roads crossed! 🏆' : 'Level clear! 🎉', G.title + '\n⏱ ' + G.time.toFixed(1) + ' s' + (G.newBest ? ' · new best!' : '  (best ' + SV.best[L] + ' s)') + '  ·  🐟 ' + G.fish + '/' + G.fishTotal + (G.lost ? '  ·  ' + G.lost + ' ✖' : '  ·  no crashes!'), G.stars, [L < LEVELS ? ['Next level ▶', () => startLevel(L + 1), 1] : ['Levels', showTitle, 1], ['Replay', () => startLevel(L)], ['Levels', showTitle]]); }
function showLose() { msg('Out of lives 😿', G.title + '\n' + ({ car: 'Squished by a vehicle', water: 'Fell in the water', train: 'Hit by a train', carried: 'Carried away', hawk: 'Snatched by a hawk', dog: 'Caught by a dog' }[G.kind] || ''), null, [['Try again', () => startLevel(G.L), 1], ['Levels', showTitle]]); }
function pause(on) { if (!G || G.state !== 'play') return; paused = on; $('bpause').textContent = on ? '▶' : '❚❚'; if (on) msg('Paused', G.title + '\n★ reach the bowl  ★ no crashes  ★ ' + Math.ceil(G.fishTotal * .6) + ' of ' + G.fishTotal + ' fish', null, [['Resume', () => pause(false), 1], ['Restart', () => startLevel(G.L)], ['Levels', showTitle]]); else $('msg').classList.add('hide'); }

/* ---------- input ---------- */
const KEYS = { ArrowUp: [0, 1], KeyW: [0, 1], Space: [0, 1], ArrowDown: [0, -1], KeyS: [0, -1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
addEventListener('keydown', e => { if (e.code === 'KeyR' && G && (G.state === 'play' || G.state === 'over')) { startLevel(G.L); return; } if (!$('msg').classList.contains('hide') && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); const b = $('mb').querySelector('.on') || $('mb').querySelector('button'); if (b) b.click(); return; } if (e.code === 'Enter' && G && G.state === 'title') { $('bcont').click(); return; } const k = KEYS[e.code]; if (k) { e.preventDefault(); tryHop(k[0], k[1]); } else if (e.code === 'Escape' || e.code === 'KeyP') pause(!paused); });
let sw = null;
cv.addEventListener('pointerdown', e => { sw = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; if (AC && AC.state === 'suspended') AC.resume(); });
cv.addEventListener('pointerup', e => {
  if (!sw || e.pointerId !== sw.id) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
  if (Math.hypot(dx, dy) < 22) tryHop(0, 1); else if (Math.abs(dx) > Math.abs(dy)) tryHop(dx > 0 ? 1 : -1, 0); else tryHop(0, dy < 0 ? 1 : -1);
});
cv.addEventListener('pointercancel', () => { sw = null; });
document.querySelectorAll('#pad button').forEach(b => { let rep = null; const stopRep = () => { clearInterval(rep); rep = null; }; b.addEventListener('pointerdown', () => { stopRep(); const v = { u: [0, 1], d: [0, -1], l: [-1, 0], r: [1, 0] }[b.dataset.d]; rep = setInterval(() => tryHop(v[0], v[1]), 190); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stopRep)); const d = b.dataset.d, v = { u: [0, 1], d: [0, -1], l: [-1, 0], r: [1, 0] }[d]; b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('dn'); tryHop(v[0], v[1]); }); const up = () => b.classList.remove('dn'); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up); });
$('bpause').onclick = () => pause(!paused);
function muteIcon() { $('bmute').textContent = SV.mute ? '🔇' : '🔊'; }
$('bmute').onclick = () => { SV.mute = SV.mute ? 0 : 1; save(); muteIcon(); try { CQMidi.mute(!!SV.mute); } catch (e) { } };
try { if (window.CQMidi && CQMidi.muted() && !SV.mute) { SV.mute = 1; muteIcon(); } else if (window.CQMidi && SV.mute) CQMidi.mute(true); } catch (e) { }
muteIcon();
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
addEventListener('blur', () => pause(true));
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

/* ---------- loop ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!paused) update(dt);
  if (G && G.state === 'play' && !paused) { const s = Math.floor(G.t); if (s !== G.shownT) { G.shownT = s; $('htime').textContent = '⏱ ' + s + 's'; } }
  render();
}
try { localStorage.setItem('cq_lastgame', 'cross2d'); } catch (_) {}
try { history.pushState({ c2: 1 }, ''); addEventListener('popstate', () => { if (G && G.state !== 'title') { paused = false; showTitle(); history.pushState({ c2: 1 }, ''); } else location.href = 'index.html'; }); } catch (_) {}
window.CR2 = { startLevel, genLevel, get G() { return G; }, P, tryHop, showTitle };
resize();
G = genLevel(SV.at >= LEVELS ? LEVELS : Math.max(1, SV.at + 1)); G.state = 'title'; camR = 4;
newClouds(); for (let i = 0; i < 40; i++) PRT.push({ x: Math.random() * COLS, y: Math.random() * 14, p: Math.random() * 6, s: .6 + Math.random() * .8 });
showTitle();
const q = +new URLSearchParams(location.search).get('level'); if (q >= 1 && q <= LEVELS) startLevel(q);
requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
})();
