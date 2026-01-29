import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Home, Users, Image, Trophy, ListTodo, Heart, Menu, X, User, LogOut } from 'lucide-react';

const Navigation = () => {
  const { theme, toggleTheme, logout } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/about', icon: Users, label: 'About' },
    { path: '/gallery', icon: Image, label: 'Gallery' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/todos', icon: ListTodo, label: 'To-Dos' },
    { path: '/tribute', icon: Heart, label: 'Tribute' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-black/40 border-b border-cyan-500/30'
          : 'bg-white/60 border-b border-pink-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/home"
              className={`text-xl font-bold heading-font ${
                theme === 'dark'
                  ? 'text-cyan-400'
                  : 'text-pink-500'
              }`}
            >
              MEMORY VAULT
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-pink-100 text-pink-600'
                        : theme === 'dark'
                          ? 'text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                          : 'text-slate-600 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <button
                data-testid="theme-toggle"
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
              >
                {theme === 'dark' ? <Heart size={18} /> : <User size={18} />}
              </button>

              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                <LogOut size={18} />
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg ${
                theme === 'dark'
                  ? 'text-cyan-400'
                  : 'text-pink-500'
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed top-16 right-0 bottom-0 w-64 z-40 backdrop-blur-xl p-6 md:hidden ${
              theme === 'dark'
                ? 'bg-black/90 border-l border-cyan-500/30'
                : 'bg-white/90 border-l border-pink-200'
            }`}
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-pink-100 text-pink-600'
                        : theme === 'dark'
                          ? 'text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                          : 'text-slate-600 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
              >
                {theme === 'dark' ? <Heart size={20} /> : <User size={20} />}
                <span className="font-medium">Toggle Theme</span>
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

export default Navigation;