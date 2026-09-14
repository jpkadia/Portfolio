import React, { useEffect, useState } from 'react';
import './Experience.css';
import './Experience_m.css';

import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css';

export default function Experience() {
  const [text, setText] = useState('');
  const fullText = 'EXPERIENCE';

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
            type();
          }, 2000);
        }
      }, 150);
    };

    type();
    return () => clearInterval(interval);
  }, []);

  const experiences = [
    {
      role: 'Web Developer',
      company: 'SwarnimTouch Solutions',
      duration: 'September 2024 to Present',
      description:
        'Developing and maintaining responsive, high-performance web applications using React.js, JavaScript, HTML5, CSS3, Tailwind CSS, and Bootstrap, along with backend development using Node.js and Express.js. Implementing modern frontend architectures, RESTful API integrations, server-side development, cross-browser compatibility, and code optimization to deliver scalable and user-centric full-stack web solutions.'
    }
  ];

  return (
    <section
      className={`experience-section scroll-animate ${isVisible ? 'visible' : ''}`}
      id="experience"
      ref={ref}
      aria-label="Professional Experience Section"
    >
      <p className="experience-subtitle typing-text" aria-label="EXPERIENCE">{text}</p>
      <h2 className="experience-title">My Journey Through Learning & Contribution</h2>
      <div className="experience-timeline">
        {experiences.map((exp, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-dot"></div>
            <div className="timeline-card gradient-text-hover">
              <h3>{exp.role} <span>— {exp.company}</span></h3>
              <p className="timeline-duration">{exp.duration}</p>
              <p className="timeline-desc">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
