// src/components/BackToTop.js
import React, { useState, useEffect } from 'react';
import './BackToTop.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button only after scrolling 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
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
