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
  MessageSquare, AlertCircle, ShoppingBag, Inbox, Package, Search,
  Copy, Check, Printer, Clock, Truck, CheckCircle2, Eye, MapPin, Tag
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
  const [inboxMessages, setInboxMessages] = useState([])

  // Order management state
  const [userOrders, setUserOrders] = useState([])
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)
  const [copiedText, setCopiedText] = useState('')

  useEffect(() => {
    fetchContactMessages()
    fetchInboxMessages()
    loadUserOrders()
  }, [user])

  const loadUserOrders = () => {
    try {
      const uOrders = JSON.parse(localStorage.getItem('vaerox_user_orders') || '[]')
      const aOrders = JSON.parse(localStorage.getItem('vaerox_admin_orders') || '[]')
      
      let combined = [...uOrders, ...aOrders]
      const seen = new Set()
      combined = combined.filter(o => {
        if (!o || !o.id) return false
        if (seen.has(o.id)) return false
        seen.add(o.id)
        return true
      })

      if (user?.email) {
        const userFiltered = combined.filter(o => o.user?.email?.toLowerCase() === user.email.toLowerCase())
        if (userFiltered.length > 0) {
          setUserOrders(userFiltered)
          return
        }
      }

      if (combined.length > 0) {
        setUserOrders(combined)
        return
      }

      // Default sample order if no orders in localstorage
      const sampleOrder = {
        id: 'VRX-458629',
        paymentId: 'pay_btjbjz9ex5',
        date: new Date().toISOString(),
        user: {
          name: user?.name || 'Sarthak Bhatnagar',
          email: user?.email || 'sb1258954@gmail.com',
          phone: '+91 98785 43210',
          address: 'Baad Post - Kakua gwalior road agra',
          city: 'Agra',
          state: 'Uttar Pradesh',
          zipCode: '282009'
        },
        items: [
          {
            id: 'p1',
            name: 'VÆROX Executive Double-Breasted Wool Tuxedo',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
            price: 18499,
            quantity: 1,
            size: 'XL',
            tier: 'Bespoke Executive',
            category: 'Luxury Apparel',
            customMeasurements: {
              chest: '42',
              waist: '34',
              hips: '40',
              torso: '29',
              fitPreference: 'Tailored Slim'
            }
          }
        ],
        subtotal: 18499,
        tax: 0,
        totalAmount: 18499,
        paymentMethod: 'Razorpay Secure (Online)',
        paymentStatus: 'Paid',
        orderStatus: 'Processing'
      }
      setUserOrders([sampleOrder])
    } catch (e) {
      console.error('Error loading orders:', e)
    }
  }

  const handleCopy = (text, type) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedText(`${type}-${text}`)
      addModalNotification('Copied', `${type} copied to clipboard!`, 'info')
      setTimeout(() => {
        setCopiedText('')
      }, 2500)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  const fetchInboxMessages = () => {
    try {
      const stored = localStorage.getItem('vaerox_user_inbox_messages')
      if (stored) {
        const parsed = JSON.parse(stored)
        const filtered = user?.email
          ? parsed.filter(m => !m.userEmail || m.userEmail.toLowerCase() === user.email.toLowerCase())
          : parsed
        setInboxMessages(filtered)
      } else {
        setInboxMessages([])
      }
    } catch (e) {
      setInboxMessages([])
    }
  }

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
      case 'orders':
        {
          const filteredOrders = userOrders.filter(order => {
            const matchesSearch = 
              (order.id && order.id.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
              (order.paymentId && order.paymentId.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
              (order.items && order.items.some(item => item.name && item.name.toLowerCase().includes(orderSearchTerm.toLowerCase())));
            
            if (orderFilterStatus === 'all') return matchesSearch;
            if (orderFilterStatus === 'processing') return matchesSearch && (order.orderStatus?.toLowerCase() === 'processing' || order.orderStatus?.toLowerCase() === 'placed');
            if (orderFilterStatus === 'shipped') return matchesSearch && order.orderStatus?.toLowerCase() === 'shipped';
            if (orderFilterStatus === 'delivered') return matchesSearch && order.orderStatus?.toLowerCase() === 'delivered';
            return matchesSearch;
          });

          return (
            <motion.div
              className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-4 sm:p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Top Banner Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#26241E]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] uppercase tracking-wider font-serif">
                      ORDER HISTORY & ATELIER PURCHASES
                    </span>
                    <span className="text-[10px] font-mono text-[#A39E93]">
                      ({userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'} Total)
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] mt-1">My Orders & Product Details</h2>
                  <p className="text-[#A39E93] text-xs mt-1 max-w-2xl leading-relaxed">
                    View comprehensive transaction records, Razorpay payment IDs, product summaries, custom bespoke measurements, and delivery tracking.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#121212] border border-[#26241E] px-4 py-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-[#A39E93] uppercase tracking-widest block">Total Spent</span>
                    <span className="text-sm font-bold font-serif text-[#C9A84C]">
                      {formatCurrency(userOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-[#121212] p-3 rounded-xl border border-[#26241E]">
                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39E93]" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Payment ID, or Item..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#26241E] focus:border-[#C9A84C] rounded-xl pl-9 pr-8 py-2 text-xs text-[#E8E0CC] placeholder-[#888] focus:outline-none"
                  />
                  {orderSearchTerm && (
                    <button
                      onClick={() => setOrderSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39E93] hover:text-[#FFF5D6]"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'shipped', label: 'In Transit' },
                    { id: 'delivered', label: 'Delivered' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilterStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        orderFilterStatus === tab.id
                          ? 'bg-[#C9A84C] text-black shadow-md'
                          : 'bg-[#181818] text-[#A39E93] hover:text-[#FFF5D6] hover:bg-[#222]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards Container */}
              {filteredOrders.length > 0 ? (
                <div className="space-y-6">
                  {filteredOrders.map((order) => {
                    const orderFormattedDate = order.date
                      ? new Date(order.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : 'N/A';

                    const formattedDeliveryAddress = order.user?.address
                      ? `${order.user.address}${order.user.city ? `, ${order.user.city}` : ''}${order.user.state ? `, ${order.user.state}` : ''} - ${order.user.zipCode || '282009'}`
                      : 'Baad Post - Kakua gwalior road agra, Agra, Uttar Pradesh - 282009';

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/50 rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300"
                      >
                        {/* Card Top Meta Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#26241E]">
                          {/* Left Details: Order ID & Payment ID */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wider font-serif">Order ID:</span>
                              <span className="font-mono text-xs font-bold text-[#FFF5D6] bg-[#0A0A0A] px-2.5 py-1 rounded-md border border-[#26241E] select-all">
                                {order.id}
                              </span>
                              <button
                                onClick={() => handleCopy(order.id, 'Order ID')}
                                className="p-1 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded transition-colors cursor-pointer"
                                title="Copy Order ID"
                              >
                                {copiedText === `Order ID-${order.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wider font-serif">Transaction ID:</span>
                              <span className="font-mono text-xs font-bold text-[#4ADE80] bg-[#0A0A0A] px-2.5 py-1 rounded-md border border-[#26241E] select-all">
                                {order.paymentId || 'pay_btjbjz9ex5'}
                              </span>
                              <button
                                onClick={() => handleCopy(order.paymentId || 'pay_btjbjz9ex5', 'Transaction ID')}
                                className="p-1 text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded transition-colors cursor-pointer"
                                title="Copy Transaction ID"
                              >
                                {copiedText === `Transaction ID-${order.paymentId || 'pay_btjbjz9ex5'}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </div>

                          {/* Right Details: Date & Status Badges */}
                          <div className="flex flex-col sm:flex-row lg:items-end gap-2 text-right">
                            <div className="text-xs text-[#A39E93]">
                              <span className="text-[10px] uppercase block font-serif text-[#888]">Payment Date & Time</span>
                              <span className="font-mono text-[#E8E0CC] text-[11px]">{orderFormattedDate}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 sm:mt-0 flex-wrap">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 size={11} />
                                {order.paymentStatus || 'PAID (Online)'}
                              </span>

                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#C9A84C]/20 border border-[#C9A84C]/60 text-[#C9A84C] uppercase tracking-wider flex items-center gap-1">
                                <Truck size={11} />
                                Delivery within 10-12 days
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Delivery Timeline Tracker */}
                        <div className="my-5 p-4 bg-[#0A0A0A] rounded-xl border border-[#26241E]">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5">
                              <Clock size={12} />
                              Shipment Progress & Delivery Timeline
                            </span>
                            <span className="text-[10px] font-bold text-[#4ADE80]">Delivery within 10-12 days</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 relative">
                            <div className="absolute top-3 left-4 right-4 h-0.5 bg-[#26241E] -z-0">
                              <div className="h-full bg-gradient-to-r from-[#C9A84C] via-[#C9A84C] to-[#26241E] w-3/4"></div>
                            </div>

                            {[
                              { title: 'Order Placed', desc: 'Payment Confirmed', active: true },
                              { title: 'Quality Check', desc: 'Atelier Inspection', active: true },
                              { title: 'In Transit', desc: '10-12 Days Delivery', active: true },
                              { title: 'Delivered', desc: 'Destination Address', active: false }
                            ].map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                  step.active ? 'bg-[#C9A84C] text-black shadow-[0_0_10px_rgba(201,168,76,0.4)]' : 'bg-[#181818] border border-[#333] text-[#666]'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold mt-1.5 ${step.active ? 'text-[#FFF5D6]' : 'text-[#666]'}`}>{step.title}</span>
                                <span className="text-[8px] text-[#888] hidden sm:block">{step.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Product Summary Items List */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-serif font-bold text-[#C9A84C] uppercase tracking-wider border-b border-[#26241E] pb-2">
                            Product Items in this Order ({order.items?.length || 1})
                          </h4>

                          {(order.items || []).map((item, idx) => {
                            const itemPrice = Number(item.price || 0);
                            const itemQty = Number(item.quantity || 1);
                            const itemTotal = itemPrice * itemQty;
                            const itemImgUrl = getProductImageUrl(item.image);

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#0A0A0A] rounded-xl border border-[#26241E] hover:border-[#C9A84C]/30 transition-all"
                              >
                                {/* Left Product Image & Details */}
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                  {/* Product Image */}
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141414] border border-[#26241E] rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden relative group">
                                    <img
                                      src={itemImgUrl}
                                      alt={item.name}
                                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';
                                      }}
                                    />
                                    <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#C9A84C]">
                                      x{itemQty}
                                    </span>
                                  </div>

                                  {/* Text Summary */}
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-serif font-bold text-[#FFF5D6] text-sm sm:text-base leading-snug">
                                        {item.name}
                                      </h5>
                                      {item.size && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C1A14] text-[#C9A84C] border border-[#C9A84C]/40 uppercase">
                                          Size: {item.size}
                                        </span>
                                      )}
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#181818] text-[#A39E93] border border-[#26241E] uppercase">
                                        {item.tier || 'Bespoke Executive'}
                                      </span>
                                    </div>

                                    {/* Product ID Badge */}
                                    <div className="flex items-center gap-2 text-[10px] text-[#A39E93] font-mono">
                                      <Tag size={11} className="text-[#C9A84C]" />
                                      <span>Product ID:</span>
                                      <span className="text-[#FFF5D6] font-bold bg-[#141414] px-2 py-0.5 rounded border border-[#26241E]">
                                        {item.id || item._id || 'p1'}
                                      </span>
                                    </div>

                                    {/* Category */}
                                    {item.category && (
                                      <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider">
                                        Category: {item.category}
                                      </p>
                                    )}

                                    {/* Custom Measurements */}
                                    {item.customMeasurements && (
                                      <div className="mt-2 text-[11px] text-[#D4B559] bg-[#141414] p-2.5 rounded-lg border-l-2 border-[#C9A84C] space-y-0.5 font-sans">
                                        <span className="font-serif font-bold block text-[10px] text-[#C9A84C] uppercase">Bespoke Custom Measurements:</span>
                                        <p className="text-[10px]">
                                          Chest: {item.customMeasurements.chest || '-'}", Waist: {item.customMeasurements.waist || '-'}", Hips: {item.customMeasurements.hips || '-'}", Torso: {item.customMeasurements.torso || '-'} ({item.customMeasurements.fitPreference || 'Tailored'})
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right Financial Summary per Item */}
                                <div className="text-right sm:self-center flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-[#26241E] pt-2 sm:pt-0">
                                  <span className="text-[10px] text-[#888] font-serif uppercase">Unit Price: {formatCurrency(itemPrice)}</span>
                                  <span className="text-base font-serif font-bold text-[#C9A84C]">
                                    {formatCurrency(itemTotal)}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-bold">Qty: {itemQty}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Delivery Address & Financial Totals Footer Grid */}
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#26241E]">
                          {/* Delivery Address Card */}
                          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#26241E] space-y-1.5 text-xs">
                            <div className="flex items-center justify-between border-b border-[#26241E] pb-2 mb-2">
                              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider font-serif flex items-center gap-1.5">
                                <MapPin size={13} />
                                Delivery Address Details
                              </span>
                              <span className="text-[9px] text-[#4ADE80] font-bold">Verified Address</span>
                            </div>
                            <p className="font-bold text-[#FFF5D6] font-serif">{order.user?.name || user?.name || 'Sarthak Bhatnagar'}</p>
                            <p className="text-[#A39E93] text-[11px] font-mono">{order.user?.email || user?.email}</p>
                            <p className="text-[#A39E93] text-[11px]">Phone: {order.user?.phone || '+91 98785 43210'}</p>
                            <div className="mt-2 text-[#E8E0CC] bg-[#121212] p-2.5 rounded-lg border border-[#222] font-serif leading-relaxed text-[11px]">
                              📍 <strong>Destination Address:</strong><br/>
                              {formattedDeliveryAddress}
                            </div>
                          </div>

                          {/* Billing & Actions Card */}
                          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#26241E] space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b border-[#26241E] pb-2 mb-2">
                                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider font-serif">
                                  Billing Breakdown
                                </span>
                                <span className="text-[9px] text-[#4ADE80] font-bold">Razorpay Secured</span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-[#A39E93]">
                                  <span>Subtotal ({order.items?.length || 1} items):</span>
                                  <span className="text-[#FFF5D6] font-semibold">{formatCurrency(order.subtotal || order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-[#A39E93]">
                                  <span>Estimated Tax:</span>
                                  <span className="text-[#4ADE80] font-semibold">{order.tax ? formatCurrency(order.tax) : 'Included'}</span>
                                </div>
                                <div className="flex justify-between text-[#A39E93]">
                                  <span>Delivery Fee:</span>
                                  <span className="text-[#4ADE80] font-bold">FREE (10-12 Days)</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#26241E] text-[#FFF5D6]">
                                  <span className="font-serif">Total Amount Paid:</span>
                                  <span className="text-[#C9A84C] text-base font-serif font-black">{formatCurrency(order.totalAmount)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center gap-2">
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="flex-1 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
                              >
                                <Eye size={14} />
                                View Full Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#121212] border border-dashed border-[#26241E] rounded-2xl p-12 text-center text-[#A39E93] space-y-3">
                  <Package size={44} className="mx-auto text-[#C9A84C]/40 mb-2" />
                  <h3 className="font-serif font-bold text-[#FFF5D6] text-base">No Orders Found</h3>
                  <p className="text-xs max-w-sm mx-auto">
                    No purchase history matched your search criteria or filter selection.
                  </p>
                  <button
                    onClick={() => { setOrderSearchTerm(''); setOrderFilterStatus('all'); }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-4 py-2 rounded-xl"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}

              {/* Modal for Detailed Printable Invoice */}
              <AnimatePresence>
                {selectedInvoiceOrder && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedInvoiceOrder(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-[#0A0A0A] border-2 border-[#C9A84C] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-[#E8E0CC] my-8 font-serif"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="flex justify-between items-start border-b border-[#26241E] pb-4 mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-[#C9A84C] uppercase tracking-widest">VÆROX SMART LIVING</h2>
                          <p className="text-xs text-[#A39E93] uppercase tracking-wider mt-0.5">Official Purchase Invoice Receipt</p>
                        </div>
                        <button
                          onClick={() => setSelectedInvoiceOrder(null)}
                          className="p-1.5 rounded-lg text-[#A39E93] hover:text-white hover:bg-[#181818] cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="space-y-5 text-xs">
                        <div className="bg-[#121212] p-4 rounded-xl border border-[#26241E] space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[#888] uppercase">Order Reference:</span>
                            <span className="font-mono font-bold text-[#FFF5D6]">{selectedInvoiceOrder.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#888] uppercase">Razorpay Payment ID:</span>
                            <span className="font-mono font-bold text-[#4ADE80]">{selectedInvoiceOrder.paymentId || 'pay_btjbjz9ex5'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#888] uppercase">Payment Status:</span>
                            <span className="font-bold text-[#4ADE80]">✔ PAID (Online)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#888] uppercase">Date & Time:</span>
                            <span className="text-[#CCC]">{selectedInvoiceOrder.date ? new Date(selectedInvoiceOrder.date).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Customer & Address */}
                        <div className="bg-[#121212] p-4 rounded-xl border border-[#26241E] space-y-1">
                          <h4 className="font-bold text-[#C9A84C] uppercase text-[10px] tracking-wider mb-2">Delivery Address Details</h4>
                          <p className="font-bold text-[#FFF5D6] text-sm">{selectedInvoiceOrder.user?.name || user?.name}</p>
                          <p className="text-[#A39E93]">{selectedInvoiceOrder.user?.email || user?.email}</p>
                          <p className="text-[#A39E93]">Phone: {selectedInvoiceOrder.user?.phone || '+91 98785 43210'}</p>
                          <p className="text-[#FFF5D6] mt-2 bg-[#0A0A0A] p-3 rounded-lg border border-[#222]">
                            📍 Baad Post - Kakua gwalior road agra, Agra, Uttar Pradesh - 282009
                          </p>
                          <p className="text-[#D4B559] text-[11px] pt-1">
                            🚚 Delivery Timeline: Order will be placed within 10-12 days.
                          </p>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-[#C9A84C] uppercase text-[10px] tracking-wider">Purchased Product Summary</h4>
                          <div className="bg-[#121212] rounded-xl border border-[#26241E] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-[#26241E] text-[10px] text-[#888] uppercase">
                                  <th className="p-3">Product Name</th>
                                  <th className="p-3 text-center">Qty</th>
                                  <th className="p-3 text-right">Unit Price</th>
                                  <th className="p-3 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(selectedInvoiceOrder.items || []).map((item, i) => (
                                  <tr key={i} className="border-b border-[#1A1A1A]">
                                    <td className="p-3 font-bold text-[#FFF5D6]">
                                      {item.name}
                                      {item.size && <span className="ml-2 text-[10px] text-[#C9A84C] font-mono">(Size: {item.size})</span>}
                                    </td>
                                    <td className="p-3 text-center text-[#A39E93]">x{item.quantity || 1}</td>
                                    <td className="p-3 text-right text-[#A39E93]">{formatCurrency(item.price)}</td>
                                    <td className="p-3 text-right font-bold text-[#C9A84C]">{formatCurrency(item.price * (item.quantity || 1))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Grand Total */}
                        <div className="bg-[#121212] p-4 rounded-xl border border-[#26241E] flex justify-between items-center text-sm font-bold">
                          <span className="text-[#FFF5D6] uppercase">Total Amount Paid:</span>
                          <span className="text-[#C9A84C] text-lg">{formatCurrency(selectedInvoiceOrder.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="mt-6 pt-4 border-t border-[#26241E] flex justify-between items-center gap-3">
                        <button
                          onClick={() => window.print()}
                          className="bg-[#181818] hover:bg-[#222] text-[#FFF5D6] border border-[#26241E] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={14} />
                          Print / Save Invoice
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceOrder(null)}
                          className="bg-[#C9A84C] text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        }

      case 'inbox':
        return (
          <motion.div
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#26241E] flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
                  CUSTOMER INBOX & ORDER NOTIFICATIONS
                </span>
                <h2 className="text-xl font-serif font-bold text-[#FFF5D6]">My Inbox</h2>
                <p className="text-[#A39E93] text-xs mt-0.5">
                  View order updates, cancellation reasons, and bespoke notices sent by VÆROX Admin.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C] uppercase">
                {inboxMessages.length} Messages
              </span>
            </div>

            {inboxMessages.length > 0 ? (
              <div className="space-y-4">
                {inboxMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/50 rounded-2xl p-5 shadow-xl transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#26241E]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-950/80 border border-rose-500/50 text-rose-300 uppercase tracking-wider">
                          ORDER CANCELLED
                        </span>
                        <span className="font-serif text-xs font-bold text-[#FFF5D6]">
                          Order ID: {msg.orderId}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A39E93] font-mono">
                        {new Date(msg.date).toLocaleString()}
                      </span>
                    </div>

                    <div className="py-3 space-y-2">
                      <div className="text-xs text-[#E8E0CC]">
                        <span className="text-[#A39E93] font-serif uppercase text-[10px] block">Item Name:</span>
                        <span className="font-serif font-bold text-[#FFF5D6]">{msg.productName}</span>
                      </div>

                      <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-rose-900/30 text-xs text-rose-200 leading-relaxed font-sans space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 font-serif uppercase block">
                          Reason Provided By Admin:
                        </span>
                        <p className="font-sans text-xs">{msg.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#121212] border border-[#26241E] rounded-2xl p-12 text-center text-[#A39E93] space-y-2">
                <Inbox size={40} className="mx-auto text-[#C9A84C]/40 mb-2" />
                <h3 className="font-serif font-bold text-[#FFF5D6] text-sm">Your Inbox is Empty</h3>
                <p className="text-xs">There are no order cancellation messages or notices at this time.</p>
              </div>
            )}
          </motion.div>
        )

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
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-3 text-sm border border-[#26241E] rounded-xl focus:outline-none focus:border-[#C9A84C] bg-[#121212] text-[#E8E0CC] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
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
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-[#26241E] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#FFF5D6]">Your Cart Preview</h2>
                <p className="text-[#A39E93] text-xs mt-0.5">Quickly adjust quantities of saved cart items</p>
              </div>
              <Link
                to="/user/cart"
                className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 px-4 py-2 rounded-xl transition duration-150 border border-[#C9A84C]/30 flex items-center gap-1"
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
                      className="flex items-center p-3.5 border border-[#26241E] bg-[#121212] rounded-2xl hover:border-[#C9A84C]/40 transition-all duration-300 gap-3 sm:gap-4"
                    >
                      {product?.image ? (
                        <div className="w-16 h-16 bg-[#0A0A0A] border border-[#26241E] p-1.5 rounded-xl flex items-center justify-center flex-shrink-0">
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
                        <div className="w-16 h-16 bg-[#181818] rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="text-[#C9A84C]/60" size={20} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#FFF5D6] text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wide mt-0.5">{product.category}</p>
                        <p className="font-bold text-[#C9A84C] text-xs sm:text-sm mt-1">{formatCurrency(totalPrice)}</p>
                      </div>

                      {/* Compact quantity controls */}
                      <div className="flex items-center bg-[#0A0A0A] border border-[#26241E] rounded-full shadow-2xs overflow-hidden h-7 w-[68px] sm:w-[84px] px-0.5 justify-between">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#E8E0CC] hover:text-[#FFF5D6] hover:bg-[#26241E] transition-all duration-150 text-xs font-bold cursor-pointer select-none"
                        >
                          <Minus size={9} strokeWidth={3} />
                        </motion.button>
                        <span className="text-[10px] sm:text-xs font-bold text-[#FFF5D6] select-none text-center flex-1">
                          {quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#E8E0CC] hover:text-[#FFF5D6] hover:bg-[#26241E] transition-all duration-150 text-xs font-bold cursor-pointer select-none"
                        >
                          <Plus size={9} strokeWidth={3} />
                        </motion.button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpdateQuantity(productId, 0)}
                        className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/40 rounded-xl transition duration-150 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#121212] rounded-2xl border border-dashed border-[#26241E] p-6">
                <ShoppingBag className="w-10 h-10 text-[#C9A84C]/40 mx-auto mb-3" />
                <p className="text-[#FFF5D6] text-xs sm:text-sm font-semibold">Your shopping cart is currently empty.</p>
                <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] px-5 py-2.5 rounded-xl transition duration-150 shadow-md">
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
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-[#26241E] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#FFF5D6]">My Saved Wishlist</h2>
                <p className="text-[#A39E93] text-xs mt-0.5">Quick look at items saved to buy later</p>
              </div>
              <Link
                to="/user/wishlist"
                className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 px-4 py-2 rounded-xl transition duration-150 border border-[#C9A84C]/30 flex items-center gap-1"
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
                      className="flex items-center p-3.5 border border-[#26241E] bg-[#121212] rounded-2xl hover:border-[#C9A84C]/40 transition-all duration-300 gap-3"
                    >
                      {product?.image ? (
                        <div className="w-16 h-16 bg-[#0A0A0A] border border-[#26241E] p-1.5 rounded-xl flex items-center justify-center flex-shrink-0">
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
                        <div className="w-16 h-16 bg-[#181818] rounded-xl flex-shrink-0 flex items-center justify-center text-[#C9A84C]/60">
                          <ShoppingBag size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#FFF5D6] text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wide mt-0.5">{product.category}</p>
                        <p className="font-bold text-[#C9A84C] text-xs sm:text-sm mt-1">{formatCurrency(discountedPrice)}</p>
                      </div>

                      <Link
                        to={`/product/${productId}`}
                        className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold py-2 px-4 rounded-xl text-xs transition duration-200 shadow-md flex items-center gap-1 flex-shrink-0 uppercase tracking-wider"
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
                      className="text-[#C9A84C] hover:text-[#FFF5D6] text-xs font-bold transition duration-150 cursor-pointer"
                    >
                      + {wishlistItems.length - 3} more items in your wishlist
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#121212] rounded-2xl border border-dashed border-[#26241E] p-6">
                <Heart className="w-10 h-10 text-[#C9A84C]/40 mx-auto mb-3" />
                <p className="text-[#FFF5D6] text-xs sm:text-sm font-semibold">Your wishlist is currently empty.</p>
                <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] px-5 py-2.5 rounded-xl transition duration-150 shadow-md">
                  Find Favorites
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )

      case 'queries':
        return (
          <motion.div
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-[#26241E] pb-5">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
                  MY CONTACT FORM INQUIRIES
                </span>
                <h2 className="text-xl font-serif font-bold text-[#FFF5D6] uppercase">My Queries & Replies</h2>
                <p className="text-[#A39E93] text-xs mt-0.5 font-light">
                  Track all your contact form submissions and official admin replies.
                </p>
              </div>
              <Link
                to="/contact"
                className="text-xs font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-105 px-4 py-2.5 rounded-xl transition-all duration-200 uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Plus size={14} />
                Submit New Query
              </Link>
            </div>

            {loadingMessages ? (
              <div className="flex flex-col justify-center items-center py-12 gap-3 bg-[#121212] rounded-2xl border border-[#26241E]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C9A84C] border-t-transparent"></div>
                <span className="text-xs font-semibold text-[#A39E93]">Loading your queries...</span>
              </div>
            ) : contactMessages.length > 0 ? (
              <div className="space-y-6">
                {contactMessages.map((msg) => {
                  const hasReply = msg.isReplied || msg.replyMessage || msg.response;
                  const replyText = msg.replyMessage || msg.response?.message;
                  const replyDate = msg.replyDate || msg.response?.createdAt;

                  return (
                    <div
                      key={msg._id}
                      className="border border-[#26241E] hover:border-[#C9A84C]/40 rounded-2xl p-5 sm:p-6 bg-[#121212] transition-all duration-300 shadow-xl"
                    >
                      {/* Top Bar: Subject & Status */}
                      <div className="flex justify-between items-start gap-4 flex-wrap pb-3 border-b border-[#26241E]">
                        <div>
                          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
                            SUBJECT
                          </span>
                          <h3 className="font-bold font-serif text-[#FFF5D6] text-base sm:text-lg">
                            {msg.subject || 'General Contact Inquiry'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#A39E93] font-mono">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                          <span className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${hasReply
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            }`}>
                            {hasReply ? 'Admin Replied' : 'Pending Response'}
                          </span>
                        </div>
                      </div>

                      {/* User's Original Message */}
                      <div className="py-4">
                        <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wider block mb-1">
                          Your Submitted Query:
                        </span>
                        <div className="text-[#E8E0CC]/90 text-xs sm:text-sm leading-relaxed bg-[#0A0A0A] p-4 rounded-xl border border-[#26241E] font-sans">
                          {msg.message}
                        </div>
                      </div>

                      {/* Official Admin Reply Banner */}
                      {hasReply ? (
                        <div className="mt-2 p-5 bg-gradient-to-br from-[#1F1B10] to-[#121212] border-2 border-[#C9A84C]/40 rounded-xl space-y-2 shadow-inner">
                          <div className="flex justify-between items-center flex-wrap gap-2 pb-2 border-b border-[#C9A84C]/20">
                            <h4 className="font-serif font-bold text-[#FFF5D6] text-xs sm:text-sm flex items-center gap-2">
                              Official Admin Response
                            </h4>
                            {replyDate && (
                              <span className="text-[10px] font-mono text-[#C9A84C]">
                                {new Date(replyDate).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[#FFF5D6] text-xs sm:text-sm leading-relaxed font-serif italic pt-1">
                            "{replyText}"
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 bg-[#181612] border border-[#26241E] rounded-xl flex items-center gap-2 text-xs text-[#A39E93] italic">
                          <AlertCircle size={14} className="text-[#C9A84C]" />
                          <span>Our support team is reviewing your query. Response will appear here once replied.</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-2xl border border-dashed border-[#26241E] p-6">
                <MessageSquare className="w-12 h-12 text-[#C9A84C]/40 mx-auto mb-3" />
                <p className="text-[#FFF5D6] font-serif text-sm font-semibold">You haven't submitted any queries yet.</p>
                <p className="text-[#A39E93] text-xs mt-1">If you have any questions or feedback, feel free to contact us.</p>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] px-6 py-3 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md">
                  Contact Us Now
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>
        )

      case 'messages':
        return (
          <motion.div
            className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] p-6 md:p-8 shadow-2xl text-[#E8E0CC]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-[#26241E] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#FFF5D6]">Support Messages</h2>
                <p className="text-[#A39E93] text-xs mt-0.5">Tickets and messages sent to our seller support</p>
              </div>
              <Link
                to="/contact"
                className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 px-4 py-2 rounded-xl transition duration-150 border border-[#C9A84C]/30 flex items-center gap-1"
              >
                Send New Message
                <Plus size={14} />
              </Link>
            </div>

            {loadingMessages ? (
              <div className="flex flex-col justify-center items-center py-10 gap-3 bg-[#121212] rounded-2xl border border-[#26241E]">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C9A84C] border-t-transparent"></div>
                <span className="text-xs font-semibold text-[#A39E93]">Loading ticket threads...</span>
              </div>
            ) : contactMessages.length > 0 ? (
              <div className="space-y-5">
                {contactMessages.map((message) => (
                  <div
                    key={message._id}
                    className="border border-[#26241E] rounded-2xl p-4 bg-[#121212] hover:border-[#C9A84C]/40 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#FFF5D6] text-sm sm:text-base">{message.subject}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border uppercase ${message.response
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            }`}>
                            {message.response ? 'Replied' : 'Sent'}
                          </span>
                        </div>
                        <p className="text-[#E8E0CC]/90 text-xs sm:text-sm mt-2 leading-relaxed bg-[#0A0A0A] p-3 rounded-xl border border-[#26241E]">{message.message}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#A39E93] whitespace-nowrap bg-[#181818] px-2 py-0.5 rounded border border-[#26241E]">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center text-[10px] text-[#A39E93] gap-1.5 px-1 font-semibold">
                      <span>Ticket ID:</span>
                      <span className="font-mono text-[#C9A84C]">{message._id.substring(0, 10).toUpperCase()}</span>
                    </div>

                    {/* Seller Response */}
                    {message.response && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-[#1F1B10] to-[#121212] border border-[#C9A84C]/40 rounded-xl relative overflow-hidden">
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <h4 className="font-bold text-[#FFF5D6] text-xs sm:text-sm flex items-center gap-1.5 font-serif">
                            <MessageSquare size={13} className="text-[#C9A84C] animate-pulse" />
                            Seller Response
                          </h4>
                          <span className="text-[9px] font-bold text-[#C9A84C] bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#26241E]">
                            {new Date(message.response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-[#FFF5D6] text-xs sm:text-sm leading-relaxed bg-[#0A0A0A] p-3 rounded-lg border border-[#26241E] font-serif italic">{message.response.message}</p>
                          <div className="mt-2.5 flex items-center text-[10px] text-[#C9A84C] font-bold gap-1 pl-1">
                            <span>Staff Agent: {message.response.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#121212] rounded-2xl border border-dashed border-[#26241E] p-6">
                <MessageSquare className="w-10 h-10 text-[#C9A84C]/40 mx-auto mb-3" />
                <p className="text-[#FFF5D6] text-xs sm:text-sm font-semibold">No messages or support tickets found.</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] px-5 py-2.5 rounded-xl transition duration-150 shadow-md uppercase tracking-wider">
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
              {/* Stat 1: My Orders */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('orders')}
                className="bg-[#0A0A0A] p-4.5 rounded-2xl border border-[#26241E] shadow-xl flex items-center gap-3.5 cursor-pointer hover:border-[#C9A84C]/70 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#26241E] flex items-center justify-center text-[#C9A84C] flex-shrink-0">
                  <Package size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wide">My Orders</span>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#FFF5D6] mt-0.5">{userOrders.length}</h4>
                </div>
              </motion.div>

              {/* Stat 2: Cart Items */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('cart')}
                className="bg-[#0A0A0A] p-4.5 rounded-2xl border border-[#26241E] shadow-xl flex items-center gap-3.5 cursor-pointer hover:border-[#C9A84C]/70 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#26241E] flex items-center justify-center text-[#C9A84C] flex-shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wide">Cart Items</span>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#FFF5D6] mt-0.5">{cartItems.length}</h4>
                </div>
              </motion.div>

              {/* Stat 3: Wishlist Saved */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('wishlist')}
                className="bg-[#0A0A0A] p-4.5 rounded-2xl border border-[#26241E] shadow-xl flex items-center gap-3.5 cursor-pointer hover:border-[#C9A84C]/70 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#26241E] flex items-center justify-center text-rose-400 flex-shrink-0">
                  <Heart size={18} className="fill-rose-950" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wide">Saved Items</span>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#FFF5D6] mt-0.5">{wishlistItems.length}</h4>
                </div>
              </motion.div>

              {/* Stat 4: Account Status */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setActiveSection('profile')}
                className="bg-[#0A0A0A] p-4.5 rounded-2xl border border-[#26241E] shadow-xl flex items-center gap-3.5 cursor-pointer hover:border-[#C9A84C]/70 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#26241E] flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wide">Account Status</span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-1 capitalize">{user?.role || 'User'}</h4>
                </div>
              </motion.div>
            </div>

            {/* Split Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* Profile Overview Card */}
              <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl p-5 sm:p-6 space-y-4 text-[#E8E0CC]">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-serif font-extrabold text-[#FFF5D6] uppercase tracking-wide">Account Summary</h3>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Details
                    <ChevronRight size={12} />
                  </button>
                </div>

                {/* Circular Profile Avatar info */}
                <div className="flex items-center gap-4 bg-[#121212] p-4 rounded-xl border border-[#26241E]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] flex items-center justify-center text-black font-black text-sm shadow-md">
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-[#FFF5D6] text-sm truncate">{user?.name}</h4>
                    <p className="text-[#A39E93] text-xs truncate mt-0.5">{user?.email}</p>
                    <span className="text-[9px] font-extrabold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-[#E8E0CC]/80 pt-1">
                  <div className="flex justify-between border-b border-[#26241E] pb-2">
                    <span className="text-[#A39E93] font-semibold">User ID</span>
                    <span className="font-mono text-[#FFF5D6] font-bold">{user?._id?.substring(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between border-b border-[#26241E] pb-2">
                    <span className="text-[#A39E93] font-semibold">Security Level</span>
                    <span className="text-[#FFF5D6] font-bold">Standard Client</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A39E93] font-semibold">Creation Date</span>
                    <span className="text-[#FFF5D6] font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Summary Card */}
              <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl p-5 sm:p-6 space-y-4 text-[#E8E0CC]">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-serif font-extrabold text-[#FFF5D6] uppercase tracking-wide">Cart Overview</h3>
                  <button
                    onClick={() => setActiveSection('cart')}
                    className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-0.5 cursor-pointer"
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
                        <div key={product._id || product.id} className="flex justify-between items-center text-xs py-2 border-b border-[#26241E]">
                          <span className="text-[#E8E0CC] font-medium truncate max-w-[200px]">{product.name}</span>
                          <span className="font-bold text-[#C9A84C]">{formatCurrency(discountedPrice * (item.quantity || 1))}</span>
                        </div>
                      )
                    })}
                    {cartItems.length > 2 && (
                      <p className="text-[10px] font-bold text-[#A39E93] pt-1">+ {cartItems.length - 2} more items in cart</p>
                    )}
                    <Link to="/user/cart" className="w-full mt-3 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition duration-150">
                      Place Order
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-[#121212] rounded-xl border border-dashed border-[#26241E]">
                    <ShoppingBag size={18} className="text-[#C9A84C]/40 mx-auto mb-2" />
                    <p className="text-[#A39E93] text-xs font-semibold">Your cart is currently empty.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Support Messages Widget */}
            <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl p-5 sm:p-6 space-y-4 text-[#E8E0CC]">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-serif font-extrabold text-[#FFF5D6] uppercase tracking-wide">Recent Help Message</h3>
                <button
                  onClick={() => setActiveSection('messages')}
                  className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  View All
                  <ChevronRight size={12} />
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex items-center justify-center py-6 bg-[#121212] rounded-xl border border-[#26241E]">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#C9A84C] border-t-transparent"></div>
                </div>
              ) : contactMessages.length > 0 ? (
                <div className="p-3 border border-[#26241E] bg-[#121212] rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#FFF5D6] text-xs sm:text-sm truncate max-w-[200px]">
                      {contactMessages[0].subject}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase border ${contactMessages[0].response ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      }`}>
                      {contactMessages[0].response ? 'Replied' : 'Sent'}
                    </span>
                  </div>
                  <p className="text-[#A39E93] text-xs line-clamp-2 leading-relaxed bg-[#0A0A0A] p-2.5 rounded-lg border border-[#26241E]">
                    {contactMessages[0].message}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-[#121212] rounded-xl border border-dashed border-[#26241E]">
                  <MessageSquare size={18} className="text-[#C9A84C]/40 mx-auto mb-2" />
                  <p className="text-[#A39E93] text-xs font-semibold">No recent messages.</p>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#0A0A0A] rounded-2xl border border-[#26241E] shadow-2xl p-5 sm:p-6 text-[#E8E0CC]">
              <h3 className="text-sm font-serif font-extrabold text-[#FFF5D6] uppercase tracking-wide mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-[#121212] hover:bg-[#1A1A1A] text-[#FFF5D6] font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-[#26241E] hover:border-[#C9A84C]/40 cursor-pointer"
                >
                  Browse Catalog
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-[#121212] hover:bg-[#1A1A1A] text-[#FFF5D6] font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-[#26241E] hover:border-[#C9A84C]/40 cursor-pointer"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="bg-[#121212] hover:bg-[#1A1A1A] text-[#FFF5D6] font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-[#26241E] hover:border-[#C9A84C]/40 cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/user/cart')}
                  className="bg-[#121212] hover:bg-[#1A1A1A] text-[#FFF5D6] font-bold py-3 px-3 rounded-xl transition duration-150 text-xs uppercase tracking-wider text-center border border-[#26241E] hover:border-[#C9A84C]/40 cursor-pointer"
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
          orders: userOrders.length,
          cart: cartItems.length,
          wishlist: wishlistItems.length,
          queries: contactMessages.length,
          inbox: inboxMessages.length
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
