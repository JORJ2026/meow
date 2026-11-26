# Cat Quest Arcade 1.1.0 (mobile, final)

Open index.html from any web server (https or localhost), or add it to your home screen.
15 games in the store. Back up or move your progress with 💾 Save & load in the store header.

Known limits
- 3D games load three.js from cdn.jsdelivr.net: they need internet the first time, then work offline. They were not test-rendered in the build sandbox.
- Store cards for those 3D games are not fresh screenshots (Cross Road 3D shows a drawn level map).
- Inkbound images (about 21 MB) are cached as you play each arena, not up front.

## 1.2.0
Music: 19 MIDI songs in music/ play shuffled in every game; Hard Knock Life plays with the intro. Songs are separate files - add or remove a .mid and edit music/playlist.json to change the list. Known limit: the built-in synth approximates instruments (no sample bank), so it sounds like classic MIDI.
