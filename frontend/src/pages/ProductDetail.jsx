import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { formatCurrency } from '../utils/format'
import { getProductImageUrl } from '../utils/imageUrl'
import ProductCard from '../components/product/ProductCard'
import {
  ShoppingBag,
  Heart,
  Ruler,
  ShieldCheck,
  Truck,
  X,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Feather,
  Award
} from 'lucide-react'

// Alpha & Numeric Size Options
const ALPHA_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const NUMERIC_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42', '44']

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Size states
  const [sizeType, setSizeType] = useState('alpha') // 'alpha' | 'numeric' | 'custom'
  const [selectedSize, setSelectedSize] = useState('L')
  const [showSizeModal, setShowSizeModal] = useState(false)

  // Custom Fit Measurement States
  const [customMeasurements, setCustomMeasurements] = useState({
    chest: '40',
    shoulder: '18',
    waist: '34',
    thigh: '24',
    torso: '29',
    hips: '38',
    fitPreference: 'Tailored'
  })
  const [showCustomFitForm, setShowCustomFitForm] = useState(false)

  // Image Zoom & Lightbox States
  const [showLightbox, setShowLightbox] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isHovering: false })

  const handleImageMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y, isHovering: true })
  }

  const handleImageMouseLeave = () => {
    setZoomPos({ x: 50, y: 50, isHovering: false })
  }

  const handleCustomMeasurementChange = (e) => {
    const { name, value } = e.target
    setCustomMeasurements(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Active info tab: 'materials' | 'benefits' | 'description' | 'care'
  const [activeInfoTab, setActiveInfoTab] = useState('materials')

  // Product FAQ open index
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Related Category Products for "You May Also Like" slider
  const [relatedProducts, setRelatedProducts] = useState([])
  const sliderRef = useRef(null)

  const { addToCart, clearCart, loading: cartLoading } = useCart()
  const { addToWishlist, isInWishlist, loading: wishlistLoading } = useWishlist()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    fetchProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProductById(id)

      if (response && response.success) {
        const prodData = response.data || response.product
        setProduct(prodData)
        fetchRelatedProducts(prodData)
      } else {
        setError('Product not found')
      }
    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError('An error occurred while fetching the product')
    } finally {
      setLoading(false)
    }
  }

  // Fetch related products for slider
  const fetchRelatedProducts = async (currentProd) => {
    try {
      const res = await productAPI.getProducts()
      if (res && res.success) {
        const all = res.data || res.products || []
        const currId = currentProd._id || currentProd.id
        const filtered = all.filter(p => (p._id || p.id) !== currId && (p.gender === currentProd.gender || p.tier === currentProd.tier))
        setRelatedProducts(filtered.length > 0 ? filtered : all.filter(p => (p._id || p.id) !== currId))
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err)
    }
  }

  // Extract 4 sub-product images
  const getProductImages = (prod) => {
    if (!prod) return []
    const imagesList = []

    if (Array.isArray(prod.images) && prod.images.length > 0) {
      prod.images.forEach(img => {
        const resolved = getProductImageUrl(img)
        if (resolved && !imagesList.includes(resolved)) imagesList.push(resolved)
      })
    }

    const mainImg = getProductImageUrl(prod?.image)
    if (mainImg && !imagesList.includes(mainImg)) {
      imagesList.unshift(mainImg)
    }

    const fallbackAngles = [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80'
    ]

    while (imagesList.length < 4) {
      imagesList.push(fallbackAngles[imagesList.length % fallbackAngles.length])
    }

    return imagesList.slice(0, 4)
  }

  const images = getProductImages(product)

  // Slider Controls for "You May Also Like"
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      try {
        const isCustom = sizeType === 'custom' || selectedSize === 'Custom Fit'
        const productWithSize = {
          ...product,
          selectedSize: isCustom ? 'Custom Fit' : selectedSize,
          selectedSizeType: sizeType,
          customMeasurements: isCustom ? customMeasurements : null
        }
        await addToCart(productWithSize, quantity)
      } catch (err) {
        console.error('Failed to add to cart:', err)
      }
    }
  }

  const handleAddToWishlist = async () => {
    if (product) {
      try {
        await addToWishlist(product)
      } catch (err) {
        console.error('Failed to add to wishlist:', err)
      }
    }
  }

  const handleBuyNow = async () => {
    if (product) {
      try {
        const isCustom = sizeType === 'custom' || selectedSize === 'Custom Fit'
        const productWithSize = {
          ...product,
          selectedSize: isCustom ? 'Custom Fit' : selectedSize,
          selectedSizeType: sizeType,
          customMeasurements: isCustom ? customMeasurements : null
        }
        await clearCart()
        await addToCart(productWithSize, quantity)
        navigate('/checkout')
      } catch (err) {
        console.error('Failed to add to cart:', err)
      }
    }
  }

  const discountedPrice = product?.discount
    ? product.price * (1 - product.discount / 100)
    : product?.price

  // 5 Product FAQs
  const productFaqs = [
    {
      q: "How do I choose between Alpha (S-XXXL) and Waist (28-44) sizes?",
      a: "For suits, jackets, and blazers, we recommend selecting standard Alpha Sizes (S to XXXL). For trousers, tailored pants, and waist fittings, select Numeric Waist Sizes (28 to 44 Inches). Use our interactive Size Guide above for exact measurement breakdowns."
    },
    {
      q: "What materials & premium fabrics are crafted into this VÆROX garment?",
      a: "This luxury garment features 100% fine Merino wool blend weave, lined with smooth Mulberry satin silk. Handcrafted canvas interlining ensures structured drape, breathability, and natural temperature regulation."
    },
    {
      q: "What is the expected delivery timeframe and shipping policy?",
      a: "All VÆROX products ship within 24 to 48 hours in protective luxury garment packaging. Delivery takes 2-4 business days across major cities with live order tracking."
    },
    {
      q: "Can I request custom alterations or bespoke fitting adjustments?",
      a: "Yes! Every VÆROX garment includes generous complimentary seam margins. You can visit any VÆROX flagship atelier or request our complimentary at-home tailor adjustment service."
    },
    {
      q: "What is your return, exchange, and 100% satisfaction guarantee?",
      a: "We offer a 7-day hassle-free return & size exchange guarantee. If your size fit is not 100% perfect, our team will exchange it immediately free of shipping cost."
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#C9A84C] font-serif text-xs tracking-widest uppercase">Loading Product Details...</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md py-12">
          <h2 className="text-xl font-serif text-[#FFF5D6] mb-3">Product Unavailable</h2>
          <p className="text-xs text-[#A39E93] mb-6">{error || "The requested item is unavailable."}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-black font-extrabold text-xs uppercase tracking-wider"
          >
            Explore Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E8E0CC] py-8 md:py-14">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb Navigation (Clean & Frameless) */}
        <div className="mb-8 flex items-center gap-2 text-xs font-serif text-[#A39E93]">
          <span onClick={() => navigate('/products')} className="hover:text-[#C9A84C] cursor-pointer">PRODUCTS</span>
          <span>/</span>
          <span className="text-[#C9A84C] uppercase">{product.tier === 'premium' ? 'VÆROX PREMIUM' : 'STANDARD CLOTHES'}</span>
          <span>/</span>
          <span className="text-[#FFF5D6] truncate">{product.name}</span>
        </div>

        {/* ═══ TOP SECTION: OPEN FRAMELESS PRODUCT VIEW ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 items-start pb-16">

          {/* ─── LEFT COLUMN: COMPACT PRODUCT IMAGES ─── */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Main Compact Product Image Container with Interactive Mouse Zoom & Lightbox trigger */}
            <div 
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              onClick={() => setShowLightbox(true)}
              className="relative rounded-xl overflow-hidden bg-[#0D0C0A] h-72 sm:h-80 md:h-88 w-full max-w-sm mx-auto flex items-center justify-center group mb-4 shadow-xl cursor-zoom-in border border-[#26241E] hover:border-[#C9A84C]/50 transition-colors"
            >
              {product.discount > 0 && (
                <span className="absolute top-3 left-3 z-20 bg-[#C9A84C] text-black font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                  -{product.discount}% OFF
                </span>
              )}

              <span className="absolute bottom-3 right-3 z-20 bg-black/80 text-[#C9A84C] text-[9px] font-bold px-2 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-[#26241E] pointer-events-none flex items-center gap-1">
                🔍 Click to Expand Lightbox
              </span>

              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-200 ease-out"
                style={{
                  transform: zoomPos.isHovering ? 'scale(1.85)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
              />
            </div>

            {/* 4 Sub-Product Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden h-14 sm:h-16 w-full border transition-all duration-300 cursor-pointer bg-[#0D0C0A] ${selectedImageIndex === index
                      ? 'border-[#C9A84C] shadow-lg scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} Sub image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-[#C9A84C]/10 pointer-events-none rounded-lg" />
                  )}
                </button>
              ))}
            </div>

            {/* SIZE SELECTION & QUANTITY SECTION */}
            <div className="w-full max-w-sm mt-6 space-y-4 pt-4 border-t border-[#26241E]/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#C9A84C]" />
                  SELECT GARMENT FIT
                </label>

                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-[10px] font-bold text-[#C9A84C] hover:text-[#FFF5D6] uppercase tracking-wider underline cursor-pointer"
                >
                  Size Guide & Custom Fit
                </button>
              </div>

              {/* Size Type Switcher (Alpha vs Numeric vs Custom Fit) */}
              <div className="flex items-center justify-between pb-2 border-b border-[#26241E]/40 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSizeType('alpha')
                    setSelectedSize('L')
                  }}
                  className={`pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${sizeType === 'alpha'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#A39E93] hover:text-[#E8E0CC]'
                    }`}
                >
                  Alpha
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSizeType('numeric')
                    setSelectedSize('34')
                  }}
                  className={`pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${sizeType === 'numeric'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#A39E93] hover:text-[#E8E0CC]'
                    }`}
                >
                  Waist
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSizeType('custom')
                    setSelectedSize('Custom Fit')
                  }}
                  className={`pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1 ${sizeType === 'custom'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#A39E93] hover:text-[#E8E0CC]'
                    }`}
                >
                  <Feather className="w-3 h-3 text-[#C9A84C]" />
                  Custom Fit ✨
                </button>
              </div>

              {/* Alpha Size Buttons */}
              {sizeType === 'alpha' && (
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {ALPHA_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-extrabold uppercase rounded-lg transition-all border cursor-pointer ${selectedSize === sz
                          ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-md font-bold'
                          : 'bg-transparent text-[#E8E0CC] border-[#26241E] hover:border-[#C9A84C]/60'
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}

              {/* Numeric Size Buttons */}
              {sizeType === 'numeric' && (
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-9 pt-1">
                  {NUMERIC_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-extrabold uppercase rounded-lg transition-all border cursor-pointer ${selectedSize === sz
                          ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-md font-bold'
                          : 'bg-transparent text-[#E8E0CC] border-[#26241E] hover:border-[#C9A84C]/60'
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}

              {/* DYNAMIC ANIMATED CUSTOM MEASUREMENT FORM */}
              {sizeType === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0A0A0A] border border-[#C9A84C]/40 rounded-2xl p-4 shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#26241E]">
                    <span className="text-xs font-bold text-[#FFF5D6] uppercase tracking-wider font-serif flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#C9A84C]" />
                      YOUR PERSONAL BODY MEASUREMENTS (INCHES)
                    </span>
                    <span className="text-[9px] bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-0.5 rounded-full font-bold uppercase">
                      Bespoke Tailoring
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Chest / Bust (in)</label>
                      <input
                        type="number"
                        name="chest"
                        value={customMeasurements.chest}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 40"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Shoulder Width (in)</label>
                      <input
                        type="number"
                        name="shoulder"
                        value={customMeasurements.shoulder}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 18"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Waist Size (in)</label>
                      <input
                        type="number"
                        name="waist"
                        value={customMeasurements.waist}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 34"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Thigh Size (in)</label>
                      <input
                        type="number"
                        name="thigh"
                        value={customMeasurements.thigh}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 24"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Torso / Length (in)</label>
                      <input
                        type="number"
                        name="torso"
                        value={customMeasurements.torso}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 29"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Hips Size (in)</label>
                      <input
                        type="number"
                        name="hips"
                        value={customMeasurements.hips}
                        onChange={handleCustomMeasurementChange}
                        placeholder="e.g. 38"
                        className="w-full bg-[#121212] border border-[#26241E] rounded-lg px-2.5 py-1.5 text-[#FFF5D6] font-mono focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A39E93] font-serif uppercase block mb-1">Fit Preference</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Slim Fit', 'Tailored Fit', 'Relaxed Fit'].map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => setCustomMeasurements(prev => ({ ...prev, fitPreference: pref }))}
                          className={`py-1 text-[10px] font-bold rounded-lg transition-all border ${customMeasurements.fitPreference === pref
                              ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                              : 'bg-[#121212] text-[#A39E93] border-[#26241E]'
                            }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quantity */}
              <div className="pt-2 flex items-center justify-between">
                <label className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                  QUANTITY
                </label>
                <div className="flex items-center border border-[#26241E] rounded-lg overflow-hidden bg-[#0A0A0A]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-[#E8E0CC] hover:bg-[#1E1C17] transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-[#FFF5D6]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 text-[#E8E0CC] hover:bg-[#1E1C17] transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: OPEN PRODUCT DETAILS ─── */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Collection Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.25em] font-serif">
                  VÆROX BESPOKE ATELIER
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#FFF5D6] font-serif uppercase tracking-tight mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex text-[#C9A84C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                  ))}
                </div>
                <span className="text-[11px] text-[#A39E93] font-sans">4.9 (128 Bespoke Reviews)</span>
              </div>

              {/* Price Row */}
              <div className="mb-6 flex items-baseline gap-4 pb-4 border-b border-[#26241E]/40">
                {product.discount ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#FFF5D6] font-serif">
                      {formatCurrency(discountedPrice)}
                    </span>
                    <span className="text-base text-[#A39E93] line-through font-serif">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">
                      Save {product.discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-[#FFF5D6] font-serif">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Product Short Summary */}
              <p className="text-xs sm:text-sm text-[#E8E0CC]/80 leading-relaxed mb-6 font-light">
                {product.description || "Hand-tailored executive suit crafted from 100% fine Merino wool with Mulberry satin lining, engineered for impeccable silhouette and posture."}
              </p>
            </div>

            {/* ACTION BUTTONS (OPEN & CLEAN) */}
            <div className="space-y-3 pt-4 border-t border-[#26241E]/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={cartLoading}
                  className="py-3.5 px-6 rounded-xl bg-transparent border border-[#C9A84C] text-[#C9A84C] font-extrabold text-xs uppercase tracking-widest hover:bg-[#C9A84C] hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartLoading ? 'ADDING...' : 'ADD TO CART'}
                </motion.button>

                <motion.button
                  onClick={handleBuyNow}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={cartLoading}
                  className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                onClick={handleAddToWishlist}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={wishlistLoading}
                className={`w-full py-3 px-5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${isInWishlist(product._id || product.id)
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-transparent border-[#26241E] text-[#A39E93] hover:text-[#FFF5D6] hover:border-[#C9A84C]/40'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product._id || product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isInWishlist(product._id || product.id) ? 'WISHLISTED ITEM' : 'ADD TO ATELIER WISHLIST'}
              </motion.button>

              {/* ═══ ANIMATED INFO TABS (MATERIAL, BENEFITS, DESCRIPTION & CARE) ═══ */}
              <div className="pt-6 mt-6 border-t border-[#26241E]/40">
                {/* Tab Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-[#0A0A0A] p-1.5 rounded-xl border border-[#26241E]">
                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('materials')}
                    className={`py-2 px-2 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeInfoTab === 'materials'
                        ? 'bg-[#C9A84C] text-black shadow-md font-bold'
                        : 'text-[#A39E93] hover:text-[#FFF5D6] hover:bg-[#141414]'
                      }`}
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span className="truncate">Materials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('benefits')}
                    className={`py-2 px-2 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeInfoTab === 'benefits'
                        ? 'bg-[#C9A84C] text-black shadow-md font-bold'
                        : 'text-[#A39E93] hover:text-[#FFF5D6] hover:bg-[#141414]'
                      }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span className="truncate">Benefits</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('description')}
                    className={`py-2 px-2 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeInfoTab === 'description'
                        ? 'bg-[#C9A84C] text-black shadow-md font-bold'
                        : 'text-[#A39E93] hover:text-[#FFF5D6] hover:bg-[#141414]'
                      }`}
                  >
                    <span className="truncate">Description</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('care')}
                    className={`py-2 px-2 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeInfoTab === 'care'
                        ? 'bg-[#C9A84C] text-black shadow-md font-bold'
                        : 'text-[#A39E93] hover:text-[#FFF5D6] hover:bg-[#141414]'
                      }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="truncate">Care</span>
                  </button>
                </div>

                {/* Animated Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInfoTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#0A0A0A]/80 p-4 rounded-xl border border-[#26241E]/60 text-xs sm:text-sm leading-relaxed text-[#E8E0CC]/90 shadow-inner"
                  >
                    {activeInfoTab === 'materials' && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider mb-1 flex items-center gap-2 text-xs">
                            <Feather className="w-3.5 h-3.5 text-[#C9A84C]" />
                            Primary Shell Weave
                          </h4>
                          <p className="text-[#A39E93] text-xs leading-relaxed">
                            Crafted from 100% fine Merino wool blend with crease-resistant twisted yarn, delivering an immaculate drape and luxurious handfeel.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#26241E]/40">
                          <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider mb-1 flex items-center gap-2 text-xs">
                            Inner Lining & Lapel
                          </h4>
                          <p className="text-[#A39E93] text-xs leading-relaxed">
                            Lined with Mulberry satin silk for effortless friction-free layering, accompanied by hand-stitched horsehair canvas for lapel structure.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#26241E]/40">
                          <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider mb-1 flex items-center gap-2 text-xs">
                            <Award className="w-3.5 h-3.5 text-[#C9A84C]" />
                            Hardware & Trimmings
                          </h4>
                          <p className="text-[#A39E93] text-xs leading-relaxed">
                            Custom VÆROX gold crest horn buttons, reinforced armhole stitching, and interior executive passport/wallet pockets.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeInfoTab === 'benefits' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 text-[#C9A84C] text-[10px]">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider text-xs mb-0.5">Executive Fit</h4>
                            <p className="text-[#A39E93] text-[11px]">Engineered shoulder padding and tapered waist line.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 text-[#C9A84C] text-[10px]">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider text-xs mb-0.5">Travel Weave</h4>
                            <p className="text-[#A39E93] text-[11px]">Maintains sharp tailored creases through transit.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 text-[#C9A84C] text-[10px]">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider text-xs mb-0.5">Seam Margins</h4>
                            <p className="text-[#A39E93] text-[11px]">Extra internal margins for bespoke fitting modifications.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 text-[#C9A84C] text-[10px]">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider text-xs mb-0.5">Gold Hardware</h4>
                            <p className="text-[#A39E93] text-[11px]">Hand-engraved VÆROX crest gold horn buttons.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeInfoTab === 'description' && (
                      <div className="space-y-3 py-1">
                        <p className="text-[#E8E0CC]/90 leading-relaxed font-light text-xs sm:text-sm">
                          {product.description || "The VÆROX Executive Collection represents the pinnacle of modern tailoring. Each piece undergoes 48 precision hand operations, combining timeless heritage craftsmanship with contemporary silhouettes."}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-serif text-[#C9A84C] pt-3 border-t border-[#26241E]/40">
                          <div>SKU: <span className="text-[#FFF5D6]">{product._id?.substring(0, 8).toUpperCase() || 'VRX-849'}</span></div>
                          <div>Tier: <span className="text-[#FFF5D6]">{product.tier?.toUpperCase() || 'STANDARD'}</span></div>
                          <div>Gender: <span className="text-[#FFF5D6]">{product.gender?.toUpperCase() || 'MEN'}</span></div>
                          <div>Origin: <span className="text-[#FFF5D6]">Handcrafted Atelier</span></div>
                        </div>
                      </div>
                    )}

                    {activeInfoTab === 'care' && (
                      <div className="space-y-2 py-1">
                        <h4 className="font-serif font-bold text-[#FFF5D6] uppercase tracking-wider flex items-center gap-2 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                          Garment Maintenance Instructions
                        </h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A39E93]">
                          <li>Professional dry clean only. Do not machine wash or tumble dry.</li>
                          <li>Hang on wide wooden suit hangers between wears to maintain structure.</li>
                          <li>Use steam iron on low temperature with a protective pressing cloth.</li>
                          <li>Store in the provided breathable VÆROX garment carrier bag.</li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ OPEN SECTION: 5 PRODUCT FAQS (MINIMALIST ACCORDION) ═══ */}
        <div className="border-t border-[#26241E]/50 pt-12 mt-12 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#C9A84C]" />
            <h3 className="font-serif text-xl font-bold text-[#FFF5D6] uppercase tracking-wider">
              FREQUENTLY ASKED QUESTIONS
            </h3>
          </div>

          <div className="divide-y divide-[#26241E]/50 border-t border-b border-[#26241E]/50">
            {productFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left flex justify-between items-center text-xs sm:text-sm font-bold text-[#FFF5D6] uppercase tracking-wider font-serif cursor-pointer hover:text-[#C9A84C] transition-colors"
                  >
                    <span>{idx + 1}. {faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#C9A84C] transition-transform duration-300 flex-shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-[#A39E93] leading-relaxed pt-3 pr-6"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ "YOU MAY ALSO LIKE" ANIMATED CATEGORY CAROUSEL ═══ */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#26241E]/50 pt-12 mt-12 mb-16">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#26241E]/40">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block mb-1">
                  EXPLORE CATEGORY
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] uppercase tracking-tight">
                  YOU MAY ALSO LIKE
                </h3>
              </div>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollSlider('left')}
                  className="w-9 h-9 rounded-full bg-[#121212] border border-[#26241E] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-md"
                  aria-label="Previous Products"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  className="w-9 h-9 rounded-full bg-[#121212] border border-[#26241E] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-md"
                  aria-label="Next Products"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sliding Animation Container */}
            <div
              ref={sliderRef}
              className="flex items-center gap-6 overflow-x-auto pb-6 scrollbar-thin scroll-smooth"
            >
              {relatedProducts.map((relProd, index) => (
                <motion.div
                  key={relProd._id || relProd.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  className="w-64 sm:w-72 flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${relProd._id || relProd.id}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <ProductCard product={relProd} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </motion.div>

      {/* SIZE CHART MODAL */}
      <AnimatePresence>
        {showSizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-[#C9A84C]/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl text-[#E8E0CC] relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowSizeModal(false)}
                className="absolute top-5 right-5 text-[#A39E93] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-[#C9A84C]" />
                <h3 className="font-serif text-xl font-bold text-[#FFF5D6] uppercase tracking-wider">
                  VÆROX BESPOKE SIZE GUIDE
                </h3>
              </div>
              <p className="text-xs text-[#A39E93] mb-6">
                All measurements in inches.
              </p>

              {/* Alpha Table */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3 font-serif">
                  ALPHA FIT SIZES (S to XXXL)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#26241E]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#121212] text-[#C9A84C] uppercase text-[10px] tracking-wider font-serif">
                      <tr>
                        <th className="p-2.5 border-b border-[#26241E]">Size</th>
                        <th className="p-2.5 border-b border-[#26241E]">Chest</th>
                        <th className="p-2.5 border-b border-[#26241E]">Shoulder</th>
                        <th className="p-2.5 border-b border-[#26241E]">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26241E] bg-[#050505]">
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">S</td><td className="p-2.5">36-38"</td><td className="p-2.5">17.0"</td><td className="p-2.5">28.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">M</td><td className="p-2.5">38-40"</td><td className="p-2.5">17.5"</td><td className="p-2.5">29.0"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">L</td><td className="p-2.5">40-42"</td><td className="p-2.5">18.0"</td><td className="p-2.5">29.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">XL</td><td className="p-2.5">42-44"</td><td className="p-2.5">18.5"</td><td className="p-2.5">30.0"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">XXL</td><td className="p-2.5">44-46"</td><td className="p-2.5">19.0"</td><td className="p-2.5">30.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">XXXL</td><td className="p-2.5">46-48"</td><td className="p-2.5">19.5"</td><td className="p-2.5">31.0"</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Numeric Table */}
              <div>
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3 font-serif">
                  NUMERIC WAIST SIZES (28 to 44)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#26241E]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#121212] text-[#C9A84C] uppercase text-[10px] tracking-wider font-serif">
                      <tr>
                        <th className="p-2.5 border-b border-[#26241E]">Waist Size</th>
                        <th className="p-2.5 border-b border-[#26241E]">Waist Circumference</th>
                        <th className="p-2.5 border-b border-[#26241E]">Inseam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26241E] bg-[#050505]">
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">28</td><td className="p-2.5">28-29"</td><td className="p-2.5">32"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">30</td><td className="p-2.5">30-31"</td><td className="p-2.5">32"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">32</td><td className="p-2.5">32-33"</td><td className="p-2.5">32.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">34</td><td className="p-2.5">34-35"</td><td className="p-2.5">33"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">36</td><td className="p-2.5">36-37"</td><td className="p-2.5">33"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">38</td><td className="p-2.5">38-39"</td><td className="p-2.5">33.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">40</td><td className="p-2.5">40-41"</td><td className="p-2.5">33.5"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">42</td><td className="p-2.5">42-43"</td><td className="p-2.5">34"</td></tr>
                      <tr><td className="p-2.5 font-bold text-[#FFF5D6]">44</td><td className="p-2.5">44-45"</td><td className="p-2.5">34"</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 text-center flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSizeType('custom')
                    setSelectedSize('Custom Fit')
                    setShowSizeModal(false)
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl cursor-pointer"
                >
                  Enter Custom Fit Measurements ✨
                </button>
                <button
                  onClick={() => setShowSizeModal(false)}
                  className="px-6 py-2.5 rounded-full bg-[#121212] border border-[#26241E] text-[#E8E0CC] hover:text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN LIGHTBOX IMAGE MODAL */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8"
            onClick={() => setShowLightbox(false)}
          >
            {/* Header / Actions */}
            <div className="w-full flex items-center justify-between text-[#FFF5D6] z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-serif font-bold text-[#C9A84C] uppercase tracking-widest">
                  VÆROX BESPOKE LIGHTBOX VIEW
                </span>
                <span className="text-xs text-[#A39E93]">
                  {selectedImageIndex + 1} of {images.length}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(false);
                }}
                className="p-2 rounded-full bg-[#121212] border border-[#26241E] text-[#C9A84C] hover:text-white hover:border-[#C9A84C] transition-all cursor-pointer shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Lightbox Image View */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative flex-1 max-w-5xl w-full flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-[#26241E] shadow-[0_0_50px_rgba(201,168,76,0.15)]"
              />

              {/* Prev / Next buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black transition-all border border-[#26241E] shadow-2xl cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black transition-all border border-[#26241E] shadow-2xl cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Navigation Row */}
            <div className="flex items-center gap-3 z-10 overflow-x-auto p-2" onClick={(e) => e.stopPropagation()}>
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative rounded-xl overflow-hidden h-16 w-16 border-2 transition-all cursor-pointer ${selectedImageIndex === index
                      ? 'border-[#C9A84C] scale-110 shadow-lg'
                      : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  <img src={imgUrl} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductDetail
