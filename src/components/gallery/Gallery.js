import { ImageOptimizer } from '../../utils/image-optimizer';
import { GalleryFilter } from './GalleryFilter';
import { GalleryModal } from './GalleryModal';
import { GalleryLayout } from './GalleryLayout';

export class Gallery {
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
      if (e.target === this.galleryModal) {
        this.galleryModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
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
