import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  Headphones,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { BannerCarousel } from '../components/homepage/BannerCarousel'
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

  // Interactive Bespoke Fitting Slider States:
  const [isBespokeSliderOpen, setIsBespokeSliderOpen] = useState(false)
  const [bespokeStep, setBespokeStep] = useState('main') // 'main' | 'gender' | 'tier'
  const [selectedBespokeGender, setSelectedBespokeGender] = useState('men')

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

  const handleBookBespokeClick = () => {
    setIsBespokeSliderOpen((prev) => !prev)
    setBespokeStep('main')
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

      {/* ═══ HANDMADE HAUTE COUTURE BESPOKE TAILORING SECTION WITH SMOOTH SLIDER CARDS ═══ */}
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
            <button
              onClick={handleBookBespokeClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_30px_rgba(201,168,76,0.6)] transition-all duration-300 shadow-xl font-sans cursor-pointer"
            >
              <span>{isBespokeSliderOpen ? 'CLOSE OPTIONS' : 'BOOK BESPOKE FITTING'}</span>
              <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isBespokeSliderOpen ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* ═══ SMOOTH SLIDER OPTIONS CONTAINER (JUST BELOW THE BANNER) ═══ */}
        <AnimatePresence>
          {isBespokeSliderOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 pt-4 border-t border-[#C9A84C]/30 overflow-hidden"
            >
              {/* STEP 1: TWO MAIN CARDS (Classic Clothes & VAEROX Premium) */}
              {bespokeStep === 'main' && (
                <motion.div
                  key="bespoke-main"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Card 1: Classic Clothes */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/products?mode=classic')}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#14120E] via-[#0F0E0B] to-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C] shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.classicCardImage === 'string' ? siteAssets.classicCardImage : siteAssets.classicCardImage?.url) || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80"}
                        alt="Classic Clothes"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/85 border border-[#C9A84C]/40 uppercase font-sans">
                          EVERYDAY REGULAR WEAR
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-wide mb-2 group-hover:text-[#C9A84C] transition-colors">
                          CLASSIC CLOTHES
                        </h3>
                        <p className="text-xs sm:text-sm text-[#E8E0CC]/75 font-light leading-relaxed mb-4 font-sans">
                          It is used for regular use and it includes all regular clothes. Click to view all clothes directly with instant sorting & filtering options.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between text-xs font-extrabold text-[#C9A84C] font-sans uppercase tracking-wider">
                        <span>EXPLORE ALL CLASSIC CLOTHES</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2: VAEROX Premium */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBespokeStep('gender')}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-[#1E190E] via-[#141008] to-[#0A0A0A] border border-[#C9A84C]/60 hover:border-[#C9A84C] shadow-xl hover:shadow-[0_0_35px_rgba(201,168,76,0.3)] transition-all duration-300 flex flex-col justify-between min-h-[320px]"
                  >
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      <img
                        src={(typeof siteAssets.premiumCardImage === 'string' ? siteAssets.premiumCardImage : siteAssets.premiumCardImage?.url) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"}
                        alt="VAEROX Premium"
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase font-sans">
                          BESPOKE HAUTE COUTURE
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-wide mb-2 group-hover:text-[#C9A84C] transition-colors">
                          VAEROX PREMIUM
                        </h3>
                        <p className="text-xs sm:text-sm text-[#E8E0CC]/80 font-light leading-relaxed mb-4 font-sans">
                          Explore VAEROX Standard (full pair custom stitch) & VAEROX Luxury (look-alike executive outfits like CEO, Manager, Teacher, Lawyer, Doctor, etc.).
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#26241E] flex items-center justify-between text-xs font-extrabold text-[#C9A84C] font-sans uppercase tracking-wider">
                        <span>CHOOSE MEN'S OR WOMEN'S</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* STEP 2: GENDER SELECTION (Men's vs Women's) */}
              {bespokeStep === 'gender' && (
                <motion.div
                  key="bespoke-gender"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setBespokeStep('main')}
                      className="text-xs font-extrabold text-[#C9A84C] hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      ← BACK TO MAIN OPTIONS
                    </button>
                    <span className="text-xs font-bold text-[#FFF5D6] uppercase tracking-widest font-serif">
                      VAEROX PREMIUM • SELECT GENDER
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Men's Option */}
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setSelectedBespokeGender('men')
                        setBespokeStep('tier')
                      }}
                      className="group rounded-2xl overflow-hidden bg-[#12100C] border border-[#C9A84C]/40 hover:border-[#C9A84C] cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <img
                          src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                          alt="Men's Wear"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12100C] via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h4 className="text-lg font-extrabold text-[#FFF5D6] font-serif uppercase group-hover:text-[#C9A84C]">
                          MEN'S WEAR
                        </h4>
                        <p className="text-xs text-[#E8E0CC]/70 mt-1 font-sans">
                          Bespoke suiting, double-breasted blazers & executive persona outfits.
                        </p>
                        <div className="mt-4 text-xs font-bold text-[#C9A84C] flex items-center gap-1 font-sans uppercase">
                          <span>SELECT MEN'S WEAR</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Women's Option */}
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setSelectedBespokeGender('women')
                        setBespokeStep('tier')
                      }}
                      className="group rounded-2xl overflow-hidden bg-[#12100C] border border-[#C9A84C]/40 hover:border-[#C9A84C] cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <img
                          src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"}
                          alt="Women's Wear"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12100C] via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h4 className="text-lg font-extrabold text-[#FFF5D6] font-serif uppercase group-hover:text-[#C9A84C]">
                          WOMEN'S WEAR
                        </h4>
                        <p className="text-xs text-[#E8E0CC]/70 mt-1 font-sans">
                          Atelier evening gowns, executive pant-suits & bespoke persona couture.
                        </p>
                        <div className="mt-4 text-xs font-bold text-[#C9A84C] flex items-center gap-1 font-sans uppercase">
                          <span>SELECT WOMEN'S WEAR</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: TIER SELECTION (VAEROX Standard vs VAEROX Luxury) */}
              {bespokeStep === 'tier' && (
                <motion.div
                  key="bespoke-tier"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setBespokeStep('gender')}
                      className="text-xs font-extrabold text-[#C9A84C] hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer font-sans"
                    >
                      ← BACK TO GENDER SELECTION
                    </button>
                    <span className="text-xs font-bold text-[#FFF5D6] uppercase tracking-widest font-serif">
                      VAEROX PREMIUM • {selectedBespokeGender.toUpperCase()}'S WEAR
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: VAEROX Standard */}
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => navigate(`/products?category=${selectedBespokeGender}&tier=standard`)}
                      className="group rounded-2xl overflow-hidden bg-[#12100C] border border-[#C9A84C]/40 hover:border-[#C9A84C] cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="h-44 relative overflow-hidden">
                        <img
                          src={(typeof siteAssets.standardTierCardImage === 'string' ? siteAssets.standardTierCardImage : siteAssets.standardTierCardImage?.url) || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"}
                          alt="VAEROX Standard"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12100C] via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded text-[9px] font-bold text-[#C9A84C] bg-black border border-[#C9A84C]/30 uppercase font-mono">
                            TIER 01 • BESPOKE STANDARD
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="text-xl font-extrabold text-[#FFF5D6] font-serif uppercase group-hover:text-[#C9A84C] mb-2">
                          VAEROX STANDARD
                        </h4>
                        <p className="text-xs text-[#E8E0CC]/80 font-light leading-relaxed mb-4 font-sans">
                          All premium clothes, full pair outfits, and custom stitch tailored with your exact body measurements.
                        </p>
                        <div className="pt-3 border-t border-[#26241E] text-xs font-extrabold text-[#C9A84C] flex items-center justify-between uppercase font-sans">
                          <span>VIEW VAEROX STANDARD</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 2: VAEROX Luxury */}
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => navigate(`/products?category=${selectedBespokeGender}&tier=luxury`)}
                      className="group rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C170D] to-[#0A0A0A] border border-[#C9A84C] hover:border-[#FFF5D6] cursor-pointer transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div className="h-44 relative overflow-hidden">
                        <img
                          src={(typeof siteAssets.luxuryTierCardImage === 'string' ? siteAssets.luxuryTierCardImage : siteAssets.luxuryTierCardImage?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"}
                          alt="VAEROX Luxury"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C170D] via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded text-[9px] font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase font-mono">
                            TIER 02 • EXECUTIVE LUXURY
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="text-xl font-extrabold text-[#FFF5D6] font-serif uppercase group-hover:text-[#C9A84C] mb-2">
                          VAEROX LUXURY
                        </h4>
                        <p className="text-xs text-[#E8E0CC]/80 font-light leading-relaxed mb-4 font-sans">
                          Look-alike executive persona outfits (CEO outfit, Manager outfit, Teacher outfit, Lawyer outfit, Doctor outfit, etc.) with custom stitching.
                        </p>
                        <div className="pt-3 border-t border-[#26241E] text-xs font-extrabold text-[#C9A84C] flex items-center justify-between uppercase font-sans">
                          <span>VIEW EXECUTIVE PERSONAS</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══ DELIVERY, SUPPORT, QUALITY & PAYMENT DETAILS SECTION ═══ */}
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
            viewport={{ once: true, margin: '-40px' }}
          >
            {serviceFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="p-5 sm:p-6 rounded-2xl bg-[#0F0E0C] border border-[#26241E] hover:border-[#C9A84C]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-3 p-3 rounded-xl bg-black w-fit border border-[#26241E]">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-[#FFF5D6] font-serif mb-1 uppercase">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#E8E0CC]/70 font-light leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <FAQSection />
    </div>
  )
}

export default NewHome
