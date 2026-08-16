import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const SLIDE_DURATION = 6000

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1920&q=80',
      title: 'VÆROX LUXURY COLLECTION',
      subtitle: 'Curated Elegance & Exclusive High-Fashion Deals',
      tag: 'VÆROX EXCLUSIVE',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1920&q=80',
      title: 'VÆROX FASHION WEEK',
      subtitle: 'Discover Couture Trends & Artisanal Craftsmanship',
      tag: 'VÆROX COUTURE',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?auto=format&fit=crop&w=1920&q=80',
      title: 'VÆROX SMART LIVING',
      subtitle: 'Next-Gen High End Electronics & Innovations',
      tag: 'VÆROX INNOVATION',
    },
  ]

  const goTo = useCallback((index) => {
    setCurrentSlide(index)
    setProgress(0)
  }, [])

  const next = useCallback(() => goTo(currentSlide === banners.length - 1 ? 0 : currentSlide + 1), [currentSlide, banners.length, goTo])
  const prev = useCallback(() => goTo(currentSlide === 0 ? banners.length - 1 : currentSlide - 1), [currentSlide, banners.length, goTo])

  /* Auto-advance */
  useEffect(() => {
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

  /* Preload all banner images on mount so transitions are instant */
  useEffect(() => {
    banners.forEach((banner) => {
      const img = new Image()
      img.src = banner.image
    })
  }, [])

  return (
    <section className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden rounded-2xl lg:rounded-3xl select-none">
      {/* ── Background Images — TRUE CROSSFADE (no blank frame) ── */}
      {/* All slides are rendered; only the active one is opacity-1. 
          AnimatePresence with NO mode (default "sync") renders both 
          exiting and entering simultaneously, creating a seamless overlap. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute inset-0 will-change-[opacity,transform]"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ 
            opacity: { duration: 0.8, ease: 'easeInOut' },
            scale: { duration: 5, ease: 'easeOut' }
          }}
        >
          <img
            src={banners[currentSlide].image}
            alt={banners[currentSlide].title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content — Smooth text transition ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              className="max-w-2xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Tag */}
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.3em] text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 mb-6 uppercase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {banners[currentSlide].tag}
              </motion.span>

              {/* Title */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#E8E0CC] mb-4 md:mb-6 leading-[1.08] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {banners[currentSlide].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#E8E0CC]/90 mb-8 md:mb-10 font-light leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                {banners[currentSlide].subtitle}
              </motion.p>

              {/* CTA */}
              <motion.button
                onClick={() => navigate('/products')}
                className="group relative px-8 py-3.5 md:py-4 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] rounded-full text-black font-extrabold text-sm md:text-base uppercase tracking-widest overflow-hidden transition-all duration-500 shadow-[0_0_25px_rgba(201,168,76,0.4)] hover:shadow-[0_0_35px_rgba(201,168,76,0.7)]"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Collection
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300"
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

      {/* ── Bottom: Progress Bars + Counter ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 pb-5 md:pb-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Progress dots */}
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

          {/* Counter */}
          <span className="text-[#C9A84C]/80 text-xs md:text-sm font-medium tracking-widest tabular-nums">
            {String(currentSlide + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(banners.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
