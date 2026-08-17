import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode } from '../contexts/ModeContext';
import { LogoEmblem } from './Logo';
import { Sparkles, ShoppingBag, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

export const ModeSelectionModal = () => {
  const { showModeModal, setShowModeModal, selectMode, setMode } = useMode();

  if (!showModeModal) return null;

  const handleChooseMode = (chosenMode, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof selectMode === 'function') {
      selectMode(chosenMode);
    } else if (typeof setMode === 'function') {
      setMode(chosenMode);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-y-auto overflow-x-hidden p-4 sm:p-6 select-none"
      >
        {/* Ambient Gold & Blue Lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-3xl overflow-hidden border border-white/15 bg-[#080808] shadow-[0_0_80px_rgba(0,0,0,0.95)]"
        >
          {/* Close button */}
          <button
            onClick={() => setShowModeModal(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white/70 hover:text-white flex items-center justify-center text-sm transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Top Title Banner */}
          <div className="p-6 md:p-8 text-center border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#C9A84C] tracking-[0.2em] uppercase mb-3">
              <Sparkles size={12} />
              Welcome to AkarioMart
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Choose Your Shopping Experience
            </h2>
            <p className="text-xs md:text-sm text-[#E8E0CC]/70 font-light mt-1 max-w-md mx-auto">
              Select between our everyday casual marketplace or our curated high-luxury lifestyle edition.
            </p>
          </div>

          {/* Split Screen 2 Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* ── LEFT: AKARIOMART CASUAL ── */}
            <motion.div
              className="p-8 md:p-10 flex flex-col justify-between relative group hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={(e) => handleChooseMode('casual', e)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                    Everyday Marketplace
                  </span>
                  <h3 className="text-2xl font-bold font-sans text-white mt-1">
                    AkarioMart Casual
                  </h3>
                  <p className="text-xs text-[#E8E0CC]/70 font-light leading-relaxed mt-2">
                    Affordable everyday essentials, multi-category products, trending fashion, electronics, and daily deals for everyone.
                  </p>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 text-xs text-[#E8E0CC]/80 font-light pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Affordable pricing & daily discounts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Electronics, Fashion, Home & Beauty
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Quick checkout & easy returns
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={(e) => handleChooseMode('casual', e)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg group-hover:shadow-blue-500/25 transition-all"
                >
                  Enter Casual Store
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* ── RIGHT: AKARIOMART LUXURY (VÆROX) ── */}
            <motion.div
              className="p-8 md:p-10 flex flex-col justify-between relative group bg-gradient-to-b from-[#0F0D08]/80 to-[#080808] hover:bg-[#120F09] transition-colors cursor-pointer"
              onClick={(e) => handleChooseMode('luxury', e)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {/* Gold Glare Halo */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#C9A84C]/20 transition-all" />

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] mb-2 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                  <Crown size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] uppercase flex items-center gap-1.5">
                    <LogoEmblem className="w-3.5 h-3.5" />
                    AkarioMart x VÆROX
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] mt-1">
                    AkarioMart Luxury
                  </h3>
                  <p className="text-xs text-[#E8E0CC]/80 font-light leading-relaxed mt-2">
                    A high-luxury curated persona experience. Shop complete lifestyle sets like <i>The CEO</i>, <i>The Gentleman</i>, and <i>The Entrepreneur</i>.
                  </p>
                </div>

                {/* Highlights */}
                <ul className="space-y-2 text-xs text-[#E8E0CC]/80 font-light pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">❖</span> Curated Lifestyle Persona Collections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">❖</span> Buy Complete Look Set with 1-Click
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">❖</span> VÆROX High-Fashion Apparel & Accessories
                  </li>
                </ul>
              </div>

              <div className="pt-8 relative z-10">
                <button
                  type="button"
                  onClick={(e) => handleChooseMode('luxury', e)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C9A84C] via-[#E4C875] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(201,168,76,0.35)] group-hover:shadow-[0_0_35px_rgba(201,168,76,0.6)] transition-all"
                >
                  Explore Luxury Experience ❖
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModeSelectionModal;
