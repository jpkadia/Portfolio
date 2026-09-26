import React from 'react';
import './Footer.css';
import './Footer_m.css';

import '../styles/ScrollAnimation.css'; // Scroll animation CSS
import useScrollAnimation from '../hooks/useScrollAnimation'; // Custom hook

export default function Footer() {
  const [footerRef, isVisible] = useScrollAnimation();

  return (
    <footer
      className={`footer-section scroll-animate ${isVisible ? 'visible' : ''}`}
      id="footer"
      ref={footerRef}
      role="contentinfo"
    >
      <div className="footer-container">

        {/* Left: Contact Information */}
        <div className="footer-column scroll-reveal">
          <h3>Contact Information</h3>
          <p>
            <a href="tel:+919081818478" className="footer-link" aria-label="Call Parth Kadiya">
              <i className="fas fa-phone" aria-hidden="true"></i> +91 90818 18478
            </a>
          </p>
          <p>
            <a href="mailto:kadiyaparth612@gmail.com" className="footer-link" aria-label="Email Parth Kadiya">
              <i className="fas fa-envelope" aria-hidden="true"></i> kadiyaparth612@gmail.com
            </a>
          </p>
        </div>

        {/* Center: Follow Me */}
        <div className="footer-column scroll-reveal delay-1">
          <h3>Follow Me</h3>
          <p>
            <a
              href="https://www.linkedin.com/in/parth-kadiya"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Parth Kadiya on LinkedIn"
              title="Parth Kadiya on LinkedIn"
            >
              <i className="fab fa-linkedin-in" aria-hidden="true"></i> parth-kadiya
            </a>
          </p>
          <p>
            <a
              href="https://github.com/parth-kadiya"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Parth Kadiya on GitHub"
              title="Parth Kadiya on GitHub"
            >
              <i className="fab fa-github" aria-hidden="true"></i> parth-kadiya
            </a>
          </p>
          <p>
            <a
              href="https://www.instagram.com/parth_kadiya_612"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Parth Kadiya on Instagram"
              title="Parth Kadiya on Instagram"
            >
              <i className="fab fa-instagram" aria-hidden="true"></i> parth_kadiya_612
            </a>
          </p>
          <p>
            <a
              href="https://www.facebook.com/parth.kadiya.612"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Parth Kadiya on Facebook"
              title="Parth Kadiya on Facebook"
            >
              <i className="fab fa-facebook-f" aria-hidden="true"></i> parth.kadiya.612
            </a>
          </p>
          <p>
            <a
              href="https://x.com/parthkadiya612"
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Parth Kadiya on X (formerly Twitter)"
              title="Parth Kadiya on X (formerly Twitter)"
            >
              <i className="fa-brands fa-x-twitter" aria-hidden="true"></i> parthkadiya612
            </a>
          </p>
        </div>

        {/* Right: Profile Summary */}
        <div className="footer-column scroll-reveal delay-2">
          <h3>Parth Kadiya</h3>
          <p>
            Creative Web Developer based in Ahmedabad, passionate about crafting responsive, scalable, and high-performance web applications using React, Next.js, and modern web technologies.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>All Rights Reserved 2026</p>
        <p>
          <a href="#parth" aria-label="Terms and Condition">Terms &amp; Condition</a> - <a href="#parth" aria-label="Privacy Policy">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}
