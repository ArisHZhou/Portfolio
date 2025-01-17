import { AnimationCore } from './core/animations';
import { ThemeManager } from './core/theme-manager';
import { LazyLoading } from './core/lazy-loading';
import { Gallery } from './components/gallery/Gallery';
import { CustomCursor } from './components/cursor/CustomCursor';

class App {
  constructor() {
    this.animations = new AnimationCore();
    this.themeManager = new ThemeManager();
    this.lazyLoading = new LazyLoading();
    this.gallery = new Gallery();
    this.cursor = new CustomCursor();
  }

  init() {
    this.themeManager.init();
    this.lazyLoading.init();
    this.gallery.init();
    this.cursor.init();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
