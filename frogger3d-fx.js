// Cross Road 3D: second visual pass. Runs beside frogger3d.js and reads its state via window.CR.
// Game rules are untouched; this file only adds decoration, textures, overlays and particles.
const { THREE, scene, cam, R3, Z, frogG } = await new Promise(res => { const t = () => window.CR ? res(window.CR) : setTimeout(t, 10); t(); });

const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const COLS = 6;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BKEY = 'cf3-best';
let bestStart = 0; try { bestStart = +localStorage.getItem(BKEY) || 0; } catch (_) {}

// ---------- per-level palettes ----------
const PAL = [
  { road: '#4b5162', grass: '#8fd26a', water: '#2e8fd0', tint: 'rgba(255,255,255,0)' },
  { road: '#5a4e55', grass: '#c6d966', water: '#3a9ad0', tint: 'rgba(255,170,90,.10)' },
  { road: '#4a4560', grass: '#a7d98c', water: '#4a7fe0', tint: 'rgba(150,120,255,.12)' },
  { road: '#56485a', grass: '#9ed98f', water: '#4a9ac8', tint: 'rgba(255,120,160,.10)' },
  { road: '#3f4f57', grass: '#7fd69a', water: '#2a9ab0', tint: 'rgba(120,255,200,.10)' },
];
let P = PAL[0];

// ---------- procedural textures (canvas) ----------
function tex(w, h, draw, repeatX) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeatX || 1, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function speckle(g, w, h, n, a) {
  for (let i = 0; i < n; i++) {
    const v = Math.random() < .5 ? 0 : 255;
    g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (a * Math.random()) + ')';
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}
const T_ROAD = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#d4d4d4'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1500, .3);
  g.strokeStyle = 'rgba(0,0,0,.08)';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, rnd(0, h)); g.lineTo(w, rnd(0, h)); g.stroke(); }
}, 10);
const T_GRASS = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#e6e6e6'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1200, .25);
  g.strokeStyle = 'rgba(60,120,40,.18)';
  for (let i = 0; i < 160; i++) { const x = rnd(0, w), y = rnd(0, h); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 6)); g.stroke(); }
}, 10);
const T_WATER = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#c4d6de'; g.fillRect(0, 0, w, h); g.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = 'rgba(255,255,255,' + rnd(.4, .9) + ')';
    g.beginPath(); g.arc(rnd(0, w), rnd(0, h), rnd(6, 16), Math.PI * .1, Math.PI * .6); g.stroke();
  }
}, 6);
const T_BARK = tex(64, 128, (g, w, h) => {
  g.fillStyle = '#b77a45'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = Math.random() < .5 ? 'rgba(60,35,15,.3)' : 'rgba(255,220,170,.25)';
    const x = rnd(0, w); g.beginPath(); g.moveTo(x, 0);
    g.bezierCurveTo(x + rnd(-6, 6), h * .3, x + rnd(-6, 6), h * .7, x + rnd(-4, 4), h); g.stroke();
  }
}, 1);
const glowTex = (c0, c1) => tex(64, 64, g => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, c0); gr.addColorStop(.3, c1); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
const G_WARM = glowTex('rgba(255,250,200,1)', 'rgba(255,230,120,.5)');
const G_RED = glowTex('rgba(255,140,140,1)', 'rgba(255,60,60,.4)');
const G_SHADE = tex(64, 64, g => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
const T_DANGER = tex(64, 64, g => {
  g.fillStyle = '#ff4d6d'; g.beginPath(); g.arc(32, 32, 29, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.font = '900 42px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('!', 32, 35);
});
const smat = (map) => new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const SM_WARM = smat(G_WARM), SM_RED = smat(G_RED);

// ---------- shared geometry & materials ----------
const PUFF_G = new THREE.SphereGeometry(.1, 6, 5), RING_G = new THREE.RingGeometry(.3, .38, 24);
const FLOWER_G = new THREE.SphereGeometry(.09, 8, 6);
const TUFT_G = new THREE.ConeGeometry(.05, .24, 4), TUFT_M = new THREE.MeshStandardMaterial({ color: '#3f9e4a', roughness: .9 });
const CRACK_G = new THREE.BoxGeometry(.5, .01, .03), CRACK_M = new THREE.MeshBasicMaterial({ color: '#2e3340', transparent: true, opacity: .45 });
const REFL_G = new THREE.BoxGeometry(.08, .14, .08), REFL_M = new THREE.MeshStandardMaterial({ color: '#ffd84a', emissive: '#ffb300', emissiveIntensity: .4 });
const REED_G = new THREE.ConeGeometry(.05, .6, 5), REED_M = new THREE.MeshStandardMaterial({ color: '#5ba84a', roughness: .8 });
const STONE_G = new THREE.DodecahedronGeometry(.22), STONE_M = new THREE.MeshStandardMaterial({ color: '#8d939c', roughness: .95 });
const FOAM_M = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .35, depthWrite: false });
const WS_M = new THREE.MeshStandardMaterial({ color: '#e8f6ff', roughness: .1, metalness: .2 });
const CARGO_C = ['#c9a46a', '#8fb3d9', '#d98c8c', '#a6d18e'];
const PETAL_C = ['#ffffff', '#ffe066', '#ff8fc7'];

// ---------- overlays (CSS does the styling; see frogger3d-fx.css) ----------
function overlay(id) { const d = document.createElement('div'); d.id = id; document.body.prepend(d); return d; }
const tintEl = overlay('tint'); overlay('topg'); overlay('grain');
const prog = document.createElement('div'); prog.id = 'prog'; prog.innerHTML = '<i></i>'; document.body.appendChild(prog);
const progBar = prog.firstChild;
const nb = document.createElement('div'); nb.id = 'nb'; nb.textContent = 'NEW BEST'; document.body.appendChild(nb);

// ---------- sprites & markers ----------
const danger = new THREE.Sprite(new THREE.SpriteMaterial({ map: T_DANGER, transparent: true, depthWrite: false, fog: false }));
danger.scale.setScalar(.5); danger.visible = false; danger.renderOrder = 6; scene.add(danger);
const spark = new THREE.Sprite(SM_WARM); spark.scale.setScalar(.25); spark.visible = false; scene.add(spark);
const shade = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.MeshBasicMaterial({ map: G_SHADE, transparent: true, opacity: .12, depthWrite: false }));
shade.rotation.x = -Math.PI / 2; shade.position.y = .025; scene.add(shade);

// ---------- particle pools ----------
const PUFFS = [], RINGS = [];
function puff(x, y, z, c, vy, life, size, op) {
  if (PUFFS.length >= 180) return;
  const m = new THREE.Mesh(PUFF_G, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false }));
  m.position.set(x, y, z); m.scale.setScalar(size); scene.add(m);
  PUFFS.push({ m, vy, life, t: 0, s: size, op });
}
function wake(x, z) {
  if (RINGS.length >= 30) return;
  const m = new THREE.Mesh(RING_G, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .6, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .07, z); scene.add(m); RINGS.push({ m, t: 0 });
}
function addZ(o) { scene.add(o); Z.meshes.push(o); return o; }

// ---------- per-level build: runs once whenever the game rebuilds its rows ----------
let lastRows = null, halo = null, rays = null, goalZ = 0, lastHop = null, bobT = 0;
function onNewLevel() {
  lastRows = Z.rows;
  { const th = window.CR.themeOf && window.CR.themeOf(Z.level); P = th ? { road: th.road, grass: th.grass, water: th.water, tint: th.tint } : PAL[(Z.level - 1) % PAL.length]; }
  tintEl.style.background = P.tint;

  // ground strips (40 wide, 0.4 tall) get textured per row type
  const ground = Z.meshes.filter(m => m.geometry && m.geometry.type === 'BoxGeometry' && m.geometry.parameters.width === 40 && m.geometry.parameters.height === 0.4);
  ground.forEach((m, i) => {
    const row = Z.rows[i]; if (!row) return;
    if (row.type === 'river') { row.water.map = T_WATER; row.water.color.set(P.water); row.water.needsUpdate = true; return; }
    const mt = m.material.clone();
    mt.map = row.type === 'road' ? T_ROAD : T_GRASS;
    mt.color.set(row.type === 'road' ? P.road : P.grass);
    mt.roughness = .9; mt.needsUpdate = true; m.material = mt;
  });

  // lily pads get a flower
  for (const m of Z.meshes) {
    const g = m.geometry;
    if (g && g.type === 'CylinderGeometry' && g.parameters.radiusTop === .42 && g.parameters.height === .04) {
      const fl = new THREE.Mesh(FLOWER_G, new THREE.MeshStandardMaterial({ color: '#ff8fc7', roughness: .6 }));
      fl.position.y = .06; m.add(fl);
    }
  }

  for (const row of Z.rows) {
    const z = -row.r;
    if (row.type === 'grass' && row.r > 0 && row.r < Z.rows.length - 1) {
      for (let i = 0; i < 4; i++) { // grass tufts
        const tf = new THREE.Group();
        for (let k = 0; k < 3; k++) {
          const b = new THREE.Mesh(TUFT_G, TUFT_M);
          b.position.set(rnd(-.08, .08), .12, rnd(-.08, .08)); b.rotation.set(rnd(-.3, .3), 0, rnd(-.3, .3)); tf.add(b);
        }
        tf.position.set(rnd(-COLS + .4, COLS - .4), 0, z + rnd(-.35, .35)); addZ(tf);
      }
      if (Math.random() < .5) { // flower patch
        const pm = new THREE.MeshStandardMaterial({ color: PETAL_C[(Math.random() * 3) | 0], roughness: .6 });
        for (let k = 0; k < 5; k++) {
          const d = new THREE.Mesh(FLOWER_G, pm); d.scale.setScalar(.7);
          d.position.set(rnd(-COLS, COLS), .07, z + rnd(-.35, .35)); addZ(d);
        }
      }
    }
    if (row.type === 'road') {
      for (let i = 0; i < 3; i++) { // asphalt cracks
        const c = new THREE.Mesh(CRACK_G, CRACK_M);
        c.position.set(rnd(-COLS, COLS), .006, z + rnd(-.3, .3)); c.rotation.y = rnd(0, 3); addZ(c);
      }
      for (const s of [-1, 1]) { // roadside reflector posts
        const r = new THREE.Mesh(REFL_G, REFL_M); r.position.set(s * (COLS + .6), .1, z); addZ(r);
      }
      for (const o of row.objs) {
        const d = row.dir, g = o.mesh;
        for (const s of [-1, 1]) { // headlight and taillight glows
          const hl = new THREE.Sprite(SM_WARM); hl.scale.setScalar(.6); hl.position.set(d * (o.w / 2 + .1), .36, s * .22); g.add(hl);
          const tl = new THREE.Sprite(SM_RED); tl.scale.setScalar(.45); tl.position.set(-d * (o.w / 2 + .1), .4, s * .22); g.add(tl);
        }
        if (!g.userData.low && Math.random() < .4) { // roof cargo
          const rc = new THREE.Mesh(new THREE.BoxGeometry(o.w * .35, .16, .5), new THREE.MeshStandardMaterial({ color: CARGO_C[(Math.random() * 4) | 0], roughness: .9 }));
          rc.position.set(-o.w * .1, .9, 0); rc.castShadow = true; g.add(rc);
        }
        const ws = new THREE.Mesh(new THREE.BoxGeometry(.03, .2, .6), WS_M); ws.position.set(o.w * .2, .7, 0); g.add(ws);
      }
    }
    if (row.type === 'river') {
      for (const s of [-1, 1]) { // reeds and stones on both banks
        for (let k = 0; k < 3; k++) {
          const rd = new THREE.Mesh(REED_G, REED_M);
          rd.position.set(s * (COLS + 1.3 + rnd(0, .6)), .2, z + rnd(-.35, .35)); rd.rotation.z = s * rnd(0, .2); addZ(rd);
        }
        const st = new THREE.Mesh(STONE_G, STONE_M); st.position.set(s * (COLS + .7), .1, z + rnd(-.2, .2)); st.rotation.set(rnd(0, 3), rnd(0, 3), 0); addZ(st);
      }
      for (const o of row.objs) {
        const lg = o.mesh.children[0]; // bark texture on the log body
        if (lg && lg.isMesh) { lg.material = lg.material.clone(); lg.material.map = T_BARK; lg.material.color.set('#ffffff'); lg.material.needsUpdate = true; }
        const foam = new THREE.Mesh(new THREE.BoxGeometry(o.w + .5, .01, .9), FOAM_M); foam.position.set(0, .01, 0); o.mesh.add(foam);
      }
    }
    if (row.r === Z.rows.length - 1) goalZ = z;
  }

  // goal: pulsing halo and slowly turning light rays
  halo = addZ(new THREE.Mesh(new THREE.RingGeometry(.6, .72, 32), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false })));
  halo.rotation.x = -Math.PI / 2; halo.position.set(0, .05, goalZ);
  rays = addZ(new THREE.Group()); rays.position.set(0, 0, goalZ);
  const RAY_G = new THREE.BoxGeometry(.06, .01, 1.2), RAY_M = new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    const r = new THREE.Mesh(RAY_G, RAY_M); r.rotation.y = -a; r.position.set(Math.cos(a) * .9, .04, Math.sin(a) * .9); rays.add(r);
  }
}

// ---------- per-frame ----------
function frame(dt) {
  const T = Z.t, f = Z.frog, fp = frogG.position;
  if (Z.rows !== lastRows) onNewLevel();

  R3.toneMappingExposure = 1.05 + .03 * Math.sin(T * .5); // slow exposure breathing

  // ground effects
  shade.position.set(((T * 1.2 + 30) % 60) - 30, .025, fp.z - 6); // cloud shadow drifting over the lanes
  T_WATER.offset.x = T * .03; // water flows

  for (const row of Z.rows) {
    if (row.type === 'road') {
      for (const o of row.objs) {
        o.mesh.position.y = Math.sin(T * 6 + o.x) * .012; // slight bob
        if (!REDUCED && Math.random() < dt * .6) // exhaust puff
          puff(o.mesh.position.x - row.dir * (o.w / 2 + .05), .5, -row.r, '#d8dce4', .3 + Math.random() * .2, 1.1, .16, .55);
      }
    } else if (row.type === 'river') {
      for (const o of row.objs) { // ripples behind floating logs
        o.wake = (o.wake == null ? rnd(0, 1.4) : o.wake) - dt;
        if (o.wake <= 0) { o.wake = 1.4; wake(o.mesh.position.x, -row.r); }
      }
    }
  }

  // frog
  const onLog = !f.hop && !Z.dead && Z.rows[f.r] && Z.rows[f.r].type === 'river';
  frogG.rotation.z = onLog ? Math.sin(T * 4) * .06 : 0; // sways on logs
  const idle = !f.hop && !Z.dead && !Z.over && !REDUCED && (T % 4) < 1.6;
  spark.visible = idle;
  if (idle) { // sparkle orbiting the idle cat
    spark.position.set(fp.x + Math.cos(T * 2) * .55, fp.y + .95 + Math.sin(T * 3) * .08, fp.z + Math.sin(T * 2) * .55);
    spark.scale.setScalar(.2 + .2 * Math.abs(Math.sin(T * 4)));
  }
  if (f.hop && f.hop !== lastHop) { // dust on takeoff
    lastHop = f.hop;
    const wr = Z.rows[f.hop.r0], wc = wr && wr.type === 'river' ? '#dff6ff' : '#e9dcc0';
    for (let i = 0; i < 5; i++) puff(f.hop.c0 + rnd(-.3, .3), .08, -f.hop.r0 + rnd(-.3, .3), wc, rnd(.2, .5), .6, .12, .7);
  }
  if (Z.dead && Z.dead.kind === 'drown' && Z.dead.t < .9 && Math.random() < dt * 18) // bubbles
    puff(fp.x + rnd(-.2, .2), fp.y + .1, fp.z + rnd(-.2, .2), '#ffffff', .9, .8, .07, .9);
  // danger marker when a car is in the frog's lane and close
  const row = Z.rows[f.r];
  const threat = !f.hop && !Z.dead && !Z.over && !REDUCED && row && row.type === 'road' &&
    row.objs.some(o => Math.abs(o.x - f.c) < o.w / 2 + 1.3);
  danger.visible = !!threat;
  if (threat) danger.position.set(fp.x, fp.y + 1.25, fp.z);

  // camera: slight FOV widening while hopping (position is left to the game's own camera)
  cam.fov += ((f.hop ? 47 : 50) - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix();

  // goal: flag bob, halo pulse, rays spin
  if (halo) { const s = 1 + Math.sin(T * 3) * .08; halo.scale.set(s, s, 1); halo.material.opacity = .5 + .3 * Math.sin(T * 3); }
  if (rays) rays.rotation.y += dt * .5;

  // particle pools
  for (let i = PUFFS.length - 1; i >= 0; i--) {
    const p = PUFFS[i]; p.t += dt;
    p.m.position.y += p.vy * dt; p.m.scale.setScalar(p.s * (1 + p.t * 1.5));
    p.m.material.opacity = p.op * Math.max(0, 1 - p.t / p.life);
    if (p.t >= p.life) { scene.remove(p.m); p.m.material.dispose(); PUFFS.splice(i, 1); }
  }
  for (let i = RINGS.length - 1; i >= 0; i--) {
    const r = RINGS[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 2.5); r.m.material.opacity = .6 * Math.max(0, 1 - r.t / .9);
    if (r.t >= .9) { scene.remove(r.m); r.m.material.dispose(); RINGS.splice(i, 1); }
  }

  // HUD
  $('lives').classList.toggle('low', Z.lives > 0 && Z.lives <= 1);
  progBar.style.width = (100 * Z.maxRow / Math.max(1, Z.rows.length - 1)).toFixed(1) + '%';
  nb.classList.toggle('on', Z.score > 0 && Z.score > bestStart);
}
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  try { frame(dt); } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
