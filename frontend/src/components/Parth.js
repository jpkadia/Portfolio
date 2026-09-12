import React, { useEffect, useState } from 'react';
import './Parth.css';
import './Parth_m.css';

// src/components/Parth.js
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css';


export default function Parth() {
  const [text, setText] = useState('');
  const fullText = 'Parth Kadiya';

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
          type(); // loop again
        }, 2000); // pause before restart
      }
    }, 150); // speed
  };

  type();

  return () => clearInterval(interval);
}, []);


  // PUBLIC_URL + path with space needs encoding
  const rawPath = `${process.env.PUBLIC_URL}/assets/parth.jpg`;
  const imgSrc = encodeURI(rawPath);

  return (
    <section
      className={`parth scroll-animate ${isVisible ? 'visible' : ''}`}
      id="parth"
      ref={ref}
    >
      <picture style={{ display: 'contents' }}>
        <source srcSet={`${process.env.PUBLIC_URL}/assets/parth.webp`} type="image/webp" />
        <img
          src={imgSrc}
          alt="Parth Kadiya - Full Stack & Frontend Developer"
          className="parth-image"
          width="8166"
          height="6044"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="parth-content">
        <h1 className="parth-typing" aria-label="Parth Kadiya">{text || '\u00A0'}</h1>
        <p>
          A passionate IT student blending design thinking with clean code.
        </p>
      </div>
    </section>
  );
}
