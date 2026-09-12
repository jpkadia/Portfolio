import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Parth from './components/Parth';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

import SEO from './components/SEO';
import NotFound from './components/NotFound';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Home page: your existing sections */}
          <Route path="/" element={
            <>
              <SEO />
              <Parth />
              <About />
              <Skills />
              <Experience />
              <Projects />
              <Education />
              <Contact />
              <BackToTop />
            </>
          }/>
          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
