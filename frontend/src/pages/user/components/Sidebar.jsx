import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, User, ShoppingCart, Heart, Mail, LogOut, HelpCircle } from 'lucide-react'

const Sidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen, counts = {} }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />
    },
    {
      id: 'profile',
      name: 'My Profile',
      icon: <User size={18} />
    },
    {
      id: 'cart',
      name: 'My Cart',
      count: counts.cart,
      icon: <ShoppingCart size={18} />
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      count: counts.wishlist,
      icon: <Heart size={18} />
    },
    {
      id: 'queries',
      name: 'My Queries',
      count: counts.queries,
      icon: <HelpCircle size={18} />
    },
    {
      id: 'messages',
      name: 'My Messages',
      icon: <Mail size={18} />
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const renderSidebarContent = (isMobileView = false) => (
    <div className="flex flex-col h-full bg-black border-r border-[#26241E]">
      {/* Sidebar Header / User Card */}
      <div className="p-6 border-b border-[#26241E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] flex items-center justify-center text-black font-extrabold text-sm shadow-md">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#FFF5D6] truncate max-w-[130px] font-serif">{user?.name || 'User Portal'}</h1>
            <p className="text-[#C9A84C] text-[10px] uppercase font-bold tracking-widest">Member</p>
          </div>
        </div>
        
        {/* Close button for mobile drawer */}
        {isMobileView && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-[#E8E0CC]/70 hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
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
                className={`flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 group relative ${
                  activeSection === item.id 
                    ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 shadow-[inset_0_0_12px_rgba(201,168,76,0.1)]' 
                    : 'text-[#E8E0CC]/70 hover:bg-[#141414] hover:text-white'
                }`}
              >
                {/* Active Bar indicator */}
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeBar"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-[#C9A84C] rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <span className={`mr-3 transition-colors ${activeSection === item.id ? 'text-[#C9A84C]' : 'text-[#A39E93] group-hover:text-[#E8E0CC]'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.name}</span>
                
                {item.count !== undefined && item.count > 0 && (
                  <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full transition-all duration-200 ${
                    activeSection === item.id 
                      ? 'bg-[#C9A84C] text-black' 
                      : 'bg-[#141414] text-[#C9A84C]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Section */}
      <div className="p-4 border-t border-[#26241E]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#E8E0CC]/70 hover:bg-rose-950/20 hover:text-rose-400 border border-[#26241E] hover:border-rose-900/30 rounded-xl transition-all duration-300 cursor-pointer gap-2"
        >
          <LogOut size={14} />
          Logout Account
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (static, always visible on md screens and larger) */}
      <div className="hidden md:flex z-[40] w-64 text-slate-100 flex-col h-[calc(100vh-4rem)] sticky top-16">
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[90] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-[100] w-64 text-slate-100 flex flex-col md:hidden shadow-2xl"
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
