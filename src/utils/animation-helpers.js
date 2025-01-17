export const animationHelpers = {
  fadeInSequence(elements, stagger = 0.1) {
    return gsap.from(elements, {
      opacity: 0,
      y: 20,
      stagger,
      duration: 0.5
    });
  },

  createScrollTrigger(element, animation) {
    return ScrollTrigger.create({
      trigger: element,
      animation,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    });
  }
};
