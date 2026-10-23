# Trash Can Treasure

A side-scrolling endless runner built with HTML5 Canvas. The character (Obi), city night streets, trash cans, and coins all come from the sprite sheets in `assets/`.

## Features

- **Attractive Start Menu**: Character portrait card, high score badge, control guide, coin rewards guide, mode selector, and fullscreen toggle.
- **Desktop & Mobile Modes**:
  - **Desktop Mode**: Clean view with keyboard controls (`Space` / `↑` / `W` to jump, `P` / `Esc` to pause) and on-screen keyboard guide.
  - **Mobile Mode**: Responsive touch HUD featuring a large tactile Jump button, top Pause button, and Fullscreen button.
  - Auto-detects device type on first visit and persists your preference in `localStorage`.
- **Responsive Screen & Orientation Support**: Adapts cleanly to any screen aspect ratio (smartphones, tablets, desktop monitors) with safe-area notch padding. Displays a friendly rotation prompt when held in portrait mode on mobile with a "Continue in Portrait" option.
- **Fullscreen Mode**: One-tap toggle to enter and exit fullscreen on supported browsers.
- **Pause & Game Over Overlays**: Quick access to Resume, Restart, Main Menu, and Mode switching.
- **Procedural Audio**: Web Audio synthesizer for jumps, coins, bonuses, collisions, and starts without external audio file dependencies.

---

## Launch & Testing

### 1. Run Local HTTP Server

Serve the project folder over HTTP (recommended for all browsers):

```bash
# Using Python
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your web browser.

### 2. Testing Desktop Mode
- Navigate to [http://localhost:8080](http://localhost:8080).
- Click **💻 Desktop** in the Start Menu.
- Press `Space`, `↑`, `W`, or click **PLAY GAME** to start running.
- Hold `Space` for higher leaps over obstacles.
- Press `P` or `Esc` to pause, and test the Resume and Restart buttons.

### 3. Testing Mobile Mode on Desktop (DevTools)
- Open Developer Tools in Chrome / Edge / Firefox (`F12` or `Ctrl + Shift + I`).
- Toggle Device Toolbar (`Ctrl + Shift + M`).
- Select a mobile device preset (e.g. iPhone 14, Pixel 7, iPad).
- Click **📱 Mobile** mode in the Start Menu.
- Notice the large on-screen **JUMP** button in the bottom right, and the **⏸** Pause and **⛶** Fullscreen buttons at the top.
- Test portrait orientation to see the smooth rotation prompt, or rotate to landscape for optimal gameplay.

### 4. Testing on a Physical Phone or Tablet (Local Network)
- Find your computer's local IP address (e.g., `ipconfig` on Windows, typically `192.168.x.x`).
- Start the server on port 8080:
  ```bash
  python -m http.server 8080 --bind 0.0.0.0
  ```
- On your phone or tablet connected to the same Wi-Fi, open `http://<YOUR_COMPUTER_IP>:8080`.
- Tap **PLAY GAME** and play using the tactile touch controls.

---

## Controls Summary

| Mode | Action | Input |
| --- | --- | --- |
| **Desktop** | Jump / Leap | `Space`, `ArrowUp`, `KeyW`, or Click |
| **Desktop** | Pause / Resume | `Escape` or `KeyP` |
| **Mobile** | Jump / Leap | Tap / Hold **JUMP** button (or tap canvas) |
| **Mobile** | Pause / Resume | Tap **⏸** button (top right) |
| **All** | Fullscreen | Tap / Click **⛶** Fullscreen button |
| **All** | Start / Restart | Click Play button, restart button, or Jump key |

---

## Assets Used

Original assets remain untouched:
- `assets/SpriteSheet_01.png` (768×1024): Character poses (idle, run, jump, fall, land), obstacles, coins, and sparks.
- `assets/SpriteSheet_02.png` (768×1024): Night city skyline parallax layers, road, sidewalk, and street props.
- `assets/01.png` (151×243): Character portrait of Obi.
- `assets/Objects.png`: Supplementary asset sheet.

---

## Project Files

- `index.html` — Page shell, start menu overlay, mobile touch controls, dialogs.
- `style.css` — Modern neon styling, touch controls, responsive canvas, orientation helper.
- `game.js` — Loop, physics, inputs, state machine, procedural audio, collisions, scoring.
- `_backup_original/` — Untouched backup of the original project files.
- `assets/` — Original art files.
