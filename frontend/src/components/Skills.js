// src/components/Skills.js
import React, { useEffect, useState } from 'react';
import './Skills.css';
import './Skills_m.css'

// src/components/Parth.js
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css';

export default function Skills() {
  const [text, setText] = useState('');
  const fullText = 'EXPERTISE';

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
          }, 2000);
        }
      }, 150);
    };

    type();
    return () => clearInterval(interval);
  }, []);

  const skills = [
    {
      img: 'frontend.png',
      alt: 'Frontend Development',
      title: 'Frontend Development',
      description:
        'I build responsive and interactive websites using HTML, CSS, JavaScript, React, and Bootstrap. My focus is on clean code and smooth user experience across all devices.',
    },
    {
      img: 'ui-ux.png',
      alt: 'UI/UX Design',
      title: 'UI/UX Design',
      description:
        'I design simple and user-friendly interfaces. From wireframes to prototypes, I create smooth user flows that look good and feel easy to use.',
    },
    {
      img: 'graphic.png',
      alt: 'Graphic Design',
      title: 'Graphic Design',
      description:
        'I create eye-catching visuals like logos, banners, and social media posts using Photoshop and CorelDraw. My designs are creative and brand-focused.',
    },
  ];

  return (
    <section
  className={`skills-section scroll-animate ${isVisible ? 'visible' : ''}`}
  id="skills"
  ref={ref}
>
      <p className="skills-subtitle typing-text" aria-label="EXPERTISE">{text}</p>
      <h2 className="skills-title">Driven by Logic, Designed with Passion.</h2>
      <div className="skills-cards">
        {skills.map(({ img, alt, title, description }) => {
          const src = encodeURI(`${process.env.PUBLIC_URL}/assets/${img}`);
          return (
            <div className="skill-card" key={title}>
              <div className="skill-icon">
                <div className="skill-icon-inner">
                  <picture style={{ display: 'contents' }}>
                    <source
                      srcSet={`${process.env.PUBLIC_URL}/assets/${img.replace(/\.(png|jpe?g)$/i, '.webp')}`}
                      type="image/webp"
                    />
                    <img
                      src={src}
                      alt={alt}
                      width="100"
                      height="100"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
