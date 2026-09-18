import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ShieldCheck, UserCheck, Search, X } from 'lucide-react'
import Logo from './Logo'
import { getSiteAssets } from '../utils/siteAssets'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartAnimation, setCartAnimation] = useState(false)
  const [wishlistAnimation, setWishlistAnimation] = useState(false)
  const [formattedDate, setFormattedDate] = useState('')
  const [siteAssets, setSiteAssets] = useState(getSiteAssets())
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    const handleUpdate = () => setSiteAssets(getSiteAssets())
    window.addEventListener('vaerox_site_assets_updated', handleUpdate)
    return () => window.removeEventListener('vaerox_site_assets_updated', handleUpdate)
  }, [])

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
    return user.role === 'admin' ? 'Admin Panel' : 'User Panel'
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
      <motion.nav
        className="sticky top-2 z-50 px-2 sm:px-4 md:px-6 w-full max-w-7xl mx-auto navbar-container"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="bg-[#050505]/95 backdrop-blur-2xl px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between rounded-full border border-[#C9A84C]/40 shadow-[0_12px_35px_rgba(0,0,0,0.9)] w-full min-w-0">

          {/* 1. LEFT SECTION: HAMBURGER MENU & LOGO */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen((prev) => !prev)
              }}
              className="md:hidden p-1.5 sm:p-2 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors focus:outline-none shrink-0 hamburger-menu-btn cursor-pointer active:scale-95 flex items-center justify-center border-none outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </button>

            <Link to="/" className="flex items-center py-0.5 group shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="flex items-center">
                <Logo layout="horizontal" size="sm" />
              </motion.div>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-[#C9A84C] uppercase shrink-0 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-ping" />
              <span>{formattedDate || 'ATELIER 2026'}</span>
            </div>
          </div>

          {/* 2. CENTER SECTION: DESKTOP NAVIGATION LINKS */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-6 lg:space-x-8 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative text-xs font-extrabold tracking-[0.18em] uppercase transition-all duration-300 py-1.5 opacity-100 ${isActive
                    ? 'text-[#C9A84C]'
                    : 'text-[#FFF5D6] hover:text-[#C9A84C]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`relative z-10 opacity-100 ${isActive ? 'text-[#C9A84C]' : 'text-[#FFF5D6]'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbarActiveIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_12px_rgba(201,168,76,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* 3. RIGHT SECTION: LINEAR ACTION BUTTONS (WISHLIST, CART, ACCOUNT) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">

            {/* Search Icon Button */}
            <button
              onClick={toggleSearch}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/60 flex items-center justify-center text-[#FFF5D6] hover:text-[#C9A84C] transition-all duration-300 shrink-0 cursor-pointer"
              title="Search Products"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon Button */}
            {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
              <Link
                to="/user/wishlist"
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/60 flex items-center justify-center text-[#FFF5D6] hover:text-[#C9A84C] transition-all duration-300 shrink-0 ${
                  wishlistAnimation ? 'scale-110 border-[#C9A84C] text-[#C9A84C]' : ''
                }`}
                title="Wishlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-[0_0_8px_rgba(201,168,76,0.8)]">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon Button */}
            {(!isAuthenticated || (isAuthenticated && user && user.role === 'user')) && (
              <Link
                to="/user/cart"
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/60 flex items-center justify-center text-[#FFF5D6] hover:text-[#C9A84C] transition-all duration-300 shrink-0 ${
                  cartAnimation ? 'scale-110 border-[#C9A84C] text-[#C9A84C]' : ''
                }`}
                title="Cart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-[0_0_8px_rgba(201,168,76,0.8)]">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Account / Login / Panel Action Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={getDashboardLink()}
                  className="relative inline-flex items-center gap-1 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-[10px] sm:text-xs tracking-wider uppercase leading-none transition-all duration-300 shadow-[0_0_18px_rgba(201,168,76,0.5)] hover:shadow-[0_0_28px_rgba(201,168,76,0.85)] hover:scale-105 border border-[#FFF5D6]/60 overflow-hidden group shrink-0 cursor-pointer"
                  title={user?.role === 'admin' ? 'Admin Management Panel' : 'User Account Dashboard Panel'}
                >
                  <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                  {user?.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
                  )}
                  <span className="sm:hidden font-extrabold">{user?.role === 'admin' ? 'A.P' : 'U.D'}</span>
                  <span className="hidden sm:inline">{getDashboardLabel()}</span>
                </Link>

                {/* Shiny Red Logout Button (Desktop) */}
                <button
                  onClick={handleLogout}
                  className="relative hidden md:inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs tracking-wider uppercase leading-none transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.7)] hover:shadow-[0_0_25px_rgba(239,68,68,0.95)] hover:scale-105 overflow-hidden group cursor-pointer border border-red-400/50"
                >
                  <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="relative inline-flex items-center justify-center px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-[10px] sm:text-xs tracking-[0.1em] uppercase leading-none transition-all duration-300 shadow-[0_0_15px_rgba(201,168,76,0.4)] hover:shadow-[0_0_25px_rgba(201,168,76,0.85)] hover:scale-105 overflow-hidden group shrink-0 cursor-pointer"
              >
                <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                Login
              </Link>
            )}
          </div>

        </div>

        {/* Floating Search Bar Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 px-2 z-50 max-w-xl mx-auto"
            >
              <form onSubmit={handleSearch} className="bg-[#0A0A0A] border-2 border-[#C9A84C] rounded-full p-2 shadow-2xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search products in VÆROX Collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-1 text-xs sm:text-sm text-[#FFF5D6] placeholder-[#888] focus:outline-none font-sans"
                  autoFocus
                />
                <button type="submit" className="bg-[#C9A84C] text-black px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:bg-[#FFF5D6]">
                  Search
                </button>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="p-1.5 text-[#888] hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
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
                  src={(typeof siteAssets.drawerHeader === 'string' ? siteAssets.drawerHeader : siteAssets.drawerHeader?.url || siteAssets.drawer_header?.url) || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"}
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
                    `flex items-center justify-between text-xs font-extrabold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all opacity-100 ${isActive
                      ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                      : 'text-[#FFF5D6] bg-[#121212] hover:text-[#C9A84C] hover:bg-[#1A1A1A] border border-[#26241E]'
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
                    `flex items-center justify-between text-xs font-extrabold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all opacity-100 ${isActive
                      ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                      : 'text-[#FFF5D6] bg-[#121212] hover:text-[#C9A84C] hover:bg-[#1A1A1A] border border-[#26241E]'
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
                    `flex items-center justify-between text-xs font-extrabold tracking-widest uppercase py-2.5 px-3.5 rounded-xl transition-all opacity-100 ${isActive
                      ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                      : 'text-[#FFF5D6] bg-[#121212] hover:text-[#C9A84C] hover:bg-[#1A1A1A] border border-[#26241E]'
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
                    `flex items-center justify-between text-xs font-extrabold tracking-widest uppercase py-2.5 px-4 rounded-xl transition-all opacity-100 ${isActive
                      ? 'text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/40'
                      : 'text-[#FFF5D6] bg-[#121212] hover:text-[#C9A84C] hover:bg-[#1A1A1A] border border-[#26241E]'
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
                      className="relative overflow-hidden group block text-center w-full py-3 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs tracking-[0.2em] uppercase rounded-xl border border-red-400/60 shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:shadow-[0_0_35px_rgba(239,68,68,1)] transition-all cursor-pointer"
                    >
                      <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
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
