import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Search, Filter, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { productAPI } from '../services/api'
import { getSiteAssets } from '../utils/siteAssets'

const ROLES_LIST = [
  'ALL',
  'CEO',
  'TEACHER',
  'MANAGER',
  'C.A',
  'OWNER',
  'LAWYER',
  'DOCTOR',
  'ARTIST',
  'ENTREPRENEUR',
  'CUSTOM ATELIER',
]

const Products = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Selection states: step 1 (tier), step 2 (gender), step 3 (catalogue)
  const [selectedTier, setSelectedTier] = useState(null) // 'standard' | 'premium' | null
  const [selectedGender, setSelectedGender] = useState(null) // 'men' | 'women' | null
  const [selectedRole, setSelectedRole] = useState('ALL') // Role sub-category for VÆROX Premium

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [siteAssets, setSiteAssets] = useState(getSiteAssets())

  useEffect(() => {
    const handleAssetsUpdate = () => setSiteAssets(getSiteAssets())
    window.addEventListener('vaerox_site_assets_updated', handleAssetsUpdate)
    return () => window.removeEventListener('vaerox_site_assets_updated', handleAssetsUpdate)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const categoryParam = urlParams.get('category')
    const searchParam = urlParams.get('search')
    const tierParam = urlParams.get('tier')

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      if (catLower === 'men' || catLower === 'women') {
        setSelectedTier(tierParam === 'premium' ? 'premium' : 'standard')
        setSelectedGender(catLower)
      } else {
        setSelectedTier(tierParam === 'premium' ? 'premium' : 'standard')
      }
    } else if (tierParam) {
      setSelectedTier(tierParam === 'premium' ? 'premium' : 'standard')
    }
    if (searchParam) setSearchQuery(searchParam)

    fetchProducts()
  }, [location.search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts()

      if (response && response.success) {
        const productsData = (response.data || response.products || []).map((product) => {
          const isSpecialUrl =
            product.image &&
            (product.image.startsWith('http://') ||
              product.image.startsWith('https://') ||
              product.image.startsWith('data:') ||
              product.image.startsWith('blob:'))
          if (!isSpecialUrl) {
            if (
              product.image &&
              product.image !== 'no-photo.jpg' &&
              product.image !== '/uploads/no-photo.jpg'
            ) {
              if (!product.image.startsWith('/uploads/')) {
                product.image = `/uploads/${product.image}`
              }
            } else {
              product.image = '/uploads/no-photo.jpg'
            }
          }
          return product
        })
        setProducts(productsData)
      } else {
        setError('Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on selected gender & tier & role & search query
  const filteredProducts = products.filter((product) => {
    const prodCat = (product.category || '').toLowerCase()
    const prodName = (product.name || '').toLowerCase()
    const prodDesc = (product.description || '').toLowerCase()
    const prodRole = (product.role || '').toUpperCase()

    // Gender matching
    let genderMatch = true
    if (selectedGender === 'men') {
      genderMatch =
        prodCat.includes('men') ||
        prodName.includes('men') ||
        prodName.includes('tuxedo') ||
        prodName.includes('suit') ||
        product.gender === 'men'
    } else if (selectedGender === 'women') {
      genderMatch =
        prodCat.includes('women') ||
        prodName.includes('women') ||
        prodName.includes('gown') ||
        prodName.includes('dress') ||
        product.gender === 'women'
    }

    // Role sub-category matching (for VÆROX Premium)
    let roleMatch = true
    if (selectedTier === 'premium' && selectedRole !== 'ALL') {
      const searchRole = selectedRole.toLowerCase()
      roleMatch =
        prodRole === selectedRole ||
        prodCat.includes(searchRole) ||
        prodName.includes(searchRole) ||
        prodDesc.includes(searchRole)
    }

    // Search query matching
    const searchMatch = searchQuery
      ? prodName.includes(searchQuery.toLowerCase()) ||
        prodDesc.includes(searchQuery.toLowerCase()) ||
        prodCat.includes(searchQuery.toLowerCase())
      : true

    return genderMatch && roleMatch && searchMatch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') return a.name?.localeCompare(b.name || '') || 0
    if (sort === 'price-low') return (a.price || 0) - (b.price || 0)
    if (sort === 'price-high') return (b.price || 0) - (a.price || 0)
    if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  // Handlers for step navigation
  const handleSelectTier = (tier) => {
    setSelectedTier(tier)
  }

  const handleSelectGender = (gender) => {
    setSelectedGender(gender)
    setSelectedRole('ALL')
  }

  const handleResetSelection = () => {
    setSelectedTier(null)
    setSelectedGender(null)
    setSelectedRole('ALL')
    navigate('/products')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#C9A84C] tracking-[0.3em] uppercase font-serif">
            LOADING VÆROX ATELIER...
          </span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          className="bg-[#0A0A0A] border border-red-500/40 text-center p-8 rounded-3xl max-w-md w-full shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-[#FFF5D6] font-bold text-lg mb-2 font-serif">Unable to connect to Atelier</p>
          <p className="text-xs text-[#A39E93] mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black text-xs font-extrabold rounded-full uppercase tracking-widest hover:scale-105 transition-all"
          >
            RETRY CONNECTION
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] select-none">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* ════════════ STEP 1: TIER SELECTION (STANDARD vs PREMIUM) ════════════ */}
          {!selectedTier && (
            <motion.div
              key="step-tier"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Full-width Cinematic Background */}
              <div className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
                {/* Dark ambient background with warm golden tones */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A05] via-[#0A0805] to-[#050301]" />
                
                {/* Ambient warm golden light effects */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px]" />
                  <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[350px] bg-[#8B6914]/4 rounded-full blur-[100px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#C9A84C]/3 rounded-full blur-[150px]" />
                </div>

                {/* Subtle grain/texture overlay */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                }} />

                {/* Content Container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-8">
                  
                  {/* Header Section */}
                  <div className="text-center mb-12 md:mb-16">
                    {/* Decorative line with subtitle */}
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                      className="flex items-center justify-center gap-4 mb-5"
                    >
                      <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-[#C9A84C]/60" />
                      <span className="text-[10px] md:text-xs font-semibold tracking-[0.35em] text-[#C9A84C]/80 uppercase font-serif">
                        Curated for the Modern Gentleman
                      </span>
                      <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-[#C9A84C]/60" />
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.7 }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-5 uppercase leading-[1.05]"
                    >
                      CHOOSE YOUR COLLECTION
                    </motion.h1>

                    {/* Subtitle description */}
                    <motion.p 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                      className="text-[#E8E0CC]/60 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed tracking-wide"
                    >
                      Timeless styles. Premium fabrics. Unmatched elegance.
                    </motion.p>
                  </div>

                  {/* ═══ TWO COLLECTION CARDS ═══ */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.7 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 max-w-6xl mx-auto mb-16 md:mb-20"
                  >
                    {/* ─── Card 1: Standard Clothes ─── */}
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectTier('standard')}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#0D0C0A] border border-[#26241E]/80 hover:border-[#C9A84C]/50 transition-all duration-500 shadow-xl flex flex-col sm:flex-row min-h-[320px] md:min-h-[360px]"
                    >
                      {/* Card border glow on hover */}
                      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#C9A84C]/40 transition-all duration-700 pointer-events-none z-20" />
                      
                      {/* Image Side (Left) */}
                      <div className="w-full sm:w-1/2 relative min-h-[220px] sm:min-h-full overflow-hidden flex-shrink-0">
                        <img 
                          src={(typeof siteAssets.productsMensBanner === 'string' ? siteAssets.productsMensBanner : siteAssets.productsMensBanner?.url || siteAssets.products_standard_card?.url) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"}
                          alt="Standard Collection"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-black/20 to-[#0D0C0A]" />
                      </div>
                      
                      {/* Text Side (Right) */}
                      <div className="w-full sm:w-1/2 p-6 md:p-8 flex flex-col justify-between relative z-10 bg-[#0D0C0A]">
                        {/* Top Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-[1px] w-4 bg-[#C9A84C]/70" />
                            <span className="text-[9px] font-bold tracking-[0.25em] text-[#C9A84C] uppercase">
                              Classic Collection
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight leading-tight mb-4">
                            STANDARD<br />CLOTHES
                          </h2>

                          {/* Category Tags */}
                          <div className="flex items-center gap-1.5 md:gap-2 mb-6 flex-wrap">
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Formal</span>
                            <span className="text-[#C9A84C]/50 text-xs">/</span>
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Business</span>
                            <span className="text-[#C9A84C]/50 text-xs">/</span>
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Everyday</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div>
                          <motion.div 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/60 bg-black/40 group-hover:bg-[#C9A84C]/10 group-hover:border-[#C9A84C] transition-all duration-500"
                            whileHover={{ x: 3 }}
                          >
                            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase">
                              Explore Collection
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C9A84C] group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* ─── Card 2: VEROX Premium ─── */}
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectTier('premium')}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#0D0C0A] border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-500 shadow-xl flex flex-col sm:flex-row min-h-[320px] md:min-h-[360px]"
                    >
                      {/* Premium gold border glow */}
                      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#C9A84C]/50 transition-all duration-700 pointer-events-none z-20" />

                      {/* Image Side (Left) */}
                      <div className="w-full sm:w-1/2 relative min-h-[220px] sm:min-h-full overflow-hidden flex-shrink-0">
                        <img 
                          src={(typeof siteAssets.productsWomensBanner === 'string' ? siteAssets.productsWomensBanner : siteAssets.productsWomensBanner?.url || siteAssets.products_premium_card?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"}
                          alt="Premium Collection"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-black/20 to-[#0D0C0A]" />
                      </div>

                      {/* Text Side (Right) */}
                      <div className="w-full sm:w-1/2 p-6 md:p-8 flex flex-col justify-between relative z-10 bg-[#0D0C0A]">
                        {/* Top Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-3.5 h-3.5 text-[#C9A84C]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                            </svg>
                            <span className="text-[9px] font-bold tracking-[0.25em] text-[#C9A84C] uppercase">
                              Premium Collection
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight leading-tight mb-4">
                            VÆROX<br />PREMIUM
                          </h2>

                          {/* Category Tags */}
                          <div className="flex items-center gap-1.5 md:gap-2 mb-6 flex-wrap">
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Tailored</span>
                            <span className="text-[#C9A84C]/50 text-xs">/</span>
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Luxury</span>
                            <span className="text-[#C9A84C]/50 text-xs">/</span>
                            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.15em] text-[#E8E0CC]/70 uppercase">Exclusive</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div>
                          <motion.div 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/60 bg-black/40 group-hover:bg-[#C9A84C]/10 group-hover:border-[#C9A84C] transition-all duration-500"
                            whileHover={{ x: 3 }}
                          >
                            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase">
                              Explore Collection
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C9A84C] group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* ═══ BOTTOM FEATURES BAR ═══ */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                  >
                    <div className="border-t border-[#26241E]/60 pt-8 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {/* Feature 1: Premium Fabrics */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-[10px] md:text-xs font-bold text-[#E8E0CC]/90 uppercase tracking-[0.15em] block leading-tight">Premium Fabrics</span>
                            <span className="text-[9px] md:text-[10px] text-[#A39E93] uppercase tracking-[0.1em]">Luxury in every thread</span>
                          </div>
                        </div>

                        {/* Feature 2: Expert Tailoring */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-[10px] md:text-xs font-bold text-[#E8E0CC]/90 uppercase tracking-[0.15em] block leading-tight">Expert Tailoring</span>
                            <span className="text-[9px] md:text-[10px] text-[#A39E93] uppercase tracking-[0.1em]">Perfect fit, always.</span>
                          </div>
                        </div>

                        {/* Feature 3: Secure Shopping */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-[10px] md:text-xs font-bold text-[#E8E0CC]/90 uppercase tracking-[0.15em] block leading-tight">Secure Shopping</span>
                            <span className="text-[9px] md:text-[10px] text-[#A39E93] uppercase tracking-[0.1em]">Safe & trusted</span>
                          </div>
                        </div>

                        {/* Feature 4: Fast Delivery */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-[10px] md:text-xs font-bold text-[#E8E0CC]/90 uppercase tracking-[0.15em] block leading-tight">Fast Delivery</span>
                            <span className="text-[9px] md:text-[10px] text-[#A39E93] uppercase tracking-[0.1em]">Worldwide</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 2: GENDER CATEGORY SELECTION (MEN'S vs WOMEN'S) ════════════ */}
          {selectedTier && !selectedGender && (
            <motion.div
              key="step-gender"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="py-8 px-4 md:px-8"
            >
              <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={handleResetSelection}
                  className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-[#121212] border border-[#26241E] text-xs font-bold text-[#C9A84C] hover:border-[#C9A84C] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO TIER SELECTION</span>
                </button>

                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase mb-3 font-serif">
                    {selectedTier === 'premium' ? 'VÆROX PREMIUM HAUTE COUTURE' : 'STANDARD CLASSICS'}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase">
                    SELECT CATEGORY
                  </h1>
                  <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                    Choose between Men's Formal Suiting or Women's Evening Atelier.
                  </p>
                </div>

                {/* 2 Gender Modal Cards (Horizontal Standard Size: Image Left, Text Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {/* Category 1: Men's */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectGender('men')}
                    className="group relative rounded-2xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] cursor-pointer shadow-xl hover:border-[#C9A84C] hover:shadow-[0_0_25px_rgba(201,168,76,0.2)] transition-all duration-300 flex flex-row h-44 sm:h-48"
                  >
                    {/* Image Side (Left) */}
                    <div className="w-2/5 sm:w-1/2 relative h-full overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url || siteAssets.home_mens_card?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                        alt="Men's Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]" />
                    </div>

                    {/* Text Side (Right) */}
                    <div className="w-3/5 sm:w-1/2 p-4 sm:p-5 flex flex-col justify-between z-10 bg-[#0A0A0A]">
                      <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase block mb-1">
                          HIGH FORMAL TAILORING
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-1">
                          MEN'S WEAR
                        </h2>
                        <p className="text-[11px] text-[#E8E0CC]/75 line-clamp-2 font-light leading-snug">
                          Bespoke tuxedos, wool blazers, oxford suits & accessories.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-[#C9A84C] font-extrabold text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        <span>EXPLORE MEN'S</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Category 2: Women's */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectGender('women')}
                    className="group relative rounded-2xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] cursor-pointer shadow-xl hover:border-[#C9A84C] hover:shadow-[0_0_25px_rgba(201,168,76,0.2)] transition-all duration-300 flex flex-row h-44 sm:h-48"
                  >
                    {/* Image Side (Left) */}
                    <div className="w-2/5 sm:w-1/2 relative h-full overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url || siteAssets.home_womens_card?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"}
                        alt="Women's Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]" />
                    </div>

                    {/* Text Side (Right) */}
                    <div className="w-3/5 sm:w-1/2 p-4 sm:p-5 flex flex-col justify-between z-10 bg-[#0A0A0A]">
                      <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase block mb-1">
                          ATELIER EVENING COUTURE
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-1">
                          WOMEN'S WEAR
                        </h2>
                        <p className="text-[11px] text-[#E8E0CC]/75 line-clamp-2 font-light leading-snug">
                          Sculpted satin evening gowns, tailored power pant-suits.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-[#C9A84C] font-extrabold text-[10px] tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        <span>EXPLORE WOMEN'S</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 3: PRODUCT CATALOGUE DISPLAY ════════════ */}
          {selectedTier && selectedGender && (
            <motion.div
              key="step-catalogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-4 px-3 sm:px-6"
            >
              <div className="max-w-7xl mx-auto">
                {/* Mobile Filter Toggle Button */}
                <div className="lg:hidden mb-4 flex justify-between items-center bg-[#0A0A0A] p-3.5 rounded-2xl border border-[#26241E]">
                  <div>
                    <span className="text-[9px] font-bold text-[#C9A84C] uppercase tracking-widest block font-serif">
                      {selectedTier === 'premium' ? 'VÆROX PREMIUM' : 'STANDARD'} &gt; {selectedGender.toUpperCase()}'S WEAR
                    </span>
                  </div>
                  <button
                    onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#141414] border border-[#C9A84C]/50 text-[#C9A84C] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>SIDEBAR FILTERS</span>
                  </button>
                </div>

                {/* MAIN CATALOGUE LAYOUT WITH ANIMATED SIDEBAR FILTER */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative">
                  
                  {/* ═══ PREMIUM ANIMATED LEFT SIDEBAR ═══ */}
                  <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full lg:w-80 bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-5 sm:p-6 shadow-2xl lg:sticky lg:top-24 z-30 transition-all duration-300 shrink-0 ${
                      isFilterSidebarOpen ? 'block' : 'hidden lg:block'
                    }`}
                  >
                    {/* Active Collection Header & Selection Reset */}
                    <div className="pb-5 border-b border-[#26241E] mb-5">
                      <span className="text-[9px] font-bold text-[#C9A84C] uppercase tracking-widest block mb-1 font-serif">
                        PRODUCTS &gt; {selectedTier === 'premium' ? 'VÆROX PREMIUM' : 'STANDARD'} &gt; {selectedGender.toUpperCase()}'S WEAR
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 leading-snug">
                        {selectedTier === 'premium' ? `VÆROX PREMIUM ${selectedGender.toUpperCase()}'S ATELIER` : `${selectedGender.toUpperCase()}'S FORMAL COLLECTION`}
                      </h2>
                      <button
                        onClick={handleResetSelection}
                        className="w-full py-2 px-3 rounded-xl bg-[#141414] border border-[#26241E] text-[#E8E0CC] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>CHANGE SELECTION</span>
                      </button>
                    </div>

                    {/* Sidebar Header Title */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#26241E] mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                        <h3 className="font-serif font-bold text-xs text-[#FFF5D6] uppercase tracking-wider">
                          VÆROX FILTERS
                        </h3>
                      </div>
                      <span className="text-[9px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-2.5 py-0.5 rounded-full uppercase">
                        {sortedProducts.length} ITEMS
                      </span>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="mb-5">
                      <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5 font-serif">
                        SEARCH COLLECTION
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder="Search suits, tuxedos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-[#121212] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] placeholder-[#A39E93] focus:outline-none focus:border-[#C9A84C] font-sans transition-all"
                        />
                      </div>
                    </div>

                    {/* EXECUTIVE / PROFESSION ROLE FILTER */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                          PROFESSION OUTFIT ROLE
                        </label>
                        <span className="text-[9px] text-[#A39E93] uppercase font-mono">
                          {selectedRole}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                        {ROLES_LIST.map((role) => {
                          const isSelected = selectedRole === role
                          return (
                            <motion.button
                              key={role}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedRole(role)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black border border-[#C9A84C] shadow-md font-extrabold'
                                  : 'bg-[#121212] text-[#E8E0CC]/80 border border-[#26241E] hover:border-[#C9A84C]/50 hover:text-[#FFF5D6]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {role === 'CEO' && <span className="text-xs">👑</span>}
                                {role === 'LAWYER' && <span className="text-xs">⚖️</span>}
                                {role === 'DOCTOR' && <span className="text-xs">🩺</span>}
                                {role === 'C.A' && <span className="text-xs">📊</span>}
                                {role === 'MANAGER' && <span className="text-xs">💼</span>}
                                {role === 'TEACHER' && <span className="text-xs">🎓</span>}
                                {role === 'ARTIST' && <span className="text-xs">🎨</span>}
                                {role === 'OWNER' && <span className="text-xs">🏛️</span>}
                                <span>{role === 'ALL' ? 'ALL EXECUTIVE ROLES' : `${role} OUTFITS`}</span>
                              </div>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-black" />
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* TIER FILTER */}
                    <div className="mb-5 border-t border-[#26241E] pt-4">
                      <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5 font-serif">
                        COLLECTION TIER
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedTier('standard')}
                          className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                            selectedTier === 'standard'
                              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C]'
                              : 'bg-[#121212] border-[#26241E] text-[#A39E93] hover:border-[#C9A84C]/40'
                          }`}
                        >
                          STANDARD
                        </button>
                        <button
                          onClick={() => setSelectedTier('premium')}
                          className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                            selectedTier === 'premium'
                              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C]'
                              : 'bg-[#121212] border-[#26241E] text-[#A39E93] hover:border-[#C9A84C]/40'
                          }`}
                        >
                          VÆROX PREMIUM
                        </button>
                      </div>
                    </div>

                    {/* SORT BY */}
                    <div className="border-t border-[#26241E] pt-4">
                      <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5 font-serif">
                        SORT PRODUCTS
                      </label>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold cursor-pointer"
                      >
                        <option value="name">Name (A - Z)</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                      </select>
                    </div>
                  </motion.aside>

                  {/* ═══ RIGHT COLUMN: PRODUCTS GRID ═══ */}
                  <div className="flex-1 w-full">
                    {sortedProducts.length > 0 ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                        {sortedProducts.map((product) => (
                          <ProductCard key={product._id || product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-12 text-center">
                        <p className="text-[#A39E93] text-sm mb-4 font-serif">No products found matching your active filter criteria.</p>
                        <button
                          onClick={() => {
                            setSelectedRole('ALL')
                            setSearchQuery('')
                          }}
                          className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
