export class GalleryModal {
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
