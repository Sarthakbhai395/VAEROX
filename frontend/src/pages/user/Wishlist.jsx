import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Compass, ChevronRight, Grid } from 'lucide-react'
import WishlistItem from '../../components/wishlist/WishlistItem'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import RestrictedAccess from '../../components/RestrictedAccess'

const Wishlist = () => {
  const navigate = useNavigate()
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('all') // 'all' or 'offers'

  // Check if user is admin or seller
  if (user && (user.role === 'admin' || user.role === 'seller')) {
    return <RestrictedAccess />
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product)
    } catch (error) {
      // Handled by context
    }
  }

  // Filter items based on active pill
  const filteredItems = wishlistItems.filter(item => {
    const product = item?.product || item
    if (activeFilter === 'offers') {
      return product?.discount && product.discount > 0
    }
    return true
  })

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
          <span className="text-sm font-semibold text-[#E8E0CC]/70 tracking-widest uppercase">Loading your wishlist...</span>
        </motion.div>
      </div>
    )
  }

  // Motion variants for list container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4">

        <AnimatePresence mode="wait">
          {wishlistItems.length === 0 ? (
            <motion.div
              className="bg-[#0A0A0A] rounded-3xl shadow-2xl p-10 md:p-20 text-center max-w-lg mx-auto border border-[#26241E]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Pulsating Heart Icon */}
              <motion.div
                className="w-20 h-20 bg-[#141414] border border-[#C9A84C]/40 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                <Heart className="w-10 h-10 text-[#C9A84C] fill-[#C9A84C]" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] mb-2">Your wishlist is empty</h2>
              <p className="text-[#A39E93] text-xs sm:text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Save your favorite VÆROX products here for later or to curate your luxury collection.
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold px-8 py-3.5 rounded-2xl transition duration-200 shadow-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              >
                <Compass size={15} />
                Explore Catalog
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">

              {/* Quick filter pills */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${activeFilter === 'all'
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-md'
                      : 'bg-[#0A0A0A] text-[#E8E0CC]/70 border-[#26241E] hover:border-[#C9A84C]'
                    }`}
                >
                  All Saved Items ({wishlistItems.length})
                </button>
                <button
                  onClick={() => setActiveFilter('offers')}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${activeFilter === 'offers'
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] shadow-md'
                      : 'bg-[#0A0A0A] text-[#E8E0CC]/70 border-[#26241E] hover:border-[#C9A84C]'
                    }`}
                >
                  Offers & Sales ({wishlistItems.filter(item => (item.product?.discount || item.discount) > 0).length})
                </button>
              </div>

              {/* Main Panel */}
              <motion.div
                className="bg-[#0A0A0A] rounded-2xl shadow-2xl overflow-hidden border border-[#26241E]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#26241E] flex items-center justify-between">
                  <h1 className="text-base sm:text-lg font-serif font-bold text-[#FFF5D6]">
                    My Wishlist <span className="text-[#C9A84C] font-semibold text-sm">({filteredItems.length})</span>
                  </h1>

                  <button
                    onClick={() => navigate('/products')}
                    className="text-[#C9A84C] hover:text-[#FFF5D6] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 bg-transparent border-0 cursor-pointer"
                  >
                    <Grid size={13} />
                    Explore Catalog
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* List Container with Staggered Animations */}
                <motion.div
                  className="divide-y divide-[#26241E]"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.25 }}
                        layout
                      >
                        <WishlistItem
                          item={item}
                          onAddToCart={handleAddToCart}
                          onRemove={removeFromWishlist}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Wishlist
