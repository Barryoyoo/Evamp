import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme, toggleTheme, login } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Backend URL:", BACKEND_URL);
    console.log("Sending payload:", { password });

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        const data = await response.json();
        login(data.token, data.theme);
        navigate('/home');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900' 
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <button
        data-testid="theme-toggle"
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50'
            : 'bg-pink-200/50 text-pink-600 hover:bg-pink-300/50 border border-pink-300'
        }`}
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md p-8 rounded-2xl backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-black/40 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
            : 'bg-white/60 border border-white/40 shadow-xl'
        }`}
      >
        <h1 className={`text-4xl font-bold mb-2 heading-font text-center ${
          theme === 'dark'
            ? 'text-cyan-400 tracking-tighter uppercase'
            : 'text-pink-500 tracking-wide capitalize'
        }`}>
          MEMORY VAULT
        </h1>
        <p className={`text-center mb-8 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          Enter password to access
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full p-4 mb-4 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-black/50 border border-zinc-700 focus:border-cyan-500 text-white placeholder:text-zinc-500'
                : 'bg-white/80 border border-pink-100 focus:ring-2 focus:ring-pink-200 text-slate-700 placeholder:text-slate-400'
            } outline-none`}
          />
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <button
            data-testid="login-btn"
            type="submit"
            className={`w-full p-4 rounded-lg font-semibold transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-gradient-to-r from-pink-400 to-yellow-400 text-white hover:scale-105 shadow-lg'
            }`}
          >
            Enter Vault
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className={`signature-font text-2xl ${
            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
          } rotate-[-2deg]`}>
            Created by Barry
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;