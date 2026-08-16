import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import { getProductImageUrl } from '../../utils/imageUrl'

const getDeterministicRating = (productId) => {
  if (!productId) return { rating: 4.5, reviews: 128 };
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 4.0 + (Math.abs(hash % 10) / 10); // Between 4.0 and 5.0
  const reviews = 50 + (Math.abs(hash) % 950);     // Between 50 and 1000
  return { rating: parseFloat(rating.toFixed(1)), reviews };
};

export const ProductCard = ({
  id,
  image,
  title,
  price,
  originalPrice,
  discount,
  rating: propRating,
  reviews: propReviews,
  category,
}) => {
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  // eslint-disable-next-line no-unused-vars
  const { addModalNotification } = useNotification()
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)

  const [imageError, setImageError] = useState(false)
  const imageUrl = getProductImageUrl(image)

  const actualDiscount =
    discount ||
    (originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0)

  const deterministicRating = getDeterministicRating(id);
  const rating = propRating || deterministicRating.rating;
  const reviews = propReviews || deterministicRating.reviews;
  const isSellerOrAdmin = user && (user.role === 'admin' || user.role === 'seller');
  const productInCart = isInCart(id);

  /* ── Handlers ── */
  const buildProduct = () => ({
    _id: id,
    id,
    image,
    name: title,
    price,
    originalPrice,
    discount,
    rating,
    reviews,
  })

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    try {
      await addToCart(buildProduct())
    } catch (err) {
      // Handled by context
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToWishlist(buildProduct())
  }

  const handleNavigate = () => {
    navigate(`/product/${id}`)
  }

  /* ── Render ── */
  return (
    <motion.div
      className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl hover:border-[#C9A84C]/60 overflow-hidden h-full flex flex-col transition-all duration-300 group relative w-full text-[#E8E0CC]"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Image Area */}
      <div className="relative bg-[#050505] aspect-square flex items-center justify-center overflow-hidden border-b border-[#26241E] cursor-pointer" onClick={handleNavigate}>
        {!imageUrl || imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] p-4">
            <svg className="w-8 h-8 text-[#26241E] mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] text-[#A39E93] font-medium">No Image</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full w-auto h-auto object-contain p-3 group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Discount Badge */}
        {actualDiscount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#C9A84C] text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10 uppercase tracking-wider">
            -{actualDiscount}%
          </span>
        )}

        {/* Wishlist Heart */}
        <motion.button
          onClick={handleAddToWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-300 z-10 ${isInWishlist(id)
              ? 'text-[#C9A84C] bg-black border border-[#C9A84C]'
              : 'text-[#A39E93] bg-black/80 hover:bg-black hover:text-[#C9A84C] border border-[#26241E]'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className="w-4 h-4"
            fill={isInWishlist(id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Details */}
      <div className="p-3.5 flex-grow flex flex-col bg-[#0A0A0A]">
        {/* Category */}
        <span className="text-[9px] font-bold text-[#C9A84C] uppercase tracking-widest mb-1 block">
          {category || 'Category'}
        </span>

        {/* Title */}
        <div className="mb-1.5">
          <h3
            onClick={handleNavigate}
            className="cursor-pointer font-sans text-xs md:text-sm font-semibold text-[#E8E0CC] line-clamp-2 h-9 leading-tight hover:text-[#FFF5D6] transition-colors duration-200"
          >
            {title}
          </h3>
        </div>

        {/* Rating Row */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-[#C9A84C]' : 'text-[#26241E]'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-bold text-[#E8E0CC] text-[10px] ml-0.5">{rating}</span>
          <span className="text-[#A39E93] text-[10px]">({reviews})</span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2.5 border-t border-[#26241E] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-sm md:text-base text-[#C9A84C] leading-none">{formatCurrency(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] text-[#A39E93] line-through mt-0.5 leading-none">{formatCurrency(originalPrice)}</span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col">
            {!isSellerOrAdmin && (
              <motion.button
                onClick={handleAddToCart}
                className={`w-8 h-8 rounded-full transition-all duration-300 relative overflow-hidden flex items-center justify-center flex-shrink-0 ${productInCart
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-bold shadow-[0_0_10px_rgba(201,168,76,0.3)] hover:scale-105'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isAdding}
                title={productInCart ? "Added to Cart" : "Add to Cart"}
              >
                {isAdding ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : productInCart ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
