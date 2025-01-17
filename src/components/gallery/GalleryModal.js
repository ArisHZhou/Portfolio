export class GalleryModal {
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
