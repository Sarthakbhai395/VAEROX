import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  Headphones,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Scissors,
  Crown,
  Award,
  ChevronRight,
  ChevronLeft,
  Check,
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

      {/* ═══ HANDMADE HAUTE COUTURE BESPOKE ATELIER UNIFIED SECTION ═══ */}
      <section className="py-6 sm:py-10 md:py-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-[#C9A84C]/50 bg-gradient-to-b from-[#14120D] via-[#0E0C09] to-[#070605] shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(201,168,76,0.18)]"
        >
          {/* Animated Ambient Gold Glow Orbs */}
          <motion.div
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-80 h-80 bg-[#C9A84C]/20 rounded-full blur-[90px] pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 -right-24 w-80 h-80 bg-[#C9A84C]/15 rounded-full blur-[90px] pointer-events-none"
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent pointer-events-none" />

          {/* Top Hero / Header Portion */}
          <div className={`relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 ${isBespokeSliderOpen ? 'pb-3 sm:pb-4' : ''}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:gap-8">
              {/* Left / Main Text Block */}
              <div className="flex-1 text-left space-y-3.5 sm:space-y-4">
                {/* Modern Pill Tag with Pulsing Gold Dot */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#FFF5D6] bg-black/70 border border-[#C9A84C]/50 backdrop-blur-md shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A84C]"></span>
                  </span>
                  <span>Crafted for distinction • 100% Bespoke tailoring</span>
                </div>

                {/* Main Heading */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-[#FFF5D6] leading-[1.2]">
                  Handmade Haute Couture{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#E8B84B]">
                    Custom Tailored
                  </span>{' '}
                  For You
                </h2>

                {/* Subtitle description */}
                <p className="text-xs sm:text-sm md:text-[15px] text-[#E8E0CC]/85 font-normal leading-relaxed max-w-2xl">
                  Every garment is master-measured, hand-cut from premier Italian Loro Piana wools & silks, and handcrafted over 80+ hours of artisan tailoring for unmatched elegance.
                </p>

                {/* Feature Chips with Micro-Icons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-[#C9A84C]/35 text-xs font-medium text-[#FFF5D6] backdrop-blur-sm">
                    <Scissors className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>100% Bespoke fit</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-[#C9A84C]/35 text-xs font-medium text-[#FFF5D6] backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>80+ Hours hand stitching</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-[#C9A84C]/35 text-xs font-medium text-[#FFF5D6] backdrop-blur-sm">
                    <Award className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>Italian Loro Piana wools</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-[#C9A84C]/35 text-xs font-medium text-[#FFF5D6] backdrop-blur-sm">
                    <Crown className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>Executive personas</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 shrink-0 w-full sm:w-auto pt-2 lg:pt-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBookBespokeClick}
                  className={`w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl md:rounded-full font-bold text-sm transition-all duration-300 shadow-2xl cursor-pointer ${
                    isBespokeSliderOpen
                      ? 'bg-black/90 text-[#FFF5D6] border-2 border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.35)] hover:bg-[#C9A84C]/20'
                      : 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black hover:shadow-[0_0_35px_rgba(201,168,76,0.65)]'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 transition-transform duration-300 ${isBespokeSliderOpen ? 'text-[#C9A84C] rotate-180' : 'text-black'}`} />
                  <span>{isBespokeSliderOpen ? 'Close atelier studio' : 'Book bespoke fitting'}</span>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isBespokeSliderOpen ? 'rotate-90 text-[#C9A84C]' : 'group-hover:translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </div>

          {/* ═══ EXPANDABLE BESPOKE ATELIER STUDIO (ONE UNIFIED SECTION) ═══ */}
          <AnimatePresence>
            {isBespokeSliderOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 sm:px-8 md:px-10 lg:px-12 pt-0 pb-6 sm:pb-10 relative">
                  {/* Subtle Grid Accent Pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Modern Stepper / Progress Breadcrumbs */}
                  <div className="relative z-10 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setBespokeStep('main')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          bespokeStep === 'main'
                            ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black shadow-[0_0_15px_rgba(201,168,76,0.45)]'
                            : 'bg-black/60 text-[#C9A84C] border border-[#C9A84C]/40 hover:text-[#FFF5D6]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">1</span>
                        <span>Atelier suite</span>
                      </button>

                      <ChevronRight className="w-3.5 h-3.5 text-[#C9A84C]/50" />

                      <button
                        onClick={() => bespokeStep === 'tier' && setBespokeStep('gender')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          bespokeStep === 'gender'
                            ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black shadow-[0_0_15px_rgba(201,168,76,0.45)]'
                            : bespokeStep === 'tier'
                            ? 'bg-black/60 text-[#C9A84C] border border-[#C9A84C]/40 hover:text-[#FFF5D6] cursor-pointer'
                            : 'bg-black/30 text-[#A39E93]/60 border border-[#26241E] cursor-default'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">2</span>
                        <span>Gender</span>
                      </button>

                      <ChevronRight className="w-3.5 h-3.5 text-[#C9A84C]/50" />

                      <div
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          bespokeStep === 'tier'
                            ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black shadow-[0_0_15px_rgba(201,168,76,0.45)]'
                            : 'bg-black/30 text-[#A39E93]/60 border border-[#26241E]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">3</span>
                        <span>Signature tier</span>
                      </div>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-2 text-xs text-[#C9A84C] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
                      <span>
                        {bespokeStep === 'main' && 'Step 1: Explore bespoke suite'}
                        {bespokeStep === 'gender' && 'Step 2: Select gender collection'}
                        {bespokeStep === 'tier' && `Step 3: ${selectedBespokeGender === 'men' ? "Men's" : "Women's"} signature tier`}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* STEP 1: MAIN CARD (VAEROX LUXURY & STANDARD) */}
                    {bespokeStep === 'main' && (
                      <motion.div
                        key="bespoke-step-main"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                      >
                        <motion.div
                          whileHover={{ y: -3, scale: 1.005 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => setBespokeStep('gender')}
                          className="group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-black/40 hover:bg-black/60 shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-500 flex flex-col md:flex-row items-stretch"
                        >
                          {/* Left: Image with seamless edge blend */}
                          <div className="relative w-full md:w-[46%] min-h-[240px] md:min-h-[300px] overflow-hidden shrink-0 bg-[#0F0D09]">
                            <img
                              src={(typeof siteAssets.premiumCardImage === 'string' ? siteAssets.premiumCardImage : siteAssets.premiumCardImage?.url) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=75"}
                              alt="Vaerox Luxury & Standard Atelier"
                              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0D09]/50 to-[#0F0D09] pointer-events-none" />
                            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D09] via-[#0F0D09]/40 to-transparent pointer-events-none" />
                            <div className="absolute top-4 left-4 z-10">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] shadow-lg">
                                <Crown className="w-3 h-3 text-black" />
                                Bespoke haute couture
                              </span>
                            </div>
                          </div>

                          {/* Right: Text Content */}
                          <div className="relative flex-1 p-6 sm:p-7 md:p-8 bg-[#0F0D09] flex flex-col justify-between z-10 md:-ml-1">
                            <div>
                              <div className="inline-block text-xs font-semibold text-[#C9A84C] mb-2">
                                Exclusive personas & full pair bespoke
                              </div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFF5D6] mb-3 group-hover:text-[#C9A84C] transition-colors">
                                Vaerox Luxury & Standard
                              </h3>
                              <p className="text-xs sm:text-sm text-[#E8E0CC]/85 font-normal leading-relaxed mb-5">
                                Explore <strong className="text-[#FFF5D6] font-semibold">Vaerox Standard</strong> (full pair custom stitch tailored to your exact measurements) & <strong className="text-[#C9A84C] font-semibold">Vaerox Luxury</strong> (look-alike executive persona outfits for CEOs, Managers, Teachers, Lawyers, Doctors, and Artists).
                              </p>

                              {/* Highlight chips */}
                              <div className="grid grid-cols-2 gap-2 mb-5">
                                <div className="p-2.5 rounded-xl bg-black/60 border border-[#C9A84C]/25 text-xs text-[#FFF5D6] font-medium flex items-center gap-2">
                                  <Scissors className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                                  <span>Custom measure stitch</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-black/60 border border-[#C9A84C]/25 text-xs text-[#FFF5D6] font-medium flex items-center gap-2">
                                  <Crown className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                                  <span>6+ Executive personas</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-[#C9A84C]/25 flex items-center justify-between text-xs sm:text-sm font-bold text-[#C9A84C] group-hover:text-[#FFF5D6] transition-colors">
                              <span className="flex items-center gap-2">
                                <span>Select gender collection</span>
                                <span className="text-xs text-[#C9A84C]/70">(Men's & Women's)</span>
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 group-hover:bg-[#C9A84C] group-hover:text-black flex items-center justify-center transition-all duration-300">
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* STEP 2: GENDER SELECTION (Men's vs Women's) */}
                    {bespokeStep === 'gender' && (
                      <motion.div
                        key="bespoke-step-gender"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4 max-w-6xl mx-auto"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => setBespokeStep('main')}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#C9A84C] hover:text-[#FFF5D6] bg-black/50 border border-[#C9A84C]/30 hover:border-[#C9A84C] cursor-pointer transition-all duration-200"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back to atelier</span>
                          </button>
                          <span className="text-xs font-semibold text-[#FFF5D6] hidden sm:inline-block">
                            Vaerox premium • Select gender
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                          {/* Men's Option */}
                          <motion.div
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                              setSelectedBespokeGender('men')
                              setBespokeStep('tier')
                            }}
                            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0F0D09] border border-[#C9A84C]/40 hover:border-[#C9A84C] shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] cursor-pointer transition-all duration-500 flex flex-col sm:flex-row items-stretch"
                          >
                            <div className="relative w-full sm:w-[44%] min-h-[200px] sm:min-h-[240px] overflow-hidden shrink-0 bg-[#0F0D09]">
                              <img
                                src={(typeof siteAssets.homeMensCard === 'string' ? siteAssets.homeMensCard : siteAssets.homeMensCard?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=75"}
                                alt="Men's Wear"
                                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0D09]/40 to-[#0F0D09] pointer-events-none" />
                              <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D09] via-[#0F0D09]/40 to-transparent pointer-events-none" />
                              <div className="absolute top-3.5 left-3.5 z-10">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] shadow-md">
                                  Gentlemen's atelier
                                </span>
                              </div>
                            </div>
                            <div className="relative flex-1 p-5 sm:p-6 bg-[#0F0D09] flex flex-col justify-between z-10 sm:-ml-1">
                              <div>
                                <h4 className="text-xl sm:text-2xl font-bold text-[#FFF5D6] group-hover:text-[#C9A84C] transition-colors mb-2">
                                  Men's wear
                                </h4>
                                <p className="text-xs sm:text-[13px] text-[#E8E0CC]/80 font-normal leading-relaxed mb-3">
                                  Bespoke suiting, double-breasted blazers, sharp tuxedo styling & executive persona outfits.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Suiting</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Blazers</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Tuxedos</span>
                                </div>
                              </div>
                              <div className="mt-4 pt-3.5 border-t border-[#C9A84C]/20 text-xs font-bold text-[#C9A84C] group-hover:text-[#FFF5D6] transition-colors flex items-center justify-between">
                                <span>Select men's wear</span>
                                <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 group-hover:bg-[#C9A84C] group-hover:text-black flex items-center justify-center transition-all duration-300">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Women's Option */}
                          <motion.div
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                              setSelectedBespokeGender('women')
                              setBespokeStep('tier')
                            }}
                            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0F0D09] border border-[#C9A84C]/40 hover:border-[#C9A84C] shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] cursor-pointer transition-all duration-500 flex flex-col sm:flex-row items-stretch"
                          >
                            <div className="relative w-full sm:w-[44%] min-h-[200px] sm:min-h-[240px] overflow-hidden shrink-0 bg-[#0F0D09]">
                              <img
                                src={(typeof siteAssets.homeWomensCard === 'string' ? siteAssets.homeWomensCard : siteAssets.homeWomensCard?.url) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=75"}
                                alt="Women's Wear"
                                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0D09]/40 to-[#0F0D09] pointer-events-none" />
                              <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D09] via-[#0F0D09]/40 to-transparent pointer-events-none" />
                              <div className="absolute top-3.5 left-3.5 z-10">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] shadow-md">
                                  Women's couture
                                </span>
                              </div>
                            </div>
                            <div className="relative flex-1 p-5 sm:p-6 bg-[#0F0D09] flex flex-col justify-between z-10 sm:-ml-1">
                              <div>
                                <h4 className="text-xl sm:text-2xl font-bold text-[#FFF5D6] group-hover:text-[#C9A84C] transition-colors mb-2">
                                  Women's wear
                                </h4>
                                <p className="text-xs sm:text-[13px] text-[#E8E0CC]/80 font-normal leading-relaxed mb-3">
                                  Atelier evening gowns, executive pant-suits, sculpted velvet blazers & bespoke persona couture.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Gowns</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Pant-suits</span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-black/60 border border-[#C9A84C]/20 text-xs text-[#C9A84C]">Velvet blazers</span>
                                </div>
                              </div>
                              <div className="mt-4 pt-3.5 border-t border-[#C9A84C]/20 text-xs font-bold text-[#C9A84C] group-hover:text-[#FFF5D6] transition-colors flex items-center justify-between">
                                <span>Select women's wear</span>
                                <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 group-hover:bg-[#C9A84C] group-hover:text-black flex items-center justify-center transition-all duration-300">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: TIER SELECTION (VAEROX Standard vs VAEROX Luxury) */}
                    {bespokeStep === 'tier' && (
                      <motion.div
                        key="bespoke-step-tier"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4 max-w-6xl mx-auto"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => setBespokeStep('gender')}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#C9A84C] hover:text-[#FFF5D6] bg-black/50 border border-[#C9A84C]/30 hover:border-[#C9A84C] cursor-pointer transition-all duration-200"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back to gender selection</span>
                          </button>
                          <span className="text-xs font-semibold text-[#FFF5D6] hidden sm:inline-block">
                            Vaerox premium • {selectedBespokeGender === 'men' ? "Men's" : "Women's"} wear
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                          {/* Card 1: VAEROX Standard */}
                          <motion.div
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => navigate(`/products?category=${selectedBespokeGender}&tier=standard`)}
                            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0F0D09] border border-[#C9A84C]/40 hover:border-[#C9A84C] shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] cursor-pointer transition-all duration-500 flex flex-col sm:flex-row items-stretch"
                          >
                            <div className="relative w-full sm:w-[44%] min-h-[200px] sm:min-h-[240px] overflow-hidden shrink-0 bg-[#0F0D09]">
                              <img
                                src={(typeof siteAssets.standardTierCardImage === 'string' ? siteAssets.standardTierCardImage : siteAssets.standardTierCardImage?.url) || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=75"}
                                alt="Vaerox Standard"
                                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0D09]/40 to-[#0F0D09] pointer-events-none" />
                              <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D09] via-[#0F0D09]/40 to-transparent pointer-events-none" />
                              <div className="absolute top-3.5 left-3.5 z-10">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-[#C9A84C] bg-black/90 border border-[#C9A84C]/50 shadow-md">
                                  Tier 01 • Bespoke standard
                                </span>
                              </div>
                            </div>
                            <div className="relative flex-1 p-5 sm:p-6 bg-[#0F0D09] flex flex-col justify-between z-10 sm:-ml-1">
                              <div>
                                <h4 className="text-xl sm:text-2xl font-bold text-[#FFF5D6] group-hover:text-[#C9A84C] transition-colors mb-2">
                                  Vaerox Standard
                                </h4>
                                <p className="text-xs sm:text-[13px] text-[#E8E0CC]/80 font-normal leading-relaxed mb-3">
                                  All premium clothes, full pair outfits, and custom stitch tailored with your exact body measurements.
                                </p>
                                <ul className="space-y-1.5 mb-3 text-xs text-[#E8E0CC]/75">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[#C9A84C]" />
                                    <span>Exact body measurement tailoring</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[#C9A84C]" />
                                    <span>Curated Italian & European textiles</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="mt-4 pt-3.5 border-t border-[#C9A84C]/20 text-xs font-bold text-[#C9A84C] group-hover:text-[#FFF5D6] transition-colors flex items-center justify-between">
                                <span>View Vaerox Standard</span>
                                <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 group-hover:bg-[#C9A84C] group-hover:text-black flex items-center justify-center transition-all duration-300">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Card 2: VAEROX Luxury */}
                          <motion.div
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => navigate(`/products?category=${selectedBespokeGender}&tier=luxury`)}
                            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0F0D09] border-2 border-[#C9A84C] hover:border-[#FFF5D6] shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_0_45px_rgba(201,168,76,0.45)] cursor-pointer transition-all duration-500 flex flex-col sm:flex-row items-stretch"
                          >
                            <div className="relative w-full sm:w-[44%] min-h-[200px] sm:min-h-[240px] overflow-hidden shrink-0 bg-[#0F0D09]">
                              <img
                                src={(typeof siteAssets.luxuryTierCardImage === 'string' ? siteAssets.luxuryTierCardImage : siteAssets.luxuryTierCardImage?.url) || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=75"}
                                alt="Vaerox Luxury"
                                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0F0D09]/40 to-[#0F0D09] pointer-events-none" />
                              <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D09] via-[#0F0D09]/40 to-transparent pointer-events-none" />
                              <div className="absolute top-3.5 left-3.5 z-10">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] shadow-md">
                                  <Crown className="w-3 h-3 text-black" />
                                  Tier 02 • Executive luxury
                                </span>
                              </div>
                            </div>
                            <div className="relative flex-1 p-5 sm:p-6 bg-[#0F0D09] flex flex-col justify-between z-10 sm:-ml-1">
                              <div>
                                <h4 className="text-xl sm:text-2xl font-bold text-[#FFF5D6] group-hover:text-[#C9A84C] transition-colors mb-2">
                                  Vaerox Luxury
                                </h4>
                                <p className="text-xs sm:text-[13px] text-[#E8E0CC]/80 font-normal leading-relaxed mb-3">
                                  Look-alike executive persona outfits with custom stitching and artisan bespoke detailing.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {['CEO', 'Manager', 'Teacher', 'Lawyer', 'Doctor', 'Artist'].map((persona) => (
                                    <span key={persona} className="px-2.5 py-0.5 rounded-md bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-xs font-medium text-[#FFF5D6]">
                                      {persona}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-4 pt-3.5 border-t border-[#C9A84C]/30 text-xs font-bold text-[#C9A84C] group-hover:text-[#FFF5D6] transition-colors flex items-center justify-between">
                                <span>View executive personas</span>
                                <div className="w-7 h-7 rounded-full bg-[#C9A84C] text-black flex items-center justify-center transition-all duration-300">
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 mb-2 sm:mb-3">
              The Værox Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#FFF5D6]">
              Bespoke Client Experience
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
                <h3 className="text-base font-bold text-[#FFF5D6] mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#E8E0CC]/75 font-normal leading-relaxed">
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
