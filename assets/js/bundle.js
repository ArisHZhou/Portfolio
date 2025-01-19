(function () {
  'use strict';

  const animationHelpers = {
    fadeInSequence(elements, stagger = 0.1) {
      return gsap.from(elements, {
        opacity: 0,
        y: 20,
        stagger,
        duration: 0.5
      });
    },

    createScrollTrigger(element, animation) {
      return ScrollTrigger.create({
        trigger: element,
        animation,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      });
    }
  };

  class AnimationCore {
    constructor() {
      this.initGSAP();
      this.animations = new Map();
    }

    initGSAP() {
      gsap.defaults({
        ease: 'power2.out',
        duration: 0.5
      });

      gsap.registerEffect({
        name: 'fadeIn',
        effect: (targets, config) => {
          return gsap.from(targets, {
            duration: config.duration || 0.5, 
            opacity: 0,
            y: config.distance || 20,
            stagger: config.stagger || 0.1
          });
        }
      });
    }

    pageEnter(element) {
      return gsap.timeline()
        .from(element, {
          opacity: 0,
          y: 30,
          duration: 0.6
        })
        .from(element.querySelectorAll('.animate-item'), {
          opacity: 0,
          y: 20,
          duration: 0.4,
          stagger: 0.1
        }, '-=0.3');
    }

    pageLeave(element) {
      return gsap.timeline()
        .to(element, {
          opacity: 0,
          y: -30,
          duration: 0.4
        });
    }

    setupScrollAnimations() {
      const elements = document.querySelectorAll('[data-scroll-animation]');
      
      elements.forEach(element => {
        const animation = element.dataset.scrollAnimation;
        const delay = element.dataset.delay || 0;
        
        animationHelpers.createScrollTrigger(element, () => {
          this.playAnimation(element, animation, delay);
        });
      });
    }

    playAnimation(element, animationType, delay) {
      let animation;
      
      switch (animationType) {
        case 'fadeIn':
          animation = gsap.from(element, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: parseFloat(delay)
          });
          break;
        
        case 'slideIn':
          animation = gsap.from(element, {
            x: -50,
            opacity: 0,
            duration: 0.6,
            delay: parseFloat(delay)
          });
          break;
        
        case 'scaleIn':
          animation = gsap.from(element, {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            delay: parseFloat(delay)
          });
          break;
        
        default:
          animation = gsap.from(element, {
            opacity: 0,
            duration: 0.6,
            delay: parseFloat(delay)
          });
      }
      
      this.animations.set(element, animation);
    }

    reverseAnimation(element) {
      const animation = this.animations.get(element);
      if (animation) {
        animation.reverse();
      }
    }

    setupHoverAnimations() {
      const hoverElements = document.querySelectorAll('[data-hover-animation]');
      
      hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          this.playHoverAnimation(element, 'enter');
        });
        
        element.addEventListener('mouseleave', () => {
          this.playHoverAnimation(element, 'leave');
        });
      });
    }

    playHoverAnimation(element, state) {
      const type = element.dataset.hoverAnimation;
      
      switch (type) {
        case 'scale':
          gsap.to(element, {
            scale: state === 'enter' ? 1.05 : 1,
            duration: 0.3
          });
          break;
          
        case 'lift':
          gsap.to(element, {
            y: state === 'enter' ? -5 : 0,
            duration: 0.3
          });
          break;
          
        case 'glow':
          gsap.to(element, {
            boxShadow: state === 'enter' 
              ? '0 0 20px rgba(255,255,255,0.3)' 
              : 'none',
            duration: 0.3
          });
          break;
      }
    }

    animateSequence(elements) {
      return animationHelpers.fadeInSequence(elements);
  }
  }

  class ThemeManager {
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

  class LazyLoading {
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

  class ImageOptimizer {
    constructor() {
      this.maxWidth = 1920;
      this.quality = 0.8;
      this.supportedFormats = ['image/webp', 'image/jpeg', 'image/png'];
    }

    async optimizeImage(file) {
      try {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
          throw new Error('File is not an image');
        }

        // Create image element
        const img = await this.createImageFromFile(file);
        
        // Resize if needed
        const { width, height } = this.calculateDimensions(img);
        
        // Create canvas with new dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw image to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP if supported
        if (this.isWebPSupported()) {
          return await this.convertToWebP(canvas);
        }
        
        // Fallback to original format
        return await this.canvasToBlob(canvas, file.type);
      } catch (error) {
        console.error('Image optimization failed:', error);
        return file; // Return original file if optimization fails
      }
    }

    async createImageFromFile(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }

    calculateDimensions(img) {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > this.maxWidth) {
        const ratio = this.maxWidth / width;
        width = this.maxWidth;
        height = Math.round(height * ratio);
      }
      
      return { width, height };
    }

    isWebPSupported() {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    async convertToWebP(canvas) {
      return await this.canvasToBlob(canvas, 'image/webp');
    }

    canvasToBlob(canvas, type) {
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          type,
          this.quality
        );
      });
    }

    // Helper method for generating responsive sizes
    generateResponsiveSizes(file, sizes = [320, 640, 960, 1280, 1920]) {
      return Promise.all(
        sizes.map(async (size) => {
          this.maxWidth = size;
          const optimizedImage = await this.optimizeImage(file);
          return {
            size,
            blob: optimizedImage,
            url: URL.createObjectURL(optimizedImage)
          };
        })
      );
    }
  }

  class GalleryFilter {
    constructor() {
      this.buttons = document.querySelectorAll('.filter-btn');
      this.items = document.querySelectorAll('.gallery-item');
    }

    init() {
      this.setupFilterButtons();
    }

    setupFilterButtons() {
      this.buttons.forEach(button => {
        button.addEventListener('click', () => {
          const category = button.dataset.filter;
          this.filterItems(category);
          this.updateActiveButton(button);
        });
      });
    }

    filterItems(category) {
      this.items.forEach(item => {
        const shouldShow = category === 'all' || 
                          item.dataset.category === category;
        item.style.display = shouldShow ? 'block' : 'none';
      });
    }

    updateActiveButton(activeButton) {
      this.buttons.forEach(btn => btn.classList.remove('active'));
      activeButton.classList.add('active');
    }
  }

  class GalleryModal {
    constructor() {
      this.modal = document.querySelector('.modal');
      this.modalImage = this.modal?.querySelector('img');
      this.modalContent = this.modal?.querySelector('.modal-content');
      this.closeButton = this.modal?.querySelector('.close');
      this.hoverDetails = this.modal?.querySelector('.hover-details');
      this.isOpen = false;
    }

    init() {
      if (!this.modal) return;
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.closeButton?.addEventListener('click', () => this.close());
      this.modalContent?.addEventListener('mouseenter', (event) => {
        if (event.target !== this.modalContent) return;
        this.hoverDetails.style.display = 'block';
    });
    
    this.modalContent?.addEventListener('mouseleave', (event) => {
        if (event.target !== this.modalContent) return;
        this.hoverDetails.style.display = 'none'; 
    });
      this.modal?.addEventListener('click', (e) => {
        //console.log(e.target);
        //if (e.target === this.modal) this.close();
        this.close(); 
      });

      // Handle keyboard events
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }

    open(imageSrc) {
      if (!this.modalImage || !this.modal) return;
      
      this.modalImage.src = imageSrc;
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.isOpen = true;

      // Animate modal opening
      gsap.fromTo(this.modal, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      
      gsap.fromTo(this.modalImage,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.1 }
      );
    }

    close() {
      if (!this.modal) return;

      gsap.to(this.modal, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.modal.classList.remove('active');
          document.body.style.overflow = '';
          this.isOpen = false;
        }
      });
    }
  }

  class Gallery {
    constructor() {
      this.filter = new GalleryFilter();
      this.modal = new GalleryModal();
      this.items = document.querySelectorAll('.gallery-item');
      this.imageOptimizer = new ImageOptimizer();
      this.gallery = document.querySelector('.gallery');
      this.uploadInput = document.querySelector('#gallery-upload');

      this.hamburger = document.querySelector('.hamburger');
   this.menu = document.querySelector('#primary-navigation'); // Use your menu's ID

    }

    init() {
      this.filter.init();
      this.modal.init();
      this.setupItemInteractions();
      this.setupImageUpload();
      this.setupLazyLoading();

   this.hamburger.addEventListener('click', () => {
    this.hamburger.classList.toggle('active');
    this.menu.classList.toggle('active'); 
  });
    }


    setupItemInteractions() {
      this.items.forEach(item => {
        // Setup click handling
        item.addEventListener('click', () => {
          const imgSrc = item.querySelector('img').src;
          this.modal.open(imgSrc);
        });

        // Setup hover animations
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            scale: 1.02,
            duration: 0.3
          });
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            scale: 1,
            duration: 0.3
          });
        });
      });
    }

    setupImageUpload() {
      if (this.uploadInput) {
        this.uploadInput.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          await this.handleMultipleImageUploads(files);
        });
      }
    }

    async handleMultipleImageUploads(files) {
      const uploadPromises = files.map(file => this.handleImageUpload(file));
      
      try {
        const optimizedImages = await Promise.all(uploadPromises);
        optimizedImages.forEach(imageData => {
          if (imageData) {
            this.addImageToGallery(imageData);
          }
        });
      } catch (error) {
        console.error('Failed to process images:', error);
        // Show error notification to user
        this.showNotification('Failed to process some images', 'error');
      }
    }

    async handleImageUpload(file) {
      try {
        const optimizedImage = await this.imageOptimizer.optimizeImage(file);
        const responsiveSizes = await this.imageOptimizer.generateResponsiveSizes(file);
        
        return {
          original: optimizedImage,
          responsive: responsiveSizes,
          name: file.name,
          type: file.type
        };
      } catch (error) {
        console.error('Failed to optimize image:', error);
        this.showNotification(`Failed to process ${file.name}`, 'error');
        return null;
      }
    }

    addImageToGallery(imageData) {
      const { original, responsive, name } = imageData;

      // Create srcset from responsive sizes
      const srcset = responsive
        .map(size => `${size.url} ${size.size}w`)
        .join(', ');

      // Create new gallery item
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.dataset.category = 'uploaded'; // or determine based on image type

      // Create image element with responsive attributes
      const img = document.createElement('img');
      img.src = URL.createObjectURL(original);
      img.srcset = srcset;
      img.sizes = '(max-width: 320px) 280px, (max-width: 640px) 580px, (max-width: 960px) 780px, 1100px';
      img.alt = name;
      img.loading = 'lazy';

      // Create title element
      const title = document.createElement('div');
      title.className = 'gallery-item-title';
      title.textContent = name;

      // Assemble gallery item
      galleryItem.appendChild(img);
      galleryItem.appendChild(title);

      // Add to gallery with animation
      this.gallery.appendChild(galleryItem);
      this.animateNewItem(galleryItem);

      // Setup interactions for new item
      this.setupSingleItemInteractions(galleryItem);
    }

    setupSingleItemInteractions(item) {
      // Click handling
      item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        this.modal.open(imgSrc);
      });

      // Hover animations
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          scale: 1.02,
          duration: 0.3
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.3
        });
      });
    }

    animateNewItem(item) {
      gsap.from(item, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    setupLazyLoading() {
      const images = this.gallery.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px'
        }
      );

      images.forEach(img => imageObserver.observe(img));
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `gallery-notification ${type}`;
      notification.textContent = message;

      document.body.appendChild(notification);

      gsap.fromTo(notification,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 }
      );

      setTimeout(() => {
        gsap.to(notification, {
          opacity: 0,
          y: -50,
          duration: 0.3,
          onComplete: () => notification.remove()
        });
      }, 3000);
    }

    // Method to update gallery layout (e.g., after filtering)
    updateLayout() {
      gsap.to(this.gallery, {
        opacity: 1,
        duration: 0.3,
        clearProps: 'all'
      });
    }

    // Method to destroy gallery instance
    destroy() {
      // Remove event listeners
      this.items.forEach(item => {
        item.removeEventListener('click', () => {});
        item.removeEventListener('mouseenter', () => {});
        item.removeEventListener('mouseleave', () => {});
      });

      // Cleanup any remaining observers
      if (this.imageObserver) {
        this.imageObserver.disconnect();
      }

      // Clear any remaining timeouts or animations
      gsap.killTweensOf(this.items);
    }
  }


  // ... existing code...

  class CustomCursor {
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

})();
//# sourceMappingURL=bundle.js.map
