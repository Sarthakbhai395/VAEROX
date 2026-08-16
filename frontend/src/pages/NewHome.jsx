import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from '../services/api'
import { BannerCarousel } from '../components/homepage/BannerCarousel'
import { ProductCard } from '../components/homepage/ProductCard'
import { DealsSection } from '../components/homepage/DealsSection'

/* ── Static Data ── */
const categories = [
  { name: 'Electronics', icon: '💻', color: 'from-blue-500 to-indigo-600' },
  { name: 'Fashion', icon: '👗', color: 'from-rose-500 to-pink-600' },
  { name: 'Home & Kitchen', icon: '🏠', color: 'from-amber-500 to-orange-600' },
  { name: 'Beauty', icon: '💄', color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Sports', icon: '⚽', color: 'from-emerald-500 to-teal-600' },
  { name: 'Books', icon: '📚', color: 'from-sky-500 to-cyan-600' },
  { name: 'Toys & Games', icon: '🎮', color: 'from-violet-500 to-purple-600' },
  { name: 'Grocery', icon: '🛒', color: 'from-lime-500 to-green-600' },
]

const deals = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1631011714977-a6068c048b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2MDY4MTUyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Smartphones',
    discount: 'Up to 40% Off',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Laptops',
    discount: 'Min 30% Off',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwNjk5Mjc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Headphones',
    discount: 'From ₹499',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlc3xlbnwxfHx8fDE3NjA3MzIxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Home Appliances',
    discount: 'Up to 60% Off',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1717295248494-937c3a5655b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGdhZGdldHN8ZW58MXx8fHwxNzYwNzMxMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Electronics',
    discount: 'Great Savings!',
  },
]

const fashionDeals = [
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYwNzk4NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Fashion',
    discount: '50-80% Off',
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1717295248494-937c3a5655b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGdhZGdldHN8ZW58MXx8fHwxNzYwNzMxMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Gadgets',
    discount: 'Up to 35% Off',
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlc3xlbnwxfHx8fDE3NjA3MzIxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Home Decor',
    discount: 'Starting ₹299',
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwNjk5Mjc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Audio',
    discount: 'Min 25% Off',
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Workstation',
    discount: 'Up to 45% Off',
  },
]

const trustFeatures = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Quality Assured',
    desc: '100% genuine products from verified sellers',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: 'SSL encrypted checkout with all major methods',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Easy Returns',
    desc: '7-day hassle-free return & refund policy',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    title: 'Free Shipping',
    desc: 'Complimentary delivery on orders above ₹500',
    gradient: 'from-purple-500 to-violet-600',
  },
]

/* ── Animation Variants ── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

/* ── Loading Skeleton ── */
const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
)

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Hero skeleton */}
    <div className="px-4 md:px-6 lg:px-8 pt-4">
      <SkeletonPulse className="w-full h-[60vh] md:h-[75vh] lg:h-[85vh] rounded-2xl lg:rounded-3xl" />
    </div>

    {/* Category skeleton */}
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
      <div className="flex gap-4 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <SkeletonPulse key={i} className="w-24 h-28 flex-shrink-0" />
        ))}
      </div>
    </div>

    {/* Products skeleton */}
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
      <SkeletonPulse className="h-8 w-52 mb-8 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
            <SkeletonPulse className="aspect-square rounded-none" />
            <div className="p-4 space-y-3">
              <SkeletonPulse className="h-4 w-3/4 rounded" />
              <SkeletonPulse className="h-3 w-1/2 rounded" />
              <SkeletonPulse className="h-5 w-1/3 rounded" />
              <SkeletonPulse className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
const NewHome = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts()

      if (response.success) {
        const featuredProducts = response.data.slice(0, 8).map((product) => {
          const isExternalUrl =
            product.image &&
            (product.image.startsWith('http://') || product.image.startsWith('https://'))

          let imageUrl
          if (isExternalUrl) {
            imageUrl = product.image
          } else if (
            product.image &&
            product.image !== 'no-photo.jpg' &&
            product.image !== '/uploads/no-photo.jpg'
          ) {
            imageUrl = product.image.startsWith('/uploads/')
              ? product.image
              : `/uploads/${product.image}`
          } else {
            imageUrl = '/uploads/no-photo.jpg'
          }

          return {
            ...product,
            _id: product._id || product.id,
            id: product._id || product.id,
            image: imageUrl,
            title: product.name,
            price: product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price,
            originalPrice: product.price,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 1000) + 1,
          }
        })
        setProducts(featuredProducts)
      } else {
        setError('Failed to fetch products')
      }
    } catch (err) {
      setError('An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  /* ── Loading ── */
  if (loading) return <LoadingSkeleton />

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center p-8 rounded-2xl border border-red-100 bg-red-50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] w-full overflow-x-hidden">
      {/* ═══ SECTION 1 — HERO BANNER ═══ */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 pt-3 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BannerCarousel />
        </motion.div>
      </section>

      {/* ═══ SECTION 2 — CATEGORY RIBBON ═══ */}
      <section className="py-10 md:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-[#FFF5D6] mb-2 font-serif tracking-tight">Shop by Category</h2>
            <p className="text-[#E8E0CC]/70 text-sm md:text-base font-light">Curated luxury collections tailored for you</p>
          </motion.div>

          <motion.div
            className="flex overflow-x-auto w-full max-w-full gap-3 md:gap-4 hide-scrollbar pb-2 snap-x snap-mandatory -mx-1 px-1 justify-start md:justify-center"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {categories.map((cat, i) => (
              <motion.div key={i} variants={fadeUp} className="flex-shrink-0 snap-start">
                <Link
                  to={`/products?category=${cat.name.toLowerCase()}`}
                  className="group flex flex-col items-center w-[5.5rem] md:w-28"
                >
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0A0A0A] border border-[#C9A84C]/40 flex items-center justify-center mb-2.5 shadow-xl group-hover:scale-110 group-hover:border-[#C9A84C] group-hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300"
                  >
                    <span className="text-2xl md:text-3xl">{cat.icon}</span>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-[#E8E0CC] text-center leading-tight group-hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 3 — DEALS (Electronics) ═══ */}
      <section className="pb-10 md:pb-14 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <DealsSection title="Top Deals on Electronics" deals={deals} />
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 4 — FEATURED PRODUCTS ═══ */}
      <section className="py-10 md:py-14 lg:py-16 bg-[#050505] border-y border-[#26241E]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="flex items-end justify-between mb-8 md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#FFF5D6] mb-2 font-serif">Best of Electronics</h2>
              <div className="w-16 h-[3px] bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] rounded-full mt-1.5" />
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-xs font-bold tracking-widest text-[#C9A84C] hover:text-[#FFF5D6] uppercase transition-colors group"
            >
              View All
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Grid / Horizontal scroll on mobile */}
          <motion.div
            className="flex overflow-x-auto w-full max-w-full md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar pb-4 -mx-1 px-1"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {products.map((product) => (
              <motion.div 
                key={product.id} 
                variants={fadeUp}
                className="flex-shrink-0 w-[58vw] sm:w-[38vw] md:w-auto snap-start"
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 5 — DEALS (Fashion & Lifestyle) ═══ */}
      <section className="py-10 md:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <DealsSection title="Fashion & Lifestyle" deals={fashionDeals} />
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 6 — TRUST FEATURES ═══ */}
      <section className="py-10 md:py-14 lg:py-20 border-t border-[#26241E]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#FFF5D6] mb-2 font-serif">Why Shop With Us</h2>
            <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-xl mx-auto font-light">
              We are committed to delivering unmatched excellence and bespoke service
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {trustFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                className="group bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 text-center hover:border-[#C9A84C]/60 hover:shadow-[0_0_25px_rgba(201,168,76,0.15)] transition-all duration-300"
                variants={fadeUp}
                whileHover={{ y: -6 }}
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black border border-[#C9A84C]/40 flex items-center justify-center mx-auto mb-4 md:mb-5 text-[#C9A84C] shadow-lg group-hover:scale-110 group-hover:bg-[#C9A84C] group-hover:text-black transition-all duration-300"
                >
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#FFF5D6] mb-1.5 uppercase tracking-wider font-serif">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-[#E8E0CC]/70 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 7 — NEWSLETTER CTA ═══ */}
      <section className="relative overflow-hidden border-t border-[#26241E]">
        <div className="absolute inset-0 bg-black" />
        {/* Subtle gold glow blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFF5D6] mb-4 md:mb-6 leading-tight font-serif">
              Discover Your Next
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]">
                Luxury Essential
              </span>
            </h2>
            <p className="text-[#E8E0CC]/80 text-base md:text-lg mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed font-light">
              Join thousands of connoisseurs. Subscribe for exclusive releases, private sales, and privilege access.
            </p>

            {/* Email Input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl bg-[#121212] border border-[#C9A84C]/30 text-[#E8E0CC] placeholder-[#A39E93] text-sm focus:outline-none focus:border-[#C9A84C] backdrop-blur-sm transition-all"
              />
              <button className="px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-all duration-200 whitespace-nowrap shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                Subscribe
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#E8E0CC]/60 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No spam, ever
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unsubscribe anytime
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Exclusive perks
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default NewHome
