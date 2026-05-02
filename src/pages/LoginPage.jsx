import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Lock, Sparkles, Fingerprint, Heart, AlertCircle } from 'lucide-react';
import api from '../api';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme, login, isAuthenticated } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Key required for session initialization');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { password });
      if (response.data.success) {
        login(response.data.theme);
        navigate('/home');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Verification protocol failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative transition-colors duration-700 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-12 rounded-[3rem] shadow-2xl">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex mb-8"
            >
               <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
                  <Fingerprint size={48} strokeWidth={1} />
               </div>
            </motion.div>
            
            <h1 className="text-5xl font-black heading-font mb-3 tracking-tighter uppercase">
              EVAMP
            </h1>
            <div className="flex justify-center">
               <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Secure Access Interface</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS KEY"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-5 pl-14 pr-6 rounded-2xl outline-none text-xs tracking-[0.3em] font-black focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-400"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/10">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black heading-font uppercase tracking-[0.2em] text-xs transition-all ${
                loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                   <span>Verifying...</span>
                </div>
              ) : 'Initialize Session'}
            </motion.button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-700 text-center">
             <div className="flex items-center justify-center gap-4 text-red-500/20">
                <Heart size={12} fill="currentColor" />
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-slate-400">Always & Forever</span>
                <Heart size={12} fill="currentColor" />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;