import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import CoverPage from './pages/CoverPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import AchievementsPage from './pages/AchievementsPage';
import ToDosPage from './pages/ToDosPage';
import TributePage from './pages/TributePage';
import JournalPage from './pages/JournalPage';
import Navigation from './components/Navigation';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useTheme();
  if (isInitializing) return null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useTheme();

  if (isInitializing) return null;

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <>
      <div className="noise-overlay" />
      {isAuthenticated && location.pathname !== '/' && <Navigation />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <CoverPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <AboutPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <GalleryPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <AchievementsPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <ToDosPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tribute"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <TributePage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <JournalPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App selection:bg-indigo-500/30">
          <AnimatedRoutes />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 !rounded-2xl shadow-xl',
            }}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;