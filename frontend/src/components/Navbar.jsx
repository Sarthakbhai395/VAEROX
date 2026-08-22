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
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
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

  // Dynamic CSS helper for desktop nav links
  const navLinkClass = ({ isActive }) =>
    `text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 px-3 py-2 border-b-2 ${isActive
      ? 'text-[#C9A84C] border-[#C9A84C] bg-[#C9A84C]/10 font-bold'
      : 'text-[#E8E0CC]/80 border-transparent hover:text-[#C9A84C] hover:bg-[#C9A84C]/5'
    }`;

  return (
    <>
      {/* Top Announcement Ribbon */}
      <div className="bg-[#050505] border-b border-[#C9A84C]/20 py-1.5 px-3 text-center text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-[#C9A84C] uppercase select-none overflow-hidden text-ellipsis whitespace-nowrap">
        <span>✦ FREE EXPRESS DELIVERY ON ORDERS ABOVE ₹1999 &nbsp;•&nbsp; 24/7 VIP SUPPORT &nbsp;•&nbsp; AUTHENTIC LUXURY ✦</span>
      </div>

      <motion.nav
        className="bg-black/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-[#C9A84C]/30 w-full navbar-container"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 w-full">

            {/* Left Section: Mobile Hamburger Icon (Hidden on Desktop) / Desktop Links */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Mobile Drawer Hamburger Button - Strictly hidden on md screens and above */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen((prev) => !prev)
                }}
                className="md:hidden p-2 rounded-xl text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors focus:outline-none shrink-0 hamburger-menu-btn cursor-pointer"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Desktop Left Navigation Links */}
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                <NavLink to="/" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/products" className={navLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                  About
                </NavLink>
              </div>
            </div>

            {/* Middle Section: Centered Luxury Logo */}
            <div className="flex justify-center items-center shrink-0">
              <Link to="/" className="flex items-center py-1 group">
                <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }} className="flex items-center">
                  <Logo layout="horizontal" size="md" />
                </motion.div>
              </Link>
            </div>

            {/* Right Section: Desktop Search, Wishlist, Cart, Account/Login */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 shrink-0">
              {/* Search Bar (Desktop only) */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-4 w-4 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search luxury..."
                    className="bg-[#121212] border border-[#C9A84C]/30 text-[#E8E0CC] placeholder-[#A39E93] text-xs tracking-wider rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#C9A84C] w-36 xl:w-48 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Wishlist Icon */}
              {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
                <Link
                  to="/user/wishlist"
                  className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-1.5 sm:p-2 rounded-xl transition-colors duration-300 shrink-0"
                  title="Wishlist"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Icon */}
              {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
                <Link
                  to="/user/cart"
                  className="relative text-[#E8E0CC] hover:text-[#C9A84C] p-1.5 sm:p-2 rounded-xl transition-colors duration-300 shrink-0"
                  title="Cart"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center shadow-md">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Account / Login Button - Perfectly proportioned in header frame */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-1.5 shrink-0">
                  <Link
                    to={getDashboardLink()}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-[#C9A84C] bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black font-extrabold text-[10px] sm:text-xs tracking-wider uppercase leading-none transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    {getDashboardLabel()}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-600 text-rose-300 hover:text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase leading-none transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#9B782B] hover:from-[#E2C266] hover:to-[#B5943C] text-black font-extrabold text-[10px] sm:text-xs tracking-[0.12em] uppercase leading-none transition duration-300 shadow-[0_0_15px_rgba(201,168,76,0.3)] whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
              )}
            </div>

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
                    <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-[0.22em] text-[#C9A84C] bg-black/85 border border-[#C9A84C]/50 uppercase shadow-lg font-sans">
                      ✦ HIGH FASHION ATELIER 2026
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
