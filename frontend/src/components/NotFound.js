import React from 'react';
import { HashLink } from 'react-router-hash-link';
import SEO from './SEO';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <SEO
        title="404 - Page Not Found | Parth Kadiya"
        description="The page you are looking for does not exist on Parth Kadiya's portfolio."
        robots="noindex, nofollow"
      />
      <section className="not-found-section" aria-label="Page Not Found">
        <div className="not-found-container">
          <div className="not-found-code" aria-hidden="true">404</div>
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-description">
            Oops! The page you are looking for might have been moved, removed, or never existed.
          </p>
          <HashLink to="/#parth" className="not-found-btn">
            <i className="fa-solid fa-house" aria-hidden="true"></i> Back to Home
          </HashLink>
        </div>
      </section>
    </>
  );
}
