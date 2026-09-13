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
    let index = 0;
    let interval;

    const type = () => {
      interval = setInterval(() => {
        if (index < fullText.length) {
          setText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setText('');
            index = 0;
            type(); // Restart loop
          }, 2000); // Delay before restart
        }
      }, 150); // Typing speed
    };

    type();

    return () => clearInterval(interval);
  }, []);

  const rawPath = `${process.env.PUBLIC_URL}/assets/about.jpg`;
  const imgSrc = encodeURI(rawPath);

  return (
    <section
      className={`about scroll-animate ${isVisible ? 'visible' : ''}`} // 🆕 Apply animation class
      id="about"
      ref={ref} // 🆕 Attach observer reference
    >
      <div className="about-image">
        <img
          src={imgSrc}
          alt="Parth Kadiya - Frontend Developer and Web Developer"
          width="400"
          height="400"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="about-content">
        <h4 className="typing-text" aria-label="ABOUT ME">{text}</h4>
        <p>
          I'm Parth Kadiya, a passionate Frontend Developer and Web Developer based in Ahmedabad. I specialize in building responsive, scalable, and high-performance web applications using modern technologies like React.js, Next.js, JavaScript, Tailwind CSS, Bootstrap, HTML5, and CSS3.
          My focus is on writing clean, modular code, building seamless interactive components, and integrating robust backend services and REST APIs to deliver exceptional digital experiences across all devices.
        </p>
      </div>
    </section>
  );
}
