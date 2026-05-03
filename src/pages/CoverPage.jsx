import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Clock, Image, Trophy, ListTodo, BookOpen, 
  Sparkles, LayoutDashboard, Activity, Zap, 
  ShieldCheck, Globe, Cpu, Heart, Flame,
  Stars, Smile, ActivitySquare
} from 'lucide-react';
import api from '../api';

const StatWidget = React.memo(({ icon: Icon, title, value, detail, color, delay, theme }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').split(' ')[0]}/10 ${color.split(' ')[0]}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold heading-font mb-0.5 tracking-tight">
        {value}
      </div>
      <div className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 mb-0.5">
        {title}
      </div>
      <div className={`text-[8px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>
        {detail}
      </div>
    </div>
  </motion.div>
));

const CoverPage = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({ memories: 0, journals: 0, achievements: 0, completedTodos: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Stats retrieval anomaly");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={`min-h-screen md:pl-[340px] pt-24 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />

      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 px-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
                  <ActivitySquare size={14} />
               </div>
               <span className="text-[9px] font-black tracking-[0.3em] uppercase text-indigo-500">Analytics Interface</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold heading-font tracking-tight mb-3 uppercase leading-none">
               DASHBOARD
            </h1>
            <div className="flex items-center gap-4">
               <p className={`text-xs font-medium body-font max-w-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visualizing core metrics and historical data logs.
               </p>
               <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/10">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em]">Live Session</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-4">
           {/* Journey Card - Replaces Timer */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 md:p-12 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Heart size={120} fill="currentColor" className="text-red-500" />
              </div>

              <div className="flex items-center justify-between mb-16">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-500 text-white shadow-lg shadow-red-600/20">
                       <Sparkles size={20} />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold heading-font tracking-tight uppercase">CHRONICLES OF US</h2>
                       <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">Cherishing every chapter of our story</p>
                    </div>
                 </div>
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ENCRYPTED</span>
                 </div>
              </div>
              
              <div className="py-8">
                 <h3 className="text-4xl md:text-6xl font-bold heading-font tracking-tighter text-indigo-500 leading-none mb-6">
                    ETERNALLY <br />
                    SYNCHRONIZED
                 </h3>
                 <p className={`text-sm body-font max-w-md ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    An unbreakable bond forged in time, documented in memories, and secured forever.
                 </p>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white font-black text-[10px]">B</div>
                       <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white font-black text-[10px]">E</div>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Love Protocol Active</p>
                 </div>
                 <div className="text-[8px] font-black tracking-[0.4em] text-slate-300 uppercase">
                    MSR_ARCHIVE_SECURED
                 </div>
              </div>
           </motion.div>

           {/* Side Stats */}
           <div className="flex flex-col gap-5">
              <StatWidget 
                icon={Image} 
                title="Memories" 
                value={stats.memories} 
                detail="Visual Captures"
                color="text-indigo-500"
                delay={0.1}
                theme={theme}
              />
              <StatWidget 
                icon={BookOpen} 
                title="Journals" 
                value={stats.journals} 
                detail="System Logs"
                color="text-purple-500"
                delay={0.2}
                theme={theme}
              />
           </div>

           <StatWidget 
             icon={Trophy} 
             title="Records" 
             value={stats.achievements} 
             detail="Unlocked Achievements"
             color="text-amber-500"
             delay={0.3}
             theme={theme}
           />
           <StatWidget 
             icon={ListTodo} 
             title="Objectives" 
             value={stats.completedTodos} 
             detail="Mission Progress"
             color="text-emerald-500"
             delay={0.4}
             theme={theme}
           />
           
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between p-8 rounded-[2rem] shadow-sm"
           >
              <div className="flex items-center gap-5">
                 <div className="p-3.5 rounded-xl bg-red-500/10 text-red-500">
                    <Heart size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold heading-font tracking-tight uppercase leading-none mb-1.5">Security Level</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Heart Sync</p>
                 </div>
              </div>
              <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-500">
                 <Sparkles size={16} />
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;