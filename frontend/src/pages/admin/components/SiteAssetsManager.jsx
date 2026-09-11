import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Image as ImageIcon, CheckCircle, RefreshCw, Sparkles, Layers } from 'lucide-react'
import { getSiteAssets, saveSiteAssets } from '../../../utils/siteAssets'
import { compressImage } from '../../../utils/imageCompressor'

export const SiteAssetsManager = () => {
  const [assets, setAssets] = useState(getSiteAssets())
  const [successMsg, setSuccessMsg] = useState('')
  const [loadingKey, setLoadingKey] = useState(null)

  const assetConfigs = [
    {
      key: 'homeMensCard',
      title: "Homepage - Men's Wear Collection Card",
      section: 'Homepage (Explores Collections)',
      page: 'Home Page (/)'
    },
    {
      key: 'homeWomensCard',
      title: "Homepage - Women's Wear Collection Card",
      section: 'Homepage (Explores Collections)',
      page: 'Home Page (/)'
    },
    {
      key: 'productsMensBanner',
      title: "Products Page - Men's Tailoring Card/Banner",
      section: 'Products Selection Tier',
      page: 'Products Page (/products)'
    },
    {
      key: 'productsWomensBanner',
      title: "Products Page - Women's Couture Card/Banner",
      section: 'Products Selection Tier',
      page: 'Products Page (/products)'
    },
    {
      key: 'drawerHeader',
      title: 'Mobile Navigation Drawer Banner Header',
      section: 'Luxury Editorial Drawer Header',
      page: 'Global Navbar (/)'
    }
  ]

  useEffect(() => {
    const handleUpdate = () => setAssets(getSiteAssets())
    window.addEventListener('vaerox_site_assets_updated', handleUpdate)
    return () => window.removeEventListener('vaerox_site_assets_updated', handleUpdate)
  }, [])

  const handleUrlChange = (key, value) => {
    const updated = { ...assets, [key]: value }
    setAssets(updated)
  }

  const handleSaveSingle = (key) => {
    saveSiteAssets({ [key]: assets[key] })
    setSuccessMsg(`Asset for "${key}" updated successfully!`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleFileUpload = async (key, file) => {
    if (!file) return
    try {
      setLoadingKey(key)
      const base64Image = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 })
      const updated = { ...assets, [key]: base64Image }
      setAssets(updated)
      saveSiteAssets({ [key]: base64Image })
      setSuccessMsg(`Image uploaded and saved for ${key}!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      console.error('File upload error:', e)
    } finally {
      setLoadingKey(null)
    }
  }

  const handleResetDefaults = () => {
    localStorage.removeItem('vaerox_site_assets')
    const defaults = getSiteAssets()
    setAssets(defaults)
    window.dispatchEvent(new Event('vaerox_site_assets_updated'))
    setSuccessMsg('Reset all site asset images to default luxury templates!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#E8E0CC] space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#26241E] pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest block font-serif">
            SITE ASSETS & CARDS MANAGEMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] uppercase">
            Website Banners & Card Images
          </h2>
          <p className="text-[#A39E93] text-xs mt-1 font-light">
            Upload and manage images used in cards across the Homepage, Products Page, and Global Navbar.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 px-4 py-2.5 rounded-xl transition duration-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <RefreshCw size={14} />
          Reset Defaults
        </button>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Asset Manager Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assetConfigs.map((cfg) => {
          const currentUrl = assets[cfg.key] || ''
          const isLoading = loadingKey === cfg.key

          return (
            <div
              key={cfg.key}
              className="bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/40 rounded-2xl p-5 space-y-4 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-wider bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#26241E]">
                      {cfg.page}
                    </span>
                    <h3 className="font-serif font-bold text-[#FFF5D6] text-sm mt-1.5">{cfg.title}</h3>
                    <p className="text-[11px] text-[#A39E93]">{cfg.section}</p>
                  </div>
                </div>

                {/* Preview Image Box */}
                <div className="relative h-44 w-full bg-[#0A0A0A] border border-[#26241E] rounded-xl overflow-hidden flex items-center justify-center group">
                  {currentUrl ? (
                    <img
                      src={currentUrl}
                      alt={cfg.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#A39E93]">
                      <ImageIcon size={24} />
                      <span className="text-xs">No image provided</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#FFF5D6] uppercase tracking-widest bg-black/80 px-3 py-1.5 rounded-full border border-[#C9A84C]/40">
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Image URL Address
                  </label>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => handleUrlChange(cfg.key, e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs border border-[#26241E] rounded-xl bg-[#0A0A0A] text-[#FFF5D6] focus:outline-none focus:border-[#C9A84C] font-mono"
                  />
                </div>
              </div>

              {/* Upload & Save Action controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#26241E]">
                <label className="flex-1 cursor-pointer bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#E8E0CC] border border-[#26241E] hover:border-[#C9A84C]/40 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5">
                  <Upload size={13} className="text-[#C9A84C]" />
                  <span>{isLoading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(cfg.key, e.target.files[0])}
                    disabled={isLoading}
                  />
                </label>

                <button
                  onClick={() => handleSaveSingle(cfg.key)}
                  className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-105 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SiteAssetsManager
