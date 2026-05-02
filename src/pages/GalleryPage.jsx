import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Upload, X, ZoomIn, ImagePlus, Trash2, 
  Sparkles, Camera, Layers, Shield, Heart,
  Stars, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';

const GalleryPage = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get('/gallery');
      setImages(response.data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await api.post('/gallery', {
          image_data: reader.result,
          caption: ''
        });
        if (response.status === 201) {
          toast.success('Visual secured');
          fetchImages();
        }
      } catch (err) {
        toast.error('Capture failed');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.delete(`/gallery/${id}`);
      if (response.status === 200) {
        toast.success('Memory removed');
        fetchImages();
        if (lightboxImage?.id === id) setLightboxImage(null);
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  return (
    <div className={`min-h-screen md:pl-[340px] pt-32 md:pt-12 md:pr-12 pb-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                  <Camera size={16} />
               </div>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-500">Visual Repository</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold heading-font tracking-tight uppercase leading-none">
               PHOTOS
            </h1>
            <p className={`mt-4 text-sm font-medium body-font tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
               {images.length} visuals stored in the archive.
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold heading-font uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
          >
            <ImagePlus size={18} />
            <span>Add Memory</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </motion.div>

        {/* Gallery Content */}
        {loading ? (
          <div className="py-48 text-center">
             <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving stream...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 py-32 text-center rounded-[3rem]">
            <div className="p-8 rounded-full bg-slate-50 dark:bg-slate-900 inline-flex mb-6 text-slate-200">
               <Layers size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold heading-font tracking-tight uppercase mb-2">No Visuals</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initialize your first visual record</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {images.map((image, i) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                onClick={() => setLightboxImage(image)}
              >
                <img
                  src={image.image_data}
                  alt="Memory"
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                   <div className="flex justify-end">
                      <button
                        onClick={(e) => handleDelete(image.id, e)}
                        className="p-2.5 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md text-white">
                         <ZoomIn size={18} />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">MSR_{image.id?.toString().slice(-4)}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-20"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center"
            >
              <div className="absolute top-0 inset-x-0 flex justify-between items-center p-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 text-red-500">
                       <Heart size={24} fill="currentColor" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold heading-font tracking-tight text-white uppercase">Protected Memory</h3>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Always & Forever Secure</p>
                    </div>
                 </div>
                 <button
                    onClick={() => setLightboxImage(null)}
                    className="p-4 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className="relative max-h-[70vh] w-full flex justify-center mt-20">
                 <img
                    src={lightboxImage.image_data}
                    alt="Capture"
                    className="max-w-full max-h-[70vh] rounded-3xl object-contain shadow-2xl border border-white/5"
                 />
              </div>

              <div className="mt-10 flex gap-4">
                 <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-lg text-[9px] font-black text-slate-400 tracking-widest uppercase">ENCRYPTED</div>
                 <div className="bg-red-500 text-white px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase">OMEGA ACCESS</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-24 md:h-0" />
    </div>
  );
};

export default GalleryPage;