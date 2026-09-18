import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import { HeroBannerManager } from './components/HeroBannerManager'
import SiteAssetsManager from './components/SiteAssetsManager'
import FAQManager from './components/FAQManager'
import { productAPI, userAPI, activityAPI, contactAPI } from '../../services/api'
import {
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  UserX,
  UserCheck,
  Edit,
  Search,
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  RefreshCw,
  Menu,
  Image as ImageIcon,
  Video,
  Layers,
  Upload,
  MessageSquare,
} from 'lucide-react'

import { compressImage } from '../../utils/imageCompressor'

const ROLES_LIST = [
  'CEO',
  'TEACHER',
  'MANAGER',
  'C.A',
  'OWNER',
  'LAWYER',
  'DOCTOR',
  'ARTIST',
  'ENTREPRENEUR',
  'CUSTOM ATELIER',
]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [contactQueries, setContactQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activities, setActivities] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [replyModalQuery, setReplyModalQuery] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Cancel Order Modal States
  const [cancelModalOrder, setCancelModalOrder] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Order status management
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => ord.id === orderId ? { ...ord, orderStatus: newStatus } : ord)
    setOrders(updated)
    localStorage.setItem('vaerox_admin_orders', JSON.stringify(updated))
    setSuccess(`Order ${orderId} status updated to ${newStatus}`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleConfirmOrderCancellation = (e) => {
    e.preventDefault()
    if (!cancelModalOrder || !cancellationReason.trim()) return

    const orderId = cancelModalOrder.id
    const reasonText = cancellationReason.trim()
    const updated = orders.map(ord => ord.id === orderId ? { ...ord, orderStatus: 'Cancelled', cancelReason: reasonText } : ord)
    setOrders(updated)
    localStorage.setItem('vaerox_admin_orders', JSON.stringify(updated))

    // Send inbox notification to user inbox
    const inboxMessages = JSON.parse(localStorage.getItem('vaerox_user_inbox_messages') || '[]')
    const newMessage = {
      id: `MSG-${Date.now()}`,
      orderId: cancelModalOrder.id,
      userEmail: cancelModalOrder.user?.email || '',
      userName: cancelModalOrder.user?.name || 'Valued Customer',
      productName: cancelModalOrder.items?.map(i => i.name).join(', ') || 'Custom Order Item',
      items: cancelModalOrder.items || [],
      totalAmount: cancelModalOrder.totalAmount,
      reason: reasonText,
      date: new Date().toISOString(),
      status: 'Cancelled',
      read: false
    }
    inboxMessages.unshift(newMessage)
    localStorage.setItem('vaerox_user_inbox_messages', JSON.stringify(inboxMessages))

    setSuccess(`Order ${orderId} cancelled successfully and reason sent to customer's inbox.`)
    setCancelModalOrder(null)
    setCancellationReason('')
    setTimeout(() => setSuccess(''), 4000)
  }

  // Search query states
  const [searchProductQuery, setSearchProductQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [searchOrderQuery, setSearchOrderQuery] = useState('')
  const [searchQueryText, setSearchQueryText] = useState('')

  // Fetch orders from localStorage or seed initial default executive orders
  const fetchOrders = () => {
    const stored = localStorage.getItem('vaerox_admin_orders')
    if (stored) {
      try {
        setOrders(JSON.parse(stored))
      } catch (e) {
        setOrders([])
      }
    } else {
      const defaultOrders = [
        {
          id: 'VRX-849201',
          paymentId: 'pay_Nz82910482',
          date: new Date(Date.now() - 3600000 * 4).toISOString(),
          user: {
            name: 'Vikramaditya Sharma',
            email: 'vikram.sharma@executive.com',
            phone: '+91 98765 43210',
            address: '402 Regency Towers, Bandra Kurla Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400051'
          },
          items: [
            {
              id: 'p1',
              name: 'VÆROX Executive Double-Breasted Wool Tuxedo',
              image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
              price: 18499,
              quantity: 1,
              size: 'XL',
              tier: 'premium',
              category: 'men'
            },
            {
              id: 'p2',
              name: 'Bespoke Satin Silk Bowtie & Pocket Square',
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
              price: 2499,
              quantity: 1,
              size: 'Standard',
              tier: 'premium',
              category: 'accessories'
            }
          ],
          subtotal: 20998,
          tax: 1679.84,
          totalAmount: 22677.84,
          paymentMethod: 'Razorpay Secure (Online)',
          paymentStatus: 'Paid',
          orderStatus: 'Processing'
        },
        {
          id: 'VRX-639102',
          paymentId: 'pay_Kx91024810',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          user: {
            name: 'Ananya Roy',
            email: 'ananya.roy@atelier.io',
            phone: '+91 91234 56789',
            address: '12-A Jubilee Hills, Road No. 36',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500033'
          },
          items: [
            {
              id: 'p3',
              name: 'VÆROX Atelier Sculpted Velvet Blazer',
              image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
              price: 14999,
              quantity: 1,
              size: '34',
              tier: 'premium',
              category: 'women'
            }
          ],
          subtotal: 14999,
          tax: 1199.92,
          totalAmount: 16198.92,
          paymentMethod: 'Razorpay Secure (Online)',
          paymentStatus: 'Paid',
          orderStatus: 'Shipped'
        }
      ]
      localStorage.setItem('vaerox_admin_orders', JSON.stringify(defaultOrders))
      setOrders(defaultOrders)
    }
  }


  // Product edit form state
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'standard-men',
  })

  // Add Product form state
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    image: '',
    subImage1: '',
    subImage2: '',
    subImage3: '',
    subImage4: '',
    description: '',
    price: '',
    discount: '0',
    tier: 'standard', // 'standard' | 'premium'
    gender: 'men', // 'men' | 'women'
    role: 'CEO',
  })

  // Fetch products
  const fetchProducts = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await productAPI.getProducts()
      if (response && response.success) {
        setProducts(response.data || response.products || [])
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching products')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await userAPI.getUsers(token)
      if (response && response.success) {
        const allUsers = response.data || response.users || []
        const regularUsers = allUsers.filter((user) => user.role === 'user')
        setUsers(regularUsers)
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching users')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch activities
  const fetchActivities = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await activityAPI.getActivities(token)
      if (response && response.success) {
        setActivities(response.data || response.activities || [])
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching activities')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch contact queries
  const fetchContactQueries = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await contactAPI.getAllMessages(token)
      if (response && response.success) {
        setContactQueries(response.data || [])
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching contact queries')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Handle admin reply submit
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyModalQuery || !replyText.trim()) return
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await contactAPI.replyMessage(replyModalQuery._id, replyText, token)
      if (response && response.success) {
        setSuccess('Reply sent successfully to user!')
        setReplyModalQuery(null)
        setReplyText('')
        fetchContactQueries(token)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to send reply')
      }
    } catch (err) {
      setError('Error submitting reply')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const loadData = (isSilent = false) => {
      fetchOrders()
      switch (activeSection) {
        case 'products':
          fetchProducts(token, isSilent)
          break
        case 'users':
          fetchUsers(token, isSilent)
          break
        case 'queries':
          fetchContactQueries(token, isSilent)
          break
        default:
          fetchProducts(token, isSilent)
          fetchUsers(token, isSilent)
          fetchActivities(token, isSilent)
          fetchContactQueries(token, isSilent)
          break
      }
    }

    loadData(false)
    const intervalId = setInterval(() => loadData(true), 15000)
    return () => clearInterval(intervalId)
  }, [activeSection, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  // Local PC Image Upload Handler for Add Product with auto-compression
  const handleProductImageUpload = async (e, targetKey = 'image') => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 800, 800, 0.82)
      setNewProductForm((prev) => ({ ...prev, [targetKey]: compressed }))
    } catch (err) {
      console.error('Image compression failed:', err)
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewProductForm((prev) => ({ ...prev, [targetKey]: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Add Product Submit
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault()
    if (!newProductForm.name || !newProductForm.price) return
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const collectionMode = newProductForm.collectionMode || 'classic'
      let finalTier = 'classic'
      let finalRole = ''
      let categoryTag = ''

      if (collectionMode === 'classic') {
        finalTier = 'classic'
        finalRole = ''
        categoryTag = `classic-${newProductForm.gender}`
      } else {
        finalTier = newProductForm.tier || 'standard'
        if (finalTier === 'luxury') {
          finalRole = newProductForm.role || 'CEO'
          categoryTag = `premium-luxury-${newProductForm.gender}-${finalRole}`
        } else {
          finalRole = ''
          categoryTag = `premium-standard-${newProductForm.gender}`
        }
      }

      const allSubImgs = [
        newProductForm.image,
        newProductForm.subImage1,
        newProductForm.subImage2,
        newProductForm.subImage3,
        newProductForm.subImage4
      ].filter(Boolean)

      const payload = {
        name: newProductForm.name,
        image:
          newProductForm.image ||
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
        images: allSubImgs.length > 0 ? allSubImgs : [newProductForm.image],
        description: newProductForm.description,
        price: parseFloat(newProductForm.price),
        discount: parseFloat(newProductForm.discount || 0),
        category: categoryTag,
        tier: finalTier,
        gender: newProductForm.gender,
        role: finalRole,
      }

      const res = await productAPI.createProduct(payload, token)
      if (res && res.success) {
        setSuccess('New Product Added Successfully!')
        setShowAddProductModal(false)
        setNewProductForm({
          name: '',
          image: '',
          subImage1: '',
          subImage2: '',
          subImage3: '',
          subImage4: '',
          description: '',
          price: '',
          discount: '0',
          collectionMode: 'classic',
          tier: 'standard',
          gender: 'men',
          role: 'CEO',
        })
        fetchProducts(token)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to create product')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred while creating product')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        await productAPI.deleteProduct(productId, token)
        setProducts((prev) => prev.filter((p) => p._id !== productId && p.id !== productId))
        setSuccess('Product deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        setProducts((prev) => prev.filter((p) => p._id !== productId && p.id !== productId))
        setSuccess('Product deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle block/unblock user
  const handleBlockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.blockUser(userId, token)
      if (response && response.success) {
        setSuccess('User blocked successfully!')
        setUsers((prev) =>
          prev.map((user) => (user._id === userId ? { ...user, isBlocked: true } : user))
        )
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to block user')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.unblockUser(userId, token)
      if (response && response.success) {
        setSuccess('User unblocked successfully!')
        setUsers((prev) =>
          prev.map((user) => (user._id === userId ? { ...user, isBlocked: false } : user))
        )
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to unblock user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await userAPI.deleteUser(userId, token)
        if (response && response.success) {
          setSuccess('User deleted successfully!')
          fetchUsers(token)
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (err) {
        setError('An error occurred while deleting user')
      } finally {
        setLoading(false)
      }
    }
  }

  const getProductImageUrl = (product) => {
    if (!product || !product.image) {
      return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&h=200'
    }
    const isSpecial =
      product.image.startsWith('http://') ||
      product.image.startsWith('https://') ||
      product.image.startsWith('data:') ||
      product.image.startsWith('blob:')
    if (isSpecial) return product.image
    if (product.image.startsWith('/uploads/')) return product.image
    return `/uploads/${product.image}`
  }

  const getUserAvatar = (user) => {
    const firstLetter = user?.name?.charAt(0)?.toUpperCase() || 'U'
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23C9A84C" rx="50"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="black">${firstLetter}</text></svg>`
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'products': {
        const filteredProducts = products.filter((product) => {
          const query = searchProductQuery.toLowerCase().trim()
          return (
            (product.name || '').toLowerCase().includes(query) ||
            (product.category || '').toLowerCase().includes(query)
          )
        })

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl shadow-xl p-6 text-[#E8E0CC]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#26241E] pb-5">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                  INVENTORY MANAGEMENT
                </span>
                <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Manage Products</h2>
                <p className="text-[#A39E93] text-xs mt-0.5 font-light">
                  Add new inventory, edit existing prices, or filter products.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-[#C9A84C]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchProductQuery}
                    onChange={(e) => setSearchProductQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black border border-[#26241E] rounded-xl focus:outline-none focus:border-[#C9A84C] text-xs text-[#E8E0CC]"
                  />
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add New Product
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-[#26241E] rounded-xl">
                <ShoppingBag className="w-12 h-12 mx-auto text-[#C9A84C]/40 mb-3" />
                <p className="text-[#FFF5D6] font-serif font-medium">No products found</p>
                <p className="text-[#A39E93] text-xs mt-1 font-light">Click "Add New Product" to add items to your catalog.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-[#26241E] rounded-xl">
                <table className="min-w-full divide-y divide-[#26241E]">
                  <thead className="bg-[#121212] text-[#C9A84C]">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Product</th>
                      <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Category</th>
                      <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Price</th>
                      <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Discount</th>
                      <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26241E] bg-[#0A0A0A]">
                    {filteredProducts.map((product) => (
                      <tr key={product._id || product.id} className="hover:bg-[#121212] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center">
                            <img
                              src={getProductImageUrl(product)}
                              alt={product.name}
                              className="w-10 h-10 object-cover mr-3 rounded-lg border border-[#26241E]"
                            />
                            <span className="font-semibold text-[#FFF5D6] text-sm">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#E8E0CC]/80 text-xs uppercase font-medium">
                          {product.category}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#C9A84C] text-sm">
                          ₹{product.price}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {product.discount ? `${product.discount}% Off` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteProduct(product._id || product.id)}
                            className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )
      }

      case 'users': {
        const filteredUsers = users.filter((user) => {
          const query = searchUserQuery.toLowerCase().trim()
          return (
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query)
          )
        })

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-6 text-[#E8E0CC]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#26241E] pb-5">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                  USER MODERATION
                </span>
                <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Manage Registered Users</h2>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search className="w-4 h-4 text-[#C9A84C]" />
                </span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC]"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-[#26241E] rounded-xl">
              <table className="min-w-full divide-y divide-[#26241E]">
                <thead className="bg-[#121212] text-[#C9A84C]">
                  <tr>
                    <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">User</th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Email</th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Status</th>
                    <th className="py-3.5 px-4 text-left text-xs font-bold uppercase tracking-wider font-serif">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26241E] bg-[#0A0A0A]">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-[#121212] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center">
                          <img
                            src={getUserAvatar(user)}
                            alt={user.name}
                            className="w-8 h-8 rounded-full mr-3 border border-[#C9A84C]"
                          />
                          <span className="font-semibold text-[#FFF5D6] text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#E8E0CC]/80 text-xs">{user.email}</td>
                      <td className="py-3.5 px-4 text-xs font-bold text-[#C9A84C]">
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(user._id)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user._id)}
                              className="p-1.5 text-amber-400 hover:bg-amber-950/40 rounded-lg"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      }

      case 'orders': {
        const filteredOrders = orders.filter(ord =>
          ord.id.toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
          ord.user?.name?.toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
          ord.user?.email?.toLowerCase().includes(searchOrderQuery.toLowerCase())
        )

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-[#E8E0CC]"
          >
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0A0A] p-6 rounded-2xl border border-[#26241E] shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
                  CUSTOMER ORDERS MANAGEMENT
                </span>
                <h2 className="text-xl font-bold font-serif text-[#FFF5D6] uppercase">
                  All Placed Orders & Client Details
                </h2>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Order ID or Client Name..."
                  value={searchOrderQuery}
                  onChange={(e) => setSearchOrderQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map((ord) => (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C]/40 rounded-3xl p-6 shadow-2xl transition-all"
                  >
                    {/* Top Row: Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#26241E] mb-6">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                          ORDER #{ord.id}
                        </span>
                        <span className="text-xs text-[#A39E93] font-mono">
                          {new Date(ord.date).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#FFF5D6]">
                          Total: <span className="text-[#C9A84C] text-sm">₹{ord.totalAmount?.toLocaleString()}</span>
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          {ord.paymentStatus} ({ord.paymentMethod || 'Razorpay'})
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: User Details + Product Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* 1. USER & SHIPPING DETAILS */}
                      <div className="lg:col-span-5 bg-[#121212] p-5 rounded-2xl border border-[#26241E]">
                        <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3 font-serif flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#C9A84C]" />
                          CLIENT & SHIPPING DETAILS
                        </h4>

                        <div className="space-y-2 text-xs text-[#E8E0CC]/90 font-sans">
                          <div>
                            <span className="text-[#A39E93] font-serif text-[10px] uppercase block">Client Name:</span>
                            <span className="font-bold text-[#FFF5D6] text-sm">{ord.user?.name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[#A39E93] font-serif text-[10px] uppercase block">Email Address:</span>
                            <span className="font-mono text-emerald-400">{ord.user?.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[#A39E93] font-serif text-[10px] uppercase block">Contact Phone:</span>
                            <span className="font-mono">{ord.user?.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[#A39E93] font-serif text-[10px] uppercase block">Delivery Address:</span>
                            <span className="leading-relaxed block bg-[#0A0A0A] p-2.5 rounded-xl border border-[#26241E] mt-1 text-[#E8E0CC]">
                              {ord.user?.address || 'N/A'}, {ord.user?.city || ''}, {ord.user?.state || ''} - {ord.user?.zipCode || ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. ORDERED PRODUCTS & SIZE DETAILS */}
                      <div className="lg:col-span-7 bg-[#121212] p-5 rounded-2xl border border-[#26241E]">
                        <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3 font-serif flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#C9A84C]" />
                          PURCHASED PRODUCTS & SIZE SPECS
                        </h4>

                        <div className="space-y-3">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="bg-[#0A0A0A] p-3 rounded-xl border border-[#26241E] space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={it.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80'}
                                    alt={it.name}
                                    className="w-14 h-14 object-cover rounded-lg border border-[#26241E] flex-shrink-0"
                                  />
                                  <div>
                                    <h5 className="font-serif font-bold text-xs text-[#FFF5D6] uppercase leading-tight line-clamp-1">{it.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${it.size === 'Custom Fit' || it.customMeasurements
                                        ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                                        : 'bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C]'
                                        }`}>
                                        SIZE: {it.size || 'L'}
                                      </span>
                                      <span className="text-[10px] text-[#A39E93]">Qty: {it.quantity || 1}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="font-bold text-xs text-[#C9A84C] font-serif">
                                  ₹{(it.price * (it.quantity || 1)).toLocaleString()}
                                </span>
                              </div>

                              {/* DISPLAY CUSTOM BODY MEASUREMENTS IF FILLED BY USER */}
                              {it.customMeasurements && (
                                <div className="mt-2 text-[10px] bg-[#121212] p-2.5 rounded-lg border border-[#C9A84C]/30 text-[#FFF5D6] font-mono grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                  <div><span className="text-[#A39E93] block text-[8.5px]">CHEST:</span> {it.customMeasurements.chest}"</div>
                                  <div><span className="text-[#A39E93] block text-[8.5px]">SHOULDER:</span> {it.customMeasurements.shoulder}"</div>
                                  <div><span className="text-[#A39E93] block text-[8.5px]">WAIST:</span> {it.customMeasurements.waist}"</div>
                                  <div><span className="text-[#A39E93] block text-[8.5px]">THIGH:</span> {it.customMeasurements.thigh}"</div>
                                  <div><span className="text-[#A39E93] block text-[8.5px]">TORSO:</span> {it.customMeasurements.torso}"</div>
                                  <div><span className="text-[#A39E93] block text-[8.5px]">HIPS:</span> {it.customMeasurements.hips}"</div>
                                  <div className="col-span-2 text-[#C9A84C] font-bold"><span className="text-[#A39E93] block text-[8.5px]">FIT TYPE:</span> {it.customMeasurements.fitPreference || 'Tailored Fit'}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Reason Notice if Cancelled */}
                    {ord.cancelReason && (
                      <div className="mt-4 p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300">
                        <span className="font-bold text-[10px] uppercase font-serif block text-rose-400 mb-0.5">Cancellation Reason Provided to User:</span>
                        {ord.cancelReason}
                      </div>
                    )}

                    {/* Bottom Row: Status Controls & Cancel Button */}
                    <div className="mt-6 pt-4 border-t border-[#26241E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif text-[#A39E93] uppercase">Current Order Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          : ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : ord.orderStatus === 'Shipped'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          }`}>
                          {ord.orderStatus || 'Processing'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-[#C9A84C] uppercase font-serif">Actions:</span>
                        {['Processing', 'Shipped', 'Delivered'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(ord.id, st)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${ord.orderStatus === st
                              ? 'bg-[#C9A84C] text-black shadow-md'
                              : 'bg-[#121212] text-[#A39E93] border border-[#26241E] hover:border-[#C9A84C]'
                              }`}
                          >
                            {st}
                          </button>
                        ))}

                        {/* CANCEL ORDER BUTTON */}
                        <button
                          onClick={() => {
                            setCancelModalOrder(ord)
                            setCancellationReason('')
                          }}
                          className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all bg-rose-950/60 text-rose-300 border border-rose-700/50 hover:bg-rose-900 cursor-pointer shadow-md flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Product Order
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-12 text-center text-[#A39E93]">
                No customer orders found matching your search.
              </div>
            )}
          </motion.div>
        )
      }

      case 'queries': {
        const filteredQueries = contactQueries.filter((q) => {
          const query = searchQueryText.toLowerCase().trim()
          return (
            (q.name || '').toLowerCase().includes(query) ||
            (q.email || '').toLowerCase().includes(query) ||
            (q.subject || '').toLowerCase().includes(query) ||
            (q.message || '').toLowerCase().includes(query)
          )
        })

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-[#E8E0CC]"
          >
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0A0A] p-6 rounded-2xl border border-[#26241E] shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
                  CUSTOMER SUPPORT & INQUIRIES
                </span>
                <h2 className="text-xl font-bold font-serif text-[#FFF5D6] uppercase">
                  Users Queries & Contact Submissions
                </h2>
                <p className="text-[#A39E93] text-xs mt-0.5 font-light">
                  View contact form submissions from users and reply directly.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search queries by name, email..."
                  value={searchQueryText}
                  onChange={(e) => setSearchQueryText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {/* Queries Grid/List */}
            {filteredQueries.length > 0 ? (
              <div className="space-y-4">
                {filteredQueries.map((q) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C]/40 rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26241E]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] font-extrabold text-sm font-serif uppercase">
                          {q.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#FFF5D6] text-sm">{q.name}</h4>
                          <span className="text-xs text-emerald-400 font-mono">{q.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#A39E93] font-mono">
                          {new Date(q.createdAt).toLocaleString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${q.isReplied
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          }`}>
                          {q.isReplied ? 'Replied' : 'Pending Reply'}
                        </span>
                      </div>
                    </div>

                    <div className="py-4 space-y-2">
                      <div className="text-xs font-serif font-bold text-[#C9A84C] uppercase">
                        Subject: <span className="text-[#FFF5D6] font-sans normal-case">{q.subject || 'General Inquiry'}</span>
                      </div>
                      <div className="bg-[#121212] p-4 rounded-xl border border-[#26241E] text-xs text-[#E8E0CC]/90 leading-relaxed font-sans">
                        {q.message}
                      </div>
                    </div>

                    {/* Admin Reply Section */}
                    {q.isReplied && q.replyMessage ? (
                      <div className="mt-2 bg-[#1A1813] border border-[#C9A84C]/30 p-4 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider font-serif">
                          <span>★ Admin Reply:</span>
                          <span className="font-mono text-[#A39E93]">
                            {q.replyDate ? new Date(q.replyDate).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-[#FFF5D6] leading-relaxed italic">
                          "{q.replyMessage}"
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setReplyModalQuery(q)
                            setReplyText('')
                          }}
                          className="px-4 py-2 bg-[#C9A84C] hover:bg-[#FFF5D6] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          Reply to Query
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-12 text-center text-[#A39E93]">
                No user queries found.
              </div>
            )}
          </motion.div>
        )
      }

      case 'hero':
        return <HeroBannerManager />

      case 'assets':
        return <SiteAssetsManager />

      case 'faqs':
        return <FAQManager />

      default: {
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-[#E8E0CC]"
          >
            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Products Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-5 flex items-center justify-between shadow-xl"
              >
                <div>
                  <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest font-serif block">
                    TOTAL PRODUCTS
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
                    {products.length}
                  </h3>
                  <p className="text-[#A39E93] text-[10px] font-light mt-1">Active inventory count</p>
                </div>
                <div className="bg-black p-3.5 rounded-2xl border border-[#C9A84C]/40 text-[#C9A84C]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Users Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-5 flex items-center justify-between shadow-xl"
              >
                <div>
                  <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest font-serif block">
                    REGULAR USERS
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
                    {users.length}
                  </h3>
                  <p className="text-[#A39E93] text-[10px] font-light mt-1">Registered clients</p>
                </div>
                <div className="bg-black p-3.5 rounded-2xl border border-[#C9A84C]/40 text-[#C9A84C]">
                  <Users className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Customer Orders Card */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setActiveSection('orders')}
                className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:border-[#C9A84C]"
              >
                <div>
                  <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest font-serif block">
                    CUSTOMER ORDERS
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
                    {orders.length}
                  </h3>
                  <p className="text-[#A39E93] text-[10px] font-light mt-1">View active orders</p>
                </div>
                <div className="bg-black p-3.5 rounded-2xl border border-[#C9A84C]/40 text-[#C9A84C]">
                  <FileText className="w-6 h-6" />
                </div>
              </motion.div>

              {/* Hero Banners Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-5 flex items-center justify-between shadow-xl"
              >
                <div>
                  <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest font-serif block">
                    HERO BANNERS
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">ACTIVE</h3>
                  <p className="text-[#A39E93] text-[10px] font-light mt-1">Homepage hero slides</p>
                </div>
                <div className="bg-black p-3.5 rounded-2xl border border-[#C9A84C]/40 text-[#C9A84C]">
                  <Layers className="w-6 h-6" />
                </div>
              </motion.div>
            </div>

            {/* Administrative Shortcuts */}
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-[#FFF5D6] mb-4 flex items-center gap-2 font-serif uppercase tracking-wider">
                <FileText className="w-5 h-5 text-[#C9A84C]" />
                Administrative Control Shortcuts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('products')}
                  className="flex items-center justify-between p-4 bg-[#121212] border border-[#26241E] rounded-xl hover:border-[#C9A84C] transition-all text-xs font-bold text-[#FFF5D6] uppercase tracking-wider"
                >
                  <span>Inventory Control</span>
                  <ShoppingBag className="w-4 h-4 text-[#C9A84C]" />
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="flex items-center justify-between p-4 bg-[#121212] border border-[#26241E] rounded-xl hover:border-[#C9A84C] transition-all text-xs font-bold text-[#FFF5D6] uppercase tracking-wider"
                >
                  <span>Customer Orders</span>
                  <FileText className="w-4 h-4 text-[#C9A84C]" />
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className="flex items-center justify-between p-4 bg-[#121212] border border-[#26241E] rounded-xl hover:border-[#C9A84C] transition-all text-xs font-bold text-[#FFF5D6] uppercase tracking-wider"
                >
                  <span>User Moderation</span>
                  <Users className="w-4 h-4 text-[#C9A84C]" />
                </button>
                <button
                  onClick={() => setActiveSection('hero')}
                  className="flex items-center justify-between p-4 bg-[#121212] border border-[#26241E] rounded-xl hover:border-[#C9A84C] transition-all text-xs font-bold text-[#FFF5D6] uppercase tracking-wider"
                >
                  <span>Hero Banners</span>
                  <Layers className="w-4 h-4 text-[#C9A84C]" />
                </button>
              </div>
            </div>

            {/* RECENT CUSTOMER ORDERS OVERVIEW */}
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-[#FFF5D6] flex items-center gap-2 font-serif uppercase tracking-wider">
                  <FileText className="w-5 h-5 text-[#C9A84C]" />
                  Recent Customer Orders
                </h2>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#121212] p-4 rounded-xl border border-[#26241E] gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#FFF5D6] font-serif block">
                          ORDER #{ord.id} - <span className="text-[#C9A84C] font-sans">{ord.user?.name}</span>
                        </span>
                        <span className="text-[10px] text-[#A39E93] font-mono">{ord.user?.email} • Size: {ord.items?.[0]?.size || 'L'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#C9A84C]">₹{ord.totalAmount?.toLocaleString()}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#A39E93] text-xs font-light">
                  No orders recorded yet.
                </div>
              )}
            </div>
          </motion.div>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] flex select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        counts={{
          products: products.length,
          users: users.length,
          orders: orders.length,
          queries: contactQueries.filter(q => !q.isReplied).length,
        }}
      />

      {/* Main Frame */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-[#0A0A0A] border-b border-[#26241E] shadow-2xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                ADMINISTRATOR PORTAL
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] tracking-tight capitalize">
                {activeSection === 'dashboard' ? 'Overview Dashboard' : `${activeSection} Management`}
              </h1>
            </div>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-[#C9A84C] hover:bg-[#141414] md:hidden transition-colors border border-[#26241E] bg-black"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0A0A0A] border-2 border-[#C9A84C] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(201,168,76,0.3)] text-[#E8E0CC]"
            >
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#26241E]">
                <div>
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                    VÆROX INVENTORY
                  </span>
                  <h2 className="text-xl font-bold text-[#FFF5D6] font-serif">Add New Product</h2>
                </div>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-2 text-[#A39E93] hover:text-[#FFF5D6]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VÆROX Executive CEO Tuxedo"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                {/* Local PC Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Product Image (Upload from Local PC) *
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="block w-full text-xs text-[#A39E93] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C9A84C] file:text-black hover:file:bg-[#FFF5D6] cursor-pointer bg-black p-2 border border-[#26241E] rounded-xl"
                    />
                    {!newProductForm.image || !newProductForm.image.startsWith('data:') ? (
                      <input
                        type="text"
                        placeholder="Or paste external image URL"
                        value={newProductForm.image && !newProductForm.image.startsWith('data:') ? newProductForm.image : ''}
                        onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                        className="w-full px-4 py-2 bg-black border border-[#26241E] rounded-xl text-[11px] text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                      />
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold px-2">✓ Image uploaded from PC (compressed)</span>
                    )}
                  </div>
                  {/* Preview */}
                  {newProductForm.image && (
                    <div className="mt-2 flex items-center gap-3 bg-black p-2 rounded-xl border border-[#26241E]">
                      <img src={newProductForm.image} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-[#26241E]" onError={(e) => { e.target.style.display = 'none' }} />
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Main Image Ready</span>
                    </div>
                  )}
                </div>

                {/* 4 Sub-Product Images Upload (Admin Upload for Product Gallery) */}
                <div className="bg-[#121212] p-4 rounded-2xl border border-[#26241E]">
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-2 font-serif">
                    4 Sub-Product Gallery Images (Optional Sub Views)
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((num) => {
                      const keyName = `subImage${num}`
                      return (
                        <div key={num} className="space-y-1">
                          <span className="text-[10px] font-bold text-[#A39E93] uppercase block">Sub Image {num}:</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(e, keyName)}
                            className="block w-full text-[10px] text-[#A39E93] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#C9A84C] file:text-black hover:file:bg-[#FFF5D6] cursor-pointer bg-black p-1.5 border border-[#26241E] rounded-lg"
                          />
                          {!newProductForm[keyName] || !newProductForm[keyName].startsWith('data:') ? (
                            <input
                              type="text"
                              placeholder={`Or paste Sub Image ${num} URL`}
                              value={newProductForm[keyName] && !newProductForm[keyName].startsWith('data:') ? newProductForm[keyName] : ''}
                              onChange={(e) => setNewProductForm({ ...newProductForm, [keyName]: e.target.value })}
                              className="w-full px-3 py-1.5 bg-black border border-[#26241E] rounded-lg text-[10px] text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                            />
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-bold">✓ Uploaded</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Handcrafted double-breasted satin lapel tuxedo..."
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                {/* Price & Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Original Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="24999"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="15"
                      value={newProductForm.discount}
                      onChange={(e) => setNewProductForm({ ...newProductForm, discount: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                {/* Main Collection Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Select Main Collection Category *
                  </label>
                  <select
                    value={newProductForm.collectionMode || 'classic'}
                    onChange={(e) => setNewProductForm({ ...newProductForm, collectionMode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border-2 border-[#C9A84C] rounded-xl text-xs text-[#FFF5D6] focus:outline-none font-bold"
                  >
                    <option value="classic">Classic Clothes (Everyday Regular Wear)</option>
                    <option value="premium">VAEROX Premium (Bespoke & Executive Outfits)</option>
                  </select>
                </div>

                {/* Sub-Tier (Only if VAEROX Premium is selected) */}
                {newProductForm.collectionMode === 'premium' && (
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      VAEROX Premium Sub-Tier *
                    </label>
                    <select
                      value={newProductForm.tier || 'standard'}
                      onChange={(e) => setNewProductForm({ ...newProductForm, tier: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="standard">VAEROX Standard (Daily Wear Premium Clothes)</option>
                      <option value="luxury">VAEROX Luxury (Ultra/Superb Premium Executive Persona Outfits)</option>
                    </select>
                  </div>
                )}

                {/* Gender Category */}
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Gender Category *
                  </label>
                  <select
                    value={newProductForm.gender || 'men'}
                    onChange={(e) => setNewProductForm({ ...newProductForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="men">Men's Wear</option>
                    <option value="women">Women's Wear</option>
                  </select>
                </div>

                {/* Role Sub-Category (ONLY FOR VAEROX LUXURY) */}
                {newProductForm.collectionMode === 'premium' && newProductForm.tier === 'luxury' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Executive Look-Alike Persona Outfit Role (VAEROX Luxury) *
                    </label>
                    <select
                      value={newProductForm.role || 'CEO'}
                      onChange={(e) => setNewProductForm({ ...newProductForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border-2 border-[#C9A84C] rounded-xl text-xs text-[#FFF5D6] focus:outline-none font-bold"
                    >
                      {ROLES_LIST.map((role) => (
                        <option key={role} value={role}>
                          {role} Outfit
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#26241E]">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-5 py-2.5 border border-[#26241E] text-[#A39E93] rounded-xl text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-xs rounded-xl uppercase tracking-wider hover:scale-105 transition-all"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Reply to Query Modal */}
        {replyModalQuery && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0A0A0A] border-2 border-[#C9A84C] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(201,168,76,0.3)] text-[#E8E0CC]"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#26241E]">
                <div>
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif">
                    REPLY TO QUERY
                  </span>
                  <h2 className="text-lg font-bold text-[#FFF5D6] font-serif">
                    User: {replyModalQuery.name}
                  </h2>
                </div>
                <button
                  onClick={() => setReplyModalQuery(null)}
                  className="p-2 text-[#A39E93] hover:text-[#FFF5D6]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 bg-[#121212] p-3 rounded-xl border border-[#26241E]">
                <p className="text-[11px] font-bold text-[#C9A84C] uppercase mb-1 font-serif">Original User Message:</p>
                <p className="text-xs text-[#E8E0CC]/80 italic">"{replyModalQuery.message}"</p>
              </div>

              <form onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1 font-serif">
                    Your Official Response *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Type your response to the user query here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-[#26241E] rounded-xl text-xs text-[#FFF5D6] focus:outline-none focus:border-[#C9A84C] leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalQuery(null)}
                    className="px-4 py-2 border border-[#26241E] text-[#A39E93] rounded-xl text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#C9A84C] via-[#D4B559] to-[#9B782B] text-black font-extrabold text-xs rounded-xl uppercase tracking-wider hover:scale-105 transition-all shadow-lg"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ADMIN ORDER CANCELLATION REASON MODAL */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border-2 border-rose-600/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(225,29,72,0.25)] text-[#E8E0CC]"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#26241E]">
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-serif block">
                    ADMIN ORDER CANCELLATION
                  </span>
                  <h2 className="text-lg font-bold text-[#FFF5D6] font-serif">
                    Order ID: {cancelModalOrder.id}
                  </h2>
                </div>
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="p-2 text-[#A39E93] hover:text-[#FFF5D6]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 bg-[#121212] p-3 rounded-xl border border-[#26241E] text-xs space-y-1">
                <p className="text-[10px] font-bold text-[#C9A84C] uppercase font-serif">Client Details:</p>
                <p className="text-[#FFF5D6] font-bold">{cancelModalOrder.user?.name} ({cancelModalOrder.user?.email})</p>
                <p className="text-[10px] text-[#A39E93]">Product(s): {cancelModalOrder.items?.map(i => i.name).join(', ')}</p>
              </div>

              <form onSubmit={handleConfirmOrderCancellation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5 font-serif">
                    Reason for Order Cancellation *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Specify exact reason for cancelling this order (e.g., Fabric stock unavailable, Bespoke size fitting mismatch, etc.). This reason will be sent directly to the customer's Inbox."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-[#26241E] rounded-xl text-xs text-[#FFF5D6] focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(null)}
                    className="px-4 py-2.5 border border-[#26241E] text-[#A39E93] hover:text-white rounded-xl text-xs uppercase font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                  >
                    Confirm Cancellation & Send to User Inbox
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Notifications Toast */}
        <div className="fixed bottom-5 right-5 z-[200]">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#C9A84C] text-black px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

