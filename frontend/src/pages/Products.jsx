import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Search, Filter, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { productAPI } from '../services/api'

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const categoryParam = urlParams.get('category')
    const searchParam = urlParams.get('search')

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      if (catLower === 'men' || catLower === 'women') {
        setSelectedTier('standard')
        setSelectedGender(catLower)
      } else {
        setSelectedTier('standard')
      }
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
    <div className="min-h-screen bg-black text-[#E8E0CC] select-none py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ════════════ STEP 1: TIER SELECTION (STANDARD vs PREMIUM) ════════════ */}
          {!selectedTier && (
            <motion.div
              key="step-tier"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="py-8"
            >
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase mb-3 font-serif">
                  VÆROX COLLECTION SELECTION
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase">
                  CHOOSE YOUR COLLECTION TIER
                </h1>
                <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                  Select your desired luxury line below to customize your fitting experience.
                </p>
              </div>

              {/* 2 Animated Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Card 1: Standard Clothes */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTier('standard')}
                  className="group relative rounded-3xl overflow-hidden border-2 border-[#26241E] bg-[#0A0A0A] p-8 md:p-10 cursor-pointer shadow-2xl hover:border-[#C9A84C] hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all duration-500 flex flex-col justify-between min-h-[380px]"
                >
                  {/* Background Image Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black/80 border border-[#C9A84C]/40 uppercase mb-4">
                      CLASSIC ESSENTIALS
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3">
                      STANDARD CLOTHES
                    </h2>
                    <p className="text-xs md:text-sm text-[#E8E0CC]/80 font-light leading-relaxed mb-6">
                      Signature formal attire, tailored blazers, classic trousers, and everyday luxury essentials engineered for impeccable elegance.
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C9A84C] tracking-widest uppercase">
                      EXPLORE STANDARD LINE
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Premium Clothes */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTier('premium')}
                  className="group relative rounded-3xl overflow-hidden border-2 border-[#C9A84C]/50 bg-[#0A0A0A] p-8 md:p-10 cursor-pointer shadow-2xl hover:border-[#C9A84C] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] transition-all duration-500 flex flex-col justify-between min-h-[380px]"
                >
                  {/* Background Image Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.25em] text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase mb-4 shadow-lg">
                      <Sparkles className="w-3 h-3 fill-current" />
                      HAUTE COUTURE ATELIER
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3">
                      VÆROX PREMIUM
                    </h2>
                    <p className="text-xs md:text-sm text-[#E8E0CC]/80 font-light leading-relaxed mb-6">
                      Handcrafted gold label double-breasted tuxedos & executive role outfits (CEO, Manager, C.A, Lawyer, Doctor) tailor-made for distinction.
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-[#C9A84C]/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FFF5D6] tracking-widest uppercase">
                      EXPLORE VÆROX PREMIUM
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFF5D6] to-[#C9A84C] text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
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
              className="py-8"
            >
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

              {/* 2 Gender Modal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Category 1: Men's */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectGender('men')}
                  className="group relative rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] cursor-pointer shadow-2xl hover:border-[#C9A84C] hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all duration-500 flex flex-col justify-end p-8 md:p-10"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
                    alt="Men's Collection"
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="relative z-10">
                    <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black/80 border border-[#C9A84C]/40 uppercase mb-3 inline-block">
                      HIGH FORMAL TAILORING
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-2">
                      MEN'S WEAR
                    </h2>
                    <p className="text-xs text-[#E8E0CC]/80 mb-6 font-light">
                      Bespoke double-breasted tuxedos, sharp wool blazers, handcrafted oxford silhouettes & accessories.
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-widest uppercase shadow-lg">
                      <span>VIEW MEN'S WEAR</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Category 2: Women's */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectGender('women')}
                  className="group relative rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] cursor-pointer shadow-2xl hover:border-[#C9A84C] hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all duration-500 flex flex-col justify-end p-8 md:p-10"
                >
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
                    alt="Women's Collection"
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="relative z-10">
                    <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black/80 border border-[#C9A84C]/40 uppercase mb-3 inline-block">
                      ATELIER EVENING COUTURE
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-2">
                      WOMEN'S WEAR
                    </h2>
                    <p className="text-xs text-[#E8E0CC]/80 mb-6 font-light">
                      Sculpted satin evening gowns, tailored power pant-suits & hand-embroidered velvet wraps.
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-widest uppercase shadow-lg">
                      <span>VIEW WOMEN'S WEAR</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
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
            >
              {/* Top Navigation Bar / Breadcrumb */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#0A0A0A] p-4 md:p-6 rounded-2xl border border-[#26241E]">
                <div>
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest block mb-1 font-serif">
                    PRODUCTS &gt; {selectedTier === 'premium' ? 'VÆROX PREMIUM' : 'STANDARD CLOTHES'} &gt; {selectedGender.toUpperCase()}'S WEAR
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-[#FFF5D6] font-serif uppercase">
                    {selectedTier === 'premium' ? `VÆROX PREMIUM ${selectedGender.toUpperCase()}'S ATELIER` : `${selectedGender.toUpperCase()}'S FORMAL COLLECTION`}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetSelection}
                    className="px-4 py-2 rounded-xl bg-black border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    CHANGE SELECTION
                  </button>
                </div>
              </div>

              {/* ROLE SUB-CATEGORY PILL BUTTONS (ONLY FOR VAEROX PREMIUM) */}
              {selectedTier === 'premium' && (
                <div className="mb-6 bg-[#0A0A0A] p-4 rounded-2xl border border-[#C9A84C]/30">
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest block mb-3 font-serif">
                    SELECT EXECUTIVE / PROFESSION OUTFIT ROLE
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {ROLES_LIST.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                          selectedRole === role
                            ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-lg'
                            : 'bg-black text-[#E8E0CC] border-[#26241E] hover:border-[#C9A84C]/60'
                        }`}
                      >
                        {role === 'ALL' ? 'ALL ROLES' : `${role} OUTFITS`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search & Sort Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-[#C9A84C]" />
                  </span>
                  <input
                    type="text"
                    placeholder={`Search ${selectedGender}'s collection...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] placeholder-[#A39E93] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <label className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">
                    Sort By:
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="name">Name (A - Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>

              {/* Product Cards Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#0A0A0A] rounded-3xl border border-[#26241E] p-8">
                  <p className="text-lg font-bold text-[#FFF5D6] font-serif mb-2">No Products Found</p>
                  <p className="text-xs text-[#A39E93] mb-6">
                    Try adjusting your role filter or search query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedRole('ALL')
                    }}
                    className="px-6 py-2.5 bg-[#C9A84C] text-black text-xs font-extrabold rounded-full uppercase tracking-widest"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
