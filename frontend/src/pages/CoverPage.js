import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ChevronDown } from 'lucide-react';

const placeholderImages = [
  'https://ik.imagekit.io/1bpypwezv/IMG20251211224724.jpg',
  'https://ik.imagekit.io/1bpypwezv/IMG-20250906-WA0001.jpg',
  'https://ik.imagekit.io/1bpypwezv/IMG-20250904-WA0030.jpg',
  'https://ik.imagekit.io/1bpypwezv/IMG-20251216-WA0092.jpg',
  'https://ik.imagekit.io/1bpypwezv/IMG-20251216-WA0076.jpg',
  'https://ik.imagekit.io/1bpypwezv/IMG-20251216-WA0095.jpg'
];

const CoverPage = () => {
  const { theme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % placeholderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${placeholderImages[currentImageIndex]})`,
              filter: theme === 'dark' ? 'brightness(0.4)' : 'brightness(0.7)'
            }}
          />
          <div className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-black/60 via-transparent to-black/80'
              : 'bg-gradient-to-b from-pink-100/40 via-transparent to-yellow-100/60'
          }`} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center"
        >
          <h1 className={`text-6xl md:text-8xl font-bold mb-6 heading-font ${
            theme === 'dark'
              ? 'text-cyan-400 tracking-tighter uppercase'
              : 'text-pink-500 tracking-wide'
          } ${
            theme === 'dark' ? 'vampire-glow' : 'echo-glow'
          }`}>
            MEMORY VAULT
          </h1>
          <p className={`text-xl md:text-2xl mb-4 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            Vampire & Echo
          </p>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
          }`}>
            The Eternal Bond
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12"
        >
          <p className={`signature-font text-3xl mb-4 ${
            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
          } rotate-[-2deg]`}>
            Created by Barry
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center"
          >
            <ChevronDown 
              size={32} 
              className={theme === 'dark' ? 'text-cyan-400' : 'text-pink-500'}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoverPage;