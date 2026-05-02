import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sparkles, Zap, Stars, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen md:pl-[340px] pt-32 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-red-500 font-black tracking-[0.3em] uppercase text-[10px]">
             <Heart size={14} fill="currentColor" />
             <span>The Archive</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold heading-font tracking-tight uppercase leading-none">
             OUR STORY
          </h1>
          <p className={`mt-6 text-sm font-medium body-font max-w-xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
             A record of connection, growth, and the beautiful journey of Barrack & Echo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile 1 */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-10 rounded-3xl shadow-sm"
          >
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3.5 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                      <Zap size={20} fill="currentColor" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold heading-font tracking-tight">BARRACK</h2>
                      <p className="text-[9px] font-black text-indigo-500 tracking-[0.2em] uppercase">The Architect</p>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className={`text-lg leading-relaxed font-medium body-font ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      The architect of logic and the silent protector. Known for a presence that commands the night and a heart that belongs to only one.
                   </div>
                   <div className="pt-6 border-t border-slate-100 dark:border-slate-700 italic text-sm text-indigo-500 font-bold">
                      "Every moment with you feels like an eternal adventure."
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Profile 2 */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-10 rounded-3xl shadow-sm"
          >
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3.5 rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                      <Heart size={20} fill="currentColor" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold heading-font tracking-tight">ECHO</h2>
                      <p className="text-[9px] font-black text-red-500 tracking-[0.2em] uppercase">The Melody</p>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className={`text-lg leading-relaxed font-medium body-font ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      The light that pierces the darkness. A melody that resonates through the void, bringing warmth to even the coldest nights.
                   </div>
                   <div className="pt-6 border-t border-slate-100 dark:border-slate-700 italic text-sm text-red-500 font-bold">
                      "Your voice echoes in my heart, a melody that never fades."
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-12 text-center rounded-[3rem] shadow-sm"
          >
             <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-8">
                   <Stars size={24} className="text-slate-300" />
                   <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400">
                      <ShieldCheck size={28} />
                   </div>
                   <Sparkles size={24} className="text-slate-300" />
                </div>
                <h3 className="text-3xl font-bold heading-font tracking-tight mb-6 uppercase">Unified Bond</h3>
                <p className={`text-xl md:text-2xl font-bold italic leading-relaxed max-w-4xl mx-auto body-font ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                   "Two souls, one eternal bond. Every memory we create together is a treasure that time cannot steal."
                </p>
                <div className="mt-12 flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase text-slate-400">
                   <span>Always</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                   <span>Forever</span>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;