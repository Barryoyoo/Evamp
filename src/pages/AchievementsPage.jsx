import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Plus, X, Trophy, Sparkles, Calendar, Camera, Trash2, Heart, Award } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import api from '../api';

const AchievementsPage = () => {
  const { theme } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '', description: '', date: '', image_data: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/achievements');
      setAchievements(response.data);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewAchievement(prev => ({ ...prev, image_data: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/achievements', newAchievement);
      if (response.status === 201) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f87171', '#818cf8']
        });
        toast.success('Victory secured');
        setShowModal(false);
        setNewAchievement({ title: '', description: '', date: '', image_data: '' });
        fetchAchievements();
      }
    } catch (err) {
      toast.error('Record failed');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.delete(`/achievements/${id}`);
      if (response.status === 200) {
        toast.success('Record removed');
        fetchAchievements();
      }
    } catch (err) {
      toast.error('Deletion error');
    }
  };

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
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-2 mb-4 text-amber-500 font-black tracking-[0.3em] uppercase text-[10px]">
               <Award size={14} />
               <span>Achievement Log</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold heading-font tracking-tight uppercase leading-none">
               RECORDS
            </h1>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 text-black font-bold heading-font uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
          >
            <Plus size={18} strokeWidth={3} />
            <span>New Record</span>
          </button>
        </motion.div>

        {achievements.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 py-32 text-center rounded-[3rem]">
            <Trophy size={48} strokeWidth={1.5} className="mx-auto mb-6 text-slate-300" />
            <h2 className="text-2xl font-bold heading-font tracking-tight mb-2 uppercase">No Records Found</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initialize your first victory entry</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="space-y-10">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative sm:pl-20 group"
                >
                  <div className="absolute left-2.5 top-1 w-7 h-7 rounded-lg bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 z-10 hidden sm:flex">
                    <Trophy size={14} strokeWidth={2.5} />
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-sm group-hover:border-amber-500/30 transition-all duration-300">
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                         <div className="flex-1">
                            <h3 className="text-2xl font-bold heading-font tracking-tight mb-2 uppercase">{achievement.title}</h3>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                               <Calendar size={12} className="text-amber-500/50" />
                               {new Date(achievement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                         </div>
                         <button
                           onClick={(e) => handleDelete(achievement.id, e)}
                           className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>

                       <p className={`text-lg font-medium body-font leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                         {achievement.description}
                       </p>

                       {achievement.image_data && (
                         <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <img
                              src={achievement.image_data}
                              alt={achievement.title}
                              className="w-full h-auto max-h-[400px] object-cover"
                            />
                         </div>
                       )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold heading-font tracking-tight uppercase">Record Entry</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Title</p>
                      <input
                        type="text"
                        placeholder="VICTORY NAME"
                        value={newAchievement.title}
                        onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 text-[11px] font-bold tracking-wider transition-all"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Date</p>
                      <input
                        type="date"
                        value={newAchievement.date}
                        onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 text-[11px] font-bold transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Description</p>
                   <textarea
                     placeholder="DESCRIBE THE EVENT..."
                     value={newAchievement.description}
                     onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                     required
                     rows={4}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 text-[11px] font-bold transition-all resize-none"
                   />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-5 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                    newAchievement.image_data 
                      ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:border-amber-500/50 hover:text-amber-500'
                  }`}
                >
                  <Camera size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                     {newAchievement.image_data ? 'Image Attached' : 'Add Visual Record'}
                  </span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold heading-font uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
                >
                  Submit Record
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsPage;
