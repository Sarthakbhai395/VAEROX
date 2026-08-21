import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import { HeroBannerManager } from './components/HeroBannerManager'
import { UGCVideoManager } from './components/UGCVideoManager'
import { productAPI, userAPI, activityAPI } from '../../services/api'
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
  Sparkles,
  Video,
  Layers,
  Upload,
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activities, setActivities] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)

  // Search query states
  const [searchProductQuery, setSearchProductQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')

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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const loadData = (isSilent = false) => {
      switch (activeSection) {
        case 'products':
          fetchProducts(token, isSilent)
          break
        case 'users':
          fetchUsers(token, isSilent)
          break
        default:
          fetchProducts(token, isSilent)
          fetchUsers(token, isSilent)
          fetchActivities(token, isSilent)
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
  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 800, 800, 0.82)
      setNewProductForm((prev) => ({ ...prev, image: compressed }))
    } catch (err) {
      console.error('Image compression failed:', err)
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewProductForm((prev) => ({ ...prev, image: event.target.result }))
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
      const categoryTag =
        newProductForm.tier === 'premium'
          ? `premium-${newProductForm.gender}-${newProductForm.role}`
          : `standard-${newProductForm.gender}`

      const payload = {
        name: newProductForm.name,
        image:
          newProductForm.image ||
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
        description: newProductForm.description,
        price: parseFloat(newProductForm.price),
        discount: parseFloat(newProductForm.discount || 0),
        category: categoryTag,
        tier: newProductForm.tier,
        gender: newProductForm.gender,
        role: newProductForm.tier === 'premium' ? newProductForm.role : '',
      }

      const res = await productAPI.createProduct(payload, token)
      if (res && res.success) {
        setSuccess('New Product Added Successfully!')
        setShowAddProductModal(false)
        setNewProductForm({
          name: '',
          image: '',
          description: '',
          price: '',
          discount: '0',
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
        const response = await productAPI.deleteProduct(productId, token)
        if (response && response.success) {
          setSuccess('Product deleted successfully!')
          fetchProducts(token)
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (err) {
        setError('An error occurred while deleting product')
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

      case 'hero':
        return <HeroBannerManager />

      case 'ugc':
        return <UGCVideoManager />

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

              {/* UGC Video Reels Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-5 flex items-center justify-between shadow-xl"
              >
                <div>
                  <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest font-serif block">
                    UGC VIDEO REELS
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">ACTIVE</h3>
                  <p className="text-[#A39E93] text-[10px] font-light mt-1">Community video reels</p>
                </div>
                <div className="bg-black p-3.5 rounded-2xl border border-[#C9A84C]/40 text-[#C9A84C]">
                  <Video className="w-6 h-6" />
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
                <button
                  onClick={() => setActiveSection('ugc')}
                  className="flex items-center justify-between p-4 bg-[#121212] border border-[#26241E] rounded-xl hover:border-[#C9A84C] transition-all text-xs font-bold text-[#FFF5D6] uppercase tracking-wider"
                >
                  <span>UGC Video Reels</span>
                  <Video className="w-4 h-4 text-[#C9A84C]" />
                </button>
              </div>
            </div>

            {/* Action Feed */}
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-[#FFF5D6] mb-4 flex items-center gap-2 font-serif uppercase tracking-wider">
                <Clock className="w-5 h-5 text-[#C9A84C]" />
                Recent Action Logs
              </h2>
              <div className="text-center py-8 text-[#A39E93] text-xs font-light">
                No recent admin alerts logged. System operational.
              </div>
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

        {/* ═══ ADD PRODUCT MODAL FORM ═══ */}
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
                      <img src={newProductForm.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-[#26241E]" onError={(e) => { e.target.style.display = 'none' }} />
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Image Ready</span>
                    </div>
                  )}
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

                {/* Tier & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Collection Tier *
                    </label>
                    <select
                      value={newProductForm.tier}
                      onChange={(e) => setNewProductForm({ ...newProductForm, tier: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="standard">Standard Clothes</option>
                      <option value="premium">VÆROX Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Gender Category *
                    </label>
                    <select
                      value={newProductForm.gender}
                      onChange={(e) => setNewProductForm({ ...newProductForm, gender: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="men">Men's Wear</option>
                      <option value="women">Women's Wear</option>
                    </select>
                  </div>
                </div>

                {/* Role Sub-Category (ONLY FOR VAEROX PREMIUM) */}
                {newProductForm.tier === 'premium' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                      Role / Profession Sub-Category (VÆROX Premium Only) *
                    </label>
                    <select
                      value={newProductForm.role}
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
