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
      this.gallery = document.querySelector('.gallery');
      this.galleryGrid = document.querySelector('.gallery-grid');
    }

    init() {
      if (this.buttons.length > 0) {
        this.setupFilterButtons();
      }
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
      // Store visible items to animate them later
      const visibleItems = [];
      const hiddenItems = [];
      
      this.items.forEach(item => {
        const shouldShow = category === 'all' || 
                          item.dataset.category === category;
        
        if (shouldShow) {
          visibleItems.push(item);
          item.style.display = '';
        } else {
          hiddenItems.push(item);
        }
      });
      
      // First animate out hidden items
      if (typeof gsap !== 'undefined') {
        gsap.to(hiddenItems, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          stagger: 0.05,
          onComplete: () => {
            hiddenItems.forEach(item => {
              item.style.display = 'none';
            });
            
            // Then animate in visible items
            gsap.fromTo(visibleItems, 
              { opacity: 0, scale: 0.8 },
              { 
                opacity: 1, 
                scale: 1, 
                duration: 0.3, 
                stagger: 0.05,
                onComplete: () => {
                  // Adjust layout after animation
                  if (this.galleryGrid) {
                    this.galleryGrid.style.opacity = 1;
                  }
                }
              }
            );
          }
        });
      } else {
        // Fallback for when gsap is not available
        hiddenItems.forEach(item => {
          item.style.display = 'none';
        });
      }
    }

    updateActiveButton(activeButton) {
      this.buttons.forEach(btn => btn.classList.remove('active'));
      activeButton.classList.add('active');
    }
  }

  class GalleryModal {
    constructor() {
      this.modal = document.querySelector('.gallery-modal');
      this.modalImage = this.modal?.querySelector('.modal-content img');
      this.modalTitle = this.modal?.querySelector('.modal-title');
      this.modalDescription = this.modal?.querySelector('.modal-description');
      this.modalDetails = this.modal?.querySelector('.modal-details');
      this.closeButton = this.modal?.querySelector('.modal-close');
      this.isOpen = false;
      this.keydownHandler = this.handleKeydown.bind(this);
      this.clickHandler = this.handleClick.bind(this);
      
      // Completely disable modal-details if it exists
      if (this.modalDetails) {
        this.modalDetails.style.display = 'none';
      }
      
      // Add a style element to override modal styles - use a more specific selector
      this.styleElement = document.createElement('style');
      document.head.appendChild(this.styleElement);
      this.styleElement.textContent = `
      body .gallery-modal.active {
        padding: 0 !important;
      }
      body .gallery-modal.active .modal-content {
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        background-color: rgba(0,0,0,0.9) !important;
      }
      body .gallery-modal.active img {
        max-width: 95vw !important;
        max-height: 95vh !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }
    `;
    }

    init() {
      if (!this.modal) return;
      // We'll set up event listeners in the open method to avoid conflicts
    }
    
    handleClick(e) {
      // Close if clicking outside the image
      if (e.target !== this.modalImage) {
        this.close();
      }
    }
    
    handleKeydown(e) {
      if (e.key === 'Escape' && this.isOpen) this.close();
    }

    open(imageSrc, fullSrc, title = '', description = '') {
      if (!this.modalImage || !this.modal) return;
      
      // Use the full-size image for the modal if available
      this.modalImage.src = fullSrc || imageSrc;
      
      // Set title and description if provided, but they won't be visible
      if (this.modalTitle) {
        this.modalTitle.textContent = title || '';
        this.modalTitle.style.display = 'none';
      }
      
      if (this.modalDescription) {
        this.modalDescription.innerHTML = description || '';
        this.modalDescription.style.display = 'none';
      }
      
      // Ensure modal-details is always hidden
      if (this.modalDetails) {
        this.modalDetails.style.display = 'none';
      }
      
      // Apply direct styles to ensure fullscreen
      this.modal.style.cssText = 'display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important;';
      
      const modalContent = this.modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.cssText = 'width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important; margin: 0 !important; padding: 0 !important; display: flex !important; justify-content: center !important; align-items: center !important; background-color: rgba(0,0,0,0.9) !important;';
      }
      
      if (this.modalImage) {
        this.modalImage.style.cssText = 'max-width: 95vw !important; max-height: 95vh !important; width: auto !important; height: auto !important; object-fit: contain !important;';
        
        // Prevent clicks on the image from closing the modal
        this.modalImage.addEventListener('click', e => e.stopPropagation());
      }
      
      // Add click handler to the modal content for closing
      this.modal.addEventListener('click', this.clickHandler);
      
      // Show modal
      setTimeout(() => {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Add keyboard event listener when modal opens
        document.addEventListener('keydown', this.keydownHandler);
      }, 10);

      // Animate modal opening
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(this.modal, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        
        gsap.fromTo(this.modalImage,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, delay: 0.1 }
        );
      }
    }

    close() {
      if (!this.modal || !this.isOpen) return;
      
      // Remove event listeners
      document.removeEventListener('keydown', this.keydownHandler);
      this.modal.removeEventListener('click', this.clickHandler);
      
      if (this.modalImage) {
        this.modalImage.removeEventListener('click', e => e.stopPropagation());
      }

      const completeClose = () => {
        this.modal.classList.remove('active');
        this.modal.style = '';
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Reset image src
        if (this.modalImage) {
          this.modalImage.src = '';
          this.modalImage.style = '';
        }
        
        // Reset title and description
        if (this.modalTitle) {
          this.modalTitle.textContent = '';
          this.modalTitle.style.display = '';
        }
        
        if (this.modalDescription) {
          this.modalDescription.innerHTML = '';
          this.modalDescription.style.display = '';
        }
        
        // Ensure modal-details remains hidden
        if (this.modalDetails) {
          this.modalDetails.style.display = 'none';
        }
        
        // Reset modal content styles
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style = '';
        }
      };

      if (typeof gsap !== 'undefined') {
        gsap.to(this.modal, {
          opacity: 0,
          duration: 0.3,
          onComplete: completeClose
        });
      } else {
        completeClose();
      }
    }
  }

  /**
   * GalleryLayout.js
   * Handles the masonry-like grid layout for the gallery
   */

  class GalleryLayout {
    constructor(galleryGrid) {
      this.galleryGrid = galleryGrid;
      this.items = galleryGrid.querySelectorAll('.gallery-item');
      this.resizeTimeout = null;
      this.itemPadding = 4; // 2px padding on each side (left+right)
    }

    init() {
      // Setup resize handler with debounce
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Setup image load events
      this.setupImageLoadEvents();
    }

    /**
     * Setup image load events to organize rows after images are loaded
     */
    setupImageLoadEvents() {
      const images = document.querySelectorAll('.gallery-image-container img');
      
      // Count how many images are loaded
      let loadedImages = 0;
      const totalImages = images.length;
      
      if (totalImages === 0) return;
      
      // Function to check if all images are loaded
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          this.organizeImagesInRows();
        }
      };
      
      // Add load event to each image
      images.forEach(img => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.addEventListener('load', checkAllImagesLoaded);
        }
        
        // Handle error case
        img.addEventListener('error', checkAllImagesLoaded);
      });
    }

    /**
     * Handle window resize events with debounce
     */
    handleResize() {
      // Debounce resize event
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.organizeImagesInRows();
      }, 200);
    }

    /**
     * Organize images in rows with equal heights
     * This implementation creates a more compact layout without white spaces
     */
    organizeImagesInRows() {
      // Get all gallery items
      const items = Array.from(document.querySelectorAll('.gallery-item'));
      if (!items.length) return;
      
      // Reset any previously set heights
      items.forEach(item => {
        const imgContainer = item.querySelector('.gallery-image-container');
        if (imgContainer) {
          imgContainer.style.height = 'auto';
        }
      });
      
      // Get the current gallery width
      const galleryWidth = this.galleryGrid.clientWidth;
      
      // Determine number of columns based on screen width
      let columnsPerRow;
      if (window.innerWidth <= 480) {
        columnsPerRow = 1;
        this.itemPadding = 2; // 1px padding on each side for mobile
      } else if (window.innerWidth <= 1024) {
        columnsPerRow = 2;
        this.itemPadding = 4; // 2px padding on each side for tablets
      } else {
        columnsPerRow = 3;
        this.itemPadding = 4; // 2px padding on each side for desktop
      }
      
      // Calculate the width of each item (accounting for padding)
      this.itemPadding * columnsPerRow;
      
      // Group items into rows
      const rows = [];
      let currentRow = [];
      
      items.forEach((item, index) => {
        currentRow.push(item);
        
        // When we reach the number of columns per row or the last item
        if (currentRow.length === columnsPerRow || index === items.length - 1) {
          rows.push([...currentRow]);
          currentRow = [];
        }
      });
      
      // Process each row to set equal heights
      rows.forEach(row => {
        // Calculate the total aspect ratio for the row
        let totalAspectRatio = 0;
        let validImages = 0;
        
        row.forEach(item => {
          const img = item.querySelector('img');
          if (img && img.complete) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            totalAspectRatio += aspectRatio;
            validImages++;
          }
        });
        
        // If no valid images, skip this row
        if (validImages === 0) return;
        
        // Calculate the row height based on the total aspect ratio
        // Account for padding in the calculation
        const rowWidth = galleryWidth - (row.length * this.itemPadding);
        const rowHeight = rowWidth / totalAspectRatio;
        
        // Set the height for all items in this row
        row.forEach(item => {
          const imgContainer = item.querySelector('.gallery-image-container');
          const img = item.querySelector('img');
          
          if (imgContainer && img && img.complete) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            
            // Calculate the width for this item based on its aspect ratio
            // Account for padding in the calculation
            const calculatedWidth = (aspectRatio / totalAspectRatio) * rowWidth;
            
            // Set the width and height
            item.style.width = `${calculatedWidth}px`;
            imgContainer.style.height = `${rowHeight}px`;
          }
        });
      });
    }

    /**
     * Add a new item to the gallery and recalculate layout
     */
    addItem(item) {
      // Add the item to the DOM
      this.galleryGrid.appendChild(item);
      
      // Setup load event for the new image
      const img = item.querySelector('img');
      if (img) {
        if (img.complete) {
          this.organizeImagesInRows();
        } else {
          img.addEventListener('load', () => this.organizeImagesInRows());
          img.addEventListener('error', () => this.organizeImagesInRows());
        }
      }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
      window.removeEventListener('resize', this.handleResize.bind(this));
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
      this.galleryGrid = document.querySelector('.gallery-grid');
      this.galleryModal = document.querySelector('.gallery-modal');
      
      this.hamburger = document.querySelector('.hamburger');
      this.menu = document.querySelector('#primary-navigation');
      
      // Initialize the gallery layout manager
      if (this.galleryGrid) {
        this.layout = new GalleryLayout(this.galleryGrid);
      }
    }

    init() {
      this.filter.init();
      this.modal.init();
      this.setupItemInteractions();
      this.setupImageUpload();
      this.setupLazyLoading();
      this.setupModalFunctionality();

      if (this.hamburger && this.menu) {
        this.hamburger.addEventListener('click', () => {
          this.hamburger.classList.toggle('active');
          this.menu.classList.toggle('active'); 
        });
      }
      
      // Initialize the layout manager
      if (this.layout) {
        this.layout.init();
      }
      
      // Add event listener for filter changes to recalculate layout
      document.addEventListener('gallery:filtered', () => {
        if (this.layout) {
          setTimeout(() => this.layout.organizeImagesInRows(), 100);
        }
      });
    }

    setupItemInteractions() {
      this.items.forEach(item => {
        // Setup click handling for modal
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          if (!img) return;
          
          const fullSrc = img.dataset.fullSrc || img.src;
          const title = item.querySelector('h4')?.textContent || '';
          
          this.openModal(fullSrc, title);
        });
      });
    }
    
    openModal(imgSrc, title) {
      if (!this.galleryModal) return;
      
      const modalImg = this.galleryModal.querySelector('.modal-content img');
      const modalTitle = this.galleryModal.querySelector('.modal-title');
      
      if (modalImg) modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      
      this.galleryModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
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
      galleryItem.dataset.category = 'uploaded';

      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'gallery-image-container';

      // Create image element with responsive attributes
      const img = document.createElement('img');
      img.src = URL.createObjectURL(original);
      img.srcset = srcset;
      img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      img.alt = name;
      img.loading = 'lazy';
      
      // Store natural dimensions for layout calculations
      img.dataset.width = original.width || 0;
      img.dataset.height = original.height || 0;

      // Create overlay with title
      const overlay = document.createElement('div');
      overlay.className = 'gallery-item-overlay';
      
      const title = document.createElement('h4');
      title.textContent = name;
      overlay.appendChild(title);

      // Assemble gallery item
      imageContainer.appendChild(img);
      imageContainer.appendChild(overlay);
      galleryItem.appendChild(imageContainer);

      // Add to gallery with animation
      if (this.layout) {
        this.layout.addItem(galleryItem);
      } else {
        this.galleryGrid.appendChild(galleryItem);
      }
      
      this.animateNewItem(galleryItem);

      // Setup interactions for new item
      this.setupSingleItemInteractions(galleryItem);
    }

    setupSingleItemInteractions(item) {
      // Click handling for modal
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        
        const fullSrc = img.dataset.fullSrc || img.src;
        const title = item.querySelector('h4')?.textContent || '';
        
        this.openModal(fullSrc, title);
      });
    }

    animateNewItem(item) {
      if (typeof gsap !== 'undefined') {
        gsap.from(item, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.out'
        });
      } else {
        // Fallback if GSAP is not available
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 10);
      }
    }

    setupLazyLoading() {
      if ('IntersectionObserver' in window) {
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
                
                // Recalculate layout after image loads
                img.addEventListener('load', () => {
                  if (this.layout) {
                    this.layout.organizeImagesInRows();
                  }
                });
              }
            });
          },
          {
            rootMargin: '50px 0px'
          }
        );

        images.forEach(img => imageObserver.observe(img));
      }
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `gallery-notification ${type}`;
      notification.textContent = message;

      document.body.appendChild(notification);

      if (typeof gsap !== 'undefined') {
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
      } else {
        // Fallback if GSAP is not available
        notification.style.transform = 'translateY(-50px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
          notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          notification.style.transform = 'translateY(0)';
          notification.style.opacity = '1';
          
          setTimeout(() => {
            notification.style.transform = 'translateY(-50px)';
            notification.style.opacity = '0';
            
            setTimeout(() => notification.remove(), 3000);
          }, 3000);
        }, 10);
      }
    }

    setupModalFunctionality() {
      if (!this.galleryModal) return;
      
      const closeBtn = this.galleryModal.querySelector('.modal-close');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.galleryModal.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
        });
      }
      
      // Close modal when clicking outside the content
      this.galleryModal.addEventListener('click', (e) => {
          this.galleryModal.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
      });
      
      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.galleryModal.classList.contains('active')) {
          this.galleryModal.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
        }
      });
    }

    destroy() {
      // Clean up event listeners
      window.removeEventListener('resize', this.handleResize?.bind(this));
      document.removeEventListener('gallery:filtered', () => {});
      
      if (this.layout) {
        this.layout.destroy();
      }
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
