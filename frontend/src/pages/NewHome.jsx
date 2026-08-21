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
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 pt-3 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BannerCarousel />
        </motion.div>
      </section>

      {/* ═══ 2. MEN'S WEAR & WOMEN'S WEAR CATEGORIES SECTION ═══ */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase mb-3">
            CURATED ATELIER
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-4">
            EXPLORE THE COLLECTIONS
          </h2>
          <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Handcrafted classical formal suiting and tailored evening wear designed to make an indelible impression
          </p>
        </motion.div>

        {/* Categories Grid (Men's Wear & Women's Wear) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Men's Wear */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] shadow-2xl hover:border-[#C9A84C]/80 hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
              alt="Men's Classical Formal Wear"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-start z-10">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.3em] text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 uppercase mb-3">
                HIGH FORMAL TAILORING
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-3 uppercase">
                MEN'S WEAR
              </h3>
              <p className="text-xs md:text-sm text-[#E8E0CC]/80 mb-6 font-light max-w-md leading-relaxed">
                Bespoke double-breasted tuxedos, sharp wool blazers, handcrafted oxford leather silhouettes & luxury accessories.
              </p>
              <Link
                to="/products?category=men"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.25em] uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.4)]"
              >
                <span>SHOP MEN'S WEAR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Women's Wear */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-3xl overflow-hidden border border-[#26241E] bg-[#0A0A0A] aspect-[4/5] shadow-2xl hover:border-[#C9A84C]/80 hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
              alt="Women's Classical Formal Wear"
              className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-start z-10">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.3em] text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 uppercase mb-3">
                ATELIER EVENING COUTURE
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-3 uppercase">
                WOMEN'S WEAR
              </h3>
              <p className="text-xs md:text-sm text-[#E8E0CC]/80 mb-6 font-light max-w-md leading-relaxed">
                Sculpted satin evening gowns, tailored power pant-suits, hand-embroidered velvet wraps & signature accessories.
              </p>
              <Link
                to="/products?category=women"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.25em] uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.4)]"
              >
                <span>SHOP WOMEN'S WEAR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2.5 VÆROX CUSTOM HANDMADE LUXURY CLOTHING (HIGHLIGHTED SHOWCASE) ═══ */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border-2 border-[#C9A84C] bg-gradient-to-br from-[#0F0E0B] via-[#0A0A0A] to-black p-8 md:p-14 shadow-[0_0_50px_rgba(201,168,76,0.25)] text-center flex flex-col items-center"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-extrabold tracking-[0.3em] text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase mb-5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            EXQUISITE BESPOKE ATELIER
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-6 uppercase max-w-4xl leading-tight">
            VÆROX CRAFTS CUSTOM HANDMADE LUXURY & CLASSIC FORMAL CLOTHES TAILORED EXCLUSIVELY FOR YOU
          </h2>

          <p className="text-[#E8E0CC]/90 text-sm md:text-lg max-w-3xl font-light leading-relaxed mb-8">
            Experience true haute couture sartorial perfection. Every garment is individually hand-measured, master-cut from premier Italian wools & silks, and handcrafted by legendary bespoke artisans to reflect your personal prestige.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-10 text-left">
            <div className="p-4 rounded-2xl bg-black/60 border border-[#C9A84C]/30 backdrop-blur-md">
              <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1 font-serif">100% Bespoke Fit</h4>
              <p className="text-[11px] text-[#E8E0CC]/70 font-light">Custom tailored to your exact anatomical measurements.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-[#C9A84C]/30 backdrop-blur-md">
              <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1 font-serif">Handmade Artistry</h4>
              <p className="text-[11px] text-[#E8E0CC]/70 font-light">Over 80 hours of hand-stitching per tuxedo & gown.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-[#C9A84C]/30 backdrop-blur-md">
              <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1 font-serif">Rare Fabrics</h4>
              <p className="text-[11px] text-[#E8E0CC]/70 font-light">Italian Loro Piana wools & pure mulberry silk linings.</p>
            </div>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.25em] uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(201,168,76,0.5)]"
          >
            <span>BOOK BESPOKE FITTING APPOINTMENT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ═══ 3. UGC VIDEOS SECTION (ADMIN CONTROLLED REELS) ═══ */}
      <UGCVideoSection />

      {/* ═══ 4. DELIVERY, SUPPORT, QUALITY & PAYMENT DETAILS SECTION ═══ */}
      <section className="py-16 md:py-24 border-t border-[#26241E] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase mb-3">
              THE VÆROX STANDARD
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFF5D6] font-serif">
              BESPOKE CLIENT EXPERIENCE
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {serviceFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="group bg-[#0A0A0A] rounded-3xl border border-[#26241E] p-8 text-center hover:border-[#C9A84C]/60 hover:shadow-[0_0_30px_rgba(201,168,76,0.18)] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-black border border-[#C9A84C]/40 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:bg-[#C9A84C] group-hover:text-black transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-[#FFF5D6] mb-2 font-serif uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#E8E0CC]/70 leading-relaxed font-light">
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
