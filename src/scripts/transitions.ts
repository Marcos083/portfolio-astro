import barba from '@barba/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, destroySmoothScroll } from './smooth-scroll';

gsap.registerPlugin(ScrollTrigger);

export function initPageTransitions(): void {
  const overlay = document.querySelector('.transition-overlay');
  if (!overlay) return;

  barba.init({
    preventRunning: true,
    transitions: [
      {
        name: 'wipe',

        leave({ current }) {
          return new Promise((resolve) => {
            // Kill all ScrollTriggers before leaving
            ScrollTrigger.getAll().forEach((st) => st.kill());
            destroySmoothScroll();

            const tl = gsap.timeline({ onComplete: resolve });

            // Fade out current page
            tl.to(current.container, {
              opacity: 0,
              y: -30,
              duration: 0.4,
              ease: 'power3.inOut',
            });

            // Wipe overlay up
            tl.to(
              overlay,
              {
                scaleY: 1,
                transformOrigin: 'bottom',
                duration: 0.6,
                ease: 'power4.inOut',
              },
              '-=0.2',
            );
          });
        },

        enter({ next }) {
          return new Promise((resolve) => {
            // Scroll to top
            window.scrollTo(0, 0);

            const tl = gsap.timeline({ onComplete: resolve });

            // Set next page initial state
            gsap.set(next.container, { opacity: 0, y: 30 });

            // Wipe overlay away
            tl.to(overlay, {
              scaleY: 0,
              transformOrigin: 'top',
              duration: 0.6,
              ease: 'power4.inOut',
            });

            // Reveal next page
            tl.to(
              next.container,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power3.out',
              },
              '-=0.3',
            );
          });
        },

        after() {
          // Re-initialize smooth scroll and animations
          initSmoothScroll();
          ScrollTrigger.refresh();
        },
      },
    ],
  });
}
