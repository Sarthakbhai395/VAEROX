import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthHook } from '../../hooks/useAuth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogin, error, loading } = useAuthHook()
  const redirectMessage = location.state?.message
  const [validationError, setValidationError] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [lockoutTimer, setLockoutTimer] = useState(0)

  // Countdown effect for rate-limit lockout
  React.useEffect(() => {
    let interval = null
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1)
      }, 1000)
    } else if (lockoutTimer === 0 && attemptCount >= 5) {
      setAttemptCount(0)
    }
    return () => clearInterval(interval)
  }, [lockoutTimer, attemptCount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (lockoutTimer > 0) {
      setValidationError(`Too many failed attempts! Please wait ${lockoutTimer} seconds before trying again.`)
      return
    }

    // Strict Email Format Checking
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address (e.g. user@gmail.com).')
      return
    }

    if (!password) {
      setValidationError('Please enter your password.')
      return
    }
    
    // Check for predefined admin credentials
    if (email.trim() === 'admin@gmail.com' && password === '123456') {
      const result = await handleLogin(email, password, 'admin')
      if (result.success) {
        navigate('/admin/dashboard')
        return
      }
    }

    const result = await handleLogin(email, password, role)
    
    if (result.success) {
      setAttemptCount(0)
      const from = location.state?.from?.pathname || '/'
      if (from !== '/' && from !== '/login') {
        navigate(from)
      } else if (role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } else {
      const newAttempts = attemptCount + 1
      setAttemptCount(newAttempts)
      if (newAttempts >= 5) {
        setLockoutTimer(30)
        setValidationError('Too many failed attempts! Account temporarily locked for 30 seconds.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#E8E0CC]">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-[#0A0A0A] p-10 rounded-2xl shadow-2xl border border-[#26241E]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-[#141414] border border-[#C9A84C]/40 flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#FFF5D6] font-serif tracking-tight">
            Sign in to VÆROX
          </h2>
          <p className="mt-2 text-center text-sm text-[#C9A84C] uppercase tracking-widest font-semibold">
            High Luxury Experience
          </p>
        </motion.div>
        
        {redirectMessage && (
          <motion.div 
            className="bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#FFF5D6] px-4 py-3 rounded-xl text-sm"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{redirectMessage}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            className="bg-red-950/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm font-semibold"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}
        
        {validationError && (
          <motion.div 
            className="bg-red-950/50 border border-red-500/60 text-red-200 px-4 py-3 rounded-xl text-sm font-semibold"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{validationError}</span>
          </motion.div>
        )}
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-[#26241E] placeholder-[#A39E93] text-[#E8E0CC] rounded-xl focus:outline-none focus:border-[#C9A84C] text-sm transition duration-300 bg-[#121212]"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-[#26241E] placeholder-[#A39E93] text-[#E8E0CC] rounded-xl focus:outline-none focus:border-[#C9A84C] text-sm transition duration-300 bg-[#121212]"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                Login as
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-sm border border-[#26241E] focus:outline-none focus:border-[#C9A84C] rounded-xl transition duration-300 bg-[#121212] text-[#E8E0CC]"
              >
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#C9A84C] focus:ring-[#C9A84C] border-[#26241E] bg-[#121212] rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-[#E8E0CC]/80">
                Remember me
              </label>
            </div>

            <div className="text-xs">
              <Link to="/forgot-password" className="font-semibold text-[#C9A84C] hover:text-[#FFF5D6] transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-102 focus:outline-none disabled:opacity-50 transition duration-300 uppercase tracking-wider shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </motion.button>
          </div>
        </motion.form>
        
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-[#E8E0CC]/70">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#C9A84C] hover:text-[#FFF5D6] transition-colors">
              Register here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
