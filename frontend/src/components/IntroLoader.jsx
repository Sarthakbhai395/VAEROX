import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoEmblem } from './Logo';

const IntroLoader = ({ onComplete }) => {
  const [stage, setStage] = useState(1); // 1: Golden Emblem Pulsing, 2: Luxury Text Reveal, 3: Complete

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 1800);

    const timer2 = setTimeout(() => {
      setStage(3);
      if (onComplete) onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setStage(3);
    if (onComplete) onComplete();
  };

  if (stage === 3) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden select-none"
      >
        {/* Skip Intro Button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-[10000] px-4 py-1.5 rounded-full border border-[#C9A84C]/40 text-[#E8E0CC] hover:text-white hover:border-[#C9A84C] bg-black/60 backdrop-blur-md text-[10px] tracking-[0.25em] uppercase transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Skip Intro ✕
        </button>

        {/* Ambient Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,168,76,0.18)_0%,_rgba(0,0,0,0.95)_70%,_#000000_100%)] pointer-events-none" />

        {/* Floating Light Particles Background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#C9A84C]/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#FFF5D6]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Stage 1: Golden Emblem Activation & Spinning 3D Loader */}
        {stage === 1 && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(6px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center gap-6 z-10"
          >
            <div className="relative">
              {/* Outer Pulsing Gold Aura */}
              <motion.div 
                className="absolute -inset-8 rounded-full bg-gradient-to-tr from-[#C9A84C] via-[#FFF5D6] to-[#8A6C1B] opacity-50 blur-2xl"
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Rotating Outer Metallic Ring Loader */}
              <motion.div
                className="absolute -inset-4 rounded-full border-2 border-dashed border-[#C9A84C] opacity-75"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Rotating Logo Emblem */}
              <motion.div 
                className="relative z-10 p-4"
                animate={{ rotateY: [0, 180, 360], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <LogoEmblem className="w-28 h-28 md:w-36 md:h-36 drop-shadow-[0_0_40px_rgba(201,168,76,0.95)]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <div className="text-xl md:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] tracking-[0.5em] uppercase">
                VÆROX
              </div>
              <div className="text-[11px] tracking-[0.4em] text-[#E8E0CC]/80 font-light uppercase">
                HIGH LUXURY
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: Silky Cinematic Text Animation */}
        {stage === 2 && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex flex-col items-center text-center max-w-3xl px-6"
          >
            {/* Shimmer Light Line Accent */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '12rem', opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mb-6"
            />

            {/* Welcome Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[#E8E0CC] font-serif text-sm md:text-lg tracking-[0.4em] uppercase font-light mb-3"
            >
              WELCOME TO THE WORLD OF
            </motion.p>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#E8E0CC] tracking-[0.25em] uppercase mb-4 drop-shadow-[0_0_40px_rgba(201,168,76,0.6)]"
            >
              VÆROX
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-xs md:text-sm text-[#C9A84C] tracking-[0.45em] uppercase font-medium"
            >
              — AKARIOMART • ELEVATE EVERYDAY —
            </motion.p>

            {/* Bottom Shimmer Line Accent */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '12rem', opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mt-6"
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroLoader;
