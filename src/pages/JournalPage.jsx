import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  PenLine, Trash2, X, Smile, Frown, Zap, 
  Meh, Heart, Plus, Sparkles, Calendar, Search,
  Stars, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';

const MOODS = [
  { id: 'happy', label: 'Radiant', icon: Smile, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'sad', label: 'Cloudy', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'excited', label: 'Electric', icon: Zap, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  { id: 'neutral', label: 'Balanced', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  { id: 'love', label: 'Adoration', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
];

const getMood = (id) => MOODS.find(m => m.id === id) || MOODS[3];

const JournalPage = () => {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journal');
      setEntries(response.data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/journal', newEntry);
      if (response.status === 201) {
        toast.success('Log secured');
        setShowModal(false);
        setNewEntry({ title: '', content: '', mood: 'neutral' });
        fetchEntries();
      }
    } catch (err) {
      toast.error('Entry failed');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/journal/${id}`);
      toast.success('Purged');
      fetchEntries();
    } catch (err) {
      toast.error('Error');
    }
  };

  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen md:pl-[340px] pt-32 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-2 mb-4 text-fuchsia-500 font-black tracking-[0.3em] uppercase text-[10px]">
               <Stars size={14} fill="currentColor" />
               <span>Memory Stream</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold heading-font tracking-tight uppercase leading-none">
               JOURNAL
            </h1>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold heading-font uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
          >
            <Plus size={18} strokeWidth={3} />
            <span>New Entry</span>
          </button>
        </motion.div>

        {/* Search */}
        <div className="mb-12 relative group">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="SEARCH LOGS..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 pl-14 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[11px] font-bold tracking-wider placeholder:tracking-normal placeholder:font-medium"
           />
        </div>

        {/* List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-24 text-center">
               <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 py-24 text-center rounded-[2.5rem]">
               <BookOpen size={40} className="mx-auto mb-4 text-slate-200" />
               <h3 className="text-xl font-bold heading-font uppercase mb-1">No Entries</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start your journey today</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => {
                const mood = getMood(entry.mood);
                const MoodIcon = mood.icon;
                const isExpanded = expandedId === entry.id;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-sm cursor-pointer hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-6">
                       <div className={`p-4 rounded-2xl ${mood.bg} ${mood.color} shadow-inner`}>
                          <MoodIcon size={24} strokeWidth={2.5} />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-2xl font-bold heading-font tracking-tight uppercase">{entry.title}</h3>
                             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-1 rounded-lg text-[8px] font-black text-slate-500 uppercase">#{entry.id?.toString().slice(-4)}</div>
                          </div>
                          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                             <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                {formatDate(entry.timestamp)}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                             <span>{mood.label}</span>
                          </div>
                          
                          <AnimatePresence>
                             {isExpanded && (
                               <motion.div
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: 'auto' }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="overflow-hidden"
                               >
                                 <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700 text-lg leading-relaxed font-medium body-font text-slate-500 dark:text-slate-400 whitespace-pre-wrap italic">
                                   "{entry.content}"
                                 </div>
                               </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                       <button
                         onClick={(e) => handleDelete(entry.id, e)}
                         className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
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
                <h2 className="text-2xl font-bold heading-font tracking-tight uppercase">New Log Entry</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-1.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Title</p>
                   <input
                     type="text"
                     placeholder="ENTRY SUBJECT"
                     value={newEntry.title}
                     onChange={(e) => setNewEntry(p => ({ ...p, title: e.target.value }))}
                     required
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-bold tracking-wider transition-all"
                   />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 pl-1">Atmosphere</p>
                  <div className="flex gap-3 flex-wrap">
                    {MOODS.map((mood) => {
                      const MoodIcon = mood.icon;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setNewEntry(p => ({ ...p, mood: mood.id }))}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${
                            newEntry.mood === mood.id 
                              ? `${mood.bg} ${mood.color} border-current scale-105` 
                              : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400 grayscale hover:grayscale-0'
                          }`}
                        >
                          <MoodIcon size={16} strokeWidth={2.5} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-1">Content</p>
                   <textarea
                     placeholder="WRITE YOUR THOUGHTS..."
                     value={newEntry.content}
                     onChange={(e) => setNewEntry(p => ({ ...p, content: e.target.value }))}
                     required
                     rows={5}
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 text-lg font-medium italic transition-all resize-none"
                   />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold heading-font uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                >
                  Save Entry
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalPage;
