export class GalleryModal {
  constructor() {
    this.modal = document.querySelector('.gallery-modal');
    this.modalImage = this.modal?.querySelector('.modal-content img');
    this.modalTitle = this.modal?.querySelector('.modal-title');
    this.modalDescription = this.modal?.querySelector('.modal-description');
    this.closeButton = this.modal?.querySelector('.modal-close');
    this.isOpen = false;
  }

  init() {
    if (!this.modal) return;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button click
    this.closeButton?.addEventListener('click', () => this.close());
    
    // Click outside modal content
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open(imageSrc, fullSrc, title = '', description = '') {
    if (!this.modalImage || !this.modal) return;
    
    // Use the full-size image for the modal if available
    this.modalImage.src = fullSrc || imageSrc;
    
    // Set title and description if provided
    if (this.modalTitle && title) {
      this.modalTitle.textContent = title;
    }
    
    if (this.modalDescription && description) {
      this.modalDescription.innerHTML = description;
    }
    
    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;

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
    if (!this.modal) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(this.modal, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.modal.classList.remove('active');
          document.body.style.overflow = '';
          this.isOpen = false;
          
          // Clear image src after animation completes
          setTimeout(() => {
            if (this.modalImage) this.modalImage.src = '';
          }, 300);
        }
      });
    } else {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      this.isOpen = false;
    }
  }
}
