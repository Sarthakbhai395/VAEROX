import { useState } from 'react'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Helper to ensure error is always a string (prevents React Error #31)
const normalizeError = (err) => {
  if (!err) return 'An unknown error occurred'
  if (typeof err === 'string') return err
  if (Array.isArray(err)) return err.join('. ')
  if (typeof err === 'object') return err.message || JSON.stringify(err)
  return String(err)
}

export const useAuthHook = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login, logout } = useAuth()

  const handleLogin = async (email, password, role) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.login(email, password, role)
      
      if (response.success) {
        // The API returns { token, data } structure, so we need to pass data and token to login
        login(response.data, response.token)
        return { success: true, data: response.data }
      } else {
        const errorMsg = normalizeError(response.error || response.message || 'Login failed')
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }
    } catch (err) {
      const errorMsg = 'An error occurred during login'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (name, email, password, role) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.register(name, email, password, role)
      
      if (response.success) {
        // The API returns { token, data } structure, so we need to pass data and token to login
        login(response.data, response.token)
        return { success: true }
      } else {
        const errorMsg = normalizeError(response.error || response.message || 'Registration failed')
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }
    } catch (err) {
      const errorMsg = 'An error occurred during registration'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return {
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout
  }
}

