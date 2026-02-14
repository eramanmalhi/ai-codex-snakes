import { Snake } from './snake.js';
import { Food } from './food.js';
import { PowerUpManager } from './powerups.js';
import { DifficultyManager } from './difficulty.js';
import { keyFromPosition, loadHighScore, saveHighScore, randomGridPosition } from './utils.js';

export class Game {
  constructor({ canvas, hud, config }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = hud;
    this.config = config;

    this.gridSize = config.preset.grid;
    this.cellSize = canvas.width / this.gridSize;

    this.snake = new Snake({ x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) });
    this.food = new Food(this.gridSize);
    this.powerups = new PowerUpManager(this.gridSize);
    this.difficulty = new DifficultyManager(config.preset);

    this.obstacles = [];
    this.score = 0;
    this.highScore = loadHighScore();
    this.lastFrameAt = performance.now();
    this.accumulator = 0;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.animationFrame = null;
    this.lastFoodSpawnRefresh = 0;

    this.onGameOver = null;
    this.soundEnabled = false;

    this.food.respawn(this.getBlockedPositions());
    this.renderHud();
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setGameOverHandler(callback) {
    this.onGameOver = callback;
  }

  start() {
    this.running = true;
    this.lastFrameAt = performance.now();
    this.loop(this.lastFrameAt);
  }

  stop() {
    this.running = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  togglePause() {
    if (this.gameOver) return this.paused;
    this.paused = !this.paused;
    this.lastFrameAt = performance.now();
    return this.paused;
  }

  restart() {
    this.stop();

    this.snake.reset({ x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) });
    this.food = new Food(this.gridSize);
    this.powerups = new PowerUpManager(this.gridSize);
    this.difficulty.reset();

    this.obstacles = [];
    this.score = 0;
    this.accumulator = 0;
    this.paused = false;
    this.gameOver = false;
    this.lastFoodSpawnRefresh = 0;

    this.food.respawn(this.getBlockedPositions());
    this.renderHud();
    this.start();
  }

  setDirection(direction) {
    if (this.paused || this.gameOver) {
      return;
    }
    this.snake.setDirection(direction);
  }

  loop(now) {
    if (!this.running) {
      return;
    }

    const delta = now - this.lastFrameAt;
    this.lastFrameAt = now;

    if (!this.paused && !this.gameOver) {
      this.difficulty.update(delta);
      this.powerups.setSpawnCooldown(this.difficulty.foodSpawnMs + 3000);

      this.accumulator += delta;
      const stepMs = this.difficulty.getStepIntervalMs(
        this.powerups.hasEffect('speedBoost'),
        this.powerups.hasEffect('slowMotion'),
      );

      while (this.accumulator >= stepMs) {
        this.step(now);
        this.accumulator -= stepMs;
      }

      if (now - this.lastFoodSpawnRefresh >= this.difficulty.foodSpawnMs) {
        this.lastFoodSpawnRefresh = now;
      }

      this.powerups.update(now, this.score, this.getBlockedPositions(), this.difficulty.powerupRarityMultiplier);
    }

    this.render(now);
    this.animationFrame = requestAnimationFrame((nextNow) => this.loop(nextNow));
  }

  step(now) {
    const head = this.snake.move();

    if (this.powerups.hasEffect('ghostMode')) {
      head.x = (head.x + this.gridSize) % this.gridSize;
      head.y = (head.y + this.gridSize) % this.gridSize;
      this.snake.segments[0] = head;
    }

    if (!this.powerups.hasEffect('ghostMode')) {
      const hitWall = head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize;
      if (hitWall) {
        this.triggerGameOver();
        return;
      }
    }

    if (this.snake.isSelfCollision()) {
      this.triggerGameOver();
      return;
    }

    if (this.isObstacleCollision(head)) {
      this.triggerGameOver();
      return;
    }

    if (this.food.isEatenBy(head)) {
      this.snake.grow();
      const increment = this.powerups.hasEffect('doubleScore') ? 2 : 1;
      this.score += increment;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveHighScore(this.highScore);
      }

      this.food.respawn(this.getBlockedPositions());
      this.tryCreateObstacle(now);
      if (this.soundEnabled) this.playBeep(240, 0.06);
    }

    const collected = this.powerups.collectIfHit(head, now);
    if (collected && this.soundEnabled) {
      this.playBeep(360, 0.1);
    }

    this.renderHud(now);
  }

  tryCreateObstacle(now) {
    if (!this.difficulty.obstacleEnabled || this.obstacles.length >= 12 || now % 2 > 1) {
      return;
    }

    const blocked = this.getBlockedPositions();
    const blockedSet = new Set(blocked.map((cell) => keyFromPosition(cell)));
    let candidate = randomGridPosition(this.gridSize);
    let guard = 0;
    while (blockedSet.has(keyFromPosition(candidate)) && guard < 500) {
      candidate = randomGridPosition(this.gridSize);
      guard += 1;
    }
    this.obstacles.push(candidate);
  }

  isObstacleCollision(head) {
    return this.obstacles.some((obstacle) => obstacle.x === head.x && obstacle.y === head.y);
  }

  getBlockedPositions() {
    const cells = [...this.snake.segments, ...this.obstacles];
    if (this.powerups.spawnedPowerup) {
      cells.push(this.powerups.spawnedPowerup.position);
    }
    return cells;
  }

  triggerGameOver() {
    this.gameOver = true;
    this.running = false;
    if (this.soundEnabled) this.playBeep(120, 0.16);
    if (this.onGameOver) {
      this.onGameOver({ score: this.score, highScore: this.highScore });
    }
  }

  playBeep(frequency, duration) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(0.04, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  renderHud(now = performance.now()) {
    this.hud.player.textContent = this.config.player;
    this.hud.score.textContent = String(this.score);
    this.hud.highScore.textContent = String(this.highScore);
    this.hud.difficulty.textContent = `${this.config.preset.label} +${this.difficulty.progressionLevel}`;

    const listItems = this.powerups.getActiveEffectLabels(now);
    this.hud.powerups.innerHTML = listItems.length
      ? listItems
          .map(
            (effect) =>
              `<li><span>${effect.name}</span><strong>${Math.ceil(effect.remainingMs / 1000)}s</strong></li>`,
          )
          .join('')
      : '<li><span>None</span><strong>-</strong></li>';
  }

  render(now) {
    const { ctx, canvas, cellSize } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0d1321';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= this.gridSize; i += 1) {
      ctx.strokeStyle = 'rgba(120, 130, 170, 0.14)';
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    this.obstacles.forEach((obstacle) => {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(obstacle.x * cellSize + 2, obstacle.y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    this.food.draw(ctx, cellSize);
    this.powerups.draw(ctx, cellSize);
    this.snake.draw(ctx, cellSize);

    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }

    this.renderHud(now);
  }
}
