export class GalleryFilter {
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
