import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Heart, Zap } from 'lucide-react';

const AboutPage = () => {
  const { theme } = useTheme();

  const vampirePanel = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const echoPanel = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3 } }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <h1 className={`text-4xl md:text-6xl font-bold text-center mb-12 heading-font ${
        theme === 'dark'
          ? 'text-cyan-400 tracking-tighter uppercase'
          : 'text-pink-500 tracking-wide'
      }`}>
        OUR STORY
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          variants={vampirePanel}
          initial="hidden"
          animate="visible"
          className={`p-8 rounded-2xl backdrop-blur-xl border-4 ${
            theme === 'dark'
              ? 'bg-black/40 border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
              : 'bg-white/60 border-slate-300 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold heading-font ${
              theme === 'dark' ? 'text-cyan-400' : 'text-slate-800'
            }`}>
              VAMPIRE
            </h2>
            <Zap className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} size={32} />
          </div>
          <div className={`space-y-4 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            <p className="text-lg">
              <span className="font-semibold">Real Name:</span> Barrack
            </p>
            <p className="text-lg">
              <span className="font-semibold">Nickname:</span> Vampire
            </p>
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-cyan-500/10' : 'bg-slate-100'
            }`}>
              <p className="italic">
                "The night is young, and so are we. Every moment with you feels like an eternal adventure."
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={echoPanel}
          initial="hidden"
          animate="visible"
          className={`p-8 rounded-2xl backdrop-blur-xl border-4 ${
            theme === 'dark'
              ? 'bg-black/40 border-pink-500/50 shadow-[0_0_30px_rgba(255,183,178,0.2)]'
              : 'bg-white/60 border-pink-300 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold heading-font ${
              theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
            }`}>
              ECHO
            </h2>
            <Heart className={theme === 'dark' ? 'text-pink-400' : 'text-pink-500'} size={32} fill="currentColor" />
          </div>
          <div className={`space-y-4 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            <p className="text-lg">
              <span className="font-semibold">Nickname:</span> Echo
            </p>
            <p className="text-lg">
              <span className="font-semibold">Role:</span> The Light in the Darkness
            </p>
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-100'
            }`}>
              <p className="italic">
                "Your voice echoes in my heart, a melody that never fades."
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className={`max-w-4xl mx-auto mt-12 p-8 rounded-2xl backdrop-blur-xl text-center ${
          theme === 'dark'
            ? 'bg-black/40 border border-white/10'
            : 'bg-white/60 border border-white/40 shadow-xl'
        }`}
      >
        <p className={`text-xl md:text-2xl italic ${
          theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
        }`}>
          "Two souls, one eternal bond. Every memory we create together is a treasure that time cannot steal."
        </p>
      </motion.div>
    </div>
  );
};

export default AboutPage;