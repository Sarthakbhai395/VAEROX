import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react'
import { heroBannerService } from '../../../services/heroBannerService'

export const HeroBannerManager = () => {
  const [banners, setBanners] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlide, setNewSlide] = useState({
    image: '',
    tag: '',
    title: '',
    subtitle: '',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/products',
  })
  const [message, setMessage] = useState('')

  const loadBanners = () => {
    setBanners(heroBannerService.getBanners())
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newSlide.image || !newSlide.title) return
    heroBannerService.addBanner(newSlide)
    loadBanners()
    setNewSlide({
      image: '',
      tag: '',
      title: '',
      subtitle: '',
      ctaText: 'EXPLORE COLLECTION',
      ctaLink: '/products',
    })
    setShowAddForm(false)
    setMessage('Hero slide added successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleToggle = (id) => {
    heroBannerService.toggleBannerActive(id)
    loadBanners()
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this hero slide?')) {
      heroBannerService.deleteBanner(id)
      loadBanners()
      setMessage('Hero slide deleted!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-6 text-[#E8E0CC]"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#26241E] pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">
            HOMEPAGE HERO CONTROL
          </span>
          <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Manage Sliding Hero Banners</h2>
          <p className="text-[#A39E93] text-xs mt-0.5">
            Admin can add, edit, hide, or remove sliding images displayed on the homepage hero section.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Add New Slide'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#FFF5D6] rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
          {message}
        </div>
      )}

      {/* Add New Slide Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd}
          className="mb-8 bg-[#121212] p-5 rounded-2xl border border-[#C9A84C]/30 space-y-4"
        >
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider font-serif">
            Create Hero Banner Slide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Slide Image URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={newSlide.image}
                onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Tag / Collection Badge *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NEW COLLECTION 2026"
                value={newSlide.tag}
                onChange={(e) => setNewSlide({ ...newSlide, tag: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Headline Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FASHION THAT MOVES WITH YOU"
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                placeholder="e.g. Redefining Classical Elegance & Luxury"
                value={newSlide.subtitle}
                onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={newSlide.ctaText}
                onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                CTA Button Target URL
              </label>
              <input
                type="text"
                value={newSlide.ctaLink}
                onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })}
                className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#C9A84C] text-black font-extrabold text-xs rounded-xl uppercase tracking-wider hover:bg-[#FFF5D6]"
            >
              Save Hero Slide
            </button>
          </div>
        </motion.form>
      )}

      {/* List of Active & Inactive Hero Banners */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 transition-all ${
              banner.active !== false
                ? 'bg-[#121212] border-[#26241E]'
                : 'bg-black/50 border-red-900/30 opacity-60'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full md:w-40 h-24 object-cover rounded-lg border border-[#26241E] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold text-[#C9A84C] bg-black border border-[#C9A84C]/30 uppercase">
                  {banner.tag}
                </span>
                {banner.active !== false ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                    Active Slide
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold text-rose-400 bg-rose-950/40 border border-rose-500/30">
                    Hidden Slide
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-[#FFF5D6] font-serif truncate">
                {banner.title}
              </h4>
              <p className="text-xs text-[#A39E93] truncate">{banner.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(banner.id)}
                className="p-2 rounded-lg border border-[#26241E] hover:border-[#C9A84C] text-[#C9A84C] transition-colors"
                title={banner.active !== false ? 'Hide Slide' : 'Show Slide'}
              >
                {banner.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 rounded-lg border border-[#26241E] hover:border-rose-500 text-rose-400 transition-colors"
                title="Delete Slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
