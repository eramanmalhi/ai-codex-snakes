# Modern Snake Game

A production-style Snake game inspired by classic Nokia gameplay, rebuilt with HTML5 Canvas and modern ES modules.

## Features

- Responsive HTML5 Canvas gameplay for desktop and mobile.
- Start session modal with player name + difficulty selection.
- Session persistence using `sessionStorage`.
- High score persistence using `localStorage`.
- Grid-based movement with wall/self/obstacle collision.
- Delta-time game loop powered by `requestAnimationFrame`.
- Automatic difficulty progression every 30 seconds.
- Dynamic obstacle spawning after 60 seconds.
- Progressive powerups unlocked by score:
  - 5+: Speed Boost
  - 10+: Slow Motion
  - 15+: Ghost Mode
  - 20+: Double Score
- Mobile swipe controls and desktop keyboard controls.
- Optional enhancements included:
  - Pause/Resume
  - Sound effects toggle
  - Dark mode toggle

## How to run

### Option 1: Open directly
Open `index.html` in a modern browser that supports ES modules.

### Option 2: Serve locally (recommended)
Use any static server, for example:

```bash
cd snake-game
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Controls

- **Desktop:** Arrow keys or `W/A/S/D`
- **Mobile:** Swipe in any direction on the game screen
- **Pause:** Pause button
- **Restart:** Use Restart or Play Again on game over modal

## Architecture

```text
snake-game/
├── index.html
├── style.css
├── README.md
├── assets/
└── src/
    ├── main.js         # App bootstrap + modal/session wiring
    ├── game.js         # Main game orchestration + loop + rendering
    ├── snake.js        # Snake class + movement/collision helpers
    ├── food.js         # Food spawn/respawn/draw logic
    ├── powerups.js     # Powerup spawning, activation, expiry logic
    ├── difficulty.js   # Difficulty presets + progressive scaling
    ├── controls.js     # Keyboard + swipe input handlers
    └── utils.js        # Shared constants and utility helpers
```

## Future enhancements

- Better audio engine with pooled `AudioContext`.
- Particle FX for powerups and game over.
- Multiple maps/themes loaded from `assets/`.
- Accessibility mode (color-blind palette + haptics).
- Touch on-screen directional pad option.
- Online leaderboard backend.
