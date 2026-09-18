import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoEmblem } from './Logo';

// Fashion & Haute Couture montage images for Marvel-style page flip sequence
const MARVEL_PAGES = [
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
];

const IntroLoader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    // Fast flipping Marvel-style comic montage interval
    const flipInterval = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % MARVEL_PAGES.length);
    }, 120);

    // Complete overall single animation in 3.6 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 3600);

    return () => {
      clearInterval(flipInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.15,
          filter: 'blur(16px)',
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black overflow-hidden select-none"
      >
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-[100000] px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-[#E8E0CC] hover:text-white hover:border-[#C9A84C] bg-black/70 backdrop-blur-md text-[10px] tracking-[0.25em] uppercase transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Skip Intro ✕
        </button>

        {/* Ambient Radial Spotlight & Gold Energy Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,168,76,0.25)_0%,_rgba(0,0,0,0.95)_70%,_#000000_100%)] pointer-events-none" />

        {/* Background Marvel Fast-Flipping Image Montage Grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3.6, ease: 'easeInOut' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPageIndex}
                src={MARVEL_PAGES[currentPageIndex]}
                alt="Marvel Studio Flip"
                initial={{ opacity: 0.3, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 0.8, scale: 1.05, rotateY: 0 }}
                exit={{ opacity: 0.2, scale: 1.2, rotateY: -90 }}
                transition={{ duration: 0.1 }}
                className="w-[85vw] max-w-4xl h-[65vh] object-cover rounded-3xl border border-[#C9A84C]/40 shadow-[0_0_80px_rgba(201,168,76,0.4)] filter contrast-125 brightness-90 mix-blend-screen"
              />
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Cinematic Scanlines & Speed Line Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_4px)] pointer-events-none" />

        {/* Single Epic Marvel Studio Reveal Content */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl">
          {/* Logo Emblem Pulsing & Zooming */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#C9A84C] via-[#FFF5D6] to-[#8A6C1B] opacity-60 blur-2xl"
            />
            <LogoEmblem className="w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_40px_rgba(201,168,76,0.9)] relative z-10" />
          </motion.div>

          {/* Marvel Style Letter by Letter / Block Zoom Title */}
          <motion.div
            initial={{ opacity: 0, scale: 2.2, letterSpacing: '1em' }}
            animate={{ opacity: 1, scale: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#E8E0CC] tracking-[0.35em] uppercase drop-shadow-[0_0_60px_rgba(201,168,76,0.8)]"
          >
            VAEROX
          </motion.div>

          {/* Golden Shimmer Laser Line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '20rem', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeInOut' }}
            className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent my-4"
          />

          {/* Cinematic Tagline Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#FFF5D6] to-[#C9A84C] tracking-[0.3em] uppercase leading-relaxed text-center font-sans">
              WHERE UNTAMED ELEGANCE MEETS FEARLESS AMBITION
            </span>
            <span className="text-[10px] sm:text-xs text-[#E8E0CC]/80 tracking-[0.4em] uppercase font-serif font-light mt-1">
              HAUTE COUTURE • BESPOKE ATELIER
            </span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroLoader;
