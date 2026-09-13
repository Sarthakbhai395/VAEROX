import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addNotification, addModalNotification } = useNotification()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist from backend when auth status changes (only for regular customer accounts)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      loadWishlistFromBackend()
    } else {
      setWishlistItems([])
    }
  }, [isAuthenticated, user?.role])

  const loadWishlistFromBackend = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.getWishlist(token)
        if (response.success) {
          setWishlistItems(response.data)
        }
      } else {
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Failed to load wishlist from backend:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      addModalNotification('Login Required', 'Please login to add items to your wishlist', 'warning')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
    }
    
    // Prevent admins and sellers from adding to wishlist
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Only users can add products to wishlist. Admins and sellers cannot purchase products.', 'error')
      throw new Error('Admins and sellers cannot add products to wishlist')
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.addToWishlist(product._id || product.id, token)
        if (response.success) {
          setWishlistItems(response.data)
          addModalNotification('Success', 'Item added to wishlist successfully!', 'success')
          return response.data
        } else {
          throw new Error(response.error || 'Failed to add product to wishlist')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      addModalNotification('Error', error.message || 'Failed to add product to wishlist', 'error')
      throw error
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.removeFromWishlist(productId, token)
        if (response.success) {
          setWishlistItems(response.data)
          addModalNotification('Success', 'Item removed from wishlist successfully!', 'success')
        } else {
          throw new Error(response.error || 'Failed to remove item from wishlist')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      addModalNotification('Error', error.message || 'Failed to remove item from wishlist', 'error')
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item._id || item.id) === productId)
  }

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.clearWishlist(token)
        if (response.success) {
          setWishlistItems(response.data)
        } else {
          throw new Error(response.error || 'Failed to clear wishlist')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      addModalNotification('Error', error.message || 'Failed to clear wishlist', 'error')
    }
  }

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loading
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  return useContext(WishlistContext)
}
