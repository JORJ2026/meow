# Cat Quest Arcade 1.1.0 (mobile, final)

Open index.html from any web server (https or localhost), or add it to your home screen.
15 games in the store. Back up or move your progress with 💾 Save & load in the store header.

Known limits
- 3D games load three.js from cdn.jsdelivr.net: they need internet the first time, then work offline. They were not test-rendered in the build sandbox.
- Store cards for those 3D games are not fresh screenshots (Cross Road 3D shows a drawn level map).
- Inkbound images (about 21 MB) are cached as you play each arena, not up front.

## 1.2.0
Music: 19 MIDI songs in music/ play shuffled in every game; Hard Knock Life plays with the intro. Songs are separate files - add or remove a .mid and edit music/playlist.json to change the list. Known limit: the built-in synth approximates instruments (no sample bank), so it sounds like classic MIDI.

## 1.3.0
- Music: every song now plays a random 30 seconds, then a new random song starts. Same in Elk River Bandit and every cat game (all 24 songs).
- Songs are only shown as "Track 1", "Track 2"... (their number in music/playlist.json), never by name.
- Tiny music bar on every page: track number, ⏭ next song, 🔊/🔇 mute.
- Hard Knock Life plays for 15 seconds when the app opens, then a random song takes over.
- Elk River Bandit: music now plays (it uses the shared player in midi.js and the songs in music/). Tapping it in the store opens it straight away, no cat picker.
- Phones: smaller corner buttons, thumb controls shrink to fit the side columns, Elk River's Store button no longer covers How to Play.

## 1.3.1
- Store pictures show again (they were loading but kept hidden). New pictures for Cat Quest, Cat Run, Temple Dash, Kitty Maze, Kitty Pong, Kitty Pac, Kitty Tetris, Cat Jewels and Run 3D; new Elk River Bandit card from real gameplay.
- 3D games no longer replace store pictures with their own screenshots.
- Portrait phones: Temple Dash, Kitty Maze and Kitty Pac zoom in to fill the screen and follow the cat, with the hearts/score strip kept at the top. Cross Road 2D's top bar fits narrow phones. Inkbound's arena sits in the middle instead of leaving a gap.

## 1.4.0
- ☰ menu: the unlock code box is visible again (type the code; on phones it works without pressing Enter), plus a 🖥 Desktop mode switch. Desktop mode is off by default; when on, the touch buttons are hidden and the game uses the whole screen for keyboard or controller.
- New in the store: Lantern Woods, Farming Sim (Wildroot), Paint (Paint 3D), Text Editor (logo app), and Cat Arcade (old), which opens jorj2026.github.io/nobodypurrfect. The local apps live in apps/ and have a small "‹ Store" tab on the left edge.
- Known limit: Paint and Text Editor load some parts from the internet (three.js, icons, fonts, export tools), so they need a connection the first time.

## 1.5.0
- New in the store: **Old School**, a GBA-style handheld that plays the homemade GBA and SNES ROMs (15 carts on the shelf, plus "Play a ROM file from this device"). Save/Load state buttons, X/Y appear for SNES games.
- New in the store: **MIDI**, the piano MIDI visualizer.
- Both open straight away (no cat pick) and have a "‹ Store" tab on the left edge.

## 1.5.1
- MIDI app: new **Cat Games** section with all 24 songs from the game soundtrack (Track 1–24, same numbers as in the games). They play on the piano visualizer with the drum track left out.

## 1.5.2
- Intro no longer cuts off after about 6 seconds. It plays all the way to the CAT QUEST title, then waits there with "Tap / Press any key to continue". Tapping still skips it early if you want.

## 1.5.3
- Music stops when you exit a game (back to the menu/store, or leaving a game page). A new random song starts when the next game starts.
- Intro song (Hard Knock Life) now plays for 45 seconds instead of 15.
- All MIDI music (cat games, Elk River Bandit, MIDI app) has a volume limiter so it never gets too loud, plus a slight synth layer.
