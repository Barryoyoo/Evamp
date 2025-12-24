import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GalleryPage = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/gallery`);
      const data = await response.json();
      setImages(data);
    } catch (err) {
      toast.error('Failed to load images');
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
        const response = await fetch(`${BACKEND_URL}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_data: reader.result,
            caption: ''
          })
        });
        
        if (response.ok) {
          toast.success('Memory added!');
          fetchImages();
        }
      } catch (err) {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/gallery/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Memory deleted');
        fetchImages();
      }
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl md:text-6xl font-bold heading-font ${
            theme === 'dark'
              ? 'text-cyan-400 tracking-tighter uppercase'
              : 'text-pink-500 tracking-wide'
          }`}>
            GALLERY
          </h1>
          <button
            data-testid="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-gradient-to-r from-pink-400 to-yellow-400 text-white hover:scale-105 shadow-lg'
            }`}
          >
            <Upload size={20} />
            Add Memory
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>
              Loading memories...
            </p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}>
              No memories yet. Start adding some!
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`break-inside-avoid relative group rounded-lg overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-black/40 border border-cyan-500/30'
                    : 'bg-white/60 border border-white/40 shadow-lg'
                }`}
              >
                <img
                  src={image.image_data}
                  alt="Memory"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => handleDelete(image.id)}
                  className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === 'dark'
                      ? 'bg-red-500/80 text-white hover:bg-red-600'
                      : 'bg-red-400/80 text-white hover:bg-red-500'
                  }`}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;