import { useState } from 'react'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

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
        return { success: true }
      } else {
        setError(response.error || 'Login failed')
        return { success: false, message: response.error || 'Login failed' }
      }
    } catch (err) {
      setError('An error occurred during login')
      return { success: false, message: 'An error occurred during login' }
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
        setError(response.error || 'Registration failed')
        return { success: false, message: response.error || 'Registration failed' }
      }
    } catch (err) {
      setError('An error occurred during registration')
      return { success: false, message: 'An error occurred during registration' }
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
