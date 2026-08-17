import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useMode } from '../contexts/ModeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Sparkles, Crown, Zap } from 'lucide-react'
import Logo from './Logo'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const { mode, setMode, openModeModal } = useMode()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsMenuOpen(false)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login'

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
    if (!isAuthenticated || !user) return 'Login'

    switch (user.role) {
      case 'admin':
        return 'Admin'
      case 'seller':
        return 'Seller Panel'
      default:
        return 'My Account'
    }
  }

  // Trigger animation when cart count changes
  useEffect(() => {
    setCartAnimation(true)
    const timer = setTimeout(() => {
      setCartAnimation(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [getCartCount()])

  // Trigger animation when wishlist count changes
  useEffect(() => {
    setWishlistAnimation(true)
    const timer = setTimeout(() => {
      setWishlistAnimation(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [wishlistItems.length])

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar-container')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  // Dynamic CSS helper for desktop nav links
  const navLinkClass = ({ isActive }) =>
    `text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 px-4 py-5 border-b-2 ${isActive
      ? 'text-[#C9A84C] border-[#C9A84C] bg-[#C9A84C]/10 font-bold'
      : 'text-[#E8E0CC]/80 border-transparent hover:text-[#C9A84C] hover:bg-[#C9A84C]/5'
    }`;

  // Dynamic CSS helper for mobile nav links
  const mobileNavLinkClass = ({ isActive }) =>
    `font-semibold px-5 py-3.5 transition-colors duration-300 block border-l-4 ${isActive
      ? 'text-white border-[#C9A84C] bg-[#141414]'
      : 'text-[#E8E0CC]/70 border-transparent hover:text-white hover:bg-[#141414]/50'
    }`;

  return (
    <>
      <motion.nav
        className="bg-black/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 navbar-container"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center h-full">
              <Link to="/" className="flex-shrink-0 flex items-center mr-8 py-2">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                  <Logo layout="horizontal" size="md" />
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center h-full">
                <NavLink to="/" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/products" className={navLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                  About
                </NavLink>
                {/* Show Contact button only for regular users, not for sellers or admins */}
                {(isAuthenticated && user && user.role === 'user') && (
                  <NavLink to="/contact" className={navLinkClass}>
                    Contact
                  </NavLink>
                )}

                {/* Mode Switcher Button */}
                <button
                  onClick={openModeModal}
                  className="ml-4 px-3 py-1.5 rounded-full border border-[#C9A84C]/40 bg-black/60 hover:border-[#C9A84C] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all text-[#C9A84C] shadow-md cursor-pointer"
                  title="Switch between Casual and Luxury mode"
                >
                  {mode === 'luxury' ? (
                    <>
                      <Crown size={12} className="text-[#C9A84C]" />
                      <span>VÆROX Luxury ❖</span>
                    </>
                  ) : (
                    <>
                      <Zap size={12} className="text-blue-400" />
                      <span className="text-blue-400">Casual Mode ⚡</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="hidden md:flex md:items-center space-x-6">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <svg className="h-5 w-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search luxury items..."
                    className="bg-[#121212] border border-[#C9A84C]/30 text-[#E8E0CC] placeholder-[#A39E93] text-xs tracking-wider rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] w-44 lg:w-56 transition-all duration-300 focus:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex items-center space-x-4">
                {/* Cart Icon - Only show for users */}
                {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={cartAnimation ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to="/user/cart" className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-2.5 hover:bg-[#C9A84C]/10 rounded-xl transition-colors duration-300 block">
                      <div className="icon-with-counter">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {getCartCount() > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md">
                            {getCartCount()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Wishlist Icon - Only show for users */}
                {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={wishlistAnimation ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to="/user/wishlist" className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-2.5 hover:bg-[#C9A84C]/10 rounded-xl transition-colors duration-300 block">
                      <div className="icon-with-counter">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {wishlistItems.length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md">
                            {wishlistItems.length}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )}

                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      to={getDashboardLink()}
                      className="border border-[#C9A84C]/40 bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black font-bold py-2 px-4 rounded-xl transition duration-300 text-xs tracking-wider uppercase shadow-md"
                    >
                      {getDashboardLabel()}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="border border-rose-500/40 bg-rose-950/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold py-2 px-4 rounded-xl transition duration-300 text-xs tracking-wider uppercase"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-[#C9A84C] to-[#9B782B] hover:from-[#E2C266] hover:to-[#B5943C] text-black font-extrabold py-2 px-6 rounded-xl transition duration-300 text-xs tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu controls */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Cart/Wishlist */}
              {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
                <div className="flex items-center space-x-1">
                  <Link to="/user/cart" className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-2">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {getCartCount() > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#C9A84C] text-black text-[8px] font-extrabold px-1 rounded-full leading-none min-w-[13px] text-center">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>
                  <Link to="/user/wishlist" className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-2">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#C9A84C] text-black text-[8px] font-extrabold px-1 rounded-full leading-none min-w-[13px] text-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              <button
                onClick={toggleMenu}
                className="p-2 rounded-xl text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer (slides in from left) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[90] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Left Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[100] w-72 bg-[#0A0A0A] border-r border-[#C9A84C]/30 text-[#E8E0CC] flex flex-col md:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#26241E] flex justify-between items-center">
                <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <Logo variant="full" size="sm" />
                </Link>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSearch}
                    className="p-1.5 rounded-lg text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                    aria-label="Toggle search"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#E8E0CC]/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Drawer Search Area */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pt-4 overflow-hidden"
                  >
                    <form onSubmit={handleSearch} className="relative flex">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="h-4 w-4 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="bg-[#141414] border border-[#C9A84C]/30 text-[#E8E0CC] placeholder-[#A39E93] text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#C9A84C] flex-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Links */}
              <div className="flex-grow py-6 px-6 flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col items-center space-y-6 pt-4">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `text-base font-medium tracking-widest uppercase transition-all duration-300 block text-center w-full py-2.5 rounded-xl ${isActive ? 'text-[#C9A84C] bg-[#C9A84C]/10 font-bold border border-[#C9A84C]/30' : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      `text-base font-medium tracking-widest uppercase transition-all duration-300 block text-center w-full py-2.5 rounded-xl ${isActive ? 'text-[#C9A84C] bg-[#C9A84C]/10 font-bold border border-[#C9A84C]/30' : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `text-base font-medium tracking-widest uppercase transition-all duration-300 block text-center w-full py-2.5 rounded-xl ${isActive ? 'text-[#C9A84C] bg-[#C9A84C]/10 font-bold border border-[#C9A84C]/30' : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </NavLink>
                  {/* Show Contact button only for regular users */}
                  {(isAuthenticated && user && user.role === 'user') && (
                    <NavLink
                      to="/contact"
                      className={({ isActive }) =>
                        `text-base font-medium tracking-widest uppercase transition-all duration-300 block text-center w-full py-2.5 rounded-xl ${isActive ? 'text-[#C9A84C] bg-[#C9A84C]/10 font-bold border border-[#C9A84C]/30' : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </NavLink>
                  )}

                  {/* Horizontal line divider */}
                  <div className="w-full border-t border-[#26241E] my-4" />

                  {isAuthenticated ? (
                    <div className="w-full flex flex-col items-center space-y-4">
                      <Link
                        to={getDashboardLink()}
                        className="text-sm font-bold tracking-widest text-[#C9A84C] hover:text-white transition-colors duration-300 text-center w-full py-2.5 border border-[#C9A84C]/40 rounded-xl uppercase"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {getDashboardLabel()}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-sm font-bold tracking-widest text-rose-400 hover:text-rose-300 transition-colors duration-300 text-center w-full py-2.5 uppercase"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold py-3 rounded-xl transition duration-300 w-full text-center uppercase tracking-widest text-sm shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
