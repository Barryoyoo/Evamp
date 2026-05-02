import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Upload, ChevronLeft, ChevronRight, X, 
  Pause, Play, Heart, Sparkles, ImagePlus,
  Trash2, Layers, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';

const TributePage = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!isPlaying || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const fetchImages = async () => {
    try {
      const response = await api.get('/tribute');
      setImages(response.data);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await api.post('/tribute', { image_data: reader.result, caption: '' });
        if (response.status === 201) {
          toast.success('Frame added');
          fetchImages();
        }
      } catch (err) {
        toast.error('Transfer error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.delete(`/tribute/${id}`);
      if (response.status === 200) {
        toast.success('Frame removed');
        fetchImages();
        if (currentIndex >= images.length - 1) setCurrentIndex(Math.max(0, images.length - 2));
      }
    } catch (err) {
      toast.error('Deletion error');
    }
  };

  const goToPrev = () => { setCurrentIndex(p => (p - 1 + images.length) % images.length); setIsPlaying(false); };
  const goToNext = () => { setCurrentIndex(p => (p + 1) % images.length); setIsPlaying(false); };

  return (
    <div className={`min-h-screen md:pl-[340px] pt-32 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />
      
      <div className="max-w-6xl mx-auto h-full flex flex-col p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-lg bg-red-500 text-white">
                  <Heart size={16} fill="currentColor" />
               </div>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500">Memorial Stream</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold heading-font tracking-tight uppercase leading-none">
               TRIBUTE
            </h1>
          </div>
          
          <div className="flex gap-3">
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition-colors"
             >
               {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
               <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                  {isPlaying ? 'Pause' : 'Resume'}
               </span>
             </button>

             <button
               onClick={() => fileInputRef.current?.click()}
               className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center gap-3 shadow-lg shadow-indigo-600/20 transition-all"
             >
               <ImagePlus size={18} />
               <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Add Photo</span>
             </button>
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </motion.div>

        {/* Main Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative group w-full flex justify-center"
              >
                 <div className="bento-card !p-4 !rounded-[2.5rem] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 luxury-shadow overflow-hidden max-w-4xl">
                    <img
                      src={images[currentIndex]?.image_data}
                      alt="Tribute"
                      className="max-h-[60vh] w-auto object-contain rounded-3xl"
                    />
                    
                    <div className="absolute inset-x-8 bottom-8 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/20">
                          SEQ_{currentIndex + 1}
                       </div>
                       <button
                         onClick={(e) => handleDelete(images[currentIndex].id, e)}
                         className="p-4 rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="bento-card py-24 text-center flex flex-col items-center justify-center !rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-700 w-full max-w-2xl">
                 <div className="p-8 rounded-full bg-slate-100 dark:bg-slate-900 mb-6 text-slate-300">
                    <Layers size={48} strokeWidth={1.5} />
                 </div>
                 <h2 className="text-2xl font-bold heading-font tracking-tight uppercase mb-2">No Visuals Recorded</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add your first photo to the stream</p>
              </div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
               <button
                 onClick={goToPrev}
                 className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xl pointer-events-auto hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
               >
                 <ChevronLeft size={24} strokeWidth={3} />
               </button>
               <button
                 onClick={goToNext}
                 className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xl pointer-events-auto hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
               >
                 <ChevronRight size={24} strokeWidth={3} />
               </button>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="mt-12 text-center space-y-8">
           {images.length > 0 && (
             <div className="flex justify-center gap-2">
               {images.map((_, i) => (
                 <button
                   key={i}
                   onClick={() => { setCurrentIndex(i); setIsPlaying(false); }}
                   className={`h-1.5 rounded-full transition-all duration-500 ${
                     i === currentIndex ? 'w-8 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                   }`}
                 />
               ))}
             </div>
           )}

           <div className="flex flex-col items-center">
              <p className="text-xl md:text-2xl font-bold heading-font tracking-tight leading-tight max-w-2xl italic">
                 "Forever in our hearts, forever in our memories."
              </p>
              <div className="mt-6 flex items-center gap-4 text-red-500/30">
                 <Heart size={12} fill="currentColor" />
                 <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400">
                    Always & Forever
                 </span>
                 <Heart size={12} fill="currentColor" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TributePage;