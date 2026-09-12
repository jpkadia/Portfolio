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
        <picture style={{ display: 'contents' }}>
          <source srcSet={`${process.env.PUBLIC_URL}/assets/about.webp`} type="image/webp" />
          <img
            src={imgSrc}
            alt="Parth Kadiya - About Me"
            width="3468"
            height="4624"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <div className="about-content">
        <h4 className="typing-text" aria-label="ABOUT ME">{text}</h4>
        <p>
          I'm Parth Kadiya, a passionate Frontend Developer based in Ahmedabad. I specialize in building responsive and user-friendly interfaces using modern technologies like React.js, Bootstrap, HTML5, CSS3, and JavaScript.
          My journey began with a deep curiosity for design and user experience, which led me to gain hands-on experience in UI/UX tools such as Figma and Adobe Photoshop.
          I’ve also interned across various domains including UI/UX design and graphic design, which gives me a well-rounded perspective in frontend development.
        </p>
      </div>
    </section>
  );
}
