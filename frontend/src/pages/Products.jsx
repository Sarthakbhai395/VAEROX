import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Search, Filter, X, Check } from 'lucide-react'
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
  // selectedMode: null | 'classic' (Classic Clothes) | 'premium' (VAEROX Premium)
  // selectedGender: null | 'men' | 'women'
  // selectedTier: null | 'standard' | 'luxury'
  // selectedRole: 'ALL' | 'CEO' | 'TEACHER' | 'MANAGER' | etc.
  const [selectedMode, setSelectedMode] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [selectedRole, setSelectedRole] = useState('ALL')

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

  // Sync component states with URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const modeParam = urlParams.get('mode')
    const categoryParam = urlParams.get('category')
    const searchParam = urlParams.get('search')
    const tierParam = urlParams.get('tier')
    const roleParam = urlParams.get('role')

    if (modeParam === 'classic' || categoryParam === 'classic') {
      setSelectedMode('classic')
      if (categoryParam === 'men' || categoryParam === 'women') {
        setSelectedGender(categoryParam.toLowerCase())
      } else {
        setSelectedGender(null)
      }
      setSelectedTier(null)
    } else if (modeParam === 'premium' || categoryParam || tierParam) {
      setSelectedMode('premium')
      if (categoryParam === 'men' || categoryParam === 'women') {
        setSelectedGender(categoryParam.toLowerCase())
      } else {
        setSelectedGender(null)
      }
      if (tierParam === 'luxury' || tierParam === 'premium') {
        setSelectedTier('luxury')
      } else if (tierParam === 'standard') {
        setSelectedTier('standard')
      } else {
        setSelectedTier(null)
      }
      if (roleParam) {
        setSelectedRole(roleParam.toUpperCase())
      } else {
        setSelectedRole('ALL')
      }
    } else {
      setSelectedMode(null)
      setSelectedGender(null)
      setSelectedTier(null)
      setSelectedRole('ALL')
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

  // Strict Product Filtering Logic based on selected mode, gender, tier & role
  const filteredProducts = products.filter((product) => {
    const prodCat = (product.category || '').toLowerCase()
    const prodName = (product.name || '').toLowerCase()
    const prodDesc = (product.description || '').toLowerCase()
    const prodRole = (product.role || '').toUpperCase()
    const prodTier = (product.tier || '').toLowerCase()
    const prodGender = (product.gender || '').toLowerCase()

    // 1. CLASSIC CLOTHES MODE
    if (selectedMode === 'classic') {
      // Exclude premium / luxury items from Classic Clothes view
      const isNotLuxuryOrPremium = prodTier !== 'luxury' && prodTier !== 'premium' && !prodCat.includes('premium')

      let genderMatch = true
      if (selectedGender === 'men') {
        genderMatch = prodGender === 'men' || prodCat.includes('men') || prodName.includes('men')
      } else if (selectedGender === 'women') {
        genderMatch = prodGender === 'women' || prodCat.includes('women') || prodName.includes('women')
      }

      const searchMatch = searchQuery
        ? prodName.includes(searchQuery.toLowerCase()) ||
          prodDesc.includes(searchQuery.toLowerCase())
        : true

      return isNotLuxuryOrPremium && genderMatch && searchMatch
    }

    // 2. VAEROX PREMIUM MODE
    if (selectedMode === 'premium') {
      let genderMatch = true
      if (selectedGender === 'men') {
        genderMatch = prodGender === 'men' || prodCat.includes('men') || prodName.includes('men')
      } else if (selectedGender === 'women') {
        genderMatch = prodGender === 'women' || prodCat.includes('women') || prodName.includes('women')
      }

      let tierMatch = true
      if (selectedTier === 'standard') {
        tierMatch = prodTier === 'standard' || prodCat.includes('standard')
      } else if (selectedTier === 'luxury') {
        tierMatch = prodTier === 'luxury' || prodTier === 'premium' || prodCat.includes('luxury') || prodCat.includes('premium')
      }

      let roleMatch = true
      if (selectedTier === 'luxury' && selectedRole && selectedRole !== 'ALL') {
        const searchRole = selectedRole.toUpperCase()
        roleMatch =
          prodRole === searchRole ||
          prodCat.toUpperCase().includes(searchRole) ||
          prodName.toUpperCase().includes(searchRole) ||
          prodDesc.toUpperCase().includes(searchRole)
      }

      const searchMatch = searchQuery
        ? prodName.includes(searchQuery.toLowerCase()) ||
          prodDesc.includes(searchQuery.toLowerCase())
        : true

      return genderMatch && tierMatch && roleMatch && searchMatch
    }

    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') return a.name?.localeCompare(b.name || '') || 0
    if (sort === 'price-low') return (a.price || 0) - (b.price || 0)
    if (sort === 'price-high') return (b.price || 0) - (a.price || 0)
    if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  // Handlers
  const handleSelectClassicMode = () => {
    setSelectedMode('classic')
    setSelectedGender(null)
    setSelectedTier(null)
    navigate('/products?mode=classic')
  }

  const handleSelectPremiumMode = () => {
    setSelectedMode('premium')
    setSelectedGender(null)
    setSelectedTier(null)
    navigate('/products?mode=premium')
  }

  const handleSelectGenderForClassic = (gender) => {
    setSelectedMode('classic')
    setSelectedGender(gender)
    navigate(`/products?mode=classic&category=${gender}`)
  }

  const handleSelectTierForPremium = (tier) => {
    setSelectedMode('premium')
    setSelectedTier(tier)
    setSelectedGender(null)
    navigate(`/products?mode=premium&tier=${tier}`)
  }

  const handleSelectGenderForPremium = (gender) => {
    setSelectedMode('premium')
    setSelectedGender(gender)
    const tier = selectedTier || 'standard'
    navigate(`/products?mode=premium&tier=${tier}&category=${gender}`)
  }

  const handleBackToMainMode = () => {
    setSelectedMode(null)
    setSelectedGender(null)
    setSelectedTier(null)
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

  // Catalogue View is active when:
  // - Classic Mode with Gender selected (Men's or Women's)
  // - VAEROX Premium Mode with Tier and Gender selected
  const isClassicCatalogueView = selectedMode === 'classic' && selectedGender !== null
  const isPremiumCatalogueView = selectedMode === 'premium' && selectedTier !== null && selectedGender !== null
  const isLuxuryView = isPremiumCatalogueView && selectedTier === 'luxury'
  const showCatalogueView = isClassicCatalogueView || isPremiumCatalogueView

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] select-none overflow-x-hidden">
      <div className="w-full">
        <AnimatePresence mode="wait">

          {/* ════════════ STEP 0: INITIAL MAIN ENTRY CARDS (CLASSIC CLOTHES vs VAEROX PREMIUM) ════════════ */}
          {!selectedMode && (
            <motion.div
              key="step-initial"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="flex items-center justify-center gap-3 mb-4"
                  >
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
                    <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase font-serif shadow-sm">
                      EXPLORE VÆROX COLLECTIONS
                    </span>
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent via-[#C9A84C] to-transparent" />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase leading-[1.05]"
                  >
                    SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]">COLLECTION</span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="text-[#E8E0CC]/75 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed tracking-wide font-sans"
                  >
                    Choose Classic Clothes for everyday regular wear or VAEROX Premium for bespoke haute couture & executive persona suiting.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.7 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16"
                >
                  {/* CARD 1: CLASSIC CLOTHES */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleSelectClassicMode}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#12110E] via-[#0E0D0B] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500 flex flex-col md:flex-row min-h-[380px]"
                  >
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.classicCardImage === 'string' ? siteAssets.classicCardImage : siteAssets.classicCardImage?.url) || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80"}
                        alt="Classic Clothes Collection"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#0E0D0B]/40 to-[#0E0D0B]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/85 border border-[#C9A84C]/40 uppercase shadow-md font-sans">
                          EVERYDAY REGULAR WEAR
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
                            C
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          CLASSIC CLOTHES
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/75 font-light leading-relaxed mb-6 font-sans">
                          It is used for regular use and it includes all regular clothes. Click to view all clothes directly with instant sorting & filtering options.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          EXPLORE ALL CLASSIC CLOTHES
                        </span>
                        <div className="w-10 h-10 rounded-full bg-black border border-[#C9A84C]/50 flex items-center justify-center text-[#C9A84C] group-hover:bg-gradient-to-r group-hover:from-[#C9A84C] group-hover:to-[#9B782B] group-hover:text-black transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 2: VAEROX PREMIUM */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleSelectPremiumMode}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#1A160E] via-[#120F09] to-[#0A0A0A] border border-[#C9A84C]/60 hover:border-[#C9A84C] shadow-2xl hover:shadow-[0_0_45px_rgba(201,168,76,0.35)] transition-all duration-500 flex flex-col md:flex-row min-h-[380px]"
                  >
                    <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.premiumCardImage === 'string' ? siteAssets.premiumCardImage : siteAssets.premiumCardImage?.url) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"}
                        alt="VAEROX Premium Collection"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#120F09]/40 to-[#120F09]" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase shadow-lg font-sans">
                          BESPOKE HAUTE COUTURE
                        </span>
                      </div>
                    </div>

                    <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between relative z-10 bg-[#120F09]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase font-serif">
                            Collection 02
                          </span>
                          <span className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C] flex items-center justify-center text-xs font-serif font-bold text-[#C9A84C]">
                            VP
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 group-hover:text-[#C9A84C] transition-colors">
                          VAEROX PREMIUM
                        </h2>

                        <p className="text-xs sm:text-sm text-[#E8E0CC]/80 font-light leading-relaxed mb-6 font-sans">
                          Explore VAEROX Standard (daily wear premium clothes) & VAEROX Luxury (look-alike executive outfits like CEO, Manager, Teacher, Lawyer, Doctor, etc.).
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#C9A84C] tracking-[0.18em] uppercase font-sans">
                          CHOOSE MEN'S OR WOMEN'S
                        </span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(201,168,76,0.6)]">
                          <ArrowRight className="w-4 h-4 font-bold" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 1: CLASSIC CLOTHES GENDER SELECTION (MEN'S vs WOMEN'S) ════════════ */}
          {selectedMode === 'classic' && selectedGender === null && (
            <motion.div
              key="step-classic-gender"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              <div className="relative z-10 max-w-7xl mx-auto">
                <motion.button
                  onClick={handleBackToMainMode}
                  className="group inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-[#0D0C0A]/90 border border-[#C9A84C]/40 text-xs font-extrabold text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all font-sans cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>BACK TO MAIN SELECTION</span>
                </motion.button>

                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-4">
                    CLASSIC CLOTHES • <span className="text-[#C9A84C]">SELECT GENDER</span>
                  </h1>
                  <p className="text-[#E8E0CC]/75 text-sm max-w-lg mx-auto font-light font-sans">
                    Choose between Men's Classic Clothes or Women's Classic Clothes for everyday regular wear.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Men's Classic Clothes */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGenderForClassic('men')}
                    className="group rounded-3xl overflow-hidden cursor-pointer bg-[#0E0D0B] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl p-6 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                        alt="Men's Classic Clothes"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-[#FFF5D6] group-hover:text-[#C9A84C] uppercase mb-2">
                        MEN'S CLASSIC CLOTHES
                      </h2>
                      <p className="text-xs text-[#E8E0CC]/75 font-sans mb-4">
                        Everyday regular clothes for men. View all men's regular wear directly with instant sorting & filters.
                      </p>
                      <div className="pt-3 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>EXPLORE MEN'S CLASSIC</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Women's Classic Clothes */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGenderForClassic('women')}
                    className="group rounded-3xl overflow-hidden cursor-pointer bg-[#0E0D0B] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl p-6 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"}
                        alt="Women's Classic Clothes"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-[#FFF5D6] group-hover:text-[#C9A84C] uppercase mb-2">
                        WOMEN'S CLASSIC CLOTHES
                      </h2>
                      <p className="text-xs text-[#E8E0CC]/75 font-sans mb-4">
                        Everyday regular clothes for women. View all women's regular wear directly with instant sorting & filters.
                      </p>
                      <div className="pt-3 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>EXPLORE WOMEN'S CLASSIC</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 2: VAEROX PREMIUM TIER SELECTION (STANDARD vs LUXURY) ════════════ */}
          {selectedMode === 'premium' && selectedTier === null && (
            <motion.div
              key="step-premium-tier"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              <div className="relative z-10 max-w-7xl mx-auto">
                <motion.button
                  onClick={handleBackToMainMode}
                  className="group inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-[#0D0C0A]/90 border border-[#C9A84C]/40 text-xs font-extrabold text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all font-sans cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>BACK TO MAIN SELECTION</span>
                </motion.button>

                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-4">
                    VAEROX PREMIUM • <span className="text-[#C9A84C]">SELECT TIER</span>
                  </h1>
                  <p className="text-[#E8E0CC]/75 text-sm max-w-xl mx-auto font-light font-sans">
                    Choose VAEROX Standard for daily wear premium clothes or VAEROX Luxury for ultra/superb executive look-alike outfits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {/* CARD 1: VAEROX STANDARD */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectTierForPremium('standard')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-[#0E0D0B] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[380px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.standardTierCardImage === 'string' ? siteAssets.standardTierCardImage : siteAssets.standardTierCardImage?.url) || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"}
                        alt="VAEROX Standard"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full text-[9px] font-bold text-[#C9A84C] border border-[#C9A84C]/40">
                        REGULAR USE PREMIUM CLOTHES
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase mb-2 group-hover:text-[#C9A84C]">
                        VAEROX STANDARD
                      </h2>
                      <p className="text-xs sm:text-sm text-[#E8E0CC]/80 font-sans mb-6">
                        Daily wear regular use premium clothes. Custom stitch tailored to your measurements with full pair distinction.
                      </p>
                      <div className="pt-4 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>SELECT VAEROX STANDARD</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 2: VAEROX LUXURY */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectTierForPremium('luxury')}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#1A160E] to-[#0A0A0A] border border-[#C9A84C]/60 hover:border-[#C9A84C] shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[380px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.luxuryTierCardImage === 'string' ? siteAssets.luxuryTierCardImage : siteAssets.luxuryTierCardImage?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"}
                        alt="VAEROX Luxury"
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black px-3 py-1 rounded-full text-[9px] font-extrabold uppercase">
                        ULTRA & SUPERB PREMIUM OUTFITS
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif uppercase mb-2 group-hover:text-[#C9A84C]">
                        VAEROX LUXURY
                      </h2>
                      <p className="text-xs sm:text-sm text-[#E8E0CC]/80 font-sans mb-6">
                        Ultra & superb premium look-alike executive persona outfits (CEO Outfit, Teacher Outfit, Manager Outfit, Lawyer Outfit, Doctor Outfit, etc.) with custom sidebar role filters!
                      </p>
                      <div className="pt-4 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>SELECT VAEROX LUXURY (WITH EXECUTIVE SIDEBAR)</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 3: VAEROX PREMIUM GENDER SELECTION (MEN'S vs WOMEN'S) ════════════ */}
          {selectedMode === 'premium' && selectedTier !== null && selectedGender === null && (
            <motion.div
              key="step-premium-gender"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="relative min-h-screen py-10 md:py-16 px-4 md:px-8 overflow-hidden"
            >
              <div className="relative z-10 max-w-7xl mx-auto">
                <motion.button
                  onClick={() => setSelectedTier(null)}
                  className="group inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-[#0D0C0A]/90 border border-[#C9A84C]/40 text-xs font-extrabold text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all font-sans cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>BACK TO TIER SELECTION ({selectedTier.toUpperCase()})</span>
                </motion.button>

                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-4">
                    VAEROX {selectedTier.toUpperCase()} • <span className="text-[#C9A84C]">SELECT GENDER</span>
                  </h1>
                  <p className="text-[#E8E0CC]/75 text-sm max-w-lg mx-auto font-light font-sans">
                    Choose between Men's Wear or Women's Wear for VAEROX {selectedTier.toUpperCase()} collection.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Men's Wear */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGenderForPremium('men')}
                    className="group rounded-3xl overflow-hidden cursor-pointer bg-[#0E0D0B] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl p-6 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                        alt="Men's Wear"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-[#FFF5D6] group-hover:text-[#C9A84C] uppercase mb-2">
                        MEN'S WEAR
                      </h2>
                      <p className="text-xs text-[#E8E0CC]/75 font-sans mb-4">
                        Tailored suiting, tuxedos & executive persona outfits for men.
                      </p>
                      <div className="pt-3 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>SELECT MEN'S WEAR</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Women's Wear */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectGenderForPremium('women')}
                    className="group rounded-3xl overflow-hidden cursor-pointer bg-[#0E0D0B] border border-[#26241E] hover:border-[#C9A84C] shadow-2xl p-6 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="h-48 relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"}
                        alt="Women's Wear"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-[#FFF5D6] group-hover:text-[#C9A84C] uppercase mb-2">
                        WOMEN'S WEAR
                      </h2>
                      <p className="text-xs text-[#E8E0CC]/75 font-sans mb-4">
                        Atelier evening gowns, power pant-suits & executive persona couture for women.
                      </p>
                      <div className="pt-3 border-t border-[#26241E] flex justify-between items-center text-xs font-bold text-[#C9A84C]">
                        <span>SELECT WOMEN'S WEAR</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 4: CATALOGUE VIEW (CLASSIC CLOTHES vs VAEROX PREMIUM) ════════════ */}
          {showCatalogueView && (
            <motion.div
              key="step-catalogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-6 px-3 sm:px-6"
            >
              <div className="max-w-7xl mx-auto">
                {/* Top Control Bar */}
                <div className="mb-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-[#0D0C0A] via-[#14120D] to-[#0A0A0A] p-4 sm:p-5 rounded-2xl border border-[#C9A84C]/40 shadow-xl">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03, x: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBackToMainMode}
                      className="px-4 py-2 rounded-xl bg-[#141414] border border-[#C9A84C]/60 text-[#C9A84C] hover:bg-[#C9A84C]/15 transition-all text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer font-sans shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#C9A84C]" />
                      <span>BACK TO MAIN SELECTION</span>
                    </motion.button>

                    <span className="text-xs font-extrabold text-[#FFF5D6] uppercase tracking-widest hidden sm:inline-block font-serif">
                      {selectedMode === 'classic' ? (
                        <span className="text-[#C9A84C]">CLASSIC CLOTHES &gt; {selectedGender?.toUpperCase()}'S REGULAR WEAR</span>
                      ) : (
                        <>{selectedGender?.toUpperCase()}'S WEAR &gt; <span className="text-[#C9A84C]">VAEROX {selectedTier?.toUpperCase()}</span></>
                      )}
                    </span>
                  </div>

                  {/* Top Bar Sort Dropdown & Search (Always available) */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#C9A84C] absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-[#121212] border border-[#26241E] focus:border-[#C9A84C] rounded-xl text-xs text-[#FFF5D6] placeholder-[#A39E93] focus:outline-none"
                      />
                    </div>

                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-3 py-1.5 bg-[#121212] border border-[#C9A84C]/40 rounded-xl text-xs text-[#FFF5D6] font-bold focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="name">Name (A - Z)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>

                    {/* Mobile Sidebar Filter Button (ONLY VISIBLE ON VAEROX LUXURY) */}
                    {isLuxuryView && (
                      <button
                        onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                        className="lg:hidden px-4 py-1.5 rounded-xl bg-[#141414] border border-[#C9A84C] text-[#C9A84C] text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-sans"
                      >
                        <Filter className="w-4 h-4" />
                        <span>EXECUTIVE PERSONAS</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ═══ MAIN LAYOUT: FULL WIDTH FOR CLASSIC & STANDARD, WITH SIDEBAR ONLY FOR LUXURY ═══ */}
                <div className={`flex flex-col ${isLuxuryView ? 'lg:flex-row' : ''} gap-6 md:gap-8 items-start relative`}>

                  {/* PRODUCTS GRID */}
                  <div className="flex-1 w-full order-2 lg:order-1">
                    {sortedProducts.length > 0 ? (
                      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLuxuryView ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4 md:gap-5`}>
                        {sortedProducts.map((product) => (
                          <ProductCard key={product._id || product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-12 text-center">
                        <p className="text-[#A39E93] text-sm mb-4 font-serif">No products found matching your active selection.</p>
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

                  {/* ═══ SIDEBAR: ONLY PRESENT IN VAEROX LUXURY PRODUCT PAGE! ═══ */}
                  {isLuxuryView && (
                    <motion.aside
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`w-full lg:w-72 bg-gradient-to-b from-[#12100C] via-[#0E0D0A] to-[#080808] border border-[#C9A84C]/50 hover:border-[#C9A84C] rounded-2xl p-5 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(201,168,76,0.15)] lg:sticky lg:top-24 z-30 transition-all duration-300 shrink-0 relative overflow-hidden backdrop-blur-xl order-1 lg:order-2 ${isFilterSidebarOpen ? 'block' : 'hidden lg:block'
                        }`}
                    >
                      <div className="pb-3 border-b border-[#26241E] mb-4 relative z-10 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold text-[#C9A84C] uppercase tracking-widest block font-serif">
                            LOOK-ALIKE EXECUTIVE OUTFITS
                          </span>
                          <h2 className="text-sm font-extrabold text-[#FFF5D6] font-serif uppercase">
                            EXECUTIVE PERSONAS
                          </h2>
                        </div>
                        {isFilterSidebarOpen && (
                          <button
                            onClick={() => setIsFilterSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-lg bg-[#141414] text-[#A39E93] hover:text-[#FFF5D6]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* LOOK-ALIKE OUTFIT ROLE SELECTION LIST (MANAGED BY ADMIN) */}
                      <div className="space-y-1.5 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                        {ROLES_LIST.map((role) => {
                          const isSelected = selectedRole === role
                          return (
                            <motion.button
                              key={role}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedRole(role)
                                const currentGender = selectedGender || 'men'
                                navigate(`/products?mode=premium&tier=luxury&category=${currentGender}&role=${role}`)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer font-sans border ${isSelected
                                  ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black border-[#C9A84C] shadow-md font-extrabold'
                                  : 'bg-[#131210]/90 text-[#E8E0CC]/80 border-[#26241E] hover:border-[#C9A84C]/50 hover:bg-[#1A1814] hover:text-[#FFF5D6]'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {role === 'CEO' && '👑'}
                                  {role === 'LAWYER' && '⚖️'}
                                  {role === 'DOCTOR' && '🩺'}
                                  {role === 'C.A' && '📊'}
                                  {role === 'MANAGER' && '💼'}
                                  {role === 'TEACHER' && '🎓'}
                                  {role === 'ARTIST' && '🎨'}
                                  {role === 'OWNER' && '🏛️'}
                                  {role === 'ENTREPRENEUR' && '🚀'}
                                  {role === 'CUSTOM ATELIER' && '👔'}
                                  {role === 'ALL' && '👔'}
                                </span>
                                <span>{role === 'ALL' ? 'ALL LOOK-ALIKE OUTFITS' : `${role} OUTFIT`}</span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-black font-extrabold" />
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.aside>
                  )}
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
