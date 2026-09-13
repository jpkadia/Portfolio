// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { HashLink } from 'react-router-hash-link';
import ThemeToggle from './ThemeToggle';
import './Header.css';
import './Header_m.css';

const NAV_LINKS = [
  { label: 'Home', to: '/#parth', id: 'parth' },
  { label: 'About', to: '/#about', id: 'about' },
  { label: 'Technical', to: '/', id: null }, // dropdown
  { label: 'Education', to: '/#education', id: 'education' },
  { label: 'Contact', to: '/#contact', id: 'contact' },
];

export default function Header() {
  const [navActive, setNavActive] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [mobileTechOpen, setMobileTechOpen] = useState(false);
  const [ignoreScroll, setIgnoreScroll] = useState(false);
  const ignoreScrollTimeout = useRef(null);

  const handleLinkClick = label => {
    // 1) Immediately activate the clicked link...
    setActiveLink(label);
    // 2) Close any open menus
    setNavActive(false);
    setMobileTechOpen(false);
    // 3) Temporarily disable scroll-based updates
    clearTimeout(ignoreScrollTimeout.current);
    setIgnoreScroll(true);
    ignoreScrollTimeout.current = setTimeout(() => {
      setIgnoreScroll(false);
    }, 800);
  };

  // Header hide/show on scroll — desktop only
  useEffect(() => {
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let timeoutId = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 20) {
        header.classList.remove('hide');
        header.classList.add('show');
        lastScrollY = currentScrollY;
        return;
      }
      header.classList.toggle('hide', currentScrollY > lastScrollY);
      header.classList.toggle('show', currentScrollY <= lastScrollY);
      lastScrollY = currentScrollY;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        header.classList.remove('hide');
        header.classList.add('show');
      }, 400);
    };

    const mq = window.matchMedia('(min-width: 1025px)');
    const updateListener = () => {
      if (mq.matches) {
        window.addEventListener('scroll', handleScroll, { passive: true });
      } else {
        window.removeEventListener('scroll', handleScroll);
        header.classList.remove('hide', 'show');
      }
    };

    updateListener();
    mq.addEventListener('change', updateListener);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mq.removeEventListener('change', updateListener);
      clearTimeout(timeoutId);
    };
  }, []);

  // Scroll-based active-link detection
  useEffect(() => {
    const onScroll = () => {
      if (ignoreScroll) return;  // ⬅️ skip updates while jumping

      const midpoint = window.scrollY + window.innerHeight / 2;

      // Top-level links with IDs
      for (let { label, id } of NAV_LINKS) {
        if (!id) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (midpoint >= top && midpoint < bottom) {
          setActiveLink(label);
          return;
        }
      }

      // Technical dropdown sections
      const skillsEl = document.getElementById('skills');
      const expEl    = document.getElementById('experience');
      const projEl   = document.getElementById('projects');
      const secs = [
        { el: skillsEl, label: 'Skills' },
        { el: expEl,    label: 'Experience' },
        { el: projEl,   label: 'Projects' },
      ];
      secs.forEach(({ el, label }) => {
        if (!el) return;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (midpoint >= top && midpoint < bottom) {
          setActiveLink(label);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initialize on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [ignoreScroll]);

  useEffect(() => {
    // cleanup on unmount
    return () => clearTimeout(ignoreScrollTimeout.current);
  }, []);

  return (
    <>
      <header className={navActive ? 'show' : ''} role="banner">
        <div className="logo">
          <picture style={{ display: 'contents' }}>
            <source srcSet={`${process.env.PUBLIC_URL}/assets/logo.webp`} type="image/webp" />
            <img
              src={`${process.env.PUBLIC_URL}/assets/logo.png`}
              alt="Parth Kadiya Logo"
              className="logo-img"
              width="116"
              height="58"
            />
          </picture>
        </div>

        <nav
          className={`nav ${navActive ? 'active' : ''}`}
          id="main-nav"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map(link => {
            if (link.label === 'Technical') {
              return (
                <div className="dropdown" key="Technical">
                  <span
                    className={`dropdown-toggle ${
                      ['Skills','Experience','Projects'].includes(activeLink)
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="fa-solid fa-laptop-code" />
                    &nbsp;Technical
                    <i className="fa-solid fa-caret-down dropdown-arrow" />
                  </span>
                  <div className="dropdown-menu">
                    {['skills','experience','projects'].map(sec => (
                      <HashLink
                        key={sec}
                        to={`/#${sec}`}
                        scroll={el =>
                          el.scrollIntoView({ behavior: 'auto', block: 'start' })
                        }
                        className={
                          activeLink ===
                          sec.charAt(0).toUpperCase() + sec.slice(1)
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          handleLinkClick(
                            sec.charAt(0).toUpperCase() + sec.slice(1)
                          )
                        }
                      >
                        <i
                          className={`fa-solid fa-${
                            sec === 'skills'
                              ? 'code'
                              : sec === 'experience'
                              ? 'briefcase'
                              : 'diagram-project'
                          }`}
                        />
                        &nbsp;
                        {sec.charAt(0).toUpperCase() + sec.slice(1)}
                      </HashLink>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <HashLink
                key={link.label}
                to={link.to}
                scroll={el => {
                  if (link.label === 'Home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    el.scrollIntoView({ behavior: 'auto', block: 'start' });
                  }
                }}
                className={activeLink === link.label ? 'active' : ''}
                onClick={() => handleLinkClick(link.label)}
              >
                <span>
                  {link.label === 'Home' && <i className="fa-solid fa-house" />}
                  {link.label === 'About' && <i className="fa-solid fa-user" />}
                  {link.label === 'Education' && (
                    <i className="fa-solid fa-graduation-cap" />
                  )}
                  {link.label === 'Contact' && (
                    <i className="fa-solid fa-phone" />
                  )}
                  &nbsp;{link.label}
                </span>
              </HashLink>
            );
          })}
        </nav>

        <ThemeToggle />

        <button
          className={`nav-toggle ${navActive ? 'active' : ''}`}
          aria-label="toggle navigation"
          aria-expanded={navActive}
          aria-controls="main-nav"
          onClick={() => setNavActive(!navActive)}
        >
          <span className="hamburger" />
          <span className="close-icon fa-solid fa-xmark" />
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav">
        {NAV_LINKS.map(link => {
          if (link.label === 'Technical') {
            return (
       <div
        key="mobile-tech"
       className={`nav-item dropdown ${mobileTechOpen ? 'open' : ''} ${
           ['Skills','Experience','Projects'].includes(activeLink)
             ? 'active'
             : ''
         }`}
        onClick={() => setMobileTechOpen(!mobileTechOpen)}
      >
                <i className="fa-solid fa-laptop-code" />
                <span>Technical</span>
                <i className="fa-solid fa-caret-down dropdown-arrow" />
                <div className="dropdown-menu">
                   {['skills','experience','projects'].map(sec => {
             const label = sec[0].toUpperCase() + sec.slice(1);
             const isActive = activeLink === label;
             return (
                    <HashLink
                      key={sec}
                      to={`/#${sec}`}
                      scroll={el =>
                        el.scrollIntoView({ behavior: 'auto', block: 'start' })
                      }
                      className={isActive ? 'active' : ''}
                      onClick={() =>
                        handleLinkClick(
                          sec.charAt(0).toUpperCase() + sec.slice(1)
                        )
                      }
                    >
                      <i
                        className={`fa-solid fa-${
                          sec === 'skills'
                            ? 'code'
                            : sec === 'experience'
                            ? 'briefcase'
                            : 'diagram-project'
                        }`}
                      />
                      &nbsp;{sec.charAt(0).toUpperCase() + sec.slice(1)}
                    </HashLink>
                  )})}
                </div>
              </div>
            );
          }

          const iconMap = {
            Home:      'fa-house',
            About:     'fa-user',
            Education: 'fa-graduation-cap',
            Contact:   'fa-phone',
          };
          return (
            <HashLink
              key={link.label}
              to={link.to}
              className={`nav-item ${
                activeLink === link.label ? 'active' : ''
              }`}
              onClick={() => handleLinkClick(link.label)}
            >
              <i className={`fa-solid ${iconMap[link.label]}`} />
              <span>{link.label}</span>
            </HashLink>
          );
        })}
      </div>
    </>
  );
}
