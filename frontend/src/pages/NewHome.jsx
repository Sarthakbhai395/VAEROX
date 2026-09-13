import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { getSiteAssets } from '../utils/siteAssets'

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
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [siteAssets, setSiteAssets] = useState(getSiteAssets())

  useEffect(() => {
    fetchFeaturedProducts()
    const handleAssetsUpdate = () => setSiteAssets(getSiteAssets())
    window.addEventListener('vaerox_site_assets_updated', handleAssetsUpdate)
    return () => window.removeEventListener('vaerox_site_assets_updated', handleAssetsUpdate)
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
      } else {
        setError('Failed to fetch featured items')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred loading products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] w-full overflow-x-hidden select-none">
      {/* Hero Banner Section */}
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 pt-2 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BannerCarousel />
        </motion.div>
      </section>

      {/* ═══ VÆROX CUSTOM STITCH & BESPOKE ATELIER SECTION ═══ */}
      <section className="py-12 md:py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
        >
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40 uppercase mb-3 shadow-[0_0_15px_rgba(201,168,76,0.15)] font-serif"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
            <span>VÆROX BESPOKE CRAFTSMANSHIP</span>
          </motion.span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#FFF5D6] font-serif tracking-tight mb-4 uppercase">
            THE ART OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]">CUSTOM STITCH</span>
          </h2>
          
          <p className="text-[#E8E0CC]/80 text-xs sm:text-base max-w-2xl mx-auto font-light leading-relaxed tracking-wide font-sans">
            Every VÆROX garment is custom stitched by master artisans, sculpted to your exact body posture, chest drop, and personal executive identity.
          </p>
        </motion.div>

        {/* Animated Points & Motion Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Point 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-gradient-to-b from-[#0D0C0A] via-[#11100D] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] p-6 sm:p-8 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-[0_0_35px_rgba(201,168,76,0.2)] flex flex-col justify-between overflow-hidden"
          >
            {/* Animated Golden Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-full blur-2xl group-hover:bg-[#C9A84C]/20 transition-all duration-500 pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-serif font-black text-[#C9A84C]/40 group-hover:text-[#C9A84C] transition-colors">01</span>
                <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black border border-[#C9A84C]/30 uppercase font-sans">
                  HAND CRAFTED
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#FFF5D6] font-serif uppercase tracking-wide mb-3 group-hover:text-[#C9A84C] transition-colors">
                Hand-Crafted Custom Stitching
              </h3>
              <p className="text-xs sm:text-sm text-[#E8E0CC]/70 font-light leading-relaxed mb-6 font-sans">
                Over 80+ hours of hand-stitching by senior master tailors ensure that every seam, shoulder canvas, and lapel rolls with natural flexibility and lifetime structure.
              </p>
            </div>

            <div className="pt-4 border-t border-[#26241E] flex items-center justify-between text-xs font-semibold text-[#C9A84C] font-sans">
              <span className="tracking-wider uppercase text-[10px]">Zero Glue • Full Canvas</span>
              <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </motion.div>

          {/* Point 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-gradient-to-b from-[#0D0C0A] via-[#11100D] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] p-6 sm:p-8 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-[0_0_35px_rgba(201,168,76,0.2)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-full blur-2xl group-hover:bg-[#C9A84C]/20 transition-all duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-serif font-black text-[#C9A84C]/40 group-hover:text-[#C9A84C] transition-colors">02</span>
                <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black border border-[#C9A84C]/30 uppercase font-sans">
                  3D CONTOUR
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#FFF5D6] font-serif uppercase tracking-wide mb-3 group-hover:text-[#C9A84C] transition-colors">
                3D Body Contour & Patterning
              </h3>
              <p className="text-xs sm:text-sm text-[#E8E0CC]/70 font-light leading-relaxed mb-6 font-sans">
                We craft individual paper patterns for your unique stance, drop, and shoulder slope. The garment wraps around your body like a second skin with zero restriction.
              </p>
            </div>

            <div className="pt-4 border-t border-[#26241E] flex items-center justify-between text-xs font-semibold text-[#C9A84C] font-sans">
              <span className="tracking-wider uppercase text-[10px]">Bespoke Measurement Fit</span>
              <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </motion.div>

          {/* Point 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-gradient-to-b from-[#0D0C0A] via-[#11100D] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] p-6 sm:p-8 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-[0_0_35px_rgba(201,168,76,0.2)] flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-full blur-2xl group-hover:bg-[#C9A84C]/20 transition-all duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-serif font-black text-[#C9A84C]/40 group-hover:text-[#C9A84C] transition-colors">03</span>
                <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black border border-[#C9A84C]/30 uppercase font-sans">
                  LUXURY TEXTILES
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#FFF5D6] font-serif uppercase tracking-wide mb-3 group-hover:text-[#C9A84C] transition-colors">
                Superfine Italian Wools & Silks
              </h3>
              <p className="text-xs sm:text-sm text-[#E8E0CC]/70 font-light leading-relaxed mb-6 font-sans">
                Hand-selected Super 150s Merino wools, pure Mulberry silk linings, and genuine horn buttons imported from Biella and Savile Row mills.
              </p>
            </div>

            <div className="pt-4 border-t border-[#26241E] flex items-center justify-between text-xs font-semibold text-[#C9A84C] font-sans">
              <span className="tracking-wider uppercase text-[10px]">Pure Natural Fibers</span>
              <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>

        {/* Highlighted Banner & CTA for Custom Stitch Clothes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-[#C9A84C]/60 bg-gradient-to-r from-[#0F0E0B] via-[#1A1710] to-[#0A0A0A] p-6 sm:p-10 md:p-12 shadow-[0_0_40px_rgba(201,168,76,0.25)] flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Ambient Lighting FX */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.25em] text-[#C9A84C] bg-black border border-[#C9A84C]/40 uppercase font-sans">
              VÆROX BESPOKE ATELIER
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight leading-tight">
              EXPERIENCE THE VÆROX <span className="text-[#C9A84C]">CUSTOM STITCH</span> DIFFERENCE
            </h3>
            <p className="text-xs sm:text-base text-[#E8E0CC]/80 font-light leading-relaxed font-sans">
              Step into the world of tailor-made excellence. Choose between Men's Wear & Women's Wear, then explore VÆROX Standard or VÆROX Luxury for executive personas like CEO, Lawyer, Doctor, and more.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full sm:w-auto">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.2em] uppercase hover:scale-105 hover:shadow-[0_0_35px_rgba(201,168,76,0.6)] transition-all duration-300 shadow-2xl font-sans"
            >
              <span>EXPLORE CUSTOM CLOTHES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ 2.5 VÆROX BESPOKE TAILORING (COMPACT & ANIMATED SHOWCASE) ═══ */}
      <section className="py-8 md:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
              <span className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans">
                ✓ 100% Bespoke Fit
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans">
                ✦ 80+ Hours Hand Stitching
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/60 border border-[#C9A84C]/30 text-[10px] sm:text-xs font-semibold text-[#FFF5D6] tracking-wider uppercase font-sans">
                ★ Italian Loro Piana Wools
              </span>
            </div>
          </div>

          {/* Right Action Call Button */}
          <div className="relative z-10 shrink-0 w-full sm:w-auto">
            <div>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_30px_rgba(201,168,76,0.6)] transition-all duration-300 shadow-xl font-sans"
              >
                <span>BOOK BESPOKE FITTING</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
