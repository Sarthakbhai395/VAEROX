import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getProductImageUrl } from '../../utils/imageUrl'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const DealsSection = ({ title, deals }) => {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <section className="relative">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#FFF5D6] mb-2 font-serif">{title}</h2>
          <div className="w-16 h-[3px] bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] rounded-full mt-1.5" />
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop scroll arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-[#C9A84C]/40 bg-[#0A0A0A] flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all duration-200"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-[#C9A84C]/40 bg-[#0A0A0A] flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all duration-200"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold tracking-widest text-[#C9A84C] hover:text-[#FFF5D6] uppercase transition-colors group"
          >
            View All
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Cards ── */}
      <motion.div
        ref={scrollRef}
        className="flex overflow-x-auto w-full max-w-full md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 snap-x snap-mandatory hide-scrollbar pb-2 -mx-1 px-1"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {deals.map((deal) => (
          <motion.div
            key={deal.id}
            className="flex-shrink-0 w-[65vw] sm:w-[42vw] md:w-auto snap-start"
            variants={cardVariants}
          >
            <Link to="/products" className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-[#26241E] aspect-[4/5] hover:border-[#C9A84C]/60 transition-all duration-300">
                <img
                  src={getProductImageUrl(deal.image)}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Glassmorphic info card */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <div className="bg-black/70 backdrop-blur-xl rounded-xl p-3 md:p-3.5 border border-[#C9A84C]/30 transition-all duration-300 group-hover:border-[#C9A84C]">
                    <h3 className="text-[#FFF5D6] font-semibold text-sm md:text-base leading-tight mb-0.5 font-serif">
                      {deal.title}
                    </h3>
                    <p className="text-[#C9A84C] text-xs md:text-sm font-extrabold uppercase tracking-wider">{deal.discount}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
