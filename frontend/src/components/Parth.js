import React, { useEffect, useState } from 'react';
import './Parth.css';
import './Parth_m.css';



export default function Parth() {
  const [text, setText] = useState('');
  const fullText = 'Parth Kadiya';

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
    <section className="parth" id="parth">
      <picture style={{ display: 'contents' }}>
        <source srcSet={`${process.env.PUBLIC_URL}/assets/parth.webp`} type="image/webp" />
        <img
          src={imgSrc}
          alt="Parth Kadiya - Frontend Developer &amp; Web Developer Portfolio"
          className="parth-image"
          width="8166"
          height="6044"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="parth-content">
        <h1 className="parth-typing" aria-label="Parth Kadiya - Web Developer Portfolio">
          <span className="visually-hidden">Parth Kadiya - Web Developer Portfolio</span>
          <span aria-hidden="true">{text || '\u00A0'}</span>
        </h1>
        <p>
          A passionate Web Developer &amp; Frontend Developer blending creative design with clean code.
        </p>
      </div>
    </section>
  );
}
