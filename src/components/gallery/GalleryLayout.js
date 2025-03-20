/**
 * GalleryLayout.js
 * Handles the masonry-like grid layout for the gallery
 */

export class GalleryLayout {
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
    const totalPaddingPerRow = this.itemPadding * columnsPerRow;
    const itemWidth = (galleryWidth - totalPaddingPerRow) / columnsPerRow;
    
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