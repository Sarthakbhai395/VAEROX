import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Logo from './Logo'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const [formattedDate, setFormattedDate] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()

  // Format live calendar date (e.g. MON, 24 AUG)
  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options = { weekday: 'short', day: '2-digit', month: 'short' }
      setFormattedDate(now.toLocaleDateString('en-US', options).toUpperCase())
    }
    updateDate()
    const timer = setInterval(updateDate, 60000)
    return () => clearInterval(timer)
  }, [])

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
    return user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
  }

  const getDashboardLabel = () => {
    if (!isAuthenticated || !user) return 'Login'
    return user.role === 'admin' ? 'Admin Panel' : 'My Account'
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

  // Close menu when clicking outside (using drawer container check)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest('.mobile-drawer-container') &&
        !event.target.closest('.hamburger-menu-btn')
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top Announcement Ribbon */}
      <div className="bg-[#050505] py-1.5 px-3 text-center text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-[#C9A84C] uppercase select-none overflow-hidden text-ellipsis whitespace-nowrap">
        <span>✦ FREE EXPRESS DELIVERY ON ORDERS ABOVE ₹1999 &nbsp;•&nbsp; 24/7 VIP SUPPORT &nbsp;•&nbsp; AUTHENTIC LUXURY ✦</span>
      </div>

      {/* Dynamic Animated Floating Capsule Navbar */}
      <motion.nav
        className="sticky top-2 z-50 px-2 sm:px-4 md:px-6 w-full max-w-7xl mx-auto navbar-container"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#C9A84C]/40 shadow-[0_12px_35px_rgba(0,0,0,0.85)] rounded-2xl md:rounded-full px-3 sm:px-5 py-2 flex items-center justify-between transition-all duration-300 w-full min-w-0">

          {/* 1. LEFT SECTION: HAMBURGER, LOGO & DYNAMIC CALENDAR BADGE */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Drawer Hamburger Button - Strictly hidden on md screens and above */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen((prev) => !prev)
              }}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors focus:outline-none shrink-0 hamburger-menu-btn cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center py-1 group shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="flex items-center">
                <Logo layout="horizontal" size="md" />
              </motion.div>
            </Link>

            {/* Dynamic Calendar Live Date Pill Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16140F] border border-[#C9A84C]/40 text-[10px] font-extrabold tracking-[0.2em] text-[#C9A84C] uppercase shadow-sm shrink-0 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-ping" />
              <span>📅 {formattedDate || 'ATELIER 2026'}</span>
            </div>
          </div>

          {/* 2. RIGHT SECTION: ANIMATED SLIDING NAV TABS & DOCK ACTION PILLS */}
          <div className="flex items-center justify-end space-x-2 lg:space-x-4 shrink-0">

            {/* Desktop Dynamic Sliding Nav Tabs (Framer Motion layoutId) */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-[#12110D] p-1 rounded-full border border-[#C9A84C]/25">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative text-xs font-bold tracking-[0.16em] uppercase transition-all duration-300 px-3.5 py-1.5 rounded-full ${
                      isActive
                        ? 'text-black font-extrabold'
                        : 'text-[#E8E0CC]/80 hover:text-[#C9A84C]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="navbarActiveTab"
                          className="absolute inset-0 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] rounded-full z-0 shadow-[0_0_12px_rgba(201,168,76,0.5)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-3.5 w-3.5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search luxury..."
                  className="bg-[#121212] border border-[#C9A84C]/30 text-[#E8E0CC] placeholder-[#A39E93] text-[11px] tracking-wider rounded-full pl-8 pr-3 py-1 focus:outline-none focus:border-[#C9A84C] w-32 xl:w-44 transition-all duration-300 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Wishlist Dynamic Icon Badge */}
            {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
              <Link
                to="/user/wishlist"
                className={`relative text-[#E8E0CC] hover:text-[#C9A84C] p-1.5 rounded-full transition-all duration-300 shrink-0 ${
                  wishlistAnimation ? 'scale-125 text-[#C9A84C]' : ''
                }`}
                title="Wishlist"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Luxury Pill Button */}
            {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
              <Link
                to="/user/cart"
                className={`hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1F1E1B] hover:bg-[#C9A84C] text-[#E8E0CC] hover:text-black border border-[#C9A84C]/40 text-xs font-semibold tracking-wider transition-all duration-300 shadow-md shrink-0 ${
                  cartAnimation ? 'scale-110 border-[#C9A84C]' : ''
                }`}
                title="Cart"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart {getCartCount() > 0 ? `(${getCartCount()})` : ''}</span>
              </Link>
            )}

            {/* Cart Icon for Mobile View */}
            {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
              <Link
                to="/user/cart"
                className="md:hidden relative text-[#E8E0CC] hover:text-[#C9A84C] p-1 rounded-xl transition-colors shrink-0"
                title="Cart"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Account / Login Pill Button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center justify-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black font-extrabold text-[9px] sm:text-xs tracking-wider uppercase leading-none transition-all duration-300 shadow-md whitespace-nowrap shrink-0"
                >
                  <span className="sm:hidden">{user?.role === 'admin' ? 'ADMIN' : 'PANEL'}</span>
                  <span className="hidden sm:inline">{getDashboardLabel()}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center justify-center px-3.5 py-1.5 rounded-full border border-rose-500/40 bg-rose-950/20 hover:bg-rose-600 text-rose-300 hover:text-white font-extrabold text-xs tracking-wider uppercase leading-none transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#9B782B] hover:from-[#E2C266] hover:to-[#B5943C] text-black font-extrabold text-[9px] sm:text-xs tracking-[0.1em] uppercase leading-none transition duration-300 shadow-[0_0_15px_rgba(201,168,76,0.3)] whitespace-nowrap shrink-0"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </motion.nav>

      {/* Mobile Drawer Menu (slides in from left) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Left Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-[100] w-80 max-w-[88vw] bg-[#0A0A0A] border-r border-[#C9A84C]/40 text-[#E8E0CC] flex flex-col md:hidden shadow-2xl overflow-hidden font-sans mobile-drawer-container"
            >
              {/* 1. TOP POWERFUL VÆROX LUXURY APPLICATION BANNER (HIGH FASHION EDITORIAL) */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden border-b border-[#C9A84C]/50 bg-black shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                  alt="VÆROX High Fashion Luxury Atelier"
                  className="w-full h-full object-cover object-center opacity-80 transform scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/35 to-black/20" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.22em] text-[#C9A84C] bg-black/85 border border-[#C9A84C]/50 uppercase shadow-lg font-sans flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-ping" />
                      📅 {formattedDate || 'ATELIER 2026'}
                    </span>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1.5 rounded-full bg-black/80 text-[#E8E0CC] hover:text-white border border-white/20 transition-all shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Logo layout="horizontal" size="sm" />
                    <p className="text-[9px] text-[#E8E0CC]/90 font-semibold mt-1 tracking-[0.2em] uppercase font-sans">
                      HAUTE COUTURE & EXQUISITE BESPOKE FIT
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. MIDDLE NAVBAR BUTTONS */}
              <div className="flex-grow p-3.5 space-y-1.5 overflow-y-auto font-sans">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                        : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Home</span>
                  <span className="text-[#C9A84C] text-xs">→</span>
                </NavLink>

                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                        : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Products Collection</span>
                  <span className="text-[#C9A84C] text-xs">→</span>
                </NavLink>

                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                        : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>About VÆROX</span>
                  <span className="text-[#C9A84C] text-xs">→</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-4 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                        : 'text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Contact & Concierge</span>
                  <span className="text-[#C9A84C] text-xs">→</span>
                </NavLink>

                {(!isAuthenticated || (user && user.role === 'user')) && (
                  <>
                    <Link
                      to="/user/wishlist"
                      className="flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-xl text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414] transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Wishlist ({wishlistItems.length})</span>
                      <span className="text-[#C9A84C]">♥</span>
                    </Link>

                    <Link
                      to="/user/cart"
                      className="flex items-center justify-between text-xs font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-xl text-[#E8E0CC]/80 hover:text-white hover:bg-[#141414] transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Bag ({getCartCount()})</span>
                      <span className="text-[#C9A84C]">🛍️</span>
                    </Link>
                  </>
                )}
              </div>

              {/* 3. BOTTOM ROLE-SPECIFIC BUTTONS & PROMINENT RED LOGOUT BUTTON */}
              <div className="p-3.5 border-t border-[#26241E] bg-[#050505] shrink-0 font-sans">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to={getDashboardLink()}
                      className="block text-center w-full py-2.5 bg-[#C9A84C]/15 border border-[#C9A84C]/50 text-[#C9A84C] font-extrabold text-xs tracking-[0.18em] uppercase rounded-xl hover:bg-[#C9A84C] hover:text-black transition-all shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user?.role === 'admin' ? '🛡️ Admin Panel' : '👤 User Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-center w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-[0.18em] uppercase rounded-xl border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block text-center w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs tracking-[0.2em] uppercase rounded-xl shadow-lg hover:scale-102 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
