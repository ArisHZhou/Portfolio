// Scroll animations using GSAP
document.addEventListener('DOMContentLoaded', () => {
    // Header scroll animation
    let lastScroll = 0;
    const header = document.querySelector('.site-header');
    const headerHeight = header.offsetHeight;

    gsap.set(header, {
        yPercent: 0,
        position: 'fixed',
        top: 0,
        width: '100%'
    });

    gsap.to(header, {
        yPercent: -100,
        ease: 'none',
        scrollTrigger: {
            start: headerHeight,
            end: 'max',
            onUpdate: (self) => {
                const currentScroll = window.pageYOffset;
                if (currentScroll > lastScroll) {
                    // Scrolling down
                    gsap.to(header, {
                        yPercent: -100,
                        duration: 0.3,
                        ease: 'power2.inOut'
                    });
                } else {
                    // Scrolling up
                    gsap.to(header, {
                        yPercent: 0,
                        duration: 0.3,
                        ease: 'power2.inOut'
                    });
                }
                lastScroll = currentScroll;
            }
        }
    });

    // Gallery items animation
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        gsap.set(item, {
            opacity: 0,
            y: 50
        });

        ScrollTrigger.create({
            trigger: item,
            start: 'top bottom-=100',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    delay: index % 3 * 0.1 // Stagger effect for items in the same row
                });
            },
            once: true
        });
    });
}); 