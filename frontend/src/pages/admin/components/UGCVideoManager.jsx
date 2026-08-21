import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Eye, EyeOff, Play, Upload, Film, Image as ImageIcon } from 'lucide-react'
import { ugcVideoService } from '../../../services/ugcVideoService'
import { compressImage } from '../../../utils/imageCompressor'

export const UGCVideoManager = () => {
  const [videos, setVideos] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    author: '@vaerox',
    thumbnail: '',
    videoUrl: '',
    productName: '',
    productLink: '/products',
  })
  const [message, setMessage] = useState('')

  const loadVideos = () => {
    setVideos(ugcVideoService.getVideos())
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // Handle local PC video file upload
  const handleVideoFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setNewVideo((prev) => ({ ...prev, videoUrl: objectUrl }))
  }

  // Handle local PC thumbnail image upload
  const handleThumbnailFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 800, 800, 0.82)
      setNewVideo((prev) => ({ ...prev, thumbnail: compressed }))
    } catch (err) {
      console.error('Thumbnail compression error:', err)
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewVideo((prev) => ({ ...prev, thumbnail: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newVideo.title || !newVideo.thumbnail || !newVideo.videoUrl) return
    ugcVideoService.addVideo(newVideo)
    loadVideos()
    setNewVideo({
      title: '',
      description: '',
      author: '@vaerox',
      thumbnail: '',
      videoUrl: '',
      productName: '',
      productLink: '/products',
    })
    setShowAddForm(false)
    setMessage('UGC Video Reel added successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleToggle = (id) => {
    ugcVideoService.toggleVideoActive(id)
    loadVideos()
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this UGC video reel?')) {
      ugcVideoService.deleteVideo(id)
      loadVideos()
      setMessage('UGC video deleted!')
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
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
            UGC VIDEO CONTROL
          </span>
          <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Manage UGC Video Reels</h2>
          <p className="text-[#A39E93] text-xs mt-0.5 font-light">
            Upload videos directly from your PC file manager or enter URLs to feature on the homepage reels section.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Upload New Video Reel'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#FFF5D6] rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
          {message}
        </div>
      )}

      {/* Add New Video Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAdd}
          className="mb-8 bg-[#121212] p-6 rounded-2xl border border-[#C9A84C]/40 space-y-5"
        >
          <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
            Upload UGC Video Reel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5">
                Reel Title / Caption *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Satin Tuxedo Walk"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5">
                Author Handle / Creator
              </label>
              <input
                type="text"
                placeholder="e.g. @marcus_v"
                value={newVideo.author}
                onChange={(e) => setNewVideo({ ...newVideo, author: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Video Upload from PC File Manager */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                Upload Video from PC *
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="block w-full text-xs text-[#A39E93] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C9A84C] file:text-black hover:file:bg-[#FFF5D6] cursor-pointer bg-black p-2 border border-[#26241E] rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Or paste video URL (e.g. https://...mp4)"
                  value={newVideo.videoUrl}
                  onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-[11px] text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {/* Thumbnail Upload from PC File Manager */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Upload Thumbnail from PC *
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileUpload}
                  className="block w-full text-xs text-[#A39E93] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C9A84C] file:text-black hover:file:bg-[#FFF5D6] cursor-pointer bg-black p-2 border border-[#26241E] rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Or paste thumbnail image URL"
                  value={newVideo.thumbnail}
                  onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-black border border-[#26241E] rounded-xl text-[11px] text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5">
                Reel Short Story / Description
              </label>
              <input
                type="text"
                placeholder="Brief highlight description about the outfit or occasion"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Tagged Product Name */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5">
                Tagged Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. VÆROX Midnight Tuxedo"
                value={newVideo.productName}
                onChange={(e) => setNewVideo({ ...newVideo, productName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Tagged Product Link */}
            <div>
              <label className="block text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-1.5">
                Tagged Product Target Link
              </label>
              <input
                type="text"
                value={newVideo.productLink}
                onChange={(e) => setNewVideo({ ...newVideo, productLink: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C9A84C] text-black font-extrabold text-xs rounded-xl uppercase tracking-wider hover:bg-[#FFF5D6] transition-all"
            >
              SAVE UGC VIDEO REEL
            </button>
          </div>
        </motion.form>
      )}

      {/* Video Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
              vid.active !== false
                ? 'bg-[#121212] border-[#26241E]'
                : 'bg-black/50 border-red-900/30 opacity-60'
            }`}
          >
            <div className="relative aspect-[9/12] rounded-xl overflow-hidden border border-[#26241E] mb-3">
              <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-black/80 backdrop-blur-md">
                {vid.author || '@vaerox'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#FFF5D6] font-serif truncate mb-1">
                {vid.title}
              </h4>
              {vid.productName && (
                <p className="text-[10px] text-[#C9A84C] truncate mb-3">
                  Tag: {vid.productName}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1A16]">
              <button
                onClick={() => handleToggle(vid.id)}
                className="p-1.5 rounded-lg border border-[#26241E] hover:border-[#C9A84C] text-[#C9A84C] transition-colors"
                title={vid.active !== false ? 'Hide Reel' : 'Show Reel'}
              >
                {vid.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(vid.id)}
                className="p-1.5 rounded-lg border border-[#26241E] hover:border-rose-500 text-rose-400 transition-colors"
                title="Delete Reel"
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
