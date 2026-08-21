import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { contactAPI, userAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../../contexts/NotificationContext'
import { formatCurrency } from '../../utils/format'
import Sidebar from './components/Sidebar'
import { 
  Menu, User, Mail, ShoppingCart, Heart, ShieldCheck, Calendar, 
  Edit2, X, Plus, Minus, Trash2, ArrowRight, ChevronRight, Lock, 
  MessageSquare, Sparkles, AlertCircle, ShoppingBag
} from 'lucide-react'

const UserDashboard = () => {
  const { user, logout, login } = useAuth()
  const { cartItems, updateQuantity, removeFromCart } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()
  const { addModalNotification } = useNotification()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [contactMessages, setContactMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContactMessages()
  }, [])

  const fetchContactMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await contactAPI.getUserMessages(token);
        if (response.success) {
          setContactMessages(response.data);
        } else {
          console.error('Failed to fetch contact messages:', response.error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEditProfile = () => {
    setIsEditing(true)
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    })
  }

  const handleSaveProfile = async () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      addModalNotification('Validation Error', 'Name and email are required', 'warning')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await userAPI.updateProfile(editData, token)
        if (response.success) {
          // Update the user in context
          login(response.data, token)
          setIsEditing(false)
          addModalNotification('Success', 'Profile updated successfully!', 'success')
        } else {
          addModalNotification('Error', response.error || 'Failed to update profile', 'error')
        }
      }
    } catch (error) {
      addModalNotification('Error', 'An error occurred while updating profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(productId)
        addModalNotification('Success', 'Item removed from cart', 'success')
      } else {
        await updateQuantity(productId, newQuantity)
        addModalNotification('Success', 'Quantity updated', 'success')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Function to get proper image URL
  const getProductImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
    }
    
    const isExternalUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:');
    if (isExternalUrl) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `${imagePath}`;
    }
    
    if (imagePath === 'no-photo.jpg') {
      return '/uploads/no-photo.jpg';
    }
    
    return `/uploads/${imagePath}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div 
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#FFF5D6]">My Profile</h2>
                <p className="text-[#A39E93] text-xs mt-0.5">Manage your personal account details</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={handleEditProfile}
                  className="text-[#C9A84C] hover:text-[#FFF5D6] bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 border border-[#C9A84C]/30"
                >
                  <Edit2 size={12} />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 text-sm border border-[#26241E] rounded-xl focus:outline-none focus:border-[#C9A84C] bg-[#121212] text-[#E8E0CC] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-3 text-sm border border-[#26241E] rounded-xl focus:outline-none focus:border-[#C9A84C] bg-[#121212] text-[#E8E0CC] font-semibold"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-150 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
                    className="bg-[#141414] hover:bg-[#1a1a1a] text-[#E8E0CC]/80 border border-[#26241E] font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-150 cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Avatar Info Header */}
                <div className="flex items-center gap-4 bg-[#121212] p-4 rounded-2xl border border-[#26241E] max-w-md">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] flex items-center justify-center text-black font-extrabold text-lg shadow-md">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#FFF5D6] text-base">{user?.name}</h3>
                    <p className="text-[#A39E93] text-xs mt-0.5">{user?.email}</p>
                  </div>
                </div>

                {/* Profile Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div className="border border-[#26241E] p-4 rounded-xl flex items-center gap-3 bg-[#121212]">
                    <User className="text-[#C9A84C] flex-shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-[#A39E93] uppercase tracking-widest">Full Name</p>
                      <p className="text-sm font-bold text-[#FFF5D6] mt-0.5">{user?.name}</p>
                    </div>
                  </div>
                  <div className="border border-[#26241E] p-4 rounded-xl flex items-center gap-3 bg-[#121212]">
                    <Mail className="text-[#C9A84C] flex-shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#A39E93] uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-[#FFF5D6] mt-0.5 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="border border-[#26241E] p-4 rounded-xl flex items-center gap-3 bg-[#121212]">
                    <ShieldCheck className="text-[#C9A84C] flex-shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-[#A39E93] uppercase tracking-widest">Account Type</p>
                      <p className="text-sm font-bold text-[#FFF5D6] mt-0.5 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <div className="border border-[#26241E] p-4 rounded-xl flex items-center gap-3 bg-[#121212]">
                    <Calendar className="text-[#C9A84C] flex-shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-[#A39E93] uppercase tracking-widest">Registered Date</p>
                      <p className="text-sm font-bold text-[#FFF5D6] mt-0.5">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )
      
      case 'cart':
        return (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Your Cart Preview</h2>
                <p className="text-slate-400 text-xs mt-0.5">Quickly adjust quantities of saved cart items</p>
              </div>
              <Link 
                to="/user/cart" 
                className="text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100/50 px-4 py-2 rounded-xl transition duration-150 border border-indigo-100/30 flex items-center gap-1"
              >
                Go to Full Cart
                <ChevronRight size={14} />
              </Link>
            </div>
            
            {cartItems.length > 0 ? (
              <div className="space-y-3.5">
                {cartItems.map((item) => {
                  const product = item.product || item
                  const productId = product._id || product.id
                  const quantity = item.quantity || 1
                  const discountedPrice = product.discount 
                    ? product.price * (1 - product.discount / 100)
                    : product.price
                  const totalPrice = discountedPrice * quantity

                  return (
                    <div 
                      key={productId}
                      className="flex items-center p-3.5 border border-slate-100 bg-slate-50/30 rounded-2xl hover:shadow-2xs transition-all duration-300 gap-3 sm:gap-4"
                    >
                      {product?.image ? (
                        <div className="w-16 h-16 bg-white border border-slate-100 p-1.5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <img 
                            src={getProductImageUrl(product.image)} 
                            alt={product.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="text-slate-300" size={20} />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{product.category}</p>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{formatCurrency(totalPrice)}</p>
                      </div>
                      
                      {/* Compact quantity controls */}
                      <div className="flex items-center bg-white border border-slate-200/80 rounded-full shadow-2xs overflow-hidden h-7 w-[68px] sm:w-[84px] px-0.5 justify-between">
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent shadow-3xs transition-all duration-150 text-xs font-bold cursor-pointer select-none"
                        >
                          <Minus size={9} strokeWidth={3} />
                        </motion.button>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-800 select-none text-center flex-1">
                          {quantity}
                        </span>
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent shadow-3xs transition-all duration-150 text-xs font-bold cursor-pointer select-none"
                        >
                          <Plus size={9} strokeWidth={3} />
                        </motion.button>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpdateQuantity(productId, 0)}
                        className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-xl transition duration-150 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <ShoppingBag className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-450 text-xs sm:text-sm font-semibold">Your shopping cart is currently empty.</p>
                <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-755 px-5 py-2.5 rounded-xl transition duration-150 shadow-sm shadow-indigo-100">
                  Shop Products
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )
      
      case 'wishlist':
        return (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">My Saved Wishlist</h2>
                <p className="text-slate-400 text-xs mt-0.5">Quick look at items saved to buy later</p>
              </div>
              <Link 
                to="/user/wishlist" 
                className="text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100/50 px-4 py-2 rounded-xl transition duration-150 border border-indigo-100/30 flex items-center gap-1"
              >
                Go to Wishlist
                <ChevronRight size={14} />
              </Link>
            </div>
            
            {wishlistItems && wishlistItems.length > 0 ? (
              <div className="space-y-3.5">
                {wishlistItems.slice(0, 3).map((item) => {
                  const product = item.product || item
                  const productId = product._id || product.id
                  const discountedPrice = product.discount 
                    ? product.price * (1 - product.discount / 100)
                    : product.price

                  return (
                    <div 
                      key={productId}
                      className="flex items-center p-3.5 border border-slate-100 bg-slate-50/30 rounded-2xl hover:shadow-2xs transition-all duration-300 gap-3"
                    >
                      {product?.image ? (
                        <div className="w-16 h-16 bg-white border border-slate-100 p-1.5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <img 
                            src={getProductImageUrl(product.image)} 
                            alt={product.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-150 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{product.category}</p>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{formatCurrency(discountedPrice)}</p>
                      </div>
                      
                      <Link 
                        to={`/product/${productId}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-200 shadow-xs flex items-center gap-1 flex-shrink-0"
                      >
                        View Product
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  )
                })}
                
                {wishlistItems.length > 3 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => setActiveSection('wishlist')}
                      className="text-indigo-650 hover:text-indigo-850 text-xs font-bold transition duration-150 cursor-pointer"
                    >
                      + {wishlistItems.length - 3} more items in your wishlist
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <Heart className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-450 text-xs sm:text-sm font-semibold">Your wishlist is currently empty.</p>
                <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-755 px-5 py-2.5 rounded-xl transition duration-150 shadow-sm shadow-indigo-100">
                  Find Favorites
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )
      
      case 'messages':
        return (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Support Messages</h2>
                <p className="text-slate-400 text-xs mt-0.5">Tickets and messages sent to our seller support</p>
              </div>
              <Link 
                to="/contact" 
                className="text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100/50 px-4 py-2 rounded-xl transition duration-150 border border-indigo-100/30 flex items-center gap-1"
              >
                Send New Message
                <Plus size={14} />
              </Link>
            </div>

            {loadingMessages ? (
              <div className="flex flex-col justify-center items-center py-10 gap-3 bg-slate-50/40 rounded-2xl border border-slate-100">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-600 border-t-transparent"></div>
                <span className="text-xs font-semibold text-slate-450">Loading ticket threads...</span>
              </div>
            ) : contactMessages.length > 0 ? (
              <div className="space-y-5">
                {contactMessages.map((message) => (
                  <div 
                    key={message._id} 
                    className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 hover:shadow-2xs transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">{message.subject}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            message.response 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60' 
                              : 'bg-amber-50 text-amber-700 border-amber-100/60'
                          }`}>
                            {message.response ? 'Replied' : 'Sent'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100/50">{message.message}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center text-[10px] text-slate-400 gap-1.5 px-1 font-semibold">
                      <span>Ticket ID:</span>
                      <span className="font-mono text-slate-550">{message._id.substring(0, 10).toUpperCase()}</span>
                    </div>
                    
                    {/* Seller Response */}
                    {message.response && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50/40 to-violet-50/40 border border-indigo-150/40 rounded-xl relative overflow-hidden">
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <h4 className="font-bold text-indigo-900 text-xs sm:text-sm flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-indigo-600 animate-pulse" />
                            Seller Response
                          </h4>
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                            {new Date(message.response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-slate-650 text-xs sm:text-sm leading-relaxed bg-white/70 p-3 rounded-lg border border-indigo-55/20">{message.response.message}</p>
                          <div className="mt-2.5 flex items-center text-[10px] text-indigo-500/80 font-bold gap-1 pl-1">
                            <Sparkles size={10} />
                            <span>Staff Agent: {message.response.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <MessageSquare className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-450 text-xs sm:text-sm font-semibold">No messages or support tickets found.</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-755 px-5 py-2.5 rounded-xl transition duration-150 shadow-sm shadow-indigo-100">
                  Contact Support
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )
      
      default: // dashboard statistics landing
        return (
          <div className="space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Cart Items */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('cart')}
                className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3.5 cursor-pointer hover:border-indigo-150 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cart Items</span>
                  <h4 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{cartItems.length}</h4>
                </div>
              </motion.div>

              {/* Stat 2: Wishlist Saved */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('wishlist')}
                className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3.5 cursor-pointer hover:border-rose-150 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <Heart size={18} className="fill-rose-50" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Saved Items</span>
                  <h4 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{wishlistItems.length}</h4>
                </div>
              </motion.div>

              {/* Stat 3: Messages Sent */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('messages')}
                className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3.5 cursor-pointer hover:border-amber-150 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Messages</span>
                  <h4 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
                    {loadingMessages ? '...' : contactMessages.length}
                  </h4>
                </div>
              </motion.div>

              {/* Stat 4: Account Status */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('profile')}
                className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-150 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Account Status</span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-1 capitalize">{user?.role || 'User'}</h4>
                </div>
              </motion.div>
            </div>

            {/* Split Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Profile Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Account Summary</h3>
                  <button 
                    onClick={() => setActiveSection('profile')}
                    className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Details
                    <ChevronRight size={12} />
                  </button>
                </div>
                
                {/* Circular Profile Avatar info */}
                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm">
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{user?.name}</h4>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email}</p>
                    <span className="text-[9px] font-extrabold text-indigo-650 bg-indigo-50/80 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-slate-650 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">User ID</span>
                    <span className="font-mono text-slate-800 font-bold">{user?._id?.substring(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Security Level</span>
                    <span className="text-slate-800 font-bold">Standard Client</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Creation Date</span>
                    <span className="text-slate-800 font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Cart Overview</h3>
                  <button 
                    onClick={() => setActiveSection('cart')}
                    className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Edit Cart
                    <ChevronRight size={12} />
                  </button>
                </div>
                
                {cartItems.length > 0 ? (
                  <div className="space-y-2">
                    {cartItems.slice(0, 2).map((item) => {
                      const product = item.product || item
                      const discountedPrice = product.discount 
                        ? product.price * (1 - product.discount / 100)
                        : product.price

                      return (
                        <div key={product._id || product.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100/50">
                          <span className="text-slate-700 font-medium truncate max-w-[200px]">{product.name}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(discountedPrice * (item.quantity || 1))}</span>
                        </div>
                      )
                    })}
                    {cartItems.length > 2 && (
                      <p className="text-[10px] font-bold text-slate-400 pt-1">+ {cartItems.length - 2} more items in cart</p>
                    )}
                    <Link to="/checkout" className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition duration-150">
                      Place Order
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <ShoppingBag size={18} className="text-slate-350 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-semibold">Your cart is currently empty.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Support Messages Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Recent Help Message</h3>
                <button 
                  onClick={() => setActiveSection('messages')}
                  className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  View All
                  <ChevronRight size={12} />
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex items-center justify-center py-6 bg-slate-50/40 rounded-xl">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-650 border-t-transparent"></div>
                </div>
              ) : contactMessages.length > 0 ? (
                <div className="p-3 border border-slate-100 bg-slate-50/40 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[200px]">
                      {contactMessages[0].subject}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                      contactMessages[0].response ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {contactMessages[0].response ? 'Replied' : 'Sent'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/50">
                    {contactMessages[0].message}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <MessageSquare size={18} className="text-slate-350 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-semibold">No recent messages.</p>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-slate-150/40 cursor-pointer"
                >
                  Browse Catalog
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-slate-150/40 cursor-pointer"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => setActiveSection('profile')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-slate-150/40 cursor-pointer"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => navigate('/user/cart')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-slate-150/40 cursor-pointer"
                >
                  Order Details
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] flex">
      {/* Sidebar navigation */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        counts={{
          cart: cartItems.length,
          wishlist: wishlistItems.length
        }}
      />
      
      {/* Main dashboard viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Mobile/Desktop Welcome Header */}
        <motion.header 
          className="bg-[#0A0A0A] border-b border-[#26241E] shadow-2xl sticky top-16 md:top-0 z-30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div className="max-w-7xl mx-auto px-5 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">Member Portal</span>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-[#FFF5D6] tracking-tight capitalize mt-0.5">
                Welcome, <span className="text-[#C9A84C] font-semibold">{user?.name}</span>
              </h1>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-[#E8E0CC]/70 hover:text-white hover:bg-[#141414] md:hidden transition-colors focus:outline-none cursor-pointer border border-[#26241E] bg-black"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.header>

        {/* Dashboard contents wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default UserDashboard
