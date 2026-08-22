import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  Headphones,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { BannerCarousel } from '../components/homepage/BannerCarousel'
import { UGCVideoSection } from '../components/homepage/UGCVideoSection'
import { FAQSection } from '../components/homepage/FAQSection'
import ProductCard from '../components/product/ProductCard'
import { productAPI } from '../services/api'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const serviceFeatures = [
  {
    icon: <Truck className="w-7 h-7 text-[#C9A84C]" />,
    title: 'Express Worldwide Shipping',
    desc: 'Insured complimentary delivery on orders over ₹1999',
  },
  {
    icon: <Headphones className="w-7 h-7 text-[#C9A84C]" />,
    title: '24/7 VIP Concierge',
    desc: 'Personal stylist consultation & order support anytime',
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-[#C9A84C]" />,
    title: '100% Certified Authentic',
    desc: 'Haute couture garments crafted from world-class textiles',
  },
  {
    icon: <CreditCard className="w-7 h-7 text-[#C9A84C]" />,
    title: 'Encrypted Security',
    desc: '256-Bit SSL protected payment gateways',
  },
]

const NewHome = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts()
      if (response.success) {
        const rawProducts = response.data || response.products || []
        const formatted = rawProducts.slice(0, 8).map((product) => {
          let imageUrl = product.image
          const isSpecial =
            imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:'))
          if (!isSpecial) {
            if (imageUrl && imageUrl !== 'no-photo.jpg' && imageUrl !== '/uploads/no-photo.jpg') {
              if (!imageUrl.startsWith('/uploads/')) {
                imageUrl = `/uploads/${imageUrl}`
              }
            } else {
              imageUrl = '/uploads/no-photo.jpg'
            }
          }
          return {
            id: product._id || product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount || 0,
            image: imageUrl,
            category: product.category,
          }
        })
        setProducts(formatted)
      }
    } catch (err) {
      console.error('Error fetching featured products:', err)
      setError('An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] w-full overflow-x-hidden select-none">
      {/* ═══ 1. DYNAMIC HERO SECTION (ADMIN CONTROLLED) ═══ */}
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 pt-2 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BannerCarousel />
        </motion.div>
      </section>

      {/* ═══ 2. MEN'S WEAR & WOMEN'S WEAR CATEGORIES SECTION ═══ */}
      <section className="py-12 md:py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase mb-2 sm:mb-3">
            CURATED ATELIER
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-2 sm:mb-4">
            EXPLORE THE COLLECTIONS
          </h2>
          <p className="text-[#E8E0CC]/70 text-xs sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Handcrafted classical formal suiting and tailored evening wear designed to make an indelible impression
          </p>
        </motion.div>

        {/* Categories Grid (Men's Wear & Women's Wear) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Card 1: Men's Wear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] sm:aspect-[4/5] min-h-[420px] shadow-2xl hover:border-[#C9A84C]/80 hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
              alt="Men's Classical Formal Wear"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-end items-start z-10">
              <span className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black/85 backdrop-blur-md border border-[#C9A84C]/50 uppercase mb-2 sm:mb-3">
                HIGH FORMAL TAILORING
              </span>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-2 sm:mb-3 uppercase">
                MEN'S WEAR
              </h3>
              <p className="text-xs sm:text-sm text-[#E8E0CC]/80 mb-4 sm:mb-6 font-light max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
                Bespoke double-breasted tuxedos, sharp wool blazers, handcrafted oxford leather silhouettes & luxury accessories.
              </p>
              <Link
                to="/products?category=men"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-[10px] sm:text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.4)]"
              >
                <span>SHOP MEN'S WEAR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Women's Wear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] sm:aspect-[4/5] min-h-[420px] shadow-2xl hover:border-[#C9A84C]/80 hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
              alt="Women's Classical Formal Wear"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-end items-start z-10">
              <span className="px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black/85 backdrop-blur-md border border-[#C9A84C]/50 uppercase mb-2 sm:mb-3">
                ATELIER EVENING COUTURE
              </span>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-2 sm:mb-3 uppercase">
                WOMEN'S WEAR
              </h3>
              <p className="text-xs sm:text-sm text-[#E8E0CC]/80 mb-4 sm:mb-6 font-light max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
                Sculpted satin evening gowns, tailored power pant-suits, hand-embroidered velvet wraps & signature accessories.
              </p>
              <Link
                to="/products?category=women"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-[10px] sm:text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.4)]"
              >
                <span>SHOP WOMEN'S WEAR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2.5 VÆROX BESPOKE TAILORING (COMPACT & ANIMATED SHOWCASE) ═══ */}
      <section className="py-8 md:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-[#C9A84C]/50 bg-gradient-to-r from-[#0F0E0B] via-[#14120D] to-[#0A0A0A] p-5 sm:p-8 shadow-[0_0_35px_rgba(201,168,76,0.18)] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
        >
          {/* Animated Background Ambient Glow & Light Beams */}
          <motion.div
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 w-64 h-64 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none"
          />

          {/* Left / Main Text Block */}
          <div className="flex-1 text-left relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] bg-black/80 border border-[#C9A84C]/40 uppercase shadow-md">
              <Sparkles className="w-3 h-3 text-[#C9A84C] animate-pulse" />
              <span>CRAFTED FOR DISTINCTION • 100% BESPOKE TAILORING</span>
            </div>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#FFF5D6] tracking-wider uppercase leading-snug font-sans">
              HANDMADE HAUTE COUTURE <span className="text-[#C9A84C]">CUSTOM TAILORED</span> FOR YOU
            </h2>

            <p className="text-xs sm:text-sm text-[#E8E0CC]/85 font-normal leading-relaxed max-w-2xl font-sans">
              Every garment is master-measured, hand-cut from premier Italian Loro Piana wools & silks, and handcrafted over 80+ hours of artisan tailoring for unmatched elegance.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans"
              >
                ✓ 100% Bespoke Fit
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans"
              >
                ✦ 80+ Hours Hand Stitching
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans"
              >
                ★ Italian Loro Piana Wools
              </motion.span>
            </div>
          </div>

          {/* Right Action Call Button */}
          <div className="relative z-10 shrink-0 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_30px_rgba(201,168,76,0.6)] transition-all duration-300 shadow-xl font-sans"
              >
                <span>BOOK BESPOKE FITTING</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 3. UGC VIDEOS SECTION (ADMIN CONTROLLED REELS) ═══ */}
      <UGCVideoSection />

      {/* ═══ 4. DELIVERY, SUPPORT, QUALITY & PAYMENT DETAILS SECTION ═══ */}
      <section className="py-12 md:py-24 border-t border-[#26241E] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase mb-2 sm:mb-3">
              THE VÆROX STANDARD
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#FFF5D6] font-serif">
              BESPOKE CLIENT EXPERIENCE
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {serviceFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group bg-[#0A0A0A] rounded-2xl sm:rounded-3xl border border-[#26241E] p-6 sm:p-8 text-center hover:border-[#C9A84C]/60 hover:shadow-[0_0_30px_rgba(201,168,76,0.18)] transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black border border-[#C9A84C]/40 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl group-hover:scale-110 group-hover:bg-[#C9A84C] group-hover:text-black transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#FFF5D6] mb-2 font-serif uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#E8E0CC]/70 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. FAQ SECTION ═══ */}
      <FAQSection />
    </div>
  )

}

export default NewHome
