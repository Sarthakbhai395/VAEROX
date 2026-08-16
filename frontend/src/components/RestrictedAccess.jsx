import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const RestrictedAccess = () => {
  const { user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return '/login'
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'seller':
        return '/seller/dashboard'
      default:
        return '/user/dashboard'
    }
  }

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard'
    
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard'
      case 'seller':
        return 'Seller Dashboard'
      default:
        return 'My Account'
    }
  }

  const getRoleMessage = () => {
    if (!user) return 'You need to be logged in to access this feature.'
    
    switch (user.role) {
      case 'admin':
        return 'As an administrator, you have special privileges to manage the system. Only regular users can purchase products.'
      case 'seller':
        return 'As a seller, you can manage your products and view customer queries. Only regular users can purchase products.'
      default:
        return 'Only authenticated users can access this feature.'
    }
  }

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8 text-center">
          <motion.div
            className="mx-auto bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold text-gray-800 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Access Restricted
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 text-lg mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {getRoleMessage()}
          </motion.p>
          
          <motion.p 
            className="text-gray-500 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Please use your dashboard to manage your account and products.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              to={getDashboardLink()}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to {getDashboardLabel()}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default RestrictedAccess
