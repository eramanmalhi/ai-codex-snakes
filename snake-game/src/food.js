import { randomGridPosition, isSamePosition } from './utils.js';

export class Food {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.position = randomGridPosition(gridSize);
  }

  respawn(blockedPositions) {
    const blocked = new Set(blockedPositions.map((pos) => `${pos.x},${pos.y}`));
    let candidate = this.position;
    let guard = 0;

    while (blocked.has(`${candidate.x},${candidate.y}`) && guard < 1000) {
      candidate = randomGridPosition(this.gridSize);
      guard += 1;
    }

    this.position = candidate;
  }

  isEatenBy(head) {
    return isSamePosition(this.position, head);
  }

  draw(ctx, cellSize) {
    ctx.fillStyle = '#ff5d73';
    ctx.beginPath();
    ctx.arc(
      this.position.x * cellSize + cellSize / 2,
      this.position.y * cellSize + cellSize / 2,
      cellSize * 0.38,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
