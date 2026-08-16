import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import { formatCurrency } from '../utils/format'
import { useAuth } from '../contexts/AuthContext'
import { getProductImageUrl } from '../utils/imageUrl'
import { paymentAPI } from '../services/api'
import { ShieldCheck, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react'

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'razorpay'
  })

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const subtotal = getCartTotal()
  const tax = Number((subtotal * 0.08).toFixed(2))
  const total = Number((subtotal + tax).toFixed(2))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const createOrder = async () => {
    try {
      const validatedTotal = Number(total.toFixed(2));
      
      if (validatedTotal <= 0) {
        console.error('Invalid amount for payment:', validatedTotal);
        throw new Error(`Invalid total amount: ₹${validatedTotal}. Please add items to your cart.`);
      }
      
      const response = await paymentAPI.createOrder(validatedTotal, 'INR');
      
      if (response.success) {
        return response.order;
      } else {
        throw new Error(response.error || response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  const handleRazorpayPayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPaymentError('')

    try {
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        setPaymentError('Razorpay SDK failed to load. Please check your internet connection.')
        setLoading(false)
        return
      }

      const order = await createOrder()

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_TQMjx3H66VLczL',
        amount: order.amount,
        currency: order.currency,
        name: 'VÆROX SMART LIVING',
        description: 'Order Payment',
        image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=200&h=200',
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log('Payment completed on client, verifying with server:', response);
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setOrderPlaced(true);
              clearCart();
              setTimeout(() => {
                navigate('/user/dashboard');
              }, 3000);
            } else {
              setPaymentError(verifyRes.error || 'Payment verification failed. Signature mismatch.');
            }
          } catch (error) {
            setPaymentError('Payment verification error: ' + error.message);
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#C9A84C'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setPaymentError(response.error.description || 'Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });
      
      rzp.open();
    } catch (error) {
      setPaymentError(error.message || 'Failed to initiate payment. Please try again.')
      console.error('Payment initiation error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-[#E8E0CC] flex items-center justify-center py-12 px-4">
        <motion.div 
          className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-[#141414] border border-[#C9A84C]/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#FFF5D6] mb-3">Your cart is empty</h2>
          <p className="text-[#A39E93] text-xs sm:text-sm mb-8">Add some luxury items to your cart before proceeding to checkout</p>
          <motion.button 
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold px-8 py-3.5 rounded-2xl transition duration-200 shadow-xl text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Products
            <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-[#E8E0CC] flex items-center justify-center py-12 px-4">
        <motion.div 
          className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-[#C9A84C]/20 border border-[#C9A84C] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-[#C9A84C]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#FFF5D6] mb-2">Order Placed Successfully!</h2>
          <p className="text-[#A39E93] text-xs sm:text-sm mb-6 leading-relaxed">Thank you for your VÆROX purchase. You will be redirected to your dashboard shortly.</p>
          <div className="bg-[#121212] border border-[#26241E] rounded-2xl p-4 text-left">
            <h3 className="font-serif font-bold text-[#FFF5D6] mb-2 text-sm uppercase tracking-wider">Order Summary</h3>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#A39E93]">Total Amount Paid:</span>
              <span className="font-bold text-[#C9A84C]">{formatCurrency(total)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] py-8 sm:py-12">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl sm:text-4xl font-serif font-bold text-[#FFF5D6] mb-8 tracking-tight"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Checkout
        </motion.h1>
        
        {paymentError && (
          <motion.div 
            className="bg-rose-950/40 border border-rose-500/40 text-rose-300 px-5 py-3.5 rounded-2xl relative mb-6 text-xs sm:text-sm font-semibold"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="block sm:inline">{paymentError}</span>
          </motion.div>
        )}
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 text-[#FFF5D6]">Shipping Information</h2>
              
              <form onSubmit={handleRazorpayPayment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#121212] border border-[#26241E] rounded-xl text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C] font-semibold transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="border-t border-[#26241E] pt-6">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 text-[#FFF5D6]">Payment Method</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center bg-[#121212] border border-[#26241E] p-4 rounded-2xl">
                      <input
                        type="radio"
                        id="razorpay"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#C9A84C] focus:ring-[#C9A84C] accent-[#C9A84C]"
                      />
                      <label htmlFor="razorpay" className="ml-3 block text-xs sm:text-sm font-semibold text-[#E8E0CC]">
                        Razorpay Secure (Credit Card, Debit Card, UPI, Net Banking)
                      </label>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full mt-8 bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs sm:text-sm py-4 rounded-xl uppercase tracking-widest shadow-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    <CreditCard size={18} />
                    {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold mb-6 text-[#FFF5D6]">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-xs sm:text-sm text-[#E8E0CC]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#FFF5D6]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-[#FFF5D6]">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-[#26241E] pt-4 flex justify-between font-serif font-bold text-base sm:text-lg text-[#FFF5D6]">
                  <span>Total</span>
                  <span className="text-[#C9A84C]">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <div className="bg-[#121212] border border-[#26241E] rounded-2xl p-4">
                <h3 className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3">Items in Cart</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#26241E]">
                  {cartItems.map((item) => {
                    const product = item.product || item
                    const itemTotal = (product.discount 
                      ? product.price * (1 - product.discount / 100)
                      : product.price) * (item.quantity || 1)
                    
                    return (
                      <div key={product._id || product.id} className="flex items-center justify-between text-xs py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#050505] border border-[#26241E] p-1 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img 
                              src={getProductImageUrl(product.image)} 
                              alt={product.name} 
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&h=100';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#E8E0CC] line-clamp-1">{product.name}</p>
                            <p className="text-[#A39E93] text-[10px]">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#C9A84C]">{formatCurrency(itemTotal)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Checkout
