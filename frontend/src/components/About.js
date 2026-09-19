// src/components/AboutMe.js
import React, { useEffect, useState } from 'react';
import './About.css';
import './About_m.css';

// 🆕 Import custom hook and animation CSS
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css'; // If not already globally imported

export default function AboutMe() {
  const [text, setText] = useState('');
  const fullText = 'ABOUT ME';

  
  // 🆕 Hook for scroll animation
  const [ref, isVisible] = useScrollAnimation();

  useEffect(() => {
    let mounted = true;
    let index = 0;
    let intervalId = null;
    let timeoutId = null;

    const type = () => {
      if (!mounted) return;
      intervalId = setInterval(() => {
        if (!mounted) return;
        if (index < fullText.length) {
          setText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            if (!mounted) return;
            setText('');
            index = 0;
            type();
          }, 2000);
        }
      }, 150);
    };

    type();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const rawPath = `${process.env.PUBLIC_URL}/assets/parth-kadiya-about.jpg`;
  const imgSrc = encodeURI(rawPath);

  return (
    <section
      className={`about scroll-animate ${isVisible ? 'visible' : ''}`} // 🆕 Apply animation class
      id="about"
      ref={ref} // 🆕 Attach observer reference
    >
      <div className="about-container section-container">
        <div className="about-image">
          <picture style={{ display: 'contents' }}>
            <source srcSet={`${process.env.PUBLIC_URL}/assets/parth-kadiya-about.webp`} type="image/webp" />
            <img
              src={imgSrc}
              alt="About Parth Kadiya - Web Developer Portfolio"
              title="Parth Kadiya - Web Developer"
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <div className="about-content">
          <h2 className="about-heading typing-text" aria-label="ABOUT ME">{text}</h2>
          <p>
            I'm Parth Kadiya, a passionate Web Developer based in Ahmedabad. I specialize in building responsive, scalable, and high-performance web applications using modern technologies like React.js, Next.js, JavaScript, Tailwind CSS, Bootstrap, HTML5, and CSS3.
            My focus is on writing clean, modular code, building seamless interactive components, and integrating robust backend services and REST APIs to deliver exceptional digital experiences across all devices.
          </p>
        </div>
      </div>
    </section>
  );
}
