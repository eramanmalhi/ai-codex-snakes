import { isSamePosition } from './utils.js';

export class Snake {
  constructor(startPosition) {
    this.reset(startPosition);
  }

  reset(startPosition) {
    this.segments = [startPosition];
    this.direction = { x: 1, y: 0 };
    this.pendingDirection = { x: 1, y: 0 };
    this.pendingGrowth = 0;
  }

  setDirection(nextDirection) {
    const opposite = this.direction.x === -nextDirection.x && this.direction.y === -nextDirection.y;
    if (!opposite) {
      this.pendingDirection = nextDirection;
    }
  }

  move() {
    this.direction = this.pendingDirection;
    const head = this.getHead();
    const nextHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    this.segments.unshift(nextHead);
    if (this.pendingGrowth > 0) {
      this.pendingGrowth -= 1;
    } else {
      this.segments.pop();
    }

    return nextHead;
  }

  grow(units = 1) {
    this.pendingGrowth += units;
  }

  getHead() {
    return this.segments[0];
  }

  isSelfCollision() {
    const [head, ...body] = this.segments;
    return body.some((segment) => isSamePosition(segment, head));
  }

  occupiesPosition(position, skipHead = false) {
    const segments = skipHead ? this.segments.slice(1) : this.segments;
    return segments.some((segment) => isSamePosition(segment, position));
  }

  draw(ctx, cellSize) {
    this.segments.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#32d296' : '#24a173';
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#0f5137';
      ctx.strokeRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
  }
}
