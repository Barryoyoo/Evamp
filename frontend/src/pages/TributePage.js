import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TributePage = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!isPlaying || images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tribute`);
      const data = await response.json();
      setImages(data);
    } catch (err) {
      toast.error('Failed to load images');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_data: reader.result,
            caption: ''
          })
        });
        
        if (response.ok) {
          toast.success('Image added to tribute');
          fetchImages();
          setShowUpload(false);
        }
      } catch (err) {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tribute/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Image removed');
        fetchImages();
        if (currentIndex >= images.length - 1) {
          setCurrentIndex(Math.max(0, images.length - 2));
        }
      }
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsPlaying(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-900/20 via-purple-900/20 to-yellow-900/20" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold heading-font text-pink-400 tracking-wide">
            IN LOVING MEMORY
          </h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-pink-500/30 text-pink-200 rounded-lg hover:bg-pink-500/40 transition-colors flex items-center gap-2"
          >
            <Upload size={20} />
            Add Image
          </button>
        </div>

        {showUpload && (
          <div className="px-6 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-pink-500/40 text-white rounded-lg hover:bg-pink-500/50 transition-colors"
            >
              Select Image
            </button>
          </div>
        )}

        {images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-pink-200/60 text-xl">No images in tribute slideshow yet</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <button
              onClick={goToPrevious}
              className="p-4 bg-pink-500/20 text-pink-200 rounded-full hover:bg-pink-500/30 transition-colors mr-4"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="relative w-full max-w-4xl aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative group">
                    <img
                      src={images[currentIndex]?.image_data}
                      alt="Tribute"
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                      style={{ filter: 'sepia(0.2) saturate(0.8)' }}
                    />
                    <button
                      onClick={() => handleDelete(images[currentIndex]?.id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={goToNext}
              className="p-4 bg-pink-500/20 text-pink-200 rounded-full hover:bg-pink-500/30 transition-colors ml-4"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}

        <div className="p-6 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-pink-400 w-8'
                  : 'bg-pink-400/30 hover:bg-pink-400/50'
              }`}
            />
          ))}
        </div>

        <div className="p-6 text-center">
          <p className="text-pink-200/80 text-lg italic">
            "Forever in our hearts, forever in our memories"
          </p>
        </div>
      </div>
    </div>
  );
};

export default TributePage;