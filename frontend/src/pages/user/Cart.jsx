import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronLeft, CreditCard, ShieldCheck, Ticket, Trash2, ArrowRight, X } from 'lucide-react'
import CartItem from '../../components/cart/CartItem'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/format'
import RestrictedAccess from '../../components/RestrictedAccess'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, clearCart, loading } = useCart()
  const { user } = useAuth()

  // Coupon State
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Check if user is admin or seller
  if (user && (user.role === 'admin' || user.role === 'seller')) {
    return <RestrictedAccess />
  }

  // Calculate detailed pricing
  const subtotalOriginal = cartItems.reduce((sum, item) => {
    const product = item.product || item
    return sum + (product.price * (item.quantity || 1))
  }, 0)

  const discountTotal = cartItems.reduce((sum, item) => {
    const product = item.product || item
    const originalPrice = product.price
    const discountedPrice = product.discount 
      ? originalPrice * (1 - product.discount / 100)
      : originalPrice
    return sum + ((originalPrice - discountedPrice) * (item.quantity || 1))
  }, 0)

  const cartTotal = subtotalOriginal - discountTotal
  const totalItemCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0)

  // Recalculate if coupon is applied
  const finalTotal = Math.max(0, cartTotal - couponDiscount)

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')
    const code = couponInput.trim().toUpperCase()

    if (!code) return

    if (code === 'WELCOME10') {
      const discount = cartTotal * 0.1
      setCouponDiscount(discount)
      setAppliedCoupon('WELCOME10')
      setCouponSuccess('Coupon WELCOME10 (10% OFF) applied!')
      setCouponInput('')
    } else if (code === 'AKARIO20' || code === 'VAEROX20') {
      const discount = cartTotal * 0.2
      setCouponDiscount(discount)
      setAppliedCoupon('VAEROX20')
      setCouponSuccess('Coupon VAEROX20 (20% OFF) applied!')
      setCouponInput('')
    } else {
      setCouponError('Invalid coupon. Try WELCOME10 or VAEROX20')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon('')
    setCouponDiscount(0)
    setCouponSuccess('')
    setCouponError('')
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#E8E0CC]">
        <motion.div 
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-9 h-9 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-[#E8E0CC]/70 tracking-widest uppercase">Loading your cart...</span>
        </motion.div>
      </div>
    )
  }

  const steps = ['Cart', 'Delivery', 'Payment']

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] py-6 sm:py-8 md:py-12 pb-24 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Checkout Stepper Progress */}
        {cartItems.length > 0 && (
          <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-4 mb-6 sm:mb-8 shadow-2xl max-w-xl mx-auto">
            <div className="flex items-center justify-between relative px-4">
              {steps.map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black shadow-md scale-105 font-extrabold' 
                        : 'bg-[#141414] text-[#A39E93] border border-[#26241E]'
                    }`}>
                      {idx === 0 ? '1' : idx === 1 ? '2' : '3'}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1.5 transition-all duration-300 ${
                      idx === 0 ? 'text-[#C9A84C]' : 'text-[#A39E93]'
                    }`}>{step}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-[2px] bg-[#26241E] mx-2 -mt-4 relative overflow-hidden" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <motion.div 
              className="bg-[#0A0A0A] rounded-3xl shadow-2xl p-8 sm:p-14 md:p-20 text-center max-w-lg mx-auto border border-[#26241E]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Animated Floating Bag Wrapper */}
              <motion.div 
                className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141414] border border-[#C9A84C]/40 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                <ShoppingBag className="w-10 h-10 text-[#C9A84C]" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] mb-2">Your shopping cart is empty</h2>
              <p className="text-[#A39E93] text-xs sm:text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Explore our catalog of high luxury products and find the perfect addition for your lifestyle.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold px-8 py-3.5 rounded-2xl transition duration-200 shadow-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              >
                Explore Collection
                <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Cart Items List */}
              <motion.div 
                className="lg:col-span-2 bg-[#0A0A0A] rounded-2xl shadow-2xl overflow-hidden border border-[#26241E]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#26241E] flex items-center justify-between">
                  <h1 className="text-base sm:text-lg font-serif font-bold text-[#FFF5D6]">
                    Shopping Cart <span className="text-[#C9A84C] font-semibold text-sm">({cartItems.length} items)</span>
                  </h1>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearCart}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 cursor-pointer bg-rose-950/30 hover:bg-rose-900/50 px-3 py-1.5 rounded-lg border border-rose-500/30"
                  >
                    <Trash2 size={13} />
                    Clear Cart
                  </motion.button>
                </div>
                
                {/* Items */}
                <div className="divide-y divide-[#26241E]">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item._id || item.id || item.product?._id || item.product?.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CartItem
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeFromCart}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Desktop Action Area */}
                <div className="hidden sm:flex p-5 sm:p-6 bg-black border-t border-[#26241E] justify-between items-center">
                  <button 
                    onClick={() => navigate('/products')}
                    className="text-[#E8E0CC]/70 hover:text-[#C9A84C] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 bg-transparent border-0 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    Continue Shopping
                  </button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/checkout')}
                    className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-xl uppercase tracking-widest transition duration-150 cursor-pointer inline-flex items-center gap-2"
                  >
                    Place Order
                    <CreditCard size={15} />
                  </motion.button>
                </div>
                
              </motion.div>
              
              {/* Right Column: Price Details & Coupon */}
              <motion.div 
                className="lg:col-span-1 space-y-5 lg:sticky lg:top-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                {/* Coupon Application Card */}
                <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest flex items-center gap-1.5">
                    <Ticket size={14} className="text-[#C9A84C]" />
                    Apply Coupon
                  </h3>
                  
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="flex-grow px-3 py-2 text-xs sm:text-sm border border-[#26241E] rounded-xl focus:outline-none focus:border-[#C9A84C] bg-[#121212] text-[#E8E0CC] uppercase placeholder:normal-case font-semibold disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!!appliedCoupon || !couponInput.trim()}
                      className="bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Feedback Message */}
                  <AnimatePresence mode="wait">
                    {couponError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-bold text-rose-400 bg-rose-950/30 border border-rose-500/30 px-2.5 py-1.5 rounded-md"
                      >
                        {couponError}
                      </motion.p>
                    )}
                    {couponSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between text-[10px] font-bold text-[#FFF5D6] bg-[#C9A84C]/10 px-2.5 py-1.5 rounded-md border border-[#C9A84C]/40"
                      >
                        <span>{couponSuccess}</span>
                        <button type="button" onClick={handleRemoveCoupon} className="text-[#C9A84C] hover:text-white">
                          <X size={10} strokeWidth={3} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!appliedCoupon && (
                    <div className="pt-1.5 text-[9px] sm:text-[10px] text-[#A39E93] leading-normal bg-[#121212] p-2.5 rounded-lg border border-dashed border-[#26241E]">
                      Use <span className="font-bold text-[#C9A84C]">WELCOME10</span> for 10% off or <span className="font-bold text-[#C9A84C]">VAEROX20</span> for 20% off.
                    </div>
                  )}
                </div>

                {/* Price Details Card */}
                <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl overflow-hidden">
                  {/* Title */}
                  <div className="px-5 py-4 border-b border-[#26241E]">
                    <h2 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest">
                      Price Details
                    </h2>
                  </div>
                  
                  {/* Detailed items */}
                  <div className="p-5 space-y-4 text-xs sm:text-sm text-[#E8E0CC]/80">
                    <div className="flex justify-between">
                      <span>Price ({totalItemCount} items)</span>
                      <span className="font-semibold text-[#FFF5D6]">{formatCurrency(subtotalOriginal)}</span>
                    </div>
                    
                    {discountTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Product Discount</span>
                        <span className="text-[#C9A84C] font-bold">
                          -{formatCurrency(discountTotal)}
                        </span>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          Coupon Discount
                          <span className="text-[9px] font-bold bg-[#C9A84C]/20 text-[#C9A84C] px-1.5 py-0.5 rounded border border-[#C9A84C]/40 uppercase">{appliedCoupon}</span>
                        </span>
                        <span className="text-[#C9A84C] font-bold">
                          -{formatCurrency(couponDiscount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Delivery Charges</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="line-through text-[#A39E93] font-normal">{formatCurrency(40)}</span>
                        <span className="text-emerald-300 text-xs bg-emerald-950/40 px-1 rounded border border-emerald-500/30 uppercase">FREE</span>
                      </span>
                    </div>
                    
                    <hr className="border-dashed border-[#26241E]" />
                    
                    <div className="flex justify-between font-extrabold text-sm sm:text-base text-[#FFF5D6] pt-1">
                      <span>Total Amount</span>
                      <span className="text-[#C9A84C]">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                  
                  {/* Saving Banner */}
                  {(discountTotal + couponDiscount) > 0 && (
                    <div className="px-5 py-3.5 bg-[#C9A84C]/10 border-t border-[#C9A84C]/30 flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#C9A84C] text-black rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        ✓
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-[#FFF5D6] leading-tight">
                        Nice! You are saving {formatCurrency(discountTotal + couponDiscount)} on this order
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Security trust badge */}
                <div className="flex items-center gap-2.5 px-4 py-1 text-[10px] font-bold text-[#A39E93]">
                  <ShieldCheck size={20} className="text-[#C9A84C] flex-shrink-0" />
                  <span>Safe & Secure Payments. 100% Authentic VÆROX items.</span>
                </div>
                
              </motion.div>
              
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-[#26241E] px-5 py-3.5 flex items-center justify-between z-50 sm:hidden shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#A39E93] uppercase tracking-wide leading-none">Total Payment</span>
            <span className="text-base font-extrabold text-[#C9A84C] mt-1">
              {formatCurrency(finalTotal)}
            </span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/checkout')}
            className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black text-xs font-extrabold px-7 py-3 rounded-xl shadow-xl uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            Place Order
            <CreditCard size={13} />
          </motion.button>
        </div>
      )}
      
    </div>
  )
}

export default Cart
