import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Plus, X, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AchievementsPage = () => {
  const { theme } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: '',
    image_data: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/achievements`);
      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      toast.error('Failed to load achievements');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAchievement(prev => ({ ...prev, image_data: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAchievement)
      });
      
      if (response.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: theme === 'dark' ? ['#00f0ff', '#ffd700'] : ['#ffb7b2', '#fdfd96']
        });
        toast.success('Achievement unlocked!');
        setShowModal(false);
        setNewAchievement({ title: '', description: '', date: '', image_data: '' });
        fetchAchievements();
      }
    } catch (err) {
      toast.error('Failed to add achievement');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/achievements/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Achievement deleted');
        fetchAchievements();
      }
    } catch (err) {
      toast.error('Failed to delete achievement');
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl md:text-6xl font-bold heading-font ${
            theme === 'dark'
              ? 'text-cyan-400 tracking-tighter uppercase'
              : 'text-pink-500 tracking-wide'
          }`}>
            ACHIEVEMENTS
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-gradient-to-r from-pink-400 to-yellow-400 text-white hover:scale-105 shadow-lg'
            }`}
          >
            <Plus size={20} />
            Add Achievement
          </button>
        </div>

        <div className="relative">
          <div className={`absolute left-8 top-0 bottom-0 w-1 ${
            theme === 'dark' ? 'bg-cyan-500/30' : 'bg-pink-300'
          }`} />

          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                    : 'bg-pink-400 shadow-lg'
                }`}>
                  <Trophy size={16} className="text-white" />
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-xl group hover:scale-[1.02] transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50'
                    : 'bg-white/60 border border-white/40 shadow-lg hover:shadow-xl'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`text-2xl font-bold heading-font ${
                        theme === 'dark' ? 'text-cyan-400' : 'text-pink-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        {achievement.date}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        theme === 'dark'
                          ? 'bg-red-500/80 text-white hover:bg-red-600'
                          : 'bg-red-400/80 text-white hover:bg-red-500'
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.image_data && (
                    <img
                      src={achievement.image_data}
                      alt={achievement.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-20">
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>
              No achievements yet. Start tracking your milestones!
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-8 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-zinc-900 border border-cyan-500/30'
                  : 'bg-white border border-pink-200'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 heading-font ${
                theme === 'dark' ? 'text-cyan-400' : 'text-pink-500'
              }`}>
                New Achievement
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className={`w-full p-3 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-black/50 border border-zinc-700 text-white placeholder:text-zinc-500'
                      : 'bg-white border border-pink-100 text-slate-700'
                  } outline-none`}
                />
                <input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className={`w-full p-3 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-black/50 border border-zinc-700 text-white'
                      : 'bg-white border border-pink-100 text-slate-700'
                  } outline-none`}
                />
                <textarea
                  placeholder="Description"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className={`w-full p-3 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-black/50 border border-zinc-700 text-white placeholder:text-zinc-500'
                      : 'bg-white border border-pink-100 text-slate-700'
                  } outline-none`}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-400 hover:border-cyan-500'
                      : 'border-pink-200 text-slate-600 hover:border-pink-400'
                  }`}
                >
                  {newAchievement.image_data ? 'Image Selected' : 'Add Image (Optional)'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className={`flex-1 p-3 rounded-lg font-semibold ${
                      theme === 'dark'
                        ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                        : 'bg-gradient-to-r from-pink-400 to-yellow-400 text-white'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 p-3 rounded-lg font-semibold ${
                      theme === 'dark'
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsPage;