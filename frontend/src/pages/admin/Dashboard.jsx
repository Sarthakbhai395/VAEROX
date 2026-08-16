import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import { productAPI, userAPI, activityAPI } from '../../services/api'
import { 
  ShoppingBag, 
  Users, 
  Store, 
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
  Menu 
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activities, setActivities] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Search query states
  const [searchProductQuery, setSearchProductQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [searchSellerQuery, setSearchSellerQuery] = useState('')

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'electronics'
  })

  // Fetch products
  const fetchProducts = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await productAPI.getProducts()
      if (response.success) {
        setProducts(response.data || response.products || [])
      } else {
        if (!silent) setError('Failed to fetch products')
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching products')
      console.error(err)
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
      if (response.success) {
        // Filter out admins and sellers, keep only regular users
        const allUsers = response.data || response.users || [];
        const regularUsers = allUsers.filter(user => user.role === 'user')
        setUsers(regularUsers)
      } else {
        if (!silent) setError('Failed to fetch users')
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching users')
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch sellers
  const fetchSellers = async (token, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError('')
      }
      const response = await userAPI.getSellersOnly(token)
      if (response.success) {
        setSellers(response.data || response.sellers || [])
      } else {
        if (!silent) setError('Failed to fetch sellers')
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching sellers')
      console.error(err)
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
      if (response.success) {
        setActivities(response.data || response.activities || [])
      } else {
        if (!silent) setError('Failed to fetch activities')
      }
    } catch (err) {
      if (!silent) setError('An error occurred while fetching activities')
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch data when component mounts or when active section changes
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
        case 'sellers':
          fetchSellers(token, isSilent)
          break
        default:
          // Fetch all data for dashboard overview
          fetchProducts(token, isSilent)
          fetchUsers(token, isSilent)
          fetchSellers(token, isSilent)
          fetchActivities(token, isSilent)
          break
      }
    }

    // Initial load
    loadData(false)

    // Set up silent polling interval for real-time dashboard updates every 15 seconds
    const intervalId = setInterval(() => {
      loadData(true)
    }, 15000)

    return () => clearInterval(intervalId)
  }, [activeSection, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await productAPI.deleteProduct(productId, token)
        if (response.success) {
          setSuccess('Product deleted successfully!')
          fetchProducts(token)
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete product')
        }
      } catch (err) {
        setError('An error occurred while deleting the product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle block user
  const handleBlockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.blockUser(userId, token)
      if (response.success) {
        setSuccess('User blocked successfully!')
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBlocked: true } : user
          )
        )
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to block user')
      }
    } catch (err) {
      setError('An error occurred while blocking the user')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle unblock user
  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.unblockUser(userId, token)
      if (response.success) {
        setSuccess('User unblocked successfully!')
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBlocked: false } : user
          )
        )
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to unblock user')
      }
    } catch (err) {
      setError('An error occurred while unblocking the user')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await userAPI.deleteUser(userId, token)
        if (response.success) {
          setSuccess('User deleted successfully!')
          fetchUsers(token)
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete user')
        }
      } catch (err) {
        setError('An error occurred while deleting the user')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle delete seller
  const handleDeleteSeller = async (sellerId) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await userAPI.deleteUser(sellerId, token)
        if (response.success) {
          setSuccess('Seller deleted successfully!')
          fetchSellers(token)
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete seller')
        }
      } catch (err) {
        setError('An error occurred while deleting the seller')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle block seller
  const handleBlockSeller = async (sellerId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.blockUser(sellerId, token)
      if (response.success) {
        setSuccess('Seller blocked successfully!')
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller._id === sellerId ? { ...seller, isBlocked: true } : seller
          )
        )
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to block seller')
      }
    } catch (err) {
      setError('An error occurred while blocking the seller')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle unblock seller
  const handleUnblockSeller = async (sellerId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await userAPI.unblockUser(sellerId, token)
      if (response.success) {
        setSuccess('Seller unblocked successfully!')
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller._id === sellerId ? { ...seller, isBlocked: false } : seller
          )
        )
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to unblock seller')
      }
    } catch (err) {
      setError('An error occurred while unblocking the seller')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount || '',
      category: product.category
    })
  }

  // Handle product form change
  const handleProductChange = (e) => {
    const { name, value } = e.target
    setProductData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await productAPI.updateProduct(editingProduct._id, productData, token)
      if (response.success) {
        setSuccess('Product updated successfully!')
        setEditingProduct(null)
        setProductData({
          name: '',
          description: '',
          price: '',
          discount: '',
          category: 'electronics'
        })
        fetchProducts(token)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update product')
      }
    } catch (err) {
      setError('An error occurred while updating the product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Function to get proper product image URL
  const getProductImageUrl = (product) => {
    if (!product || !product.image) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&h=200';
    }
    const isExternalUrl = product.image.startsWith('http://') || product.image.startsWith('https://');
    if (isExternalUrl) return product.image;
    if (product.image.startsWith('/uploads/')) return product.image;
    if (product.image === 'no-photo.jpg') return '/uploads/no-photo.jpg';
    return `/uploads/${product.image}`;
  };

  // Function to get user avatar with unique colors based on name
  const getUserAvatar = (user) => {
    if (!user) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100';
    const stringToColor = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
      return "00000".substring(0, 6 - c.length) + c
    }
    const firstLetter = user.name?.charAt(0)?.toUpperCase() || 'U'
    const color = stringToColor(user.name || 'User')
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${color}" rx="50"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="white">${firstLetter}</text></svg>`
  };

  // Function to get seller avatar with unique colors based on name
  const getSellerAvatar = (seller) => {
    if (!seller) return 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100';
    const stringToColor = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 7) - hash)
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
      return "00000".substring(0, 6 - c.length) + c
    }
    const firstLetter = seller.name?.charAt(0)?.toUpperCase() || 'S'
    const color = stringToColor(seller.name || 'Seller')
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${color}" rx="20"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="white">${firstLetter}</text></svg>`
  };

  // Render edit product form modal
  const renderEditProductForm = () => {
    if (!editingProduct) return null;
    
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-500" />
                  Edit Product
                </h2>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all bg-white"
                    >
                       <option value="electronics">Electronics</option>
                       <option value="fashion">Fashion</option>
                       <option value="home & kitchen">Home & Kitchen</option>
                       <option value="books">Books</option>
                       <option value="sports">Sports</option>
                       <option value="beauty">Beauty</option>
                       <option value="toys & games">Toys & Games</option>
                       <option value="grocery">Grocery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productData.price}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={productData.discount}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleProductChange}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Updating...
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products': {
        const filteredProducts = products.filter(product => {
          const query = searchProductQuery.toLowerCase().trim()
          return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.seller?.name || '').toLowerCase().includes(query)
          )
        })

        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Manage Products</h2>
                <p className="text-slate-400 text-xs mt-0.5">Filter, edit, or delete inventory products.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="animate-spin w-8 h-8 mb-3 text-blue-500" />
                <p className="text-sm font-medium">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No products found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product._id} 
                      className="border border-slate-150 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all"
                    >
                      <div className="flex gap-4">
                        <img 
                          src={getProductImageUrl(product)} 
                          alt={product.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-slate-100 shadow-sm bg-slate-50 shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                            {product.category}
                          </span>
                          <h3 className="font-semibold text-slate-800 text-sm truncate">{product.name}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Seller: {product.seller?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Price</p>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-sm">${product.price.toFixed(2)}</span>
                            {product.discount > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors bg-white shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-colors bg-white shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto w-full border border-slate-100 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-slate-150">
                    <thead className="bg-slate-50/70 text-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Price</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Discount</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Seller</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center">
                              <img 
                                src={getProductImageUrl(product)} 
                                alt={product.name} 
                                className="w-10 h-10 object-cover mr-3 rounded-lg border border-slate-150 shadow-sm bg-slate-50"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                                }}
                              />
                              <span className="font-semibold text-slate-800 text-sm">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-600 text-sm font-medium">{product.category}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">${product.price.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            {product.discount ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {product.discount}% Off
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-sm font-medium">{product.seller?.name || 'Unknown'}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1.5">
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Product"
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
              </>
            )}
          </motion.div>
        )
      }
      
      case 'users': {
        const filteredUsers = users.filter(user => {
          const query = searchUserQuery.toLowerCase().trim()
          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          )
        })

        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Manage Users</h2>
                <p className="text-slate-400 text-xs mt-0.5">Browse client users, filter accounts, or restrict dashboard logins.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {loading && users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="animate-spin w-8 h-8 mb-3 text-blue-500" />
                <p className="text-sm font-medium">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No users found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search query</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user._id} 
                      className="border border-slate-150 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={getUserAvatar(user)} 
                          alt={user.name} 
                          className="w-12 h-12 object-cover rounded-full border border-slate-100 shadow-sm shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm truncate">{user.name}</h3>
                          <p className="text-slate-400 text-xs truncate mt-0.5">{user.email}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mt-2 ${
                            user.isBlocked 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          {user.isBlocked ? (
                            <button 
                              onClick={() => handleUnblockUser(user._id)}
                              className="p-2 border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-colors bg-white shadow-sm"
                              title="Unblock User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBlockUser(user._id)}
                              className="p-2 border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-lg transition-colors bg-white shadow-sm"
                              title="Block User"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors bg-white shadow-sm"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto w-full border border-slate-100 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-slate-150">
                    <thead className="bg-slate-50/70 text-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center">
                              <img 
                                src={getUserAvatar(user)} 
                                alt={user.name} 
                                className="w-10 h-10 object-cover rounded-full mr-3 border border-slate-150 shadow-sm"
                              />
                              <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-sm font-medium">{user.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center border ${
                              user.isBlocked 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1.5">
                              {user.isBlocked ? (
                                <button 
                                  onClick={() => handleUnblockUser(user._id)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Unblock User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleBlockUser(user._id)}
                                  className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                  title="Block User"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete User"
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
              </>
            )}
          </motion.div>
        )
      }
      
      case 'sellers': {
        const filteredSellers = sellers.filter(seller => {
          const query = searchSellerQuery.toLowerCase().trim()
          return (
            seller.name.toLowerCase().includes(query) ||
            seller.email.toLowerCase().includes(query)
          )
        })

        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Manage Sellers</h2>
                <p className="text-slate-400 text-xs mt-0.5">Oversee merchant accounts, monitor active statuses, and toggle blocks.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchSellerQuery}
                  onChange={(e) => setSearchSellerQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {loading && sellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="animate-spin w-8 h-8 mb-3 text-blue-500" />
                <p className="text-sm font-medium">Loading sellers...</p>
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
                <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No sellers found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search query</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                  {filteredSellers.map((seller) => {
                    const sellerProdCount = products.filter(p => p.seller && (p.seller._id === seller._id || p.seller === seller._id)).length
                    return (
                      <div 
                        key={seller._id} 
                        className="border border-slate-150 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all"
                      >
                        <div className="flex gap-3">
                          <img 
                            src={getSellerAvatar(seller)} 
                            alt={seller.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">{seller.name}</h3>
                            <p className="text-slate-400 text-xs truncate mt-0.5">{seller.email}</p>
                            <div className="flex gap-2 items-center mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                seller.isBlocked 
                                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                {seller.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {sellerProdCount} products
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(seller.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2">
                            {seller.isBlocked ? (
                              <button 
                                onClick={() => handleUnblockSeller(seller._id)}
                                className="p-2 border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-colors bg-white shadow-sm"
                                title="Unblock Seller"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBlockSeller(seller._id)}
                                className="p-2 border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-lg transition-colors bg-white shadow-sm"
                                title="Block Seller"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteSeller(seller._id)}
                              className="p-2 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors bg-white shadow-sm"
                              title="Delete Seller"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto w-full border border-slate-100 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-slate-150">
                    <thead className="bg-slate-50/70 text-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Seller</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Products</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredSellers.map((seller) => {
                        const sellerProdCount = products.filter(p => p.seller && (p.seller._id === seller._id || p.seller === seller._id)).length
                        return (
                          <tr key={seller._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center">
                                <img 
                                  src={getSellerAvatar(seller)} 
                                  alt={seller.name} 
                                  className="w-10 h-10 object-cover rounded-lg mr-3 border border-slate-150 shadow-sm"
                                />
                                <span className="font-semibold text-slate-800 text-sm">{seller.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-sm font-medium">{seller.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center border ${
                                seller.isBlocked 
                                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                {seller.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-sm font-medium">
                              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                {sellerProdCount} products
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-505 text-sm font-medium">
                              {new Date(seller.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1.5">
                                {seller.isBlocked ? (
                                  <button 
                                    onClick={() => handleUnblockSeller(seller._id)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Unblock Seller"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleBlockSeller(seller._id)}
                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                    title="Block Seller"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteSeller(seller._id)}
                                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Delete Seller"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )
      }
      
      default: { // dashboard overview
        const getActivityIndicatorColor = (actionType) => {
          if (actionType.includes('DELETE')) return 'bg-rose-500 ring-rose-100';
          if (actionType.includes('BLOCK')) return 'bg-amber-500 ring-amber-100';
          if (actionType.includes('CREATE')) return 'bg-emerald-500 ring-emerald-100';
          return 'bg-blue-500 ring-blue-100';
        };

        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Products Stat Card */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Products</span>
                  <h3 className="text-3xl font-extrabold text-slate-800">{products.length}</h3>
                  <p className="text-blue-500 text-[10px] font-semibold flex items-center gap-0.5">
                    View active products
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shadow-inner border border-blue-100/50 shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </motion.div>
              
              {/* Users Stat Card */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Regular Users</span>
                  <h3 className="text-3xl font-extrabold text-slate-800">{users.length}</h3>
                  <p className="text-emerald-500 text-[10px] font-semibold flex items-center gap-0.5">
                    View customer roster
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl shadow-inner border border-emerald-100/50 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </motion.div>
              
              {/* Sellers Stat Card */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Sellers</span>
                  <h3 className="text-3xl font-extrabold text-slate-800">{sellers.length}</h3>
                  <p className="text-purple-500 text-[10px] font-semibold flex items-center gap-0.5">
                    View registered merchants
                  </p>
                </div>
                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl shadow-inner border border-purple-100/50 shrink-0">
                  <Store className="w-6 h-6" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Administrative Shortcuts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveSection('products')}
                  className="flex items-center justify-between p-4 border border-slate-150 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-sm"
                >
                  <span>Inventory Control</span>
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => setActiveSection('users')}
                  className="flex items-center justify-between p-4 border border-slate-150 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-sm"
                >
                  <span>User Moderation</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => setActiveSection('sellers')}
                  className="flex items-center justify-between p-4 border border-slate-150 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 text-sm"
                >
                  <span>Seller Verification</span>
                  <Store className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Recent Activities Timeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Action Logs
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 border border-slate-100 rounded-lg">
                  Real-time Feed
                </span>
              </div>
              
              {activities.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ${getActivityIndicatorColor(activity.targetType || '')} transition-transform group-hover:scale-110 shrink-0`} />
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm leading-snug">
                            {activity.admin} <span className="text-slate-500 font-medium">{activity.action}</span>
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1 font-medium">
                            {activity.target}
                          </p>
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase shrink-0 mt-0.5 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-md">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-medium">No recent activities logged</p>
                </div>
              )}
            </div>
          </motion.div>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] flex">
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
          sellers: sellers.length
        }}
      />
      
      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="bg-[#0A0A0A] border-b border-[#26241E] shadow-2xl sticky top-16 md:top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">Administrator Portal</span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] tracking-tight capitalize">
                {activeSection === 'dashboard' ? 'Overview Dashboard' : `${activeSection} Management`}
              </h1>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-[#E8E0CC]/70 hover:text-white hover:bg-[#141414] md:hidden transition-colors focus:outline-none border border-[#26241E] shadow-sm bg-black"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
        
        {/* Edit Modal Popup */}
        {editingProduct && renderEditProductForm()}

        {/* Sleek Floating Toast Notifications */}
        <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 max-w-sm w-[90%] sm:w-full">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-emerald-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 border border-emerald-500/20"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold">{success}</p>
                </div>
                <button onClick={() => setSuccess('')} className="hover:bg-emerald-700/50 p-1 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-rose-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 border border-rose-500/20"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
                <button onClick={() => setError('')} className="hover:bg-rose-700/50 p-1 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
