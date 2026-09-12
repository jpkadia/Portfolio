import React, { useEffect, useState } from 'react';
import './Education.css';
import './Education_m.css';

import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css'; // Make sure this path is correct


export default function Education() {
  const [text, setText] = useState('');
  const fullText = 'ACADEMIC BACKGROUND';

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

  return (
    <section
  className={`education-section scroll-animate ${isVisible ? 'visible' : ''}`}
  id="education"
  ref={ref}
>
      <p className="education-subtitle typing-text">{text}</p>
      <h2 className="education-title">Shaped by knowledge. Driven by innovation.</h2>

      <div className="education-container">
        <div className="timeline"></div>

        <div className="education-entry left">
          <div className="education-box gradient-text-hover">
            <h3>B.Sc. CA & IT (2022–2025)</h3>
            <p>
              Completed Bachelor of Science in Computer Application & Information Technology
              from Shreyarth University with a CGPI of 8.5. Built a strong foundation in frontend development,
              programming, database systems, and UI/UX design principles.
            </p>
          </div>
          <div className="connector-line"></div>
        </div>

        <div className="education-entry right">
          <div className="education-box gradient-text-hover">
            <h3>H.S.C. – Class 12 (2022)</h3>
            <p>
              Completed Higher Secondary Education from The H.B. Kapadiya New High School with 76%.
            </p>
          </div>
          <div className="connector-line"></div>
        </div>

        <div className="education-entry left">
          <div className="education-box gradient-text-hover">
            <h3>S.S.C. – Class 10 (2020)</h3>
            <p>
              Completed Secondary Schooling from The H.B. Kapadiya New High School with 68%.
            </p>
          </div>
          <div className="connector-line"></div>
        </div>

        <div className="education-entry right">
          <div className="education-box gradient-text-hover">
            <h3>Certifications</h3>
            <p>
              Earned certifications in Advanced Diploma in Computer Education, Frontend Development, UI/UX Design,
              and Graphic Design to boost technical and creative capabilities.
            </p>
          </div>
          <div className="connector-line"></div>
        </div>
      </div>
    </section>
  );
}
