export class LazyLoading {
  constructor() {
    this.lazyImages = document.querySelectorAll('[data-src]');
    this.imageObserver = null;
    this.observerOptions = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.1
    };
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }

    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.imageObserver = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.imageObserver.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a new image to preload
    const preloadImage = new Image();
    
    preloadImage.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      
      gsap.fromTo(img, 
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5,
          clearProps: "transform"
        }
      );
    };

    preloadImage.src = src;
  }

  loadAllImages() {
    this.lazyImages.forEach(img => this.loadImage(img));
  }
}
