import { ImageOptimizer } from '../../utils/image-optimizer';
import { GalleryFilter } from './GalleryFilter';
import { GalleryModal } from './GalleryModal';

export class Gallery {
  constructor() {
    this.filter = new GalleryFilter();
    this.modal = new GalleryModal();
    this.items = document.querySelectorAll('.gallery-item');
    this.imageOptimizer = new ImageOptimizer();
    this.gallery = document.querySelector('.gallery');
    this.uploadInput = document.querySelector('#gallery-upload');
  }

  init() {
    this.filter.init();
    this.modal.init();
    this.setupItemInteractions();
    this.setupImageUpload();
    this.setupLazyLoading();
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
