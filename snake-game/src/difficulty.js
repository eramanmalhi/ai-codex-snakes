import { clamp } from './utils.js';

export class DifficultyManager {
  constructor(basePreset) {
    this.base = basePreset;
    this.reset();
  }

  reset() {
    this.elapsedMs = 0;
    this.progressionLevel = 0;
    this.currentSpeed = this.base.speed;
    this.foodSpawnMs = this.base.foodSpawnMs;
    this.powerupRarityMultiplier = 1;
    this.obstacleEnabled = false;
  }

  update(deltaMs) {
    this.elapsedMs += deltaMs;
    const level = Math.floor(this.elapsedMs / 30000);

    if (level > this.progressionLevel) {
      this.progressionLevel = level;
      this.currentSpeed = clamp(this.currentSpeed + 0.75, this.base.speed, 18);
      this.foodSpawnMs = clamp(this.foodSpawnMs - 120, 900, this.base.foodSpawnMs);
      this.powerupRarityMultiplier = clamp(this.powerupRarityMultiplier + 0.1, 1, 2.2);
    }

    if (this.elapsedMs >= 60000) {
      this.obstacleEnabled = true;
    }
  }

  getStepIntervalMs(hasSpeedBoost, hasSlowMotion) {
    let speedCellsPerSec = this.currentSpeed;

    if (hasSpeedBoost) {
      speedCellsPerSec += 3;
    }

    if (hasSlowMotion) {
      speedCellsPerSec = Math.max(2, speedCellsPerSec - 3);
    }

    return 1000 / speedCellsPerSec;
  }
}
