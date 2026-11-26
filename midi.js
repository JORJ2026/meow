/* Cat Quest Arcade - MIDI jukebox.
   Plays the real .mid files in music/ (listed in music/playlist.json) - nothing is typed into code.
   - reads Standard MIDI Files (format 0/1/2, tempo changes, program / volume / pan changes, drums on channel 10)
   - plays every song from start to finish, then picks the next song at random (no repeats until all have played)
   - CQMidi.play('jay-z-hard-knock-life')  plays one song;  CQMidi.next() skips;  CQMidi.mute(true|false)
   - set window.CQ_MUSIC_HOLD = 1 before loading to stop it starting a random song on the first tap */
(function () {
  'use strict';
  if (window.CQMidi) return;
  var cs = document.currentScript, BASE = cs && cs.src ? cs.src.replace(/[^\/]*(\?.*)?$/, '') : '';
  var LS = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } };

  /* ---------- MIDI file parser ---------- */
  function parse(buf) {
    var d = new DataView(buf), p = 0, u8 = new Uint8Array(buf);
    function s4() { var s = String.fromCharCode(u8[p], u8[p + 1], u8[p + 2], u8[p + 3]); p += 4; return s; }
    if (s4() !== 'MThd') throw new Error('not a midi file');
    var hl = d.getUint32(p); p += 4; var fmt = d.getUint16(p), nt = d.getUint16(p + 2), div = d.getUint16(p + 4); p += hl;
    var tpq = (div & 0x8000) ? 480 : div, evs = [], tempos = [{ tick: 0, us: 500000 }], seq = 0;
    for (var t = 0; t < nt && p < u8.length; t++) {
      var id = s4(), len = d.getUint32(p); p += 4; var end = Math.min(p + len, u8.length);
      if (id !== 'MTrk') { p = end; continue; }
      var tick = 0, run = 0;
      while (p < end) {
        var dt = 0, b; do { b = u8[p++]; dt = (dt << 7) | (b & 127); } while (b & 128 && p < end); tick += dt;
        var st = u8[p];
        if (st === 0xFF) {
          var ty = u8[p + 1]; p += 2; var l = 0; do { b = u8[p++]; l = (l << 7) | (b & 127); } while (b & 128);
          if (ty === 0x51 && l === 3) tempos.push({ tick: tick, us: (u8[p] << 16) | (u8[p + 1] << 8) | u8[p + 2] });
          p += l; if (ty === 0x2F) break; continue;
        }
        if (st === 0xF0 || st === 0xF7) { p++; var sl = 0; do { b = u8[p++]; sl = (sl << 7) | (b & 127); } while (b & 128); p += sl; continue; }
        if (st & 128) { run = st; p++; } else st = run;
        var hi = st >> 4, ch = st & 15, a = u8[p++], v = 0;
        if (hi !== 12 && hi !== 13) v = u8[p++];
        evs.push({ tick: tick, o: seq++, hi: hi, ch: ch, a: a, v: v });
      }
      p = end;
    }
    evs.sort(function (x, y) { return x.tick - y.tick || x.o - y.o; });
    tempos.sort(function (x, y) { return x.tick - y.tick; });
    /* ticks -> seconds through the tempo map */
    var tm = [], sec = 0, last = 0, us = 500000;
    tempos.forEach(function (T) { sec += (T.tick - last) / tpq * us / 1e6; last = T.tick; us = T.us; tm.push({ tick: T.tick, sec: sec, us: us }); });
    var ti = 0;
    function toSec(tick) { while (ti + 1 < tm.length && tm[ti + 1].tick <= tick) ti++; while (ti > 0 && tm[ti].tick > tick) ti--; var T = tm[ti]; return T.sec + (tick - T.tick) / tpq * T.us / 1e6; }
    var prog = [], open = {}, out = [], ctl = [];
    for (var i = 0; i < 16; i++) prog[i] = 0;
    evs.forEach(function (e) {
      var tm0 = toSec(e.tick);
      if (e.hi === 12) { prog[e.ch] = e.a; }
      else if (e.hi === 11) {
        if (e.a === 7 || e.a === 11 || e.a === 10) ctl.push({ t: tm0, ch: e.ch, c: e.a, v: e.v });
        else if (e.a === 121) ctl.push({ t: tm0, ch: e.ch, c: 121, v: 0 });
      }
      else if (e.hi === 9 && e.v > 0) {
        var k = e.ch * 128 + e.a; (open[k] = open[k] || []).push(out.length);
        out.push({ t: tm0, d: -1, ch: e.ch, n: e.a, v: e.v, pr: prog[e.ch] });
      } else if (e.hi === 8 || (e.hi === 9 && e.v === 0)) {
        var q = open[e.ch * 128 + e.a]; if (q && q.length) { var n = out[q.shift()]; n.d = Math.max(0.03, tm0 - n.t); }
      }
    });
    out.forEach(function (n) { if (n.d < 0) n.d = 0.4; });
    var endT = 0; out.forEach(function (n) { if (n.t + n.d > endT) endT = n.t + n.d; });
    var all = []; out.forEach(function (n) { all.push({ t: n.t, k: 0, n: n }); }); ctl.forEach(function (c) { all.push({ t: c.t, k: 1, c: c }); });
    all.sort(function (x, y) { return x.t - y.t || y.k - x.k; });   // controllers before notes at the same moment
    return { ev: all, dur: endT, notes: out.length };
  }

  /* ---------- synth (Web Audio, no samples needed) ---------- */
  var AC = null, master = null, chans = null, noiseBuf = null, voices = 0, MAXV = 44;
  function mkCtx() {
    if (AC) return AC;
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { AC = new C({ latencyHint: 'playback' }); } catch (e) { try { AC = new C(); } catch (e2) { return null; } }
    var comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.2;
    master = AC.createGain(); master.gain.value = 0.36; master.connect(comp); comp.connect(AC.destination);
    chans = [];
    for (var i = 0; i < 16; i++) {
      var g = AC.createGain(), pn = AC.createStereoPanner ? AC.createStereoPanner() : null;
      if (pn) { g.connect(pn); pn.connect(master); } else g.connect(master);
      chans.push({ g: g, p: pn, vol: 1, ex: 1 });
    }
    var n = AC.sampleRate, b = AC.createBuffer(1, n, AC.sampleRate), x = b.getChannelData(0);
    for (var j = 0; j < n; j++) x[j] = Math.random() * 2 - 1;
    noiseBuf = b; return AC;
  }
  var hz = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };
  function noise(dest, t, dur, type, f, q, vol) {
    var s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7;
    var g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function osc(dest, t, dur, type, f0, f1, vol) {
    var o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    var g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  function drum(dest, t, n, v) {
    var a = v / 127;
    if (n === 35 || n === 36) { osc(dest, t, 0.28, 'sine', 150, 42, 0.95 * a); noise(dest, t, 0.02, 'lowpass', 1800, 0.7, 0.25 * a); }
    else if (n === 38 || n === 40) { noise(dest, t, 0.2, 'bandpass', 1900, 0.6, 0.55 * a); osc(dest, t, 0.12, 'triangle', 220, 150, 0.4 * a); }
    else if (n === 37) { osc(dest, t, 0.04, 'square', 900, 0, 0.18 * a); noise(dest, t, 0.04, 'highpass', 2500, 0.7, 0.2 * a); }
    else if (n === 39) { noise(dest, t, 0.05, 'bandpass', 1500, 0.8, 0.45 * a); noise(dest, t + 0.012, 0.16, 'bandpass', 1500, 0.8, 0.4 * a); }
    else if (n === 42 || n === 44) noise(dest, t, 0.05, 'highpass', 7500, 0.7, 0.26 * a);
    else if (n === 46) noise(dest, t, 0.32, 'highpass', 7000, 0.7, 0.24 * a);
    else if (n === 49 || n === 57 || n === 52 || n === 55) noise(dest, t, 1.0, 'highpass', 5200, 0.6, 0.3 * a);
    else if (n === 51 || n === 59 || n === 53) { noise(dest, t, 0.4, 'highpass', 8200, 0.9, 0.16 * a); osc(dest, t, 0.35, 'triangle', 4100, 0, 0.04 * a); }
    else if (n === 41 || n === 43 || n === 45 || n === 47 || n === 48 || n === 50) { var f = 70 + (n - 41) * 14; osc(dest, t, 0.32, 'sine', f * 1.5, f, 0.7 * a); }
    else if (n === 56) { osc(dest, t, 0.18, 'square', 800, 0, 0.12 * a); osc(dest, t, 0.18, 'square', 540, 0, 0.12 * a); }
    else if (n === 54) noise(dest, t, 0.08, 'highpass', 6000, 0.7, 0.2 * a);
    else noise(dest, t, 0.07, 'bandpass', 2400 + (n % 12) * 300, 2, 0.2 * a);
  }
  /* GM program -> instrument recipe: wave, second wave, lowpass, attack, release, decay time (0 = sustain), gain */
  function recipe(pr) {
    if (pr < 8) return { w: 'triangle', w2: 'sine', lp: 4200, at: 0.004, rl: 0.18, dec: 1.4, g: 0.75 };      // pianos
    if (pr < 16) return { w: 'sine', w2: 'triangle', lp: 7000, at: 0.003, rl: 0.5, dec: 1.2, g: 0.6 };        // bells / mallets
    if (pr < 24) return { w: 'square', w2: 'sine', lp: 2600, at: 0.015, rl: 0.08, dec: 0, g: 0.38 };          // organs
    if (pr < 32) return { w: 'sawtooth', w2: null, lp: 2300, at: 0.003, rl: 0.12, dec: 0.7, g: 0.5 };        // guitars
    if (pr < 40) return { w: pr >= 38 ? 'square' : 'sawtooth', w2: 'sine', lp: 650, at: 0.006, rl: 0.1, dec: pr >= 38 ? 0 : 0.9, g: 0.85, sub: 1 }; // basses
    if (pr < 52) return { w: 'sawtooth', w2: 'sawtooth', lp: 2000, at: 0.1, rl: 0.22, dec: 0, g: 0.3, det: 9 }; // strings
    if (pr < 56) return { w: 'triangle', w2: 'sine', lp: 2200, at: 0.08, rl: 0.2, dec: 0, g: 0.5 };           // choirs
    if (pr < 64) return { w: 'sawtooth', w2: null, lp: 2400, at: 0.04, rl: 0.1, dec: 0, g: 0.42, swell: 1 };  // brass
    if (pr < 72) return { w: 'square', w2: null, lp: 1700, at: 0.03, rl: 0.08, dec: 0, g: 0.32 };             // reeds
    if (pr < 80) return { w: 'sine', w2: 'triangle', lp: 4000, at: 0.04, rl: 0.1, dec: 0, g: 0.6, vib: 1 };   // flutes / pipes
    if (pr < 88) return { w: 'sawtooth', w2: 'square', lp: 3400, at: 0.01, rl: 0.1, dec: 0, g: 0.3, det: 5 }; // synth leads
    if (pr < 104) return { w: 'sawtooth', w2: 'triangle', lp: 1800, at: 0.2, rl: 0.4, dec: 0, g: 0.28, det: 7 }; // pads / fx
    if (pr < 112) return { w: 'sawtooth', w2: null, lp: 2200, at: 0.004, rl: 0.1, dec: 0.5, g: 0.45 };       // ethnic plucks
    return { w: 'triangle', w2: null, lp: 3000, at: 0.003, rl: 0.08, dec: 0.25, g: 0.5 };
  }
  function voice(ch, t, n, d, v) {
    var C = chans[ch], R = recipe(n.pr), f = hz(n.n), vel = Math.pow(v / 127, 1.3);
    var e = AC.createGain(), fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = Math.min(R.lp + f * 0.4, 12000); fl.Q.value = 0.5;
    var peak = R.g * vel, hold = Math.max(d, 0.04), tA = t + R.at, tEnd = Math.max(t + hold, tA);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(peak, tA);
    if (R.dec) {                                        // plucked / struck: dies away by itself
      var tD = Math.min(tEnd, tA + R.dec), vEnd = peak * Math.pow(0.12, (tD - tA) / R.dec);
      e.gain.exponentialRampToValueAtTime(Math.max(vEnd, 0.0006), tD); tEnd = tD;
    } else e.gain.setValueAtTime(peak, tEnd);          // held: sustains until the note ends
    e.gain.linearRampToValueAtTime(0.0001, tEnd + R.rl);
    var stopAt = tEnd + R.rl + 0.06;
    fl.connect(e); e.connect(C.g);
    if (R.swell) { fl.frequency.setValueAtTime(R.lp * 0.4, t); fl.frequency.linearRampToValueAtTime(R.lp + f * 0.4, t + 0.12); }
    var o1 = AC.createOscillator(); o1.type = R.w; o1.frequency.value = f; if (R.det) o1.detune.value = -R.det;
    o1.connect(fl); o1.start(t); o1.stop(stopAt);
    var os = [o1];
    if (R.w2) { var o2 = AC.createOscillator(), g2 = AC.createGain(); o2.type = R.w2; o2.frequency.value = R.sub ? f / 2 : (R.det ? f : f * 2); if (R.det) o2.detune.value = R.det; g2.gain.value = R.det ? 0.8 : 0.35; o2.connect(g2); g2.connect(fl); o2.start(t); o2.stop(stopAt); os.push(o2); }
    if (R.vib) { var lf = AC.createOscillator(), lg = AC.createGain(); lf.frequency.value = 5.2; lg.gain.value = f * 0.006; lf.connect(lg); lg.connect(o1.frequency); lf.start(t + 0.15); lf.stop(stopAt); }
    voices++; o1.onended = function () { voices--; try { e.disconnect(); fl.disconnect(); } catch (x) { } };
  }

  /* ---------- jukebox ---------- */
  var list = [], bag = [], cache = {}, cur = null, song = null, idx = 0, startAt = 0, timer = 0, want = false, userMuted = LS('cq_music_mute') === '1', unlocked = false, token = 0, listeners = [];
  var listP = null, lastId = LS('cq_midi_last') || '';
  function loadList() {
    if (listP) return listP;
    listP = fetch(BASE + 'music/playlist.json').then(function (r) { return r.json(); }).then(function (a) { list = a || []; return list; }).catch(function () { listP = null; return list; });
    return listP;
  }
  function emit() { listeners.forEach(function (f) { try { f(cur, api); } catch (e) { } }); }
  function fetchSong(item) {
    if (cache[item.id]) return Promise.resolve(cache[item.id]);
    return fetch(BASE + 'music/' + item.file).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (b) { var s = parse(b); cache[item.id] = s; return s; });
  }
  function pickRandom() {
    if (!bag.length) {
      bag = list.map(function (x) { return x.id; });
      for (var i = bag.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
      if (bag.length > 1 && bag[bag.length - 1] === lastId) { var k = bag.length - 1; var t2 = bag[k]; bag[k] = bag[0]; bag[0] = t2; }   // bag is popped from the end
    }
    var id = bag.pop(); return list.filter(function (x) { return x.id === id; })[0];
  }
  function begin(item) {
    var my = ++token; cur = item; lastId = item.id; LS('cq_midi_last', item.id); stopTimer(); song = null; emit();
    fetchSong(item).then(function (s) {
      if (my !== token) return; song = s; idx = 0; want = true; run(my);
    }).catch(function () { if (my === token) { setTimeout(function () { if (my === token && want) api.next(); }, 800); } });
  }
  function run(my) {
    if (!want || my !== token) return;
    if (!AC || !unlocked) return;                      // starts at the first tap (browsers block sound before that)
    if (!startAt || startAt === -1) { startAt = AC.currentTime + 0.15; }
    resume(); stopTimer(); timer = setInterval(tick, 50);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = 0; } }
  function tick() {
    if (!AC || !song) return;
    var now = AC.currentTime, hz2 = now + 0.4, E = song.ev;
    while (idx < E.length && startAt + E[idx].t < hz2) {
      var e = E[idx++], at = startAt + e.t;
      if (e.k === 1) {
        var C = chans[e.c.ch], c = e.c;
        if (c.c === 7) { C.vol = c.v / 127; C.g.gain.setValueAtTime(C.vol * C.ex, Math.max(at, now)); }
        else if (c.c === 11) { C.ex = c.v / 127; C.g.gain.setValueAtTime(C.vol * C.ex, Math.max(at, now)); }
        else if (c.c === 10 && C.p) C.p.pan.setValueAtTime((c.v - 64) / 64 * 0.7, Math.max(at, now));
        else if (c.c === 121) { C.vol = 1; C.ex = 1; }
        continue;
      }
      var n = e.n; if (at < now - 0.03) continue;       // too late (tab was busy): skip rather than burst
      if (n.ch === 9) { if (voices < MAXV + 14) drum(chans[9].g, Math.max(at, now), n.n, n.v); }
      else if (voices < MAXV || n.v > 100) { try { voice(n.ch, Math.max(at, now), n, n.d, n.v); } catch (x) { } }
    }
    if (idx >= E.length && now > startAt + song.dur + 1.2) { stopTimer(); song = null; api.next(); }   // song finished -> next random song
  }
  function resume() { if (AC && !userMuted && !document.hidden && AC.state === 'suspended') { try { AC.resume(); } catch (e) { } } }
  function unlock() {
    if (unlocked) { resume(); return; }
    if (!mkCtx()) return; unlocked = true;
    try { var b = AC.createBuffer(1, 1, 22050), s = AC.createBufferSource(); s.buffer = b; s.connect(AC.destination); s.start(0); } catch (e) { }
    if (userMuted) { try { AC.suspend(); } catch (e) { } }
    if (want && song) { startAt = -1; run(token); }
    else if (!want && !window.CQ_MUSIC_HOLD && !cur) api.random();
    else if (want && !song && cur) { /* still downloading: begin() finishes the start */ }
  }
  ['pointerdown', 'touchend', 'mousedown', 'keydown', 'click'].forEach(function (ev) { addEventListener(ev, unlock, { capture: true, passive: true }); });
  document.addEventListener('visibilitychange', function () {
    if (!AC) return;
    if (document.hidden) { try { AC.suspend(); } catch (e) { } } else resume();
  });

  var api = {
    list: function () { return list.slice(); },
    current: function () { return cur; },
    isPlaying: function () { return !!(want && song && AC && AC.state === 'running'); },
    muted: function () { return userMuted; },
    /* play one song by id (or part of its name), from the beginning */
    play: function (id) {
      return loadList().then(function () {
        var it = list.filter(function (x) { return x.id === id; })[0] || list.filter(function (x) { return x.id.indexOf(id) >= 0; })[0];
        if (!it) return; if (AC && unlocked) startAt = -1; else startAt = 0; want = true; begin(it);
      });
    },
    random: function () { return loadList().then(function () { if (!list.length) return; if (AC && unlocked) startAt = -1; else startAt = 0; want = true; begin(pickRandom()); }); },
    next: function () { return api.random(); },
    stop: function () { want = false; ++token; stopTimer(); song = null; cur = null; emit(); },
    mute: function (m) {
      userMuted = !!m; LS('cq_music_mute', userMuted ? '1' : '0');
      if (AC) { try { userMuted ? AC.suspend() : resume(); } catch (e) { } }
      emit();
    },
    toggle: function () { api.mute(!userMuted); return userMuted; },
    onchange: function (f) { listeners.push(f); },
    parse: parse                                     // exposed for tests
  };

  /* small music button on pages that have no sound button of their own (the 3D games and Inkbound) */
  function addButton() {
    if (window.CQ_MUSIC_NOBTN || document.getElementById('cqmbtn')) return;
    var st = document.createElement('style');
    st.textContent = '#cqmbtn{position:fixed;z-index:2147483000;top:calc(env(safe-area-inset-top,0px) + 6px);right:calc(env(safe-area-inset-right,0px) + 6px);width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);background:rgba(20,20,30,.5);color:#fff;font:15px/1 system-ui;padding:0;opacity:.6;-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}#cqmbtn:active{opacity:1}';
    document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'cqmbtn'; b.type = 'button'; b.setAttribute('aria-label', 'Music on/off');
    var paint = function () { b.textContent = userMuted ? '\uD83D\uDD07' : '\uD83C\uDFB5'; b.title = cur ? cur.artist + ' - ' + cur.title : 'Music'; };
    b.onclick = function (e) { e.stopPropagation(); api.toggle(); paint(); };
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    document.body.appendChild(b); paint(); listeners.push(paint);
  }
  if (document.body) addButton(); else document.addEventListener('DOMContentLoaded', addButton);
  window.CQMidi = api;
  loadList();
})();
