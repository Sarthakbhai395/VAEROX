import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, Volume2, VolumeX, X, ShoppingBag, Eye, Heart } from 'lucide-react'
import { ugcVideoService } from '../../services/ugcVideoService'

export const UGCVideoSection = () => {
  const [videos, setVideos] = useState([])
  const [activeModalVideo, setActiveModalVideo] = useState(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const loadVideos = () => {
      const active = ugcVideoService.getActiveVideos()
      setVideos(active)
    }
    loadVideos()
    window.addEventListener('storage', loadVideos)
    return () => window.removeEventListener('storage', loadVideos)
  }, [])

  if (!videos || videos.length === 0) return null

  return (
    <section className="py-14 md:py-20 bg-[#050505] border-t border-[#26241E] select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase mb-3">
            COMMUNITY & REELS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-3">
            VÆROX IN REAL LIFE
          </h2>
          <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-xl mx-auto font-light">
            Watch authentic moments, high-fashion styling tips, and red-carpet looks curated by our global community
          </p>
        </motion.div>

        {/* Video Reel Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[9/16] shadow-xl hover:border-[#C9A84C]/60 hover:shadow-[0_0_30px_rgba(201,168,76,0.2)] transition-all duration-300 cursor-pointer"
              onClick={() => setActiveModalVideo(video)}
            >
              {/* Thumbnail Image */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Play Icon Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/60 backdrop-blur-md border border-[#C9A84C]/60 flex items-center justify-center text-[#C9A84C] group-hover:scale-110 group-hover:bg-[#C9A84C] group-hover:text-black transition-all duration-300 shadow-2xl">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Author Tag (Top Left) */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-md border border-white/20">
                  {video.author || '@vaerox_community'}
                </span>
              </div>

              {/* Card Footer Details */}
              <div className="absolute bottom-0 inset-x-0 p-3.5 md:p-4 z-10 flex flex-col gap-2">
                <h3 className="text-xs md:text-sm font-bold text-[#FFF5D6] line-clamp-1 font-serif">
                  {video.title}
                </h3>

                {/* Linked Product Tag */}
                {video.productName && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="flex items-center justify-between bg-black/80 backdrop-blur-md border border-[#C9A84C]/40 p-2 rounded-xl text-[10px] md:text-xs text-[#E8E0CC] hover:border-[#C9A84C] transition-colors"
                  >
                    <span className="truncate font-medium flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                      <span className="truncate">{video.productName}</span>
                    </span>
                    <Link
                      to={video.productLink || '/products'}
                      className="ml-2 font-bold text-[#C9A84C] hover:text-white uppercase tracking-wider text-[9px] whitespace-nowrap"
                    >
                      Shop Look →
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Video Modal */}
      <AnimatePresence>
        {activeModalVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-[#C9A84C]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col aspect-[9/16] max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/70 border border-white/20 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* HTML5 Video Player */}
              <video
                src={activeModalVideo.videoUrl}
                poster={activeModalVideo.thumbnail}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
              />

              {/* Overlay Footer Info */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent z-20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-[#C9A84C] bg-black/80 border border-[#C9A84C]/40">
                    {activeModalVideo.author}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-950/40 px-3 py-1 rounded-full border border-rose-500/30">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {activeModalVideo.likes}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-serif">{activeModalVideo.title}</h3>

                {activeModalVideo.productName && (
                  <Link
                    to={activeModalVideo.productLink || '/products'}
                    onClick={() => setActiveModalVideo(null)}
                    className="flex items-center justify-between bg-[#C9A84C] text-black font-extrabold px-4 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-[#FFF5D6] transition-colors shadow-lg"
                  >
                    <span>Shop {activeModalVideo.productName}</span>
                    <ShoppingBag className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
