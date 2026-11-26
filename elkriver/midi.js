// Elk River Bandit music: uses the shared Cat Quest jukebox (../midi.js), so it plays the same songs
// from ../music/ as every cat game - a random 30 seconds of each, shown only as "Track N".
// This file keeps the old ERBMidi.create() interface that app.js calls.
(function () {
  var J = function () { return window.CQMidi; };
  function create(opts) {
    opts = opts || {};
    var vol = opts.volume == null ? .3 : opts.volume, muted = false, on = false;
    var apply = function () { var j = J(); if (j) j.volume(muted ? 0 : vol / .3); };
    return {
      get playing() { var j = J(); return !!(on && j && j.isPlaying()); },
      play: function (id) { var j = J(); if (!j) return; on = true; apply(); j.play(id); },
      stop: function () { var j = J(); on = false; if (j) j.stop(); },
      pause: function () { var j = J(); if (j && on) j.pause(); },
      resume: function () { var j = J(); if (j && on) j.resume(); },
      setMuted: function (m) { muted = !!m; apply(); },
      setVolume: function (v) { vol = v; apply(); }
    };
  }
  window.ERBMidi = { create: create };
})();
