import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/verify');
        if (response.data.valid) {
          setIsAuthenticated(true);
          const savedTheme = localStorage.getItem('theme') || 'dark';
          setTheme(savedTheme);
          document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    try {
      await api.put('/settings/theme', { theme: newTheme });
    } catch (err) {
      console.error("Failed to save theme setting");
    }
  };

  const login = (serverTheme) => {
    setIsAuthenticated(true);
    const themeToUse = serverTheme || 'dark';
    setTheme(themeToUse);
    localStorage.setItem('theme', themeToUse);
    document.documentElement.classList.toggle('dark', themeToUse === 'dark');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed");
    }
    localStorage.removeItem('theme');
    setIsAuthenticated(false);
    setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAuthenticated, login, logout, isInitializing }}>
      {children}
    </ThemeContext.Provider>
  );
};