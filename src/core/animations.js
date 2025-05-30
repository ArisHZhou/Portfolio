import { animationHelpers } from '../utils/animation-helpers';

export class AnimationCore {
  constructor() {
    this.initGSAP();
    this.animations = new Map();
    this.observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    this.observer = null;
    this.lastScrollY = window.scrollY;
    this.scrollDirection = 'down';
    this.ticking = false;
  }

  init() {
    this.setupScrollObserver();
    this.setupScrollDirectionDetection();
  }

  initGSAP() {
    gsap.defaults({
      ease: 'power2.out',
      duration: 0.5
    });

    gsap.registerEffect({
      name: 'fadeIn',
      effect: (targets, config) => {
        return gsap.from(targets, {
          duration: config.duration || 0.5, 
          opacity: 0,
          y: config.distance || 20,
          stagger: config.stagger || 0.1
        });
      }
    });
  }

  pageEnter(element) {
    return gsap.timeline()
      .from(element, {
        opacity: 0,
        y: 30,
        duration: 0.6
      })
      .from(element.querySelectorAll('.animate-item'), {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.1
      }, '-=0.3');
  }

  pageLeave(element) {
    return gsap.timeline()
      .to(element, {
        opacity: 0,
        y: -30,
        duration: 0.4
      });
  }

  setupScrollAnimations() {
    const elements = document.querySelectorAll('[data-scroll-animation]');
    
    elements.forEach(element => {
      const animation = element.dataset.scrollAnimation;
      const delay = element.dataset.delay || 0;
      
      animationHelpers.createScrollTrigger(element, () => {
        this.playAnimation(element, animation, delay);
      });
    });
  }

  playAnimation(element, animationType, delay) {
    let animation;
    
    switch (animationType) {
      case 'fadeIn':
        animation = gsap.from(element, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: parseFloat(delay)
        });
        break;
      
      case 'slideIn':
        animation = gsap.from(element, {
          x: -50,
          opacity: 0,
          duration: 0.6,
          delay: parseFloat(delay)
        });
        break;
      
      case 'scaleIn':
        animation = gsap.from(element, {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          delay: parseFloat(delay)
        });
        break;
      
      default:
        animation = gsap.from(element, {
          opacity: 0,
          duration: 0.6,
          delay: parseFloat(delay)
        });
    }
    
    this.animations.set(element, animation);
  }

  reverseAnimation(element) {
    const animation = this.animations.get(element);
    if (animation) {
      animation.reverse();
    }
  }

  setupHoverAnimations() {
    const hoverElements = document.querySelectorAll('[data-hover-animation]');
    
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.playHoverAnimation(element, 'enter');
      });
      
      element.addEventListener('mouseleave', () => {
        this.playHoverAnimation(element, 'leave');
      });
    });
  }

  playHoverAnimation(element, state) {
    const type = element.dataset.hoverAnimation;
    
    switch (type) {
      case 'scale':
        gsap.to(element, {
          scale: state === 'enter' ? 1.05 : 1,
          duration: 0.3
        });
        break;
        
      case 'lift':
        gsap.to(element, {
          y: state === 'enter' ? -5 : 0,
          duration: 0.3
        });
        break;
        
      case 'glow':
        gsap.to(element, {
          boxShadow: state === 'enter' 
            ? '0 0 20px rgba(255,255,255,0.3)' 
            : 'none',
          duration: 0.3
        });
        break;
    }
  }

  animateSequence(elements) {
    return animationHelpers.fadeInSequence(elements);
  }

  setupScrollObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          if (entry.target.dataset.delay) {
            entry.target.style.animationDelay = `${entry.target.dataset.delay}ms`;
          }
        }
      });
    }, this.observerOptions);

    // Observe all elements with the data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(element => {
      element.classList.add('will-animate');
      this.observer.observe(element);
    });
  }

  setupScrollDirectionDetection() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
          this.lastScrollY = currentScrollY;
          
          // Update header visibility
          const header = document.querySelector('.site-header');
          if (header) {
            if (currentScrollY <= 0) {
              header.classList.remove('header-hidden');
            } else if (this.scrollDirection === 'down' && currentScrollY > 100) {
              header.classList.add('header-hidden');
            } else if (this.scrollDirection === 'up') {
              header.classList.remove('header-hidden');
            }
          }
          
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }
}
