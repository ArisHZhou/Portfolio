export class GalleryFilter {
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
