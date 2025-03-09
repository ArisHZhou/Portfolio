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
    this.galleryRow = document.querySelector('.gallery-row');
    this.targetRowHeight = 250; // Target row height in pixels
    this.spacing = 4; // Spacing between images

    this.hamburger = document.querySelector('.hamburger');
    this.menu = document.querySelector('#primary-navigation'); // Use your menu's ID
  }

  init() {
    this.filter.init();
    this.modal.init();
    this.setupItemInteractions();
    this.setupImageUpload();
    this.setupLazyLoading();
    this.setupGalleryLayout();
    this.setupModalFunctionality();

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

  setupGalleryLayout() {
    // Wait for images to load before layout
    let loadedImages = 0;
    const totalImages = this.items.length;
    
    this.items.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        if (img.complete) {
          loadedImages++;
          if (loadedImages === totalImages) {
            this.layoutGallery();
          }
        } else {
          img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              this.layoutGallery();
            }
          };
        }
      }
    });
    
    // Relayout on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.layoutGallery(), 200);
    });
  }

  layoutGallery() {
    if (!this.galleryRow) return;
    
    // Reset all styles first
    this.items.forEach(item => {
      item.style.width = '';
      item.style.height = '';
      item.style.marginRight = '';
      item.style.marginBottom = '';
    });
    
    const containerWidth = this.galleryRow.clientWidth;
    let currentRow = [];
    let currentRowWidth = 0;
    
    // Process each gallery item
    this.items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (!img || !img.complete) return;
      
      // Get natural dimensions
      const imgWidth = img.naturalWidth || 1;
      const imgHeight = img.naturalHeight || 1;
      const aspectRatio = imgWidth / imgHeight;
      
      // Calculate scaled width based on target height
      const scaledWidth = Math.floor(this.targetRowHeight * aspectRatio);
      
      // Add to current row
      currentRow.push({
        item: item,
        width: scaledWidth,
        height: this.targetRowHeight,
        aspectRatio: aspectRatio
      });
      currentRowWidth += scaledWidth;
      
      // Check if we need to layout this row
      const isLastItem = index === this.items.length - 1;
      
      if (currentRowWidth + (this.spacing * (currentRow.length - 1)) >= containerWidth || isLastItem) {
        // Calculate how much space we have to fill
        const totalSpacing = this.spacing * (currentRow.length - 1);
        const availableWidth = containerWidth - totalSpacing;
        
        // If this is the last row and doesn't fill the width, handle differently
        if (isLastItem && currentRowWidth < containerWidth * 0.8 && currentRow.length < 3) {
          // For the last row that's not full, maintain aspect ratios
          currentRow.forEach((rowItem, i) => {
            const finalWidth = Math.floor(rowItem.aspectRatio * this.targetRowHeight);
            
            rowItem.item.style.width = `${finalWidth}px`;
            rowItem.item.style.height = `${this.targetRowHeight}px`;
            rowItem.item.style.marginRight = i < currentRow.length - 1 ? `${this.spacing}px` : '0';
            rowItem.item.style.marginBottom = `${this.spacing}px`;
          });
        } else {
          // Calculate ratio to fill the row completely
          const ratio = availableWidth / currentRowWidth;
          
          // Apply dimensions to each item in the row
          let rowHeight = Math.floor(this.targetRowHeight * ratio);
          
          currentRow.forEach((rowItem, i) => {
            const finalWidth = Math.floor(rowItem.width * ratio);
            
            rowItem.item.style.width = `${finalWidth}px`;
            rowItem.item.style.height = `${rowHeight}px`;
            rowItem.item.style.marginRight = i < currentRow.length - 1 ? `${this.spacing}px` : '0';
            rowItem.item.style.marginBottom = `${this.spacing}px`;
          });
        }
        
        // Reset for next row
        currentRow = [];
        currentRowWidth = 0;
      }
    });
    
    // Remove margin from the last item in each row
    const rows = [];
    let currentRowY = -1;
    
    // Group items by their vertical position (row)
    Array.from(this.items).forEach(item => {
      const rect = item.getBoundingClientRect();
      if (currentRowY === -1 || Math.abs(rect.top - currentRowY) > 5) {
        currentRowY = rect.top;
        rows.push([]);
      }
      rows[rows.length - 1].push(item);
    });
    
    // Remove right margin from last item in each row
    rows.forEach(row => {
      if (row.length > 0) {
        row[row.length - 1].style.marginRight = '0';
      }
    });
  }

  setupModalFunctionality() {
    const modals = document.querySelectorAll('.modal');
    
    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        const modal = modals[index];
        const img = item.querySelector('img');
        const modalImg = modal.querySelector('.modal-content img');
        
        if (img && modalImg) {
          modalImg.src = img.src;
          modal.classList.add('active');
        }
      });
    });
    
    // Close modal when clicking the close button or outside the image
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('active');
      });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
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
    
    // Remove resize event listener
    window.removeEventListener('resize', () => {});
  }
}


// ... existing code...
