import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Heart, Plus, Minus, Tag, Store } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { getProductImageUrl as resolveProductImageUrl } from '../../utils/imageUrl'
import { useWishlist } from '../../contexts/WishlistContext'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate()
  const { addToWishlist } = useWishlist()
  
  // Access product details from the nested product object (backend format) or directly (local format)
  const product = item?.product || item
  
  // Get the product ID (use _id if available, otherwise id)
  const productId = product?._id || product?.id || item?._id || item?.id

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100)
    : product?.price

  const totalPrice = discountedPrice * (item?.quantity || 1)

  // Function to get proper image URL
  const getProductImageUrl = (product) => {
    return resolveProductImageUrl(product?.image);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(productId)
    } else {
      onUpdateQuantity(productId, newQuantity)
    }
  }

  const handleMoveToWishlist = async (e) => {
    e.stopPropagation()
    try {
      await addToWishlist(product)
      onRemove(productId)
    } catch (error) {
      // Handled by context
    }
  }

  // Ensure we have a valid quantity
  const itemQuantity = item?.quantity || 1

  return (
    <div className="flex items-start p-4 sm:p-6 bg-[#0A0A0A] hover:bg-[#121212] transition-all duration-300 gap-4 sm:gap-6 border-b border-[#26241E] text-[#E8E0CC]">
      
      {/* Left Block: Image & Premium Quantity Control */}
      <div className="flex flex-col items-center flex-shrink-0 w-20 sm:w-28">
        <div 
          onClick={() => navigate(`/product/${productId}`)}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-[#050505] rounded-2xl border border-[#26241E] flex items-center justify-center p-2 cursor-pointer hover:border-[#C9A84C] transition-all duration-300 relative group overflow-hidden"
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
        
        {/* Quantity control pill */}
        <div className="flex items-center mt-3.5 bg-[#121212] border border-[#26241E] rounded-full overflow-hidden h-7 sm:h-8 w-20 sm:w-24 px-1 justify-between">
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => handleQuantityChange(itemQuantity - 1)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#A39E93] hover:text-[#C9A84C] hover:bg-black border border-transparent transition-all duration-150 text-xs font-bold cursor-pointer select-none"
          >
            <Minus size={10} strokeWidth={3} />
          </motion.button>
          <span className="text-[11px] sm:text-xs font-bold text-[#E8E0CC] select-none w-5 text-center">
            {itemQuantity}
          </span>
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => handleQuantityChange(itemQuantity + 1)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#A39E93] hover:text-[#C9A84C] hover:bg-black border border-transparent transition-all duration-150 text-xs font-bold cursor-pointer select-none"
          >
            <Plus size={10} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
      
      {/* Right Block: Content Details & Actions */}
      <div className="flex-grow min-w-0 flex flex-col justify-between self-stretch">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category Tag & Seller */}
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
            {product?.name || 'Premium Product'}
          </h3>
          
          {/* Pricing Block */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-[#C9A84C]">
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

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-[#26241E] pt-2.5 mt-4 w-full gap-2">
          {/* Subtotal shown on mobile */}
          <div className="text-left">
            <span className="text-[9px] font-bold text-[#A39E93] uppercase tracking-wide block sm:hidden">Subtotal</span>
            <span className="font-bold text-xs sm:text-sm text-[#FFF5D6]">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Move to Wishlist */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMoveToWishlist}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold text-[#C9A84C] hover:text-[#FFF5D6] bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 rounded-lg border border-[#C9A84C]/30 transition-all duration-200 cursor-pointer group"
              title="Move to Wishlist"
            >
              <Heart size={12} className="group-hover:animate-pulse group-hover:fill-[#C9A84C] transition-all duration-200" />
              <span className="hidden xs:inline uppercase tracking-wider">Wishlist</span>
            </motion.button>

            {/* Remove from Cart */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onRemove(productId)}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 rounded-lg border border-rose-500/30 transition-all duration-200 cursor-pointer group uppercase tracking-wider"
              title="Remove item"
            >
              <Trash2 size={12} className="group-hover:rotate-6 transition-transform duration-200" />
              Remove
            </motion.button>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default CartItem
