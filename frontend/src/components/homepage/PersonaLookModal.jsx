import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/format';
import { CheckCircle, ShoppingBag, Sparkles, X, ArrowRight, Shield } from 'lucide-react';

export const PersonaLookModal = ({ persona, onClose }) => {
  const { addToCart } = useCart();
  const [addedBundle, setAddedBundle] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState({});

  if (!persona) return null;

  const totalRawPrice = persona.items.reduce((acc, item) => acc + item.price, 0);
  const bundleDiscountedPrice = Math.round(totalRawPrice * 0.9); // 10% bundle discount

  const handleAddBundleToCart = async () => {
    setAddedBundle(true);
    // Add all items in the persona to cart
    for (const item of persona.items) {
      await addToCart({
        _id: item.id,
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: persona.title,
      });
    }
    setTimeout(() => setAddedBundle(false), 2500);
  };

  const handleAddSingleItemToCart = async (item) => {
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    await addToCart({
      _id: item.id,
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: persona.title,
    });
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-4xl bg-[#090909] border border-[#C9A84C]/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(201,168,76,0.25)] text-[#E8E0CC]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Banner Header */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={persona.heroImage}
              alt={persona.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 z-10 space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.25em] text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 uppercase">
                {persona.subtitle}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                {persona.title}
              </h2>
              <p className="text-xs md:text-sm text-[#E8E0CC]/80 font-light max-w-xl">
                {persona.description}
              </p>
            </div>
          </div>

          {/* Items breakdown + Complete Setup CTA */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white uppercase tracking-wider">
                  Curated Look Breakdown ({persona.items.length} Pieces)
                </h3>
                <p className="text-xs text-[#E8E0CC]/60 font-light">
                  Hand-selected by VÆROX master stylists for flawless aesthetic harmony.
                </p>
              </div>

              {/* Complete Setup Price Box */}
              <div className="text-right">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest block">
                  Complete Look Bundle
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-bold text-white">{formatCurrency(bundleDiscountedPrice)}</span>
                  <span className="text-xs text-[#A39E93] line-through">{formatCurrency(totalRawPrice)}</span>
                </div>
              </div>
            </div>

            {/* Product Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 hide-scrollbar">
              {persona.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-[#C9A84C]/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-black"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-[#C9A84C] uppercase tracking-wider block">
                        {item.tag || 'VÆROX Piece'}
                      </span>
                      <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-xs font-bold text-[#E8E0CC] mt-0.5 block">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddSingleItemToCart(item)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                      addedItemIds[item.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-[#C9A84C] text-white hover:text-black border border-white/10'
                    }`}
                  >
                    {addedItemIds[item.id] ? (
                      <>
                        <CheckCircle size={12} />
                        Added
                      </>
                    ) : (
                      <>
                        + Add Piece
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#E8E0CC]/70 font-light">
                <Shield size={14} className="text-[#C9A84C]" />
                Includes Complimentary Luxury Garment Packaging & Insured Shipping
              </div>

              <button
                onClick={handleAddBundleToCart}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(201,168,76,0.35)] ${
                  addedBundle
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#C9A84C] via-[#E4C875] to-[#9B782B] text-black hover:scale-105'
                }`}
              >
                {addedBundle ? (
                  <>
                    <CheckCircle size={16} />
                    Complete Setup Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Buy Complete Setup ({formatCurrency(bundleDiscountedPrice)})
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonaLookModal;
