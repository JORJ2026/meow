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
