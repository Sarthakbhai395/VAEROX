import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

// Pages
import Home from './pages/NewHome'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import UserDashboard from './pages/user/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import SellerDashboard from './pages/seller/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/user/Cart'
import Wishlist from './pages/user/Wishlist'
import Checkout from './pages/Checkout'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import IntroLoader from './components/IntroLoader'

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-black text-[#E8E0CC]">
      <IntroLoader />
      <Navbar />
      <main className="flex-grow">
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
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
