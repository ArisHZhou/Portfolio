export class CustomCursor {
  constructor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'cursor-dot';
    this.isVisible = false;
    this.links = document.querySelectorAll('a, button, .clickable');
  }

  init() {
    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorDot);
    this.setupEventListeners();
    this.setupLinkHovers();
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => this.moveCursor(e));
    document.addEventListener('mouseenter', () => this.showCursor());
    document.addEventListener('mouseleave', () => this.hideCursor());
    document.addEventListener('mousedown', () => this.clickEffect());
    document.addEventListener('mouseup', () => this.removeClickEffect());
  }

  setupLinkHovers() {
    this.links.forEach(link => {
      link.addEventListener('mouseenter', () => this.enlargeCursor());
      link.addEventListener('mouseleave', () => this.shrinkCursor());
    });
  }

  moveCursor(e) {
    const posX = e.clientX;
    const posY = e.clientY;

    gsap.to(this.cursor, {
      x: posX,
      y: posY,
      duration: 0.1
    });

    gsap.to(this.cursorDot, {
      x: posX,
      y: posY,
      duration: 0.3
    });
  }

  showCursor() {
    if (!this.isVisible) {
      this.isVisible = true;
      gsap.to([this.cursor, this.cursorDot], {
        opacity: 1,
        duration: 0.3
      });
    }
  }

  hideCursor() {
    if (this.isVisible) {
      this.isVisible = false;
      gsap.to([this.cursor, this.cursorDot], {
        opacity: 0,
        duration: 0.3
      });
    }
  }

  enlargeCursor() {
    gsap.to(this.cursor, {
      scale: 1.5,
      duration: 0.3
    });
  }

  shrinkCursor() {
    gsap.to(this.cursor, {
      scale: 1,
      duration: 0.3
    });
  }

  clickEffect() {
    gsap.to(this.cursor, {
      scale: 0.8,
      duration: 0.1
    });
  }

  removeClickEffect() {
    gsap.to(this.cursor, {
      scale: 1,
      duration: 0.1
    });
  }
}
