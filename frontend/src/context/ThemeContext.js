import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // By default, open in light theme
    try {
      const sessionTheme = sessionStorage.getItem('portfolio-theme');
      if (sessionTheme === 'light' || sessionTheme === 'dark') {
        return sessionTheme;
      }
    } catch (e) {}
    return 'light';
  });

  useEffect(() => {
    // Clean up any old localStorage key that had auto-saved dark mode
    try {
      localStorage.removeItem('portfolio-theme');
    } catch (e) {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      root.setAttribute('data-theme', 'dark');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      root.setAttribute('data-theme', 'light');
    }

    try {
      sessionStorage.setItem('portfolio-theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
