import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { animate } from 'animejs'
import { heroBannerService } from '../../services/heroBannerService'

export const BannerCarousel = () => {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const heroBadgeRef = useRef(null)
  const SLIDE_DURATION = 6000

  // Load banners from heroBannerService
  const loadBanners = useCallback(() => {
    const active = heroBannerService.getActiveBanners()
    setBanners(active)
  }, [])

  useEffect(() => {
    loadBanners()
    const handleStorage = () => loadBanners()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [loadBanners])

  const goTo = useCallback((index) => {
    setCurrentSlide(index)
    setProgress(0)
  }, [])

  const next = useCallback(() => {
    if (banners.length === 0) return
    goTo(currentSlide === banners.length - 1 ? 0 : currentSlide + 1)
  }, [currentSlide, banners.length, goTo])

  const prev = useCallback(() => {
    if (banners.length === 0) return
    goTo(currentSlide === 0 ? banners.length - 1 : currentSlide - 1)
  }, [currentSlide, banners.length, goTo])

  /* Auto-advance */
  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
      setProgress(0)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [banners.length])

  /* Progress bar tick */
  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (SLIDE_DURATION / 50), 100))
    }, 50)
    return () => clearInterval(tick)
  }, [currentSlide])

  /* Anime.js 3D float animation on slide change */
  useEffect(() => {
    if (heroBadgeRef.current) {
      try {
        animate(heroBadgeRef.current, {
          translateY: [-10, 0],
          duration: 1800,
        })
      } catch (e) {
        // Safe fallback
      }
    }
  }, [currentSlide])

  /* Preload banner images */
  useEffect(() => {
    banners.forEach((banner) => {
      const img = new Image()
      img.src = banner.image
    })
  }, [banners])

  if (!banners || banners.length === 0) return null
  const slide = banners[currentSlide] || banners[0]

  return (
    <section className="relative w-full h-[65vh] md:h-[80vh] lg:h-[88vh] overflow-hidden rounded-2xl lg:rounded-3xl select-none shadow-2xl border border-[#26241E]">
      {/* ── Background Images Crossfade ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id || currentSlide}
          className="absolute inset-0 will-change-[opacity,transform]"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            scale: { duration: 6, ease: 'easeOut' },
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Ambient Gold Spotlight */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id || currentSlide}`}
              className="max-w-2xl"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Tag with Anime.js ref */}
              <div ref={heroBadgeRef} className="inline-block mb-6">
                <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-[0.3em] text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/60 uppercase shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                  {slide.tag || 'VÆROX LUXURY'}
                </span>
              </div>

              {/* Title */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#E8E0CC] mb-4 md:mb-6 leading-[1.08] tracking-tight font-serif drop-shadow-[0_0_35px_rgba(201,168,76,0.5)]"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg md:text-xl text-[#E8E0CC]/90 mb-8 md:mb-10 font-light leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>

              {/* CTA Button */}
              <motion.button
                onClick={() => navigate(slide.ctaLink || '/products')}
                className="group relative px-8 py-3.5 md:py-4 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] rounded-full text-black font-extrabold text-xs md:text-sm uppercase tracking-[0.25em] overflow-hidden transition-all duration-500 shadow-[0_0_25px_rgba(201,168,76,0.4)] hover:shadow-[0_0_40px_rgba(201,168,76,0.8)]"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {slide.ctaText || 'EXPLORE COLLECTION'}
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Nav Arrows ── */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black active:scale-90 transition-all duration-300"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black active:scale-90 transition-all duration-300"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Progress Indicators ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 pb-5 md:pb-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
                style={{ width: idx === currentSlide ? '2.5rem' : '1rem' }}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div className="absolute inset-0 bg-[#C9A84C]/30 rounded-full" />
                {idx === currentSlide && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#C9A84C] rounded-full transition-[width] duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          <span className="text-[#C9A84C]/80 text-xs md:text-sm font-medium tracking-widest tabular-nums">
            {String(currentSlide + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(banners.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
