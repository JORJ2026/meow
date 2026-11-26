# Cat Quest Mobile: improvements batch

Honest count: **71 implemented** (not 100). Items are grouped by file.

## improve.js (28)
1 offline service worker · 2 crash toast, loop stays alive · 3 stray promise rejections swallowed · 4 Android back pauses/steps back · 5 controls released on pause · 6 iOS audio unlock · 7 audio resumes on return · 8 sound setting remembered · 9 mute announces state · 10 low battery lowers resolution · 11 data-saver lowers resolution · 12 reduced-motion disables shake · 13 fullscreen button hidden when installed · 14 launch counter · 15 iOS add-to-home-screen tip · 16 storage-blocked notice · 17 rotation pauses mid-level · 18 save on page hide · 19 pause on pagehide · 20 wake lock re-acquired · 21 stored touch settings clamped · 22 deep links `?game=` · 23 `?fps=1` meter · 24 vibration rate-limited · 25 page title follows screen · 26 pinch-zoom/rubber-band blocked outside scroll areas · 27 audio tone cap · 28 loop resumes after throttle

## mobile.css polish (23)
29 focus-visible ring · 30 accent/caret/color-scheme · 31 dvh-based deck height · 32 content-visibility on store cards · 33 overlay fade-in · 34 balanced headings · 35 pretty paragraph wrapping · 36 hidden scrollbars + overscroll containment · 37 image shimmer placeholder · 38 "last played" badge style · 39 disabled/pressed button states · 40 no tap-highlight flash · 41 larger hit area on top buttons · 42 44px summary rows · 43 press feedback · 44 hover only on fine pointers · 45 ≤360px phone tweaks · 46 tablet 3-column store · 47 very short landscape scaling · 48 portrait hint moved to bottom · 49 high-contrast mode · 50 forced-colors mode · 51 reduced-motion shimmer/ripples off · (print hidden)

## game.js (7)
52 opaque canvas (`alpha:false`) · 53 update steps capped at 4 · 54 DOM lookup cache · 55 card painting only when menu visible, every other frame · 56 card render scale follows DPR · 57 low-latency audio context · 58 skip world render while store/menu covers it

## store.js (6)
59 per-game data attribute · 60 accessible card labels · 61 last-played highlight · 62 image prefetch · 63 scroll restore · 64 real-screenshot previews for 3D entries

## mobile.js / 3D (2)
65 `cqSetPerf` hook · 66 computed side-column width; plus 67 portrait FOV for Maze 3D, 68 for Run 3D (untested)

## index.html / PWA (3)
69 web manifest + icons · 70 theme/description/color-scheme meta + noscript · 71 dialog roles on all overlays

Not done: the remaining 29, 3D page testing (three.js unreachable here).

## Round 3 (requested features)
- Pac / Maze d-pad: floating joystick (origin follows the thumb), axis hysteresis, thumb nub, glowing active arrow, tick haptic, 12% larger in portrait. Tested in headless Chrome.
- Cat Tetris 3D: cat and dog now stand on small ledges level with the top row (untested: three.js unreachable here).
- Cat Jewels 3D: 20 more background upgrades (5-stop sky, 2 extra star layers, nebulae, ringed planet, 3 ridge layers, horizon glow, lanterns, fireflies, petals, sparkles, god rays, wireframe gems, constellation, glow pool, combo colour wash, light colour cycle, comets, moon arc, parallax, all wrapped in try/catch). Untested visually.
- Cat Run: 8 new obstacle patterns (picket fence, crate tower, spike pits, flyer lane, spring tower, enemy alley, broken bridge, double trouble) with difficulty unlocks, used in endless mode too; new "50 Stages" campaign (300 m to 1476 m, speed/chase/enemy density ramp per stage, 3-star ratings, sequential unlock, saved). Generation tested for all 8 patterns in all 4 world types; stage start and grid verified.

## Round 4 (requested features)
- Maze 3D: per-level palette shift, 5 floor patterns (checker, stripes, bands, waves, speckle) with a hue drift along the route, lighter open rooms, golden pool at the goal, wall heights and tints vary (outer walls taller), 5 treat shapes, 2 themed props per world (20 kinds) revealed with the fog, and a coloured trail on tiles you have walked. Logic smoke-tested with a stand-in for three.js; not seen rendered.
- Pong 3D: 5 difficulty levels (Kitten, Tabby, Alley Cat, Tiger, Lion). Serve speed 5 to 12, top speed 11 to 26, faster speed-up per hit, quicker dog. Picker before the match; "Next level" after a win; remembered.
- Intro, title screen and story films always play landscape: on a portrait phone the stage is turned 90 degrees and fills the screen (tested).
- Cross Road 3D: 50 new levels (6 to 55) in 10 themes x 5 (Desert Dash, Frosty Pass, Candy Lane, Lava Land, Spooky Night, Jungle Run, Beach Break, Neon City, Toy Town, Rainbow Sky), each with its own sky, ground, water (lava glows), car colours and roadside props; Continue / New game / level picker. Smoke-tested with the stand-in; not seen rendered.
- Cross Road 2D: new game (crossroad2d.html), 50 seeded levels in 10 worlds; roads, rivers (logs, lily pads, diving turtles), rail crossings with warning lights, ice (slide), conveyor belts, roaming dogs, idle hawk; 3 lives, checkpoints, fish, stars, saved progress, swipe/tap/d-pad/keys. 40 visual upgrades tagged V1 to V40 in the source.

## Round 5 (release)
- Real gameplay screenshots for every level of Cat Quest (125), Cat Run stages (50), Temple Dash, Kitty Maze, Kitty Pong, Kitty Pac (100 each) and Cross Road 2D (50): 625 images in img/lv.
- New store cards with real screenshots: Cross Road 2D, Inkbound.
- Inkbound added as a playable game (inkbound/): phone layer with a full-screen arena during matches, floating touch pad, pause button, no copy/zoom gestures, Android back pauses, ?stage= link from the gallery.
- Level gallery for every game (pick a game, then "Level gallery"): screenshot cards, names, stars, locks, world tabs, tap to play. Cross Road 3D and Pong 3D use drawn previews; Tetris, Jewels and Run 3D are endless and show a note.
- Release: service worker cq-1.0.0 (offline, query-safe navigation), manifest shortcuts and screenshots.

## Final polish (1.0.1)
- All 7 3D games: loading screen, a clear "can't load the 3D engine" screen with Try again / Store when offline or the download fails, one consistent "‹ Store" button in the safe area, no long-press menus / selection / double-tap zoom, screen kept awake, stray promise errors silenced.
- All 2D games with levels (Cat Quest, Cat Run stages, Temple Dash, Kitty Maze, Kitty Pong, Kitty Pac): end-of-level messages get a "🗺 Levels" button that opens the level gallery.
- Store: each card shows progress ("12 / 100 cleared", "★ All cleared" or the level count).
- Cross Road 2D: one-time "tap or swipe up to hop" hint on the first level.
- Inkbound: one-time control hint at the first match on a touch screen.
- Regression sweep: every 2D mode started and driven in portrait and landscape, every gallery opened, Cross Road 2D and Inkbound played, all 3D pages booted with a three.js stand-in: no script errors.

## 1.0.2
- Level select gallery removed (overlay, 625 level screenshots, the "🗺 Levels" button on end-of-level screens, picture thumbnails in Cross Road 2D's level list). Store progress badges kept (badges.js).

## 1.0.3
- The 3 world selectors (Classic, Cat Worlds, The River; Bosses when unlocked) are back on the character-pick sheet for Cat Quest and Cat Run. In Cat Run they set the world type; in Cat Quest PLAY opens the story map at your furthest unlocked level in that world.

# 1.1.0 final release

## New feature: Save & load all game data
Store header → "💾 Save & load" (also in the pause menu). Downloads one .json file holding every game's progress and settings: Cat Quest, Cat Run, Temple Dash, Kitty Maze, Pong, Pac, Tetris, Jewels, the 3D games, Cross Road 2D and 3D, and Inkbound. Load it on another phone or after clearing the browser. "Load" keeps games that aren't in the file; "Replace everything" swaps it all. Tested: save → erase → load (both modes) restores everything.

## 102 improvements (each one built and checked)
Save & load details (13)
1 shows which games a save file holds · 2 flushes unsaved progress before saving · 3 Share button (phone share sheet) · 4 rejects oversized files · 5 rejects files that aren't Cat Quest saves · 6 refuses saves from a newer version · 7 only plain text keys/values are imported · 8 automatic undo point before any load or erase · 9 the running game can't overwrite a freshly loaded save · 10 shows what's on this phone, its size and the last backup date · 11 two-tap "Erase all progress" · 12 tap outside closes the panel · 13 drag-and-drop a save file onto the page

Store and app shell (25)
14 store subtitle: game count and levels cleared · 15 NEW badge on Cross Road 2D and Inkbound until opened · 16 light tap buzz on store cards · 17 broken preview image falls back to a tile · 18 3D cards say "needs internet" when offline · 19 offline notice · 20 back-online notice · 21 asks the browser to keep saves from being evicted · 22 "update ready, tap to reload" when a new version installs · 23 weekly backup reminder once you have progress · 24 PLAY ignores accidental double taps · 25 version label in the store · 26 notices now show above every screen (they were hidden behind the store) · 27 tap a notice to dismiss it · 28 chosen world (Classic / Cat Worlds / River) remembered · 29 "▶ Continue" button for the last game played · 30 store scrolls to the last-played game · 31 pick sheet shows the game's blurb and your progress · 32 Enter plays / Escape goes back on the pick sheet · 33 pause menu has a Save button · 34 focus returns to the button that opened a dialog · 35 ?game= links work for all 15 games · 36 cards rise in one after another · 37 previews fade in when loaded · 38 every button presses down · 39 PLAY softly glows · 40 the chosen pet pops · 41 48 px tap targets in result dialogs

Bug fix (1)
42 Cat Quest story progress was saved but never read back, so it reset on every reload. Fixed.

Offline and updates (6)
43 pages load fresh when online, cached copy when offline · 44 scripts/styles/images served instantly and refreshed in the background · 45 three.js is kept after the first 3D game, so 3D games then work offline · 46 the whole 2D arcade and store pictures are stored on install · 47 Inkbound arenas are kept as you play them · 48 partial / error responses never cached

All seven 3D games (16)
49 data-saver or low-battery phones render at 1x · 50 opening one by link still marks it "last played" · 51 tab titles name the arcade · 52 Android back goes to the store · 53 "Tap to continue" after returning, so the first tap can't make a stray move · 54 buzz on button taps · 55 one gameplay tip on the loading screen · 56 no loading-screen flash on fast loads · 57 visible keyboard focus · 58 reduced-motion respected · 59 your best score on the loading screen (Tetris, Jewels, Cross Road 3D) · 60 tab title shows the level you're on · 61 three.js download starts earlier (preconnect + modulepreload) · 62 app icons on every 3D page · 63 "Add to home screen" from a 3D page installs the arcade · 64 dark colour scheme hint

Cross Road 2D (28)
65 Space hops · 66 hold a d-pad arrow to keep hopping · 67 tiny buzz per hop · 68 best time per level, "new best!" · 69 brief slow-motion on a crash · 70 Enter/Space presses the main button on any message · 71 total stars on the level list · 72 pause shows the three star goals · 73 "close!" pop when a car just misses you · 74 pauses when the window loses focus · 75 main button gets focus · 76 data-saver/low battery renders at 1x · 77 Android back: game → level list → store · 78 counts as last played in the store · 79 live timer in the HUD · 80 R restarts · 81 pause button turns into ▶ · 82 app icons / manifest on the page · 83 whoosh sound on a close call · 84 ripple when you land on a log, lily or turtle · 85 hop pitch rises as you near the bowl · 86 hawk cry when it starts circling · 87 train horn when a train sets off nearby · 88 slide sound on ice · 89 paw prints in the snow (Frosty Fields) · 90 victory bounce at the bowl · 91 last heart pulses · 92 HUD fits on one line on small phones

Inkbound (8)
93 starting a match on a phone goes full screen and locks landscape where allowed · 94 buzz on touch buttons · 95 counts as last played · 96 leaving for the store exits full screen · 97 tab title names the arcade · 98 install icons / manifest · 99 header buttons become icons on narrow phones · 100 touch pad hidden outside matches (it ran off the screen)

Install (2)
101 iPhone home-screen title and full-screen status bar · 102 re-opening the installed app focuses the open window

Checks run: every 2D mode started and driven in portrait and landscape; Cross Road 2D and Inkbound played; all 7 3D pages booted with a three.js stand-in (no script errors, loading screen clears); save → erase → load in both modes.
Not verifiable here: how the 3D games look (three.js can't download in the build sandbox) and the offline caching of three.js (needs a real connection once).

## 1.1.1
- World buttons on the pick sheet now always do something. Cat Quest: Classic opens the story map; Cat Worlds and The River play their own 50 levels directly, starting at level 1 and moving on as you clear them ("Next level" stays inside that world; your place is remembered). A line under the buttons says what PLAY will do. Cat Run: the chosen world sets the run type (Classic Dash, Cat World Run, River Run), as before.

## 1.1.2
- Real store screenshots for the 3D games: the first time you play each one, the app saves a real frame from it and that store card uses it from then on (kept out of save files).
- three.js now loads from cdn.jsdelivr.net (same version) and is cached for offline play.

## 1.1.3
- Offline layer now loads new code first when online, so updates (like the screenshot capture) work on the first visit instead of the second.
- 3D screenshot capture starts sooner (1.5 s) and keeps trying for 30 s.

## 1.2.0 - real MIDI jukebox
- 24 songs live as real .mid files in `music/` (listed in `music/playlist.json`); nothing is typed into code.
- `midi.js` reads Standard MIDI Files (tempo changes, instruments, volume/pan, drums) and plays them with a built-in Web Audio synth.
- Every song plays start to finish; when it ends a new random song starts (all 24 play before any repeats, and the last song of the previous visit never opens the next one).
- The intro (tap screen + intro animation) plays Hard Knock Life; the old chiptune tune is gone. After it the shuffle carries on.
- All 3D games, Cross Road 2D, Inkbound and the 2D arcade have music; the sound button (or the small music button in the 3D games / Inkbound) mutes it, and the choice is remembered.
- Music pauses when the app is in the background and resumes when you come back; service worker caches the songs for offline play (cq-1.2.0).
- 1.2.1: soundtrack now 24 songs (added Sabotage, Fight For Your Right, Gangsta's Paradise, Ruff Ryders' Anthem, I Heard It Through the Grapevine).
- 1.2.2: Elk River Bandit added to the store (elkriver/), with its own 24-song MIDI soundtrack and a back-to-store button.
