/**
 * MARCOS COSTA PORTFOLIO — Animation Utilities
 * Reusable GSAP animation helpers for all sections
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ================================================
   TEXT SCRAMBLE EFFECT
   ================================================ */
export class TextScramble {
  private el: HTMLElement;
  private chars: string;
  private frame: number = 0;
  private queue: Array<{ from: string; to: string; start: number; end: number; char?: string }> = [];
  private resolve!: () => void;
  private frameRequest: number = 0;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  private update(): void {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="opacity:0.5">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }
}

/* ================================================
   MAGNETIC TILT EFFECT
   ================================================ */
export function initMagneticTilt(
  element: HTMLElement,
  options: { strength?: number; perspective?: number; ease?: string } = {},
): () => void {
  const { strength = 8, perspective = 800, ease = 'power2.out' } = options;

  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    gsap.to(element, {
      rotateX: (y - 0.5) * -strength,
      rotateY: (x - 0.5) * strength,
      transformPerspective: perspective,
      duration: 0.5,
      ease,
    });
  };

  const handleLeave = () => {
    gsap.to(element, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
  };
}

/* ================================================
   SCROLL-TRIGGERED ENTRANCE
   ================================================ */
export function initScrollEntrance(
  selector: string,
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    ease?: string;
  } = {},
): void {
  const {
    y = 40,
    opacity = 0,
    duration = 0.8,
    stagger = 0.1,
    start = 'top 85%',
    ease = 'power3.out',
  } = options;

  const elements = gsap.utils.toArray<HTMLElement>(selector);

  elements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none reverse',
      },
      y,
      opacity,
      duration,
      stagger,
      ease,
    });
  });
}

/* ================================================
   SPLIT TEXT REVEAL (character by character)
   ================================================ */
export function splitTextReveal(
  element: HTMLElement,
  options: { duration?: number; stagger?: number; ease?: string } = {},
): gsap.core.Timeline {
  const { duration = 0.6, stagger = 0.02, ease = 'power3.out' } = options;

  const text = element.textContent || '';
  element.innerHTML = '';

  const chars = text.split('').map((char) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.overflow = 'hidden';
    span.textContent = char === ' ' ? ' ' : char;
    element.appendChild(span);
    return span;
  });

  const tl = gsap.timeline();
  tl.from(chars, {
    y: '100%',
    opacity: 0,
    duration,
    stagger,
    ease,
  });

  return tl;
}
