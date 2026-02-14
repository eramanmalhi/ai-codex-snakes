import { Game } from './game.js';
import { Controls } from './controls.js';
import { DIFFICULTY_PRESETS, loadSessionConfig, saveSessionConfig } from './utils.js';

const el = {
  canvas: document.getElementById('gameCanvas'),
  playerName: document.getElementById('playerName'),
  score: document.getElementById('score'),
  highScore: document.getElementById('highScore'),
  difficulty: document.getElementById('difficulty'),
  powerups: document.getElementById('activePowerups'),
  startModal: document.getElementById('startModal'),
  startForm: document.getElementById('startForm'),
  playerInput: document.getElementById('playerInput'),
  difficultyInput: document.getElementById('difficultyInput'),
  gameOverModal: document.getElementById('gameOverModal'),
  gameOverMessage: document.getElementById('gameOverMessage'),
  restartBtn: document.getElementById('restartBtn'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  darkModeBtn: document.getElementById('darkModeBtn'),
};

let game = null;
let controls = null;
let soundEnabled = false;

function setupFromConfig(config) {
  if (controls) {
    controls.unbind();
  }

  game = new Game({
    canvas: el.canvas,
    hud: {
      player: el.playerName,
      score: el.score,
      highScore: el.highScore,
      difficulty: el.difficulty,
      powerups: el.powerups,
    },
    config,
  });

  controls = new Controls(document.body, (direction) => game.setDirection(direction));
  controls.bind();

  game.setSoundEnabled(soundEnabled);
  game.setGameOverHandler(({ score }) => {
    el.gameOverMessage.textContent = `Final score: ${score}`;
    el.gameOverModal.classList.add('show');
  });

  game.start();
}

function openStartModal(prefill) {
  el.playerInput.value = prefill?.player || '';
  el.difficultyInput.value = prefill?.difficulty || 'easy';
  el.startModal.classList.add('show');
}

function closeStartModal() {
  el.startModal.classList.remove('show');
}

el.startForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const player = el.playerInput.value.trim();
  const difficulty = el.difficultyInput.value;

  const config = {
    player,
    difficulty,
    preset: DIFFICULTY_PRESETS[difficulty],
  };

  saveSessionConfig({ player, difficulty });
  closeStartModal();
  setupFromConfig(config);
});

el.restartBtn.addEventListener('click', () => {
  el.gameOverModal.classList.remove('show');
  game.restart();
});

el.playAgainBtn.addEventListener('click', () => {
  el.gameOverModal.classList.remove('show');
  openStartModal(loadSessionConfig());
});

el.pauseBtn.addEventListener('click', () => {
  if (!game) return;
  const paused = game.togglePause();
  el.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
});

el.soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  el.soundToggleBtn.textContent = `Sound: ${soundEnabled ? 'On' : 'Off'}`;
  if (game) game.setSoundEnabled(soundEnabled);
});

el.darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

const stored = loadSessionConfig();
if (stored && DIFFICULTY_PRESETS[stored.difficulty]) {
  openStartModal(stored);
} else {
  openStartModal();
}
