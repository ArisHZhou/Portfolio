export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.toggleBtn = document.querySelector('#theme-toggle');
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    this.setupMediaQueryListener();
  }

  setupEventListeners() {
    this.toggleBtn?.addEventListener('click', () => this.toggleTheme());
  }

  setupMediaQueryListener() {
    this.prefersDark.addEventListener('change', (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      this.applyTheme(newTheme);
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update button text/icon
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
      this.toggleBtn.innerHTML = theme === 'light' 
        ? '🌙' // moon icon
        : '☀️'; // sun icon
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
}
