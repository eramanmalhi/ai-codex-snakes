import { POWERUPS, randomGridPosition, isSamePosition } from './utils.js';

export class PowerUpManager {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.spawnedPowerup = null;
    this.activeEffects = [];
    this.lastSpawnAt = 0;
    this.spawnCooldownMs = 12000;
  }

  setSpawnCooldown(ms) {
    this.spawnCooldownMs = Math.max(6000, ms);
  }

  update(now, score, blockedPositions, rarityMultiplier = 1) {
    this.activeEffects = this.activeEffects.filter((effect) => effect.endsAt > now);

    if (this.spawnedPowerup) {
      if (this.spawnedPowerup.expiresAt <= now) {
        this.spawnedPowerup = null;
      }
      return;
    }

    if (now - this.lastSpawnAt < this.spawnCooldownMs * rarityMultiplier) {
      return;
    }

    const unlockables = Object.values(POWERUPS).filter((powerup) => score >= powerup.scoreUnlock);
    if (!unlockables.length || Math.random() > 0.45) {
      this.lastSpawnAt = now;
      return;
    }

    const template = unlockables[Math.floor(Math.random() * unlockables.length)];
    const blockedSet = new Set(blockedPositions.map((cell) => `${cell.x},${cell.y}`));
    let position = randomGridPosition(this.gridSize);
    let guard = 0;

    while (blockedSet.has(`${position.x},${position.y}`) && guard < 1000) {
      position = randomGridPosition(this.gridSize);
      guard += 1;
    }

    this.spawnedPowerup = {
      ...template,
      position,
      expiresAt: now + 6000,
    };
    this.lastSpawnAt = now;
  }

  collectIfHit(head, now) {
    if (!this.spawnedPowerup || !isSamePosition(this.spawnedPowerup.position, head)) {
      return null;
    }

    const collected = this.spawnedPowerup;
    this.activeEffects.push({
      id: collected.id,
      name: collected.name,
      endsAt: now + collected.durationMs,
    });
    this.spawnedPowerup = null;
    return collected;
  }

  hasEffect(effectId) {
    return this.activeEffects.some((effect) => effect.id === effectId);
  }

  draw(ctx, cellSize) {
    if (!this.spawnedPowerup) {
      return;
    }

    const { position, color } = this.spawnedPowerup;
    ctx.fillStyle = color;
    ctx.fillRect(position.x * cellSize + 2, position.y * cellSize + 2, cellSize - 4, cellSize - 4);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(position.x * cellSize + 2, position.y * cellSize + 2, cellSize - 4, cellSize - 4);
  }

  getActiveEffectLabels(now) {
    return this.activeEffects.map((effect) => ({
      name: effect.name,
      remainingMs: Math.max(0, effect.endsAt - now),
    }));
  }
}
