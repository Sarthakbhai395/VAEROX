import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { productAPI } from '../services/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    const search = urlParams.get('search')
    if (category) setFilter(category)
    if (search) setSearchQuery(search)
    fetchProducts()
  }, [location.search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts()

      if (response.success) {
        const productsData = (response.data || response.products || []).map(product => {
          const isExternalUrl = product.image && (
            product.image.startsWith('http://') || 
            product.image.startsWith('https://')
          );
          if (!isExternalUrl) {
            if (product.image && product.image !== 'no-photo.jpg' && product.image !== '/uploads/no-photo.jpg') {
              if (!product.image.startsWith('/uploads/')) {
                product.image = `/uploads/${product.image}`;
              }
            } else {
              product.image = '/uploads/no-photo.jpg';
            }
          }
          return product;
        });
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

  const filteredProducts = products.filter(product => {
    const categoryMatch = filter === 'all' || product.category?.toLowerCase() === filter.toLowerCase()
    const searchMatch = searchQuery 
      ? product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return categoryMatch && searchMatch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'name') return a.name?.localeCompare(b.name || '') || 0
    if (sort === 'price-low') return (a.price || 0) - (b.price || 0)
    if (sort === 'price-high') return (b.price || 0) - (a.price || 0)
    if (sort === 'discount') return (b.discount || 0) - (a.discount || 0)
    if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const hasActiveFilters = filter !== 'all' || sort !== 'name' || searchQuery
  const activeFilterCount = (filter !== 'all' ? 1 : 0) + (sort !== 'name' ? 1 : 0) + (searchQuery ? 1 : 0)

  const resetAll = () => {
    setFilter('all')
    setSort('name')
    setSearchQuery('')
    setMobileFiltersOpen(false)
  }

  /* ── Filter Content (shared between mobile drawer and desktop sidebar) ── */
  /* ── Filter Content (shared between mobile drawer and desktop sidebar) ── */
  const FilterContent = ({ isMobile = false }) => (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      <div>
        <label htmlFor={`filter-${isMobile ? 'mobile' : 'desktop'}`} className="block text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
          Category
        </label>
        <select
          id={`filter-${isMobile ? 'mobile' : 'desktop'}`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-4 pr-10 py-3 text-sm border border-[#26241E] focus:outline-none focus:border-[#C9A84C] rounded-xl bg-[#121212] text-[#E8E0CC] transition-colors appearance-none"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home & kitchen">Home & Kitchen</option>
          <option value="books">Books</option>
          <option value="sports">Sports</option>
          <option value="beauty">Beauty</option>
          <option value="toys & games">Toys & Games</option>
          <option value="grocery">Grocery</option>
        </select>
      </div>

      <div>
        <label htmlFor={`sort-${isMobile ? 'mobile' : 'desktop'}`} className="block text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
          Sort By
        </label>
        <select
          id={`sort-${isMobile ? 'mobile' : 'desktop'}`}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full pl-4 pr-10 py-3 text-sm border border-[#26241E] focus:outline-none focus:border-[#C9A84C] rounded-xl bg-[#121212] text-[#E8E0CC] transition-colors appearance-none"
        >
          <option value="name">Name (A - Z)</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Highest Discount</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {isMobile && hasActiveFilters && (
        <button
          onClick={resetAll}
          className="w-full py-2.5 text-sm font-semibold text-rose-400 bg-rose-950/30 rounded-xl hover:bg-rose-900/50 transition-colors uppercase tracking-wider"
        >
          Reset All Filters
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#E8E0CC]/70 tracking-widest uppercase">Loading products...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div 
          className="bg-[#0A0A0A] border border-red-500/30 text-center px-6 py-8 rounded-2xl shadow-xl max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-[#FFF5D6] font-semibold mb-1">Something went wrong</p>
          <p className="text-sm text-[#A39E93] mb-4">{error}</p>
          <button onClick={fetchProducts} className="px-5 py-2 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black text-sm font-bold rounded-xl hover:scale-105 transition-all">
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC]">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-6 md:py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Page Header ── */}
        <div className="flex flex-col items-center mb-6 md:mb-10 text-center">
          <motion.h1 
            className="text-2xl md:text-4xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-2 md:mb-3"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {filter === 'all' ? 'All Products' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Collection`}
          </motion.h1>
          <motion.div 
            className="w-12 md:w-16 h-1 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 }}
          />
        </div>
        
        {/* ── Search Bar ── */}
        <motion.div 
          className="mb-6 md:mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center bg-[#0A0A0A] rounded-full border border-[#C9A84C]/40 shadow-xl focus-within:border-[#C9A84C] overflow-hidden p-1 transition-all">
            <input
              type="text"
              placeholder="Search luxury products..."
              className="flex-grow pl-4 md:pl-6 pr-2 py-2.5 md:py-3 bg-transparent text-[#E8E0CC] placeholder-[#A39E93] focus:outline-none text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold transition duration-200 shadow-md flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap text-sm md:text-base uppercase tracking-wider hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </motion.div>

        {/* ═══ MOBILE: Filter Bar + Collapsible Drawer ═══ */}
        <div className="lg:hidden mb-5">
          {/* Compact filter trigger bar */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Filter toggle button */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                mobileFiltersOpen 
                  ? 'bg-[#C9A84C] text-black border-[#C9A84C]' 
                  : 'bg-[#0A0A0A] text-[#E8E0CC] border-[#26241E] hover:border-[#C9A84C]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  mobileFiltersOpen ? 'bg-black text-[#C9A84C]' : 'bg-[#C9A84C] text-black'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1">
              {filter !== 'all' && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-[#C9A84C]/20 text-[#C9A84C] text-xs font-semibold rounded-full whitespace-nowrap border border-[#C9A84C]/40">
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <button onClick={() => setFilter('all')} className="ml-0.5 hover:text-white">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              )}
              {sort !== 'name' && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-950/40 text-amber-300 text-xs font-semibold rounded-full whitespace-nowrap border border-amber-500/30">
                  {sort === 'price-low' ? 'Price ↑' : sort === 'price-high' ? 'Price ↓' : sort === 'discount' ? 'Discount' : 'Newest'}
                  <button onClick={() => setSort('name')} className="ml-0.5 hover:text-white">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              )}
            </div>

            {/* Result count (mobile) */}
            <span className="text-xs font-medium text-[#A39E93] whitespace-nowrap">
              {sortedProducts.length} items
            </span>
          </motion.div>

          {/* Collapsible filter drawer */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1">
                  <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-xl p-4">
                    <FilterContent isMobile={true} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ MAIN LAYOUT: Desktop Sidebar + Product Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* ── Desktop Sidebar (hidden on mobile, shown lg+) ── */}
          <motion.div 
            className="hidden lg:block lg:col-span-1 bg-[#0A0A0A] p-6 rounded-2xl border border-[#26241E] shadow-xl sticky top-24"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#26241E]">
              <h2 className="text-lg font-bold text-[#FFF5D6] flex items-center gap-2 font-serif">
                <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h2>
              {hasActiveFilters && (
                <button 
                  onClick={resetAll}
                  className="text-xs font-bold text-[#C9A84C] hover:text-[#FFF5D6] uppercase tracking-wider transition-colors"
                >
                  Reset All
                </button>
              )}
            </div>
            <FilterContent isMobile={false} />
          </motion.div>

          {/* ── Product Grid ── */}
          <div className="lg:col-span-3">
            {/* Result count bar (desktop only) */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-[#E8E0CC]/70">
                Showing <strong className="text-[#FFF5D6]">{sortedProducts.length}</strong> products
              </span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[#C9A84C] hover:text-[#FFF5D6] text-sm font-semibold flex items-center gap-1 group"
                >
                  Clear search for "{searchQuery}"
                  <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {sortedProducts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {sortedProducts.map((product) => (
                  <motion.div
                    key={product._id || product.id}
                    variants={item}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12 md:py-16 bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">🔍</div>
                <h3 className="text-xl md:text-2xl font-bold text-[#FFF5D6] mb-2 font-serif">No Products Found</h3>
                <p className="text-sm md:text-base text-[#E8E0CC]/70 mb-5 md:mb-6 px-4">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={resetAll}
                  className="bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold py-2.5 px-6 rounded-full transition duration-300 shadow-md text-sm md:text-base uppercase tracking-wider hover:scale-105"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Products
