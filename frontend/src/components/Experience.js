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

  const experiences = [
    {
      role: 'Co-Founder & Lead Developer',
      company: 'Techie Growera',
      duration: 'September 2026 to Present',
      badge: 'Startup',
      description:
        'Co-founded and leading technical architecture and digital solutions at Techie Growera. Driving end-to-end digital growth by delivering custom Website Development (React/Next.js), Technical SEO, Graphic Design, Video Editing, Social Media Management, Digital Marketing, and high-ROI Meta Ads campaigns to build and scale modern brands.',
      link: 'https://techiegrowera.vercel.app/',
      linkText: 'Visit Techie Growera'
    },
    {
      role: 'Web Developer',
      company: 'SwarnimTouch Solutions',
      duration: 'September 2024 to Present',
      badge: 'Full-Time',
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
      <div className="experience-container section-container">
        <p className="experience-subtitle typing-text" aria-label="EXPERIENCE">{text}</p>
        <h2 className="experience-title">My Journey Through Learning & Contribution</h2>
        <div className="experience-timeline">
          {experiences.map((exp, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-dot"></div>
              <div className="timeline-card gradient-text-hover">
                <div className="timeline-card-header">
                  <div>
                    <h3>{exp.role} <span>— {exp.company}</span></h3>
                    <p className="timeline-duration">{exp.duration}</p>
                  </div>
                  {exp.badge && (
                    <span className={`timeline-badge ${exp.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                      {exp.badge === 'Startup' && <i className="fa-solid fa-rocket" aria-hidden="true"></i>}
                      {exp.badge}
                    </span>
                  )}
                </div>
                <p className="timeline-desc">{exp.description}</p>
                {exp.link && (
                  <div className="timeline-actions">
                    <a
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-link-btn"
                      aria-label={`${exp.linkText} (opens in a new tab)`}
                    >
                      <span>{exp.linkText}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
