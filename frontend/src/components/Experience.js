import React, { useEffect, useState } from 'react';
import './Experience.css';
import './Experience_m.css';

import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css'; // Make sure this path is correct

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
            type(); // loop again
          }, 2000);
        }
      }, 150);
    };

    type();
    return () => clearInterval(interval);
  }, []);

  const experiences = [
    {
      role: 'Frontend Developer Intern',
      company: 'SwarnimTouch Solutions Pvt Ltd.',
      duration: 'Sep 2024 – Present',
      description:
        'Developed and maintained responsive web pages using React.js and Bootstrap to improve user engagement. Optimized website performance through code refactoring, image compression, and lazy loading techniques.'
    },
    {
      role: 'Graphic Design Intern',
      company: 'Skill Enhanced Pvt Ltd',
      duration: 'Jun 2024 – Aug 2024',
      description:
        'Created interactive prototypes and streamlined onboarding flows in Figma, reducing drop-off rates by 15%. Conducted usability tests, collected feedback, and iterated on designs to enhance user satisfaction.'
    },
    {
      role: 'UI – UX Design Intern',
      company: 'To-Let Globe Pvt Ltd.',
      duration: 'Apr 2024 – May 2024',
      description:
        'Designed marketing collateral such as logos, banners, and social media graphics to boost brand visibility. Collaborated with marketing teams to produce print and digital advertisements under tight deadlines.'
    }
  ];

  return (
    <section
  className={`experience-section scroll-animate ${isVisible ? 'visible' : ''}`}
  id="experience"
  ref={ref}
>
      <p className="experience-subtitle typing-text">{text}</p>
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
