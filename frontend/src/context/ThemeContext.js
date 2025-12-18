import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    fetch(`${BACKEND_URL}/api/settings/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme })
    });
  };

  const login = (token, serverTheme) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    const themeToUse = serverTheme || 'dark';
    setTheme(themeToUse);
    localStorage.setItem('theme', themeToUse);
    document.documentElement.classList.toggle('dark', themeToUse === 'dark');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('theme');
    setIsAuthenticated(false);
    setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAuthenticated, login, logout }}>
      {children}
    </ThemeContext.Provider>
  );
};