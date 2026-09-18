import React, { createContext, useState, useContext, useEffect } from 'react'
import { safeStorage, sanitizeObject, resetRateLimit } from '../utils/security'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load auth state from localStorage safely on initial load
  useEffect(() => {
    const savedUser = safeStorage.getItem('user')
    const savedAuthState = localStorage.getItem('isAuthenticated')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedAuthState === 'true' && savedToken) {
      try {
        const cleanUser = sanitizeObject(savedUser)
        setUser(cleanUser)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Error parsing saved user data:', e)
        safeStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('token')
      }
    }

    const handleAuthExpired = () => {
      setUser(null)
      setIsAuthenticated(false)
    }
    window.addEventListener('vaerox_auth_expired', handleAuthExpired)
    return () => window.removeEventListener('vaerox_auth_expired', handleAuthExpired)
  }, [])

  const login = (userData, token) => {
    const cleanUser = sanitizeObject(userData)
    setUser(cleanUser)
    setIsAuthenticated(true)
    resetRateLimit('login_attempt')
    
    // Save to localStorage safely
    safeStorage.setItem('user', cleanUser)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    // Remove from localStorage
    safeStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token')
  }

  // Function to check if user is authenticated
  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('user')
    const savedAuthState = localStorage.getItem('isAuthenticated')
    const savedToken = localStorage.getItem('token')
    
    return savedUser && savedAuthState === 'true' && savedToken
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
