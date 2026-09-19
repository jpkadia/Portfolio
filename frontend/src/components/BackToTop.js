// src/components/BackToTop.js
import React, { useState, useEffect } from 'react';
import './BackToTop.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button only after scrolling 300px
  useEffect(() => {
    let rafId = null;

    const toggleVisibility = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const shouldBeVisible = (window.scrollY || window.pageYOffset) > 300;
        setIsVisible(prev => (prev === shouldBeVisible ? prev : shouldBeVisible));
      });
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    isVisible && (
      <button
        className="back-to-top"
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Scroll back to top"
      >
        <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
      </button>
    )
  );
}
