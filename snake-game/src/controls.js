const DIRECTION_MAP = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

export class Controls {
  constructor(targetElement, onDirection) {
    this.targetElement = targetElement;
    this.onDirection = onDirection;
    this.touchStart = null;
    this.minSwipeDistance = 28;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
  }

  bind() {
    window.addEventListener('keydown', this.boundKeyHandler);
    this.targetElement.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    this.targetElement.addEventListener('touchmove', this.boundTouchMove, { passive: true });
  }

  unbind() {
    window.removeEventListener('keydown', this.boundKeyHandler);
    this.targetElement.removeEventListener('touchstart', this.boundTouchStart);
    this.targetElement.removeEventListener('touchmove', this.boundTouchMove);
  }

  handleKeyDown(event) {
    const direction = DIRECTION_MAP[event.key];
    if (!direction) {
      return;
    }

    event.preventDefault();
    this.onDirection(direction);
  }

  handleTouchStart(event) {
    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  handleTouchMove(event) {
    if (!this.touchStart) {
      return;
    }

    const touch = event.touches[0];
    const diffX = touch.clientX - this.touchStart.x;
    const diffY = touch.clientY - this.touchStart.y;

    if (Math.abs(diffX) < this.minSwipeDistance && Math.abs(diffY) < this.minSwipeDistance) {
      return;
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      this.onDirection(diffX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      this.onDirection(diffY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }

    this.touchStart = null;
  }
}
