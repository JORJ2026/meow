# Cat Quest Arcade 1.0 (mobile)

Open index.html from any web server (https or localhost), or add it to your home screen.
16 games in the store; every game with levels has a Level gallery on its pick sheet.

Known limits
- 3D games (Tetris, Jewels, Run 3D, Maze 3D, Pong 3D, Pac 3D, Cross Road 3D) load three.js from esm.sh, so they need internet on first play and were not test-rendered in the build sandbox.
- Store cards for those 3D games are not fresh screenshots (Cross Road 3D shows a drawn level map).
- Inkbound images are large (about 21 MB) and are fetched on demand, not pre-cached.
