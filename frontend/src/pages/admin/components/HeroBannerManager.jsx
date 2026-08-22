import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react'
import { heroBannerService } from '../../../services/heroBannerService'

export const HeroBannerManager = () => {
  const [banners, setBanners] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [imageUploadMode, setImageUploadMode] = useState('file') // 'file' or 'url'
  const [previewUrl, setPreviewUrl] = useState('')
  const [newSlide, setNewSlide] = useState({
    image: '',
    tag: '',
    title: '',
    subtitle: '',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/products',
  })
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loadBanners = () => {
    setBanners(heroBannerService.getBanners())
  }

  useEffect(() => {
    loadBanners()
  }, [])

  // Handle local PC file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP, etc.)')
      return
    }

    // Check size limit (5MB warning / auto resize hint)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size is too large. Please select an image under 8MB.')
      return
    }

    setErrorMsg('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target.result
      setNewSlide((prev) => ({ ...prev, image: base64Data }))
      setPreviewUrl(base64Data)
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newSlide.image) {
      setErrorMsg('Banner image is required! Please upload an image from your PC.')
      return
    }
    if (!newSlide.title.trim()) {
      setErrorMsg('Headline Title is required!')
      return
    }
    if (!newSlide.subtitle.trim()) {
      setErrorMsg('Description is required!')
      return
    }

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
    setPreviewUrl('')
    setShowAddForm(false)
    setErrorMsg('')
    setMessage('Hero banner slide created & published successfully!')
    setTimeout(() => setMessage(''), 3500)
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
      className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 sm:p-6 text-[#E8E0CC]"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#26241E] pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">
            HOMEPAGE HERO CONTROL
          </span>
          <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Manage Sliding Hero Banners</h2>
          <p className="text-[#A39E93] text-xs mt-0.5">
            Upload banner images from your local PC to feature on the homepage hero section.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setErrorMsg('')
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-md shrink-0"
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

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Add New Slide Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd}
          className="mb-8 bg-[#121212] p-4 sm:p-6 rounded-2xl border border-[#C9A84C]/40 space-y-5 shadow-2xl"
        >
          <div className="flex justify-between items-center border-b border-[#26241E] pb-3">
            <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Create Hero Banner Slide
            </h3>
            <span className="text-[10px] text-[#A39E93]">
              * Required fields: Image, Headline Title & Description
            </span>
          </div>

          {/* Upload Image Section */}
          <div className="bg-black/60 border border-[#26241E] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#FFF5D6] uppercase tracking-wider">
                Upload Banner Image *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('file')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${
                    imageUploadMode === 'file'
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-[#1A1A1A] text-[#A39E93] hover:text-white'
                  }`}
                >
                  Upload From Local PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${
                    imageUploadMode === 'url'
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-[#1A1A1A] text-[#A39E93] hover:text-white'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageUploadMode === 'file' ? (
              <div>
                <input
                  type="file"
                  id="hero-image-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="hero-image-file-input"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A84C]/40 hover:border-[#C9A84C] rounded-xl bg-[#0A0A0A] cursor-pointer transition-all hover:bg-[#C9A84C]/5 group"
                >
                  <ImageIcon className="w-8 h-8 text-[#C9A84C] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#FFF5D6]">
                    Click to Select Image from Local PC
                  </span>
                  <span className="text-[10px] text-[#A39E93] mt-1">
                    Supports PNG, JPG, WEBP • Works on Localhost, Hosting Domain & IP Everywhere
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="Paste Image URL (https://...)"
                  value={newSlide.image}
                  onChange={(e) => {
                    setNewSlide({ ...newSlide, image: e.target.value })
                    setPreviewUrl(e.target.value)
                  }}
                  className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            )}

            {/* Image Preview */}
            {(previewUrl || newSlide.image) && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-[#C9A84C]/40 max-h-48 flex items-center justify-center bg-black">
                <img
                  src={previewUrl || newSlide.image}
                  alt="Banner Preview"
                  className="max-h-48 w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[#C9A84C] text-[10px] font-bold border border-[#C9A84C]/40">
                  ✓ Image Loaded & Preview Ready
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Description / Subtitle *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Redefining Classical Elegance & Luxury"
                value={newSlide.subtitle}
                onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                Tag / Collection Badge <span className="text-[10px] text-[#A39E93]/70">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. NEW COLLECTION 2026 (Optional)"
                value={newSlide.tag}
                onChange={(e) => setNewSlide({ ...newSlide, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                CTA Button Text <span className="text-[10px] text-[#A39E93]/70">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="EXPLORE COLLECTION"
                value={newSlide.ctaText}
                onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#A39E93] mb-1">
                CTA Button Target URL <span className="text-[10px] text-[#A39E93]/70">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="/products"
                value={newSlide.ctaLink}
                onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs rounded-xl uppercase tracking-wider hover:scale-105 transition-all shadow-lg"
            >
              Save & Publish Hero Slide
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
