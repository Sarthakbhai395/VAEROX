import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Search, Filter, X, SlidersHorizontal, Check } from 'lucide-react'
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

  // Selection states:
  // Step 1: Category Selection (selectedGender: 'men' | 'women' | null)
  // Step 2: Tier Selection (selectedTier: 'standard' | 'luxury' | null)
  // Step 3: Product Catalogue view
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [selectedRole, setSelectedRole] = useState('ALL') // Persona sub-category for VÆROX Luxury

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

  // Sync component states with URL search parameters for seamless back/forward browser navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const categoryParam = urlParams.get('category')
    const searchParam = urlParams.get('search')
    const tierParam = urlParams.get('tier')

    // 1. Gender category state from URL
    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      if (catLower === 'men' || catLower === 'women') {
        setSelectedGender(catLower)
      } else {
        setSelectedGender(null)
      }
    } else {
      setSelectedGender(null)
    }

    // 2. Collection tier state from URL
    if (tierParam) {
      const tierLower = tierParam.toLowerCase()
      if (tierLower === 'luxury' || tierLower === 'premium') {
        setSelectedTier('luxury')
      } else if (tierLower === 'standard') {
        setSelectedTier('standard')
      } else {
        setSelectedTier(null)
      }
    } else {
      setSelectedTier(null)
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

  // Filter products based on selected gender, tier, persona role & search query
  const filteredProducts = products.filter((product) => {
    const prodCat = (product.category || '').toLowerCase()
    const prodName = (product.name || '').toLowerCase()
    const prodDesc = (product.description || '').toLowerCase()
    const prodRole = (product.role || '').toUpperCase()
    const prodTier = (product.tier || '').toLowerCase()

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

    // Tier matching (if products specify a tier tag)
    let tierMatch = true
    if (prodTier && prodTier !== 'all') {
      if (selectedTier === 'standard') {
        tierMatch = prodTier === 'standard' || prodTier === 'classic' || prodTier === 'regular'
      } else if (selectedTier === 'luxury' || selectedTier === 'premium') {
        tierMatch = prodTier === 'luxury' || prodTier === 'premium' || prodTier === 'high'
      }
    }

    // Persona role sub-category matching (specifically for VÆROX Luxury)
    let roleMatch = true
    if (selectedTier === 'luxury' && selectedRole !== 'ALL') {
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

    return genderMatch && tierMatch && roleMatch && searchMatch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') return a.name?.localeCompare(b.name || '') || 0
    if (sort === 'price-low') return (a.price || 0) - (b.price || 0)
    if (sort === 'price-high') return (b.price || 0) - (a.price || 0)
    if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  // Step Navigation Handlers
  const handleSelectGender = (gender) => {
    setSelectedGender(gender)
    setSelectedTier(null)
    setSelectedRole('ALL')
    navigate(`/products?category=${gender}`)
  }

  const handleSelectTier = (tier) => {
    setSelectedTier(tier)
    setSelectedRole('ALL')
    const currentGender = selectedGender || 'men'
    navigate(`/products?category=${currentGender}&tier=${tier}`)
  }

  const handleBackToCategories = () => {
    setSelectedGender(null)
    setSelectedTier(null)
    setSelectedRole('ALL')
    navigate('/products')
  }

  const handleBackToTiers = () => {
    setSelectedTier(null)
    setSelectedRole('ALL')
    const currentGender = selectedGender || 'men'
    navigate(`/products?category=${currentGender}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.35em] uppercase font-serif">
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
          <p className="text-xs text-[#A39E93] mb-6 font-sans">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black text-xs font-extrabold rounded-full uppercase tracking-widest hover:scale-105 transition-all font-sans cursor-pointer"
          >
            RETRY CONNECTION
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] select-none overflow-x-hidden">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* ════════════ STEP 1: CATEGORY SELECTION (MEN'S WEAR vs WOMEN'S WEAR) ════════════ */}
          {!selectedGender && (
            <motion.div
              key="step-category"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              {/* Animated Cinematic Background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#C9A84C]/15 via-[#8B6914]/8 to-transparent rounded-full blur-[150px]"
                />
                <motion.div
                  animate={{ y: [-20, 20, -20], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-[#C9A84C]/10 rounded-full blur-[120px]"
                />
                <motion.div
                  animate={{ y: [20, -20, 20], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#C9A84C]/10 rounded-full blur-[120px]"
                />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="flex items-center justify-center gap-3 mb-4"
                  >
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
                    <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase font-serif shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
                      <span>CURATED BESPOKE ATELIER</span>
                    </span>
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent via-[#C9A84C] to-transparent" />
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase leading-[1.05]"
                  >
                    SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]">GENDER CATEGORY</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="text-[#E8E0CC]/75 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed tracking-wide font-sans"
                  >
                    Begin your tailor-made experience by choosing between Men's Suiting Atelier or Women's Evening Couture.
                  </motion.p>
                </div>

                {/* 2 Category Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.7 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16"
                >
                  {/* Card 1: Men's Wear */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGender('men')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#12110E] via-[#0E0D0B] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500 flex flex-col md:flex-row min-h-[360px]"
                  >
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img 
                        src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url || siteAssets.home_mens_card?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"}
                        alt="Men's Wear Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#0E0D0B]/40 to-[#0E0D0B]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/85 border border-[#C9A84C]/40 uppercase shadow-md font-sans">
                          HIGH FORMAL TAILORING
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative z-10 bg-[#0E0D0B]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-serif">
                            Collection 01
                          </span>
                          <span className="w-8 h-8 rounded-full bg-black/60 border border-[#26241E] flex items-center justify-center text-xs font-serif font-bold text-[#C9A84C]">
                            M
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          MEN'S WEAR
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/75 font-light leading-relaxed mb-6 font-sans">
                          Bespoke double-breasted tuxedos, sharp superfine wool blazers, oxford formal suits & hand-crafted accessories.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          EXPLORE MEN'S WEAR
                        </span>
                        <div className="w-10 h-10 rounded-full bg-black border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C] group-hover:bg-gradient-to-r group-hover:from-[#C9A84C] group-hover:to-[#9B782B] group-hover:text-black transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2: Women's Wear */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGender('women')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#12110E] via-[#0E0D0B] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500 flex flex-col md:flex-row min-h-[360px]"
                  >
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img 
                        src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url || siteAssets.home_womens_card?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"}
                        alt="Women's Wear Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#0E0D0B]/40 to-[#0E0D0B]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/85 border border-[#C9A84C]/40 uppercase shadow-md font-sans">
                          ATELIER EVENING COUTURE
                        </span>
                      </div>
                    </div>

                    <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative z-10 bg-[#0E0D0B]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-serif">
                            Collection 02
                          </span>
                          <span className="w-8 h-8 rounded-full bg-black/60 border border-[#26241E] flex items-center justify-center text-xs font-serif font-bold text-[#C9A84C]">
                            W
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          WOMEN'S WEAR
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/75 font-light leading-relaxed mb-6 font-sans">
                          Sculpted satin evening gowns, tailored executive power pant-suits & luxury statement accessories.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          EXPLORE WOMEN'S WEAR
                        </span>
                        <div className="w-10 h-10 rounded-full bg-black border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C] group-hover:bg-gradient-to-r group-hover:from-[#C9A84C] group-hover:to-[#9B782B] group-hover:text-black transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 2: TIER SELECTION (VÆROX STANDARD vs VÆROX LUXURY) ════════════ */}
          {selectedGender && !selectedTier && (
            <motion.div
              key="step-tier"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              {/* Cinematic Background Lighting & Particle Orbs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#C9A84C]/15 via-[#8B6914]/8 to-transparent rounded-full blur-[150px]"
                />
                <motion.div
                  animate={{ y: [-20, 20, -20], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-[#C9A84C]/10 rounded-full blur-[120px]"
                />
                <motion.div
                  animate={{ y: [20, -20, 20], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#C9A84C]/10 rounded-full blur-[120px]"
                />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto">
                {/* Back Button to Step 1 */}
                <motion.button
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.03, x: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBackToCategories}
                  className="group inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-[#0D0C0A]/90 border border-[#C9A84C]/40 hover:border-[#C9A84C] text-xs font-extrabold text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all duration-300 shadow-[0_0_25px_rgba(201,168,76,0.18)] font-sans cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>BACK TO CATEGORIES ({selectedGender.toUpperCase()}'S WEAR)</span>
                </motion.button>

                {/* Header Title Block */}
                <div className="text-center mb-12 md:mb-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="flex items-center justify-center gap-3 mb-4"
                  >
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
                    <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase font-serif shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
                      <span>{selectedGender.toUpperCase()}'S BESPOKE ATELIER</span>
                    </span>
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent via-[#C9A84C] to-transparent" />
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase leading-tight"
                  >
                    CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]">COLLECTION TIER</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-[#E8E0CC]/75 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed font-sans"
                  >
                    Select VÆROX Standard for essential classic garments, or VÆROX Luxury for executive persona styling tailored to your distinction.
                  </motion.p>
                </div>

                {/* ═══ TWO HIGH-FASHION TIER CARDS ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  
                  {/* CARD 1: VÆROX STANDARD */}
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.7 }}
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectTier('standard')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#12110E] via-[#0E0D0B] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500 flex flex-col md:flex-row min-h-[380px]"
                  >
                    {/* Glowing Accent Border Lines */}
                    <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-[#C9A84C]/60 transition-colors pointer-events-none z-20" />

                    {/* Image Side (Left/Top) */}
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img 
                        src={selectedGender === 'men' 
                          ? "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80" 
                          : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80"}
                        alt="VÆROX Standard Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#0E0D0B]/40 to-[#0E0D0B]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/85 border border-[#C9A84C]/40 uppercase shadow-md font-sans">
                          EVERYDAY CLASSIC
                        </span>
                      </div>
                    </div>

                    {/* Content Side (Right/Bottom) */}
                    <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative z-10 bg-[#0E0D0B]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-serif">
                            Tier 01 • Standard
                          </span>
                          <span className="w-8 h-8 rounded-full bg-black/60 border border-[#26241E] flex items-center justify-center text-xs font-serif font-bold text-[#C9A84C]">
                            01
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          VÆROX STANDARD
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/75 font-light leading-relaxed mb-6 font-sans">
                          Essential everyday formalwear tailored with signature VÆROX craftsmanship. Includes standard double-breasted blazers, trousers, oxford shirts & classic coordinates.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-6">
                          <span className="px-2.5 py-1 rounded-lg bg-black border border-[#26241E] text-[10px] font-semibold text-[#E8E0CC]/80 uppercase font-sans">
                            ✓ All Clothes
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-black border border-[#26241E] text-[10px] font-semibold text-[#E8E0CC]/80 uppercase font-sans">
                            ✓ Classic Fit
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-black border border-[#26241E] text-[10px] font-semibold text-[#E8E0CC]/80 uppercase font-sans">
                            ✓ Premium Textiles
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          EXPLORE ALL CLOTHES
                        </span>
                        <div className="w-10 h-10 rounded-full bg-black border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C] group-hover:bg-gradient-to-r group-hover:from-[#C9A84C] group-hover:to-[#9B782B] group-hover:text-black transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 2: VÆROX LUXURY */}
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.7 }}
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectTier('luxury')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#1A160E] via-[#120F09] to-[#0A0A0A] border border-[#C9A84C]/60 hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_45px_rgba(201,168,76,0.35)] transition-all duration-500 flex flex-col md:flex-row min-h-[380px]"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C]/15 rounded-bl-full blur-3xl group-hover:bg-[#C9A84C]/30 transition-all pointer-events-none" />

                    {/* Image Side (Left/Top) */}
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img 
                        src={selectedGender === 'men' 
                          ? "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80" 
                          : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"}
                        alt="VÆROX Luxury Collection"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#120F09]/40 to-[#120F09]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase shadow-lg font-sans flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-black" />
                          <span>EXECUTIVE COUTURE</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Side (Right/Bottom) */}
                    <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative z-10 bg-[#120F09]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-serif">
                            Tier 02 • High Luxury
                          </span>
                          <span className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C] flex items-center justify-center text-xs font-serif font-bold text-[#C9A84C]">
                            02
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          VÆROX LUXURY
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/80 font-light leading-relaxed mb-4 font-sans">
                          High-couture persona styling crafted for CEOs, Lawyers, Doctors, Teachers, Artists & Bespoke Atelier commissions.
                        </p>

                        {/* Persona Pill Badges Preview */}
                        <div className="mb-6">
                          <span className="text-[9px] font-bold text-[#C9A84C] uppercase tracking-wider block mb-2 font-serif">
                            SELECT BY PERSONA:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {['CEO', 'LAWYER', 'DOCTOR', 'TEACHER', 'ARTIST'].map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded-full bg-black/80 border border-[#C9A84C]/40 text-[9px] font-extrabold text-[#FFF5D6] uppercase tracking-wider font-sans">
                                {p === 'CEO' && '👑 '}
                                {p === 'LAWYER' && '⚖️ '}
                                {p === 'DOCTOR' && '🩺 '}
                                {p === 'TEACHER' && '🎓 '}
                                {p === 'ARTIST' && '🎨 '}
                                {p}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-wider font-sans">
                              + MORE
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          EXPLORE LUXURY PERSONAS
                        </span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(201,168,76,0.6)]">
                          <ArrowRight className="w-4 h-4 font-bold" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 3: PRODUCT CATALOGUE DISPLAY ════════════ */}
          {selectedGender && selectedTier && (
            <motion.div
              key="step-catalogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-6 px-3 sm:px-6"
            >
              <div className="max-w-7xl mx-auto">
                {/* Back Button Header Bar */}
                <div className="mb-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-[#0D0C0A] via-[#14120D] to-[#0A0A0A] p-4 sm:p-5 rounded-2xl border border-[#C9A84C]/40 shadow-xl">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03, x: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBackToTiers}
                      className="px-4 py-2 rounded-xl bg-[#141414] border border-[#C9A84C]/60 text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer font-sans shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#C9A84C]" />
                      <span>BACK TO TIER SELECTION</span>
                    </motion.button>
                    <span className="text-xs font-extrabold text-[#FFF5D6] uppercase tracking-widest hidden sm:inline-block font-serif">
                      {selectedGender.toUpperCase()}'S WEAR &gt; <span className="text-[#C9A84C]">{selectedTier === 'luxury' ? 'VÆROX LUXURY' : 'VÆROX STANDARD'}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                    className="lg:hidden px-4 py-2 rounded-xl bg-[#141414] border border-[#C9A84C]/60 text-[#C9A84C] text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-sans"
                  >
                    <Filter className="w-4 h-4" />
                    <span>SIDEBAR FILTERS</span>
                  </button>
                </div>

                {/* MAIN CATALOGUE LAYOUT WITH COMPACT RIGHT SIDEBAR FILTER */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative">
                  
                  {/* ═══ LEFT SIDE: PRODUCTS GRID ═══ */}
                  <div className="flex-1 w-full order-2 lg:order-1">
                    {sortedProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                        {sortedProducts.map((product) => (
                          <ProductCard key={product._id || product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-12 text-center">
                        <p className="text-[#A39E93] text-sm mb-4 font-serif">No luxury products found matching your active selection.</p>
                        <button
                          onClick={() => {
                            setSelectedRole('ALL')
                            setSearchQuery('')
                          }}
                          className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer font-sans"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ═══ RIGHT SIDE: COMPACT SIDEBAR ═══ */}
                  <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full lg:w-72 bg-gradient-to-b from-[#12100C] via-[#0E0D0A] to-[#080808] border border-[#C9A84C]/35 hover:border-[#C9A84C]/60 rounded-2xl p-4 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(201,168,76,0.1)] lg:sticky lg:top-24 z-30 transition-all duration-300 shrink-0 relative overflow-hidden backdrop-blur-xl order-1 lg:order-2 ${
                      isFilterSidebarOpen ? 'block' : 'hidden lg:block'
                    }`}
                  >
                    {/* Ambient Gold Particle Light */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#C9A84C]/10 rounded-bl-full blur-2xl pointer-events-none" />

                    {/* Header */}
                    <div className="pb-3 border-b border-[#26241E] mb-3.5 relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold tracking-[0.18em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase font-serif">
                          <Sparkles className="w-2.5 h-2.5 text-[#C9A84C] animate-pulse" />
                          <span>{selectedGender.toUpperCase()}'S • {selectedTier === 'luxury' ? 'LUXURY' : 'STANDARD'}</span>
                        </span>
                        {isFilterSidebarOpen && (
                          <button 
                            onClick={() => setIsFilterSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-lg bg-[#141414] text-[#A39E93] hover:text-[#FFF5D6]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight leading-snug">
                          {selectedTier === 'luxury' ? `EXECUTIVE ATELIER` : `ESSENTIALS`}
                        </h2>
                        <span className="text-[9px] font-extrabold text-[#C9A84C] bg-[#C9A84C]/15 border border-[#C9A84C]/40 px-2 py-0.5 rounded-full uppercase font-mono">
                          {sortedProducts.length} ITEMS
                        </span>
                      </div>
                    </div>

                    {/* PERSONA ROLE FILTER (EXECUTIVE PERSONAS IN COMPACT SIDEBAR) */}
                    {selectedTier === 'luxury' && (
                      <div className="mb-4 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1 h-3 bg-gradient-to-b from-[#FFF5D6] to-[#C9A84C] rounded-full" />
                            <label className="block text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-widest font-serif">
                              EXECUTIVE PERSONAS
                            </label>
                          </div>
                          <span className="text-[8px] font-bold text-[#FFF5D6] bg-black/80 border border-[#26241E] px-1.5 py-0.5 rounded uppercase font-mono">
                            {selectedRole === 'ALL' ? 'ALL' : selectedRole}
                          </span>
                        </div>
                        
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                          {ROLES_LIST.map((role) => {
                            const isSelected = selectedRole === role
                            return (
                              <motion.button
                                key={role}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer font-sans border ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black border-[#C9A84C] shadow-sm font-extrabold'
                                    : 'bg-[#131210]/90 text-[#E8E0CC]/80 border-[#26241E] hover:border-[#C9A84C]/50 hover:bg-[#1A1814] hover:text-[#FFF5D6]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">
                                    {role === 'CEO' && '👑'}
                                    {role === 'LAWYER' && '⚖️'}
                                    {role === 'DOCTOR' && '🩺'}
                                    {role === 'C.A' && '📊'}
                                    {role === 'MANAGER' && '💼'}
                                    {role === 'TEACHER' && '🎓'}
                                    {role === 'ARTIST' && '🎨'}
                                    {role === 'OWNER' && '🏛️'}
                                    {role === 'ENTREPRENEUR' && '🚀'}
                                    {role === 'CUSTOM ATELIER' && '✨'}
                                    {role === 'ALL' && '✨'}
                                  </span>
                                  <span>{role === 'ALL' ? 'ALL PERSONAS' : role}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-black font-extrabold" />
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* SEARCH INPUT */}
                    <div className="mb-4 relative z-10">
                      <label className="block text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-widest mb-1 font-serif flex items-center gap-1">
                        <Search className="w-2.5 h-2.5 text-[#C9A84C]" />
                        <span>SEARCH</span>
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#C9A84C]/70 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search collection..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-7 py-1.5 bg-[#131210] border border-[#26241E] focus:border-[#C9A84C] rounded-lg text-[11px] text-[#FFF5D6] placeholder-[#A39E93]/70 focus:outline-none font-sans transition-all"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-2 text-[#A39E93] hover:text-[#FFF5D6]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* COLLECTION TIER SWITCHER */}
                    <div className="mb-3.5 border-t border-[#26241E] pt-3 relative z-10">
                      <label className="block text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-widest mb-1 font-serif">
                        TIER
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 bg-[#100F0C] p-1 rounded-xl border border-[#26241E]">
                        <button
                          onClick={() => handleSelectTier('standard')}
                          className={`py-1 px-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all border cursor-pointer font-sans ${
                            selectedTier === 'standard'
                              ? 'bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black border-[#C9A84C]'
                              : 'bg-transparent border-transparent text-[#A39E93] hover:text-[#FFF5D6]'
                          }`}
                        >
                          STANDARD
                        </button>
                        <button
                          onClick={() => handleSelectTier('luxury')}
                          className={`py-1 px-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all border cursor-pointer font-sans ${
                            selectedTier === 'luxury'
                              ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black border-[#C9A84C]'
                              : 'bg-transparent border-transparent text-[#A39E93] hover:text-[#FFF5D6]'
                          }`}
                        >
                          LUXURY
                        </button>
                      </div>
                    </div>

                    {/* SORT BY */}
                    <div className="border-t border-[#26241E] pt-3 relative z-10">
                      <label className="block text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-widest mb-1 font-serif">
                        SORT BY
                      </label>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#131210] border border-[#26241E] focus:border-[#C9A84C] rounded-lg text-[11px] text-[#FFF5D6] focus:outline-none font-bold cursor-pointer font-sans"
                      >
                        <option value="name">Name (A - Z)</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                      </select>

                      {(selectedRole !== 'ALL' || searchQuery !== '') && (
                        <button
                          onClick={() => {
                            setSelectedRole('ALL')
                            setSearchQuery('')
                          }}
                          className="w-full mt-3 py-1.5 px-2 rounded-lg bg-red-950/30 border border-red-800/40 hover:border-red-500 text-red-300 text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer font-sans"
                        >
                          CLEAR FILTERS
                        </button>
                      )}
                    </div>
                  </motion.aside>
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
