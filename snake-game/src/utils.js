export const DIFFICULTY_PRESETS = {
  easy: { label: 'Easy', speed: 5, grid: 24, foodSpawnMs: 2800 },
  medium: { label: 'Medium', speed: 7, grid: 20, foodSpawnMs: 2200 },
  hard: { label: 'Hard', speed: 10, grid: 16, foodSpawnMs: 1800 },
};

export const POWERUPS = {
  speedBoost: {
    id: 'speedBoost',
    name: 'Speed Boost',
    scoreUnlock: 5,
    durationMs: 4000,
    color: '#f7b801',
  },
  slowMotion: {
    id: 'slowMotion',
    name: 'Slow Motion',
    scoreUnlock: 10,
    durationMs: 5000,
    color: '#7dd3fc',
  },
  ghostMode: {
    id: 'ghostMode',
    name: 'Ghost Mode',
    scoreUnlock: 15,
    durationMs: 5000,
    color: '#c084fc',
  },
  doubleScore: {
    id: 'doubleScore',
    name: 'Double Score',
    scoreUnlock: 20,
    durationMs: 6000,
    color: '#fb7185',
  },
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomGridPosition = (gridSize) => ({
  x: randomInt(0, gridSize - 1),
  y: randomInt(0, gridSize - 1),
});

export const keyFromPosition = ({ x, y }) => `${x},${y}`;

export const isSamePosition = (a, b) => a.x === b.x && a.y === b.y;

export function loadHighScore() {
  return Number(localStorage.getItem('snakeHighScore') || 0);
}

export function saveHighScore(score) {
  localStorage.setItem('snakeHighScore', String(score));
}

export function loadSessionConfig() {
  const raw = sessionStorage.getItem('snakeSession');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSessionConfig(config) {
  sessionStorage.setItem('snakeSession', JSON.stringify(config));
}
