import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, ShoppingCart, Star, Tag, Store } from 'lucide-react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import { getProductImageUrl as resolveProductImageUrl } from '../../utils/imageUrl'

const getDeterministicRating = (productId) => {
  if (!productId) return { rating: 4.5, reviews: 128 };
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = productId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 4.0 + (Math.abs(hash % 10) / 10);
  const reviews = 50 + (Math.abs(hash) % 950);
  return { rating: parseFloat(rating.toFixed(1)), reviews };
};

const WishlistItem = ({ item, onAddToCart, onRemove }) => {
  const navigate = useNavigate()
  const { addModalNotification } = useNotification()
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  
  // Get the product ID (use _id if available, otherwise id)
  const productId = item?.product?._id || item?.product?.id || item?._id || item?.id

  // Access product details from the nested product object
  const product = item?.product || item

  // Function to get proper image URL
  const getProductImageUrl = (product) => {
    return resolveProductImageUrl(product?.image);
  };

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    // Prevent admins and sellers from adding to cart
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Sellers and admins cannot purchase products', 'error')
      return
    }
    
    setIsAdding(true)
    try {
      await onAddToCart(product)
    } catch (error) {
      // Handled by context
    } finally {
      setIsAdding(false)
    }
  }

  const deterministic = getDeterministicRating(productId);
  const rating = product?.rating || deterministic.rating;
  const reviews = product?.reviews || deterministic.reviews;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-[#0A0A0A] hover:bg-[#121212] transition-all duration-300 gap-4 sm:gap-6 border-b border-[#26241E] text-[#E8E0CC]">
      
      {/* Product Image and Details (Left / Center) */}
      <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
        {/* Square Image container */}
        <div 
          onClick={() => navigate(`/product/${productId}`)}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-[#050505] rounded-2xl border border-[#26241E] flex items-center justify-center p-2 flex-shrink-0 cursor-pointer hover:border-[#C9A84C] transition-all duration-300 relative group overflow-hidden"
        >
          {product?.image ? (
            <img 
              src={getProductImageUrl(product)} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&h=150';
              }}
            />
          ) : (
            <svg className="w-8 h-8 text-[#26241E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          {/* Category Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Tag size={8} />
              {product?.category || 'General'}
            </span>
            <span className="text-[10px] text-[#A39E93] font-medium flex items-center gap-1">
              <Store size={10} />
              VÆROX
            </span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => navigate(`/product/${productId}`)}
            className="font-sans font-semibold text-xs sm:text-sm md:text-base text-[#E8E0CC] hover:text-[#FFF5D6] cursor-pointer transition-all duration-200 line-clamp-2 leading-snug pt-0.5"
          >
            {product?.name || 'Premium Saved Product'}
          </h3>
          
          {/* Rating Pill Badge */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <div className="flex bg-[#C9A84C] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md items-center gap-0.5">
              <span>{rating}</span>
              <Star size={9} className="fill-current text-black" />
            </div>
            <span className="text-[10px] sm:text-xs text-[#A39E93] font-semibold">({reviews} ratings)</span>
          </div>

          {/* Pricing details */}
          <div className="flex items-baseline gap-2 pt-1 flex-wrap">
            <span className="font-extrabold text-sm sm:text-base text-[#FFF5D6]">
              {formatCurrency(discountedPrice)}
            </span>
            {product?.discount && product.discount > 0 ? (
              <>
                <span className="text-[10px] sm:text-xs text-[#A39E93] line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold text-black bg-[#C9A84C] px-1.5 py-0.5 rounded-md uppercase">
                  {product.discount}% Off
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Buttons (Right / Bottom) */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#26241E] mt-2 sm:mt-0">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xl uppercase tracking-wider flex items-center justify-center min-w-[110px] sm:min-w-[125px] transition-all duration-200 cursor-pointer gap-1.5 disabled:opacity-60"
          disabled={user && (user.role === 'admin' || user.role === 'seller') || isAdding}
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart size={13} strokeWidth={2.5} />
              Add To Cart
            </>
          )}
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRemove(productId)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 rounded-xl border border-rose-500/30 transition-all duration-200 cursor-pointer ml-auto sm:ml-0"
          title="Remove from wishlist"
        >
          <Trash2 size={13} />
          Remove
        </motion.button>
      </div>

    </div>
  )
}

export default WishlistItem
