import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addNotification, addModalNotification } = useNotification()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from backend when auth status changes (only for regular customer accounts)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      loadCartFromBackend()
    } else {
      setCartItems([])
    }
  }, [isAuthenticated, user?.role])

  const loadCartFromBackend = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.getCart(token)
        if (response.success) {
          setCartItems(response.data)
        }
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const isInCart = (productId) => {
    return cartItems.some(item => {
      const itemProductId = item.product ? (item.product._id || item.product.id) : (item._id || item.id)
      return itemProductId === productId
    })
  }

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => {
      const itemProductId = item.product ? (item.product._id || item.product.id) : (item._id || item.id)
      return itemProductId === productId
    })
    return item ? item.quantity || 1 : 0
  }

  const addToCart = async (product, quantity = 1) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      addModalNotification('Login Required', 'Please login to add items to your cart', 'warning')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
    }
    
    // Prevent admins and sellers from adding to cart
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      addModalNotification('Access Denied', 'Sellers and admins cannot purchase products', 'error')
      throw new Error('Admins and sellers cannot add products to cart')
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const productId = product._id || product.id
        const response = await userAPI.addToCart(productId, quantity, token, product)
        if (response.success) {
          setCartItems(response.data)
          addModalNotification('Success', 'Item added to cart successfully!', 'success')
          return response.data
        } else {
          throw new Error(response.error || 'Failed to add product to cart')
        }
      } else {
        throw new Error('No authentication token found')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      addModalNotification('Error', error.message || 'Failed to add product to cart', 'error')
      throw error
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.removeFromCart(productId, token)
        if (response.success) {
          setCartItems(response.data)
          addModalNotification('Success', 'Item removed from cart successfully!', 'success')
        } else {
          throw new Error(response.error || 'Failed to remove item from cart')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      addModalNotification('Error', error.message || 'Failed to remove item from cart', 'error')
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.updateCart(productId, quantity, token)
        if (response.success) {
          setCartItems(response.data)
        } else {
          throw new Error(response.error || 'Failed to update quantity')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      addModalNotification('Error', error.message || 'Failed to update quantity', 'error')
    }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token && isAuthenticated) {
        const response = await userAPI.clearCart(token)
        if (response.success) {
          setCartItems(response.data)
        } else {
          throw new Error(response.error || 'Failed to clear cart')
        }
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      addModalNotification('Error', error.message || 'Failed to clear cart', 'error')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both backend format (item.product) and local format (item directly)
      const product = item.product || item
      const price = product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price
      return total + (price * (item.quantity || 1))
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
    isInCart,
    getCartItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  return useContext(CartContext)
}
