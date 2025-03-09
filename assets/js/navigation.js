document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.primary-nav');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('nav-open');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                primaryNav.classList.remove('nav-open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                mobileNavToggle.classList.remove('active');
            });
        });
    }
}); 