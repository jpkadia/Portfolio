import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import useVisitorTracker from './hooks/useVisitorTracker';
import './styles/Layout.css';
import './styles/DarkTheme.css';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Track visitor and section engagement
  useVisitorTracker(isAdminRoute);

  // Prevent automatic scroll jump on page refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // On page mount / reload, ensure rock-solid top positioning
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const handleBeforeUnload = () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <ThemeProvider>
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? 'admin-main-container' : ''}>
        <ErrorBoundary>
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

            {/* Dedicated Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      {!isAdminRoute && <Footer />}
    </ThemeProvider>
  );
}

export default App;
