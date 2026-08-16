import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { productAPI, sellerContactAPI } from '../../services/api'
import { formatCurrency } from '../../utils/format'
import Sidebar from './components/Sidebar'
import { Menu } from 'lucide-react'

const SellerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [showContactQueries, setShowContactQueries] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: 'electronics'
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [image1, setImage1] = useState(null);
  const [imagePreview1, setImagePreview1] = useState(null);
  const [imageUrl1, setImageUrl1] = useState('');

  const [image2, setImage2] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [imageUrl2, setImageUrl2] = useState('');

  const [image3, setImage3] = useState(null);
  const [imagePreview3, setImagePreview3] = useState(null);
  const [imageUrl3, setImageUrl3] = useState('');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [contactQueries, setContactQueries] = useState([])
  const [contactResponses, setContactResponses] = useState([])
  const [contactLoading, setContactLoading] = useState(false)
  const [responseLoading, setResponseLoading] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true) // Add this state
  const navigate = useNavigate()
  const { user } = useAuth()

  // Check for user data on component mount
  useEffect(() => {
    // Check if user is already in context
    if (user && user.id) {
      setLoadingUserData(false)
    } else {
      // Check localStorage as backup
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser && parsedUser.id) {
            setLoadingUserData(false)
          } else {
            setLoadingUserData(false)
          }
        } catch (e) {
          console.error('Error parsing saved user data:', e)
          setLoadingUserData(false)
        }
      } else {
        setLoadingUserData(false)
      }
    }
  }, [user])

  // Redirect if user is not authenticated or not a seller
  useEffect(() => {
    // Check if we have user data
    if (user === null) {
      // Check localStorage as backup
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser && parsedUser.role !== 'seller') {
            navigate('/login')
          }
        } catch (e) {
          console.error('Error parsing saved user data:', e)
          navigate('/login')
        }
      }
      // If no user data and not loading, redirect to login
      // But don't redirect if we're already trying to load user data
      else if (!loadingUserData) {
        navigate('/login')
      }
    } else if (user && user.role !== 'seller') {
      navigate('/login')
    }
  }, [user, navigate, loadingUserData])

  // Fetch seller's products
  useEffect(() => {
    if (user && user.id) {
      fetchSellerProducts()
    }
  }, [user])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showAddProduct || showEditProduct || showContactQueries || showResponseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddProduct, showEditProduct, showContactQueries, showResponseModal]);

  const fetchSellerProducts = async () => {
    // Don't fetch if user is not available
    if (!user || !user.id) {
      setProductsLoading(false)
      return
    }
    
    try {
      setProductsLoading(true)
      setProductsError('')
      
      const token = localStorage.getItem('token')
      const response = await productAPI.getProducts()
      
      if (response.success) {
        // Filter products to show only those belonging to the current seller
        const sellerProducts = response.data.filter(product => {
          // Handle cases where product.seller might be null, undefined, or invalid
          if (!product.seller) return false;
          
          try {
            // Handle both string and object formats for seller
            const sellerId = typeof product.seller === 'object' ? 
              (product.seller._id || product.seller.id) : 
              product.seller;
              
            return sellerId && sellerId.toString() === user.id.toString();
          } catch (err) {
            console.error('Error processing product seller data:', err);
            return false;
          }
        })
        setProducts(sellerProducts)
      } else {
        setProductsError(response.message || 'Failed to fetch products')
      }
    } catch (err) {
      setProductsError('An error occurred while fetching products: ' + err.message)
      console.error('Error fetching products:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  // Fetch contact queries
  const fetchContactQueries = async () => {
    try {
      setContactLoading(true)
      setError('')
      setSuccess('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await sellerContactAPI.getContactMessages(token)
      
      if (response.success) {
        setContactQueries(response.data)
      } else {
        setError('Failed to fetch contact queries: ' + (response.error || 'Unknown error'))
      }
    } catch (err) {
      setError('An error occurred while fetching contact queries: ' + err.message)
      console.error(err)
    } finally {
      setContactLoading(false)
    }
  }

  // Fetch contact queries when the queries section is opened
  useEffect(() => {
    if (activeSection === 'queries' && user && user.id) {
      fetchContactQueries()
    }
  }, [activeSection, user])

  // Send response to contact query
  const sendContactResponse = async (e) => {
    e.preventDefault()
    try {
      setResponseLoading(true)
      const token = localStorage.getItem('token')
      const response = await sellerContactAPI.sendContactResponse(
        selectedContact._id,
        responseMessage,
        token
      )
      
      if (response.success) {
        setSuccess('Response sent successfully!')
        setResponseMessage('')
        setShowResponseModal(false)
        // Refresh contact queries
        fetchContactQueries()
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to send response')
      }
    } catch (err) {
      setError('An error occurred while sending response')
      console.error(err)
    } finally {
      setResponseLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageSlotChange = (slotIndex, file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (slotIndex === 1) {
          setImage1(file);
          setImagePreview1(reader.result);
          setImageUrl1(''); // Clear URL if file is selected
        } else if (slotIndex === 2) {
          setImage2(file);
          setImagePreview2(reader.result);
          setImageUrl2(''); // Clear URL if file is selected
        } else if (slotIndex === 3) {
          setImage3(file);
          setImagePreview3(reader.result);
          setImageUrl3(''); // Clear URL if file is selected
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSlot = (slotIndex) => {
    if (slotIndex === 1) {
      setImage1(null);
      setImagePreview1(null);
      setImageUrl1('');
    } else if (slotIndex === 2) {
      setImage2(null);
      setImagePreview2(null);
      setImageUrl2('');
    } else if (slotIndex === 3) {
      setImage3(null);
      setImagePreview3(null);
      setImageUrl3('');
    }
  };

  const resolveDashboardImageUrl = (path) => {
    if (!path || path === 'no-photo.jpg' || path === '/uploads/no-photo.jpg') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return path;
    return `/uploads/${path}`;
  };

  const getImagesLayout = () => {
    const layout = [];
    
    // Slot 1
    if (image1) {
      layout.push('file');
    } else if (imageUrl1) {
      layout.push(imageUrl1);
    } else if (imagePreview1 && !imagePreview1.startsWith('blob:') && !imagePreview1.startsWith('data:')) {
      layout.push(imagePreview1);
    } else {
      layout.push(null);
    }

    // Slot 2
    if (image2) {
      layout.push('file');
    } else if (imageUrl2) {
      layout.push(imageUrl2);
    } else if (imagePreview2 && !imagePreview2.startsWith('blob:') && !imagePreview2.startsWith('data:')) {
      layout.push(imagePreview2);
    } else {
      layout.push(null);
    }

    // Slot 3
    if (image3) {
      layout.push('file');
    } else if (imageUrl3) {
      layout.push(imageUrl3);
    } else if (imagePreview3 && !imagePreview3.startsWith('blob:') && !imagePreview3.startsWith('data:')) {
      layout.push(imagePreview3);
    } else {
      layout.push(null);
    }

    return layout.filter(Boolean);
  };

  const handleUploadFiles = async (productId, token) => {
    const layout = getImagesLayout();
    const formData = new FormData();
    
    let hasFiles = false;
    if (image1) { formData.append('files', image1); hasFiles = true; }
    if (image2) { formData.append('files', image2); hasFiles = true; }
    if (image3) { formData.append('files', image3); hasFiles = true; }
    
    if (hasFiles) {
      formData.append('images', JSON.stringify(layout));
      const uploadResponse = await productAPI.uploadProductPhoto(productId, formData, token);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Failed to upload product images');
      }
      return uploadResponse.data;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const layout = getImagesLayout();

      const productPayload = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount) || 0,
        category: productData.category,
        images: layout.map(item => item === 'file' ? null : item).filter(Boolean)
      };

      const response = await productAPI.createProduct(productPayload, token);
      
      if (response.success) {
        // Handle file uploads if any files are selected
        try {
          await handleUploadFiles(response.data._id, token);
        } catch (uploadErr) {
          setError(uploadErr.message || 'Failed to upload product image(s)');
        }
        
        setSuccess(true);
        setProductData({
          name: '',
          description: '',
          price: '',
          discount: '',
          category: 'electronics'
        });
        
        // Reset all image slots
        setImage1(null); setImagePreview1(null); setImageUrl1('');
        setImage2(null); setImagePreview2(null); setImageUrl2('');
        setImage3(null); setImagePreview3(null); setImageUrl3('');
        
        fetchSellerProducts();
        setTimeout(() => {
          setShowAddProduct(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err) {
      setError('An error occurred while creating the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount?.toString() || '0',
      category: product.category
    })
    
    // Clear and populate image slots
    setImage1(null); setImagePreview1(null); setImageUrl1('');
    setImage2(null); setImagePreview2(null); setImageUrl2('');
    setImage3(null); setImagePreview3(null); setImageUrl3('');

    const prodImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image].filter(img => img && img !== 'no-photo.jpg' && img !== '/uploads/no-photo.jpg');

    if (prodImages[0]) {
      const isUrl = prodImages[0].startsWith('http://') || prodImages[0].startsWith('https://');
      if (isUrl) {
        setImageUrl1(prodImages[0]);
      }
      setImagePreview1(resolveDashboardImageUrl(prodImages[0]));
    }
    if (prodImages[1]) {
      const isUrl = prodImages[1].startsWith('http://') || prodImages[1].startsWith('https://');
      if (isUrl) {
        setImageUrl2(prodImages[1]);
      }
      setImagePreview2(resolveDashboardImageUrl(prodImages[1]));
    }
    if (prodImages[2]) {
      const isUrl = prodImages[2].startsWith('http://') || prodImages[2].startsWith('https://');
      if (isUrl) {
        setImageUrl3(prodImages[2]);
      }
      setImagePreview3(resolveDashboardImageUrl(prodImages[2]));
    }

    setShowEditProduct(true)
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const layout = getImagesLayout();

      const productPayload = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount) || 0,
        category: productData.category,
        images: layout.map(item => item === 'file' ? null : item).filter(Boolean)
      };

      const response = await productAPI.updateProduct(editingProduct._id, productPayload, token);
      
      if (response.success) {
        // Handle file uploads if any files are selected
        try {
          await handleUploadFiles(editingProduct._id, token);
        } catch (uploadErr) {
          setError(uploadErr.message || 'Failed to upload product image(s)');
        }
        
        setSuccess(true);
        fetchSellerProducts();
        setTimeout(() => {
          setShowEditProduct(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update product');
      }
    } catch (err) {
      setError('An error occurred while updating the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await productAPI.deleteProduct(productId, token)
        
        if (response.success) {
          // Remove the product from the local state
          setProducts(products.filter(product => product._id !== productId))
          // Show success message or just refresh the list
        } else {
          alert('Failed to delete product: ' + (response.message || 'Unknown error'))
        }
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('An error occurred while deleting the product')
      }
    }
  }

  // Function to get product image URL
  const getProductImageUrl = (product) => {
    if (!product || !product.image || product.image === 'no-photo.jpg' || product.image === '/uploads/no-photo.jpg') {
      return null;
    }
    
    if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
      return product.image;
    }
    
    if (product.image.startsWith('/uploads/')) {
      return product.image;
    }
    
    return `/uploads/${product.image}`;
  };

  // If user is not loaded yet, show loading state
  if (loadingUserData || (user === null && localStorage.getItem('user'))) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // If user is not authenticated or not a seller, redirect to login
  if ((!user || !user.id) && !localStorage.getItem('user')) {
    navigate('/login')
    return null
  }

  if (user && user.role !== 'seller') {
    navigate('/login')
    return null
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">My Products</h2>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Add Product
              </button>
            </div>
            
            {productsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {productsError}
              </div>
            )}
            
            {productsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading your products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">You haven't added any products yet.</p>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product._id} 
                    className="border rounded-lg p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <div className="bg-gray-50 border border-gray-200 rounded-xl w-full h-40 mb-4 overflow-hidden flex items-center justify-center">
                      {getProductImageUrl(product) ? (
                        <img 
                          src={getProductImageUrl(product)} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <svg className="w-10 h-10 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm capitalize">{product.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatCurrency(product.discount ? (product.price * (1 - product.discount / 100)) : product.price)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'queries':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Contact Queries</h2>
            
            {contactLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading contact queries...</p>
              </div>
            ) : error ? (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            ) : success ? (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            ) : contactQueries.length > 0 ? (
              <div className="space-y-4">
                {contactQueries.map((contact) => (
                  <div 
                    key={contact._id} 
                    className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-800 text-lg">{contact.subject}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            contact.response ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contact.response ? 'Replied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{contact.message}</p>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Message ID:</span>
                        <span className="ml-2 text-gray-600 font-mono">{contact._id.substring(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">From:</span>
                        <span className="ml-2 text-gray-600">{contact.name} ({contact.email})</span>
                      </div>
                    </div>
                    
                    {/* Seller Response */}
                    {contact.response ? (
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-purple-800 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Your Response
                          </h4>
                          <span className="text-sm text-purple-600">
                            {new Date(contact.response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-purple-700">{contact.response.message}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button 
                          onClick={() => {
                            setSelectedContact(contact)
                            setShowResponseModal(true)
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                        >
                          Respond to Query
                        </button>
                      </div>
                    )}
                    
                    {/* Delete button */}
                    <div className="mt-4">
                      <button 
                        onClick={() => handleDeleteContactMessage(contact._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                      >
                        Delete Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-600">No contact queries received yet.</p>
              </div>
            )}
          </div>
        )
      
      default: // dashboard
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">My Products</h2>
                </div>
                <p className="text-gray-600 mb-6">View and manage your products</p>
                <button 
                  onClick={() => setActiveSection('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Products
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">User Queries</h2>
                </div>
                <p className="text-gray-600 mb-6">View and respond to user contact queries</p>
                <button 
                  onClick={() => {
                    setActiveSection('queries')
                    fetchContactQueries()
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full"
                >
                  View Queries
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Products</h2>
              
              {productsError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {productsError}
                </div>
              )}
              
              {productsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading your products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">You haven't added any products yet.</p>
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 3).map((product) => (
                    <div 
                      key={product._id} 
                      className="border rounded-lg p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                      <div className="bg-gray-50 border border-gray-200 rounded-xl w-full h-40 mb-4 overflow-hidden flex items-center justify-center">
                        {getProductImageUrl(product) ? (
                          <img 
                            src={getProductImageUrl(product)} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            <svg className="w-10 h-10 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-gray-600 text-sm capitalize">{product.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-lg text-gray-800">
                          {formatCurrency(product.discount ? (product.price * (1 - product.discount / 100)) : product.price)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {products.length > 3 && (
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <button 
                        onClick={() => setActiveSection('products')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View All {products.length} Products
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )
    }
  }

  // Add delete contact message function
  const handleDeleteContactMessage = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token')
        const response = await sellerContactAPI.deleteContactMessage(contactId, token)
        
        if (response.success) {
          // Remove the contact message from the local state
          setContactQueries(contactQueries.filter(contact => contact._id !== contactId))
          setSuccess('Contact message deleted successfully!')
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError('Failed to delete contact message')
        }
      } catch (err) {
        setError('An error occurred while deleting the contact message')
        console.error(err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header 
          className="bg-white border-b border-slate-150/80 shadow-sm sticky top-16 md:top-0 z-30"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Merchant Portal</span>
              <motion.h1 
                className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight capitalize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {activeSection === 'dashboard' ? 'Overview Dashboard' : `${activeSection} Management`}
              </motion.h1>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </motion.header>

        <motion.main 
          className="flex-1 p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {renderContent()}
        </motion.main>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8 mx-auto max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Fill in the fields to create a catalog listing</p>
                </div>
                <button 
                  onClick={() => setShowAddProduct(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                  {error && (
                    <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm">
                      Product created successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-850 text-sm"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-850 text-sm resize-none"
                        placeholder="Enter product description"
                        rows={3}
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={productData.price}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm"
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={productData.discount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm"
                          placeholder="Discount %"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Category
                        </label>
                        <select 
                          name="category"
                          value={productData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm"
                          required
                        >
                          <option value="technology">Technology</option>
                          <option value="clothing">Clothing</option>
                          <option value="home appliances">Home Appliances</option>
                          <option value="books">Books</option>
                          <option value="sports">Sports</option>
                          <option value="home & kitchen">Home & Kitchen</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                        Product Images (Up to 3)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Slot 1 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 1 (Primary)</span>
                            <span className="text-[9px] bg-purple-50 text-purple-655 px-2 py-0.5 rounded-full font-bold border border-purple-100">Required</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview1 || imageUrl1 ? (
                              <>
                                <img src={imagePreview1 || imageUrl1} alt="Slot 1 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(1)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl1}
                              onChange={(e) => {
                                setImageUrl1(e.target.value);
                                if (e.target.value) {
                                  setImage1(null);
                                  setImagePreview1(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-add-1" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-add-1"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(1, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slot 2 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 2</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">Optional</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview2 || imageUrl2 ? (
                              <>
                                <img src={imagePreview2 || imageUrl2} alt="Slot 2 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(2)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl2}
                              onChange={(e) => {
                                setImageUrl2(e.target.value);
                                if (e.target.value) {
                                  setImage2(null);
                                  setImagePreview2(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-add-2" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-add-2"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(2, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slot 3 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 3</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">Optional</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview3 || imageUrl3 ? (
                              <>
                                <img src={imagePreview3 || imageUrl3} alt="Slot 3 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(3)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl3}
                              onChange={(e) => {
                                setImageUrl3(e.target.value);
                                if (e.target.value) {
                                  setImage3(null);
                                  setImagePreview3(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-add-3" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-add-3"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(3, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-sm font-semibold transition-colors focus:outline-none"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-purple-500/10 hover:scale-[1.01] active:scale-100 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditProduct && (
          <motion.div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8 mx-auto max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Edit Product</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Modify the catalog fields for this listing</p>
                </div>
                <button 
                  onClick={() => setShowEditProduct(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="flex flex-col flex-1 min-h-0">
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                  {error && (
                    <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm">
                      Product updated successfully!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm resize-none"
                        placeholder="Enter product description"
                        rows={3}
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={productData.price}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm"
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={productData.discount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 placeholder-slate-400 text-slate-855 text-sm"
                          placeholder="Discount %"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Category
                        </label>
                        <select 
                          name="category"
                          value={productData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 text-slate-800 text-sm"
                          required
                        >
                          <option value="technology">Technology</option>
                          <option value="clothing">Clothing</option>
                          <option value="home appliances">Home Appliances</option>
                          <option value="books">Books</option>
                          <option value="sports">Sports</option>
                          <option value="home & kitchen">Home & Kitchen</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                        Product Images (Up to 3)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Slot 1 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 1 (Primary)</span>
                            <span className="text-[9px] bg-purple-50 text-purple-655 px-2 py-0.5 rounded-full font-bold border border-purple-100">Required</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview1 || imageUrl1 ? (
                              <>
                                <img src={imagePreview1 || imageUrl1} alt="Slot 1 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(1)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl1}
                              onChange={(e) => {
                                setImageUrl1(e.target.value);
                                if (e.target.value) {
                                  setImage1(null);
                                  setImagePreview1(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-edit-1" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-edit-1"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(1, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slot 2 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 2</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">Optional</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview2 || imageUrl2 ? (
                              <>
                                <img src={imagePreview2 || imageUrl2} alt="Slot 2 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(2)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl2}
                              onChange={(e) => {
                                setImageUrl2(e.target.value);
                                if (e.target.value) {
                                  setImage2(null);
                                  setImagePreview2(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-edit-2" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-edit-2"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(2, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slot 3 */}
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-650">Slot 3</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">Optional</span>
                          </div>
                          
                          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-xl h-28 mb-3 overflow-hidden flex items-center justify-center group-hover:border-purple-300 transition-colors">
                            {imagePreview3 || imageUrl3 ? (
                              <>
                                <img src={imagePreview3 || imageUrl3} alt="Slot 3 Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleClearSlot(3)}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                                  title="Clear image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                                <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors mb-1">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Link or Upload</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imageUrl3}
                              onChange={(e) => {
                                setImageUrl3(e.target.value);
                                if (e.target.value) {
                                  setImage3(null);
                                  setImagePreview3(null);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all bg-white placeholder-slate-400 text-slate-700"
                              placeholder="Image URL..."
                            />
                            <label htmlFor="file-upload-edit-3" className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer hover:bg-white text-xs text-slate-655 font-semibold bg-white transition-all shadow-sm active:scale-95">
                              <span>Upload File</span>
                              <input
                                id="file-upload-edit-3"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageSlotChange(3, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditProduct(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-sm font-semibold transition-colors focus:outline-none"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-purple-500/10 hover:scale-[1.01] active:scale-100 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Queries Modal */}
      <AnimatePresence>
        {showContactQueries && (
          <motion.div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 mx-auto max-h-[90vh] flex flex-col"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800">User Contact Queries</h3>
                  <button 
                    onClick={() => setShowContactQueries(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {contactLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading contact queries...</p>
                  </div>
                ) : error ? (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                ) : success ? (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                  </div>
                ) : contactQueries.length > 0 ? (
                  <div className="space-y-4">
                    {contactQueries.map((contact) => (
                      <div 
                        key={contact._id} 
                        className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-800 text-lg">{contact.subject}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                contact.response ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contact.response ? 'Replied' : 'successfull'}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2">{contact.message}</p>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Message ID:</span>
                            <span className="ml-2 text-gray-600 font-mono">{contact._id.substring(0, 8)}...</span>
                          </div>
                        </div>
                        
                        {/* Seller Response */}
                        {contact.response && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-purple-800 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Seller Response
                              </h4>
                              <span className="text-sm text-purple-600">
                                {new Date(contact.response.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-purple-700">{contact.response.message}</p>
                              <div className="mt-3 flex items-center text-xs text-purple-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>From: {contact.response.name}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">No contact queries received yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && (
          <motion.div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Respond to Query</h3>
                  <button 
                    onClick={() => setShowResponseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {success}
                  </div>
                )}
                
                <form onSubmit={sendContactResponse}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="font-medium">{selectedContact?.subject}</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="text-gray-600">{selectedContact?.message}</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Response
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your response..."
                      rows={4}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowResponseModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={responseLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      disabled={responseLoading}
                    >
                      {responseLoading ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SellerDashboard
