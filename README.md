# Trash Can Treasure

A side-scrolling endless runner built with HTML5 Canvas. The character, city, trash cans, and coins all come from the sprite sheets in `assets/`.

## Launch

Serve the folder over HTTP (the browser needs that to load local images reliably):

```bash
# Python
python -m http.server 8080

# or Node
npx --yes serve -p 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Opening `index.html` directly as a file may also work in some browsers.

## Controls

| Action | Keys / input |
| --- | --- |
| Jump | Space, Arrow Up, W, left click, or tap |
| Pause / resume | Escape or P |
| Start / restart | Jump |

There is no slide move. The sheets have idle, run, jump, fall, and landing poses, but not a dedicated slide animation.

## Assets used

Original files were not renamed, moved, or overwritten.

- `assets/SpriteSheet_01.png` (768×1024)
  - Idle row (11 frames)
  - Run / jog row (11 frames)
  - Jump row (10 frames)
  - Fall and land frames
  - Green trash cans and dumpsters
  - Garbage bags
  - Gold coin spin, crown coins, blue bonus coins
  - Pickup sparks and `+1` / `+5` / `+10` / `BONUS!` art
- `assets/SpriteSheet_02.png` (768×1024)
  - Night skyline, shop street, and warehouse alley (parallax)
  - Road and sidewalk tiles
  - Lamps, hydrant, signs, bench, tree, fence, pallets, boxes, barrier
- `assets/01.png` (151×243)
  - Character portrait on the title and game-over screens

## Missing animations

- No slide / duck strip
- No separate hit or death strip (game over uses a falling pose)

## Project files

- `index.html` — page shell
- `style.css` — layout and 16:9 scaling
- `game.js` — loop, physics, input, collisions, animation
- `assets/` — original artwork
