import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, CheckCircle2, XCircle, Ruler, Sparkles, Award } from 'lucide-react'

const MEASUREMENT_LABELS = [
  { key: 'chest', label: 'Chest / Bust' },
  { key: 'shoulder', label: 'Shoulder Width' },
  { key: 'waist', label: 'Waist Size' },
  { key: 'thigh', label: 'Thigh Size' },
  { key: 'torso', label: 'Torso / Length' },
  { key: 'hips', label: 'Hips Size' }
]

const CustomFitConfirmModal = ({
  isOpen,
  productName,
  measurements,
  onConfirm,
  onCancel
}) => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 6
    const rotateX = (0.5 - y) * 6
    setTilt({
      rotateX,
      rotateY,
      glareX: x * 100,
      glareY: y * 100
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          style={{ perspective: 1400 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-fit-modal-title"
        >
          {/* Ambient Luxury Gold Radial Aura */}
          <div
            className="pointer-events-none fixed inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(201,168,76,0.22), transparent 55%)'
            }}
          />

          <motion.div
            initial={{ opacity: 0, rotateX: 24, rotateY: -10, scale: 0.84, y: 45 }}
            animate={{
              opacity: 1,
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              scale: 1,
              y: 0
            }}
            exit={{ opacity: 0, rotateX: -20, rotateY: 10, scale: 0.86, y: 35 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => e.stopPropagation()}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#15130E] via-[#0B0A08] to-[#050505] border-2 border-[#C9A84C]/70 shadow-[0_35px_90px_rgba(0,0,0,0.95),0_0_55px_rgba(201,168,76,0.25)] text-[#E8E0CC] overflow-hidden my-auto"
          >
            {/* Dynamic 3D Specular Sheen */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,245,214,0.10), transparent 55%)`
              }}
            />

            {/* Top Metallic Gold Bevel Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#9B782B] via-[#FFF5D6] to-[#C9A84C]" />

            <div className="relative p-5 sm:p-7 space-y-5">
              {/* Header */}
              <div className="flex items-start gap-4 border-b border-[#26241E] pb-4">
                <motion.div
                  initial={{ rotateY: -90, scale: 0.7 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF5D6] via-[#C9A84C] to-[#8C6B20] text-black flex items-center justify-center flex-shrink-0 shadow-[0_10px_25px_rgba(201,168,76,0.4)]"
                >
                  <Ruler className="w-6 h-6" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.22em] font-serif flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      VÆROX BESPOKE ATELIER
                    </span>
                  </div>
                  <h2
                    id="custom-fit-modal-title"
                    className="text-lg sm:text-xl font-serif font-extrabold text-[#FFF5D6] uppercase tracking-wide leading-snug"
                  >
                    Confirm Your Custom Fit Measurements
                  </h2>
                  {productName && (
                    <p className="text-xs text-[#A39E93] mt-0.5 truncate">
                      Garment: <span className="text-[#E8E0CC] font-semibold">{productName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Entered Measurements 3D Layered Summary */}
              <div className="bg-[#0E0D0A] border border-[#26241E] rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,245,214,0.06)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Entered Measurements Summary
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#FFF5D6] text-[10px] font-bold uppercase">
                    {measurements?.fitPreference || 'Tailored Fit'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MEASUREMENT_LABELS.map((item) => (
                    <div
                      key={item.key}
                      className="bg-[#151410] border border-[#2A261C] rounded-xl px-3 py-2 flex flex-col justify-between shadow-inner"
                    >
                      <span className="text-[9.5px] text-[#A39E93] uppercase tracking-wider font-serif">
                        {item.label}
                      </span>
                      <span className="text-sm font-mono font-bold text-[#FFF5D6] mt-0.5">
                        {measurements?.[item.key]}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Policy Box */}
              <div className="rounded-2xl bg-gradient-to-br from-[#23190B] via-[#171209] to-[#120E08] border border-[#C9A84C]/60 p-4 sm:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <h3 className="text-xs font-serif font-extrabold text-[#FFF5D6] uppercase tracking-widest">
                    Custom Fit Policy & Terms
                  </h3>
                </div>
                <div className="space-y-2.5 text-xs sm:text-[13px] text-[#F2E6C4] leading-relaxed font-medium">
                  <p>
                    Once measurements are confirmed, custom-fit products are not eligible for return or exchange due to incorrect customer-provided measurements.
                  </p>
                  <p>
                    If the customer receives a damaged or defective product, exchange only will be provided. No refund will be available.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#141310] hover:bg-[#1E1C16] border border-[#3A3426] hover:border-rose-500/60 text-[#E8E0CC] hover:text-rose-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Cancel Measurements
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_28px_rgba(201,168,76,0.35)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Measurements
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CustomFitConfirmModal

