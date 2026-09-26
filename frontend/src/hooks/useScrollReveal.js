import { useEffect } from 'react';

/**
 * Universal Card & Component Scroll Reveal Hook
 * - Observes every element with the class '.scroll-reveal' individually.
 * - Triggers EXACTLY when that specific card/box enters the viewport.
 * - Solves the premature animation issue (elements no longer animate before appearing).
 * - Disconnects immediately after reveal for 60-120 FPS performance.
 * - Supports prefers-reduced-motion for accessibility & power saving.
 */
export default function useScrollReveal(trigger) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Accessibility: If user prefers reduced motion, reveal instantly
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // 2. Fallback: If IntersectionObserver is not supported, reveal instantly
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // 3. Responsive threshold & rootMargin:
    // Triggers when the element enters the bottom 40px of screen (20px on mobile)
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 0.08 : 0.12;
    const rootMargin = isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target); // Animate once and free observer memory
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [trigger]);
}
