import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// Route-based code splitting for all pages
const Home = lazy(() => import('./pages/NewHome'))

// Route-based code splitting for secondary pages
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const UserDashboard = lazy(() => import('./pages/user/Dashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/user/Cart'))
const Wishlist = lazy(() => import('./pages/user/Wishlist'))
const Checkout = lazy(() => import('./pages/Checkout'))

// Core Global Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import IntroLoader from './components/IntroLoader'

// Minimalist luxury fallback
const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-black">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
      <span className="text-[11px] tracking-[0.25em] text-[#C9A84C] uppercase font-sans">
        Loading Atelier...
      </span>
    </div>
  </div>
)

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-black text-[#E8E0CC]">
      <IntroLoader />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/cart"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/wishlist"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
