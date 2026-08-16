import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Sidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'products',
      name: 'My Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'queries',
      name: 'User Queries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderSidebarContent = (isMobileView = false) => (
    <>
      {/* Sidebar Header */}
      <div className="p-5 border-b border-[#26241E] flex justify-between items-center bg-black">
        <div>
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] uppercase tracking-wider font-serif">Seller Panel</h1>
          <p className="text-[#E8E0CC]/60 text-[10px] uppercase tracking-widest mt-0.5">Management Dashboard</p>
        </div>
        {/* Close button for mobile drawer */}
        {isMobileView && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-[#E8E0CC]/70 hover:text-white hover:bg-[#141414] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto bg-black">
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link 
                to="#" 
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(item.id)
                  if (isMobileView) {
                    setIsOpen(false) // Close drawer on selection on mobile
                  }
                }}
                className={`flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-l-4 border-[#C9A84C] shadow-[inset_0_0_12px_rgba(201,168,76,0.1)]' 
                    : 'text-[#E8E0CC]/70 hover:bg-[#141414] hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className={`mr-3 transition-colors ${activeSection === item.id ? 'text-[#C9A84C]' : 'text-[#A39E93] group-hover:text-[#E8E0CC]'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Section */}
      <div className="p-4 border-t border-[#26241E] bg-black">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#E8E0CC]/70 hover:bg-rose-950/20 hover:text-rose-400 border border-[#26241E] hover:border-rose-900/40 rounded-xl transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-3 text-[#A39E93] hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar (static, always visible on md screens and larger) */}
      <div className="hidden md:flex z-[40] w-64 bg-black border-r border-[#26241E] text-[#E8E0CC] flex-col h-[calc(100vh-4rem)] sticky top-16">
        {renderSidebarContent(false)}
      </div>

      {/* Mobile Sidebar (animated drawer sliding from the right) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[100] w-64 bg-black border-l border-[#26241E] text-[#E8E0CC] flex flex-col md:hidden shadow-2xl"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
