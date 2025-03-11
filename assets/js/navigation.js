document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.primary-nav');
    
    // Set active navigation items based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .footer-nav a');
    
    navLinks.forEach(link => {
        // Remove trailing index.html or .html for comparison
        const linkPath = link.getAttribute('href').replace(/index\.html$/, '').replace(/\.html$/, '');
        const currentCleanPath = currentPath.replace(/index\.html$/, '').replace(/\.html$/, '');
        
        // Check if the current path matches the link path
        if (linkPath === currentCleanPath || 
            (currentCleanPath === '/' && linkPath === '/') ||
            (linkPath !== '/' && currentCleanPath.startsWith(linkPath))) {
            link.classList.add('active');
        }
    });
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('nav-open');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const mobileNavLinks = document.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                primaryNav.classList.remove('nav-open');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                mobileNavToggle.classList.remove('active');
            });
        });
    }
}); 