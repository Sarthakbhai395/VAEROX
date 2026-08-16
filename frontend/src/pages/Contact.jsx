import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { contactAPI } from '../services/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

const Contact = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Redirect guest users to login page
  useEffect(() => {
    if (!isAuthenticated) {
      const from = location.state?.from?.pathname || location.pathname
      navigate('/login', { state: { from, message: 'Please login first to contact us' } })
    }
  }, [isAuthenticated, navigate, location])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)
    
    try {
      const token = localStorage.getItem('token')
      const response = await contactAPI.sendMessage(formData, token)
      
      if (response.success) {
        setSubmitSuccess(true)
        setFormData({
          name: user?.name || formData.name,
          email: user?.email || formData.email,
          subject: '',
          message: ''
        })
        
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      } else {
        setSubmitError(response.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
              💬 VÆROX Concierge Support
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] mb-4">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg text-[#E8E0CC]/80 max-w-2xl mx-auto leading-relaxed">
            Have questions or custom inquiries? Our dedicated concierge team is ready to assist you 24/7.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Information - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-8 lg:p-10 text-[#E8E0CC] h-full relative overflow-hidden">
              <h2 className="text-2xl font-serif font-bold text-[#FFF5D6] mb-3">Contact Information</h2>
              <p className="text-[#A39E93] mb-8 text-sm">Fill out the form and our team will get back to you within 24 hours.</p>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start">
                  <div className="bg-[#121212] border border-[#26241E] p-3.5 rounded-2xl mr-4 text-[#C9A84C] flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF5D6] mb-1">Phone</h3>
                    <p className="text-xs text-[#A39E93]">+91 98765 43210</p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start">
                  <div className="bg-[#121212] border border-[#26241E] p-3.5 rounded-2xl mr-4 text-[#C9A84C] flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF5D6] mb-1">Email</h3>
                    <p className="text-xs text-[#A39E93]">support@vaerox-akariomart.com</p>
                  </div>
                </div>
                
                {/* Address */}
                <div className="flex items-start">
                  <div className="bg-[#121212] border border-[#26241E] p-3.5 rounded-2xl mr-4 text-[#C9A84C] flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF5D6] mb-1">Headquarters</h3>
                    <p className="text-xs text-[#A39E93]">123 Luxury Avenue, Flagship Tower</p>
                    <p className="text-xs text-[#A39E93]">Mumbai, Maharashtra 400001, India</p>
                  </div>
                </div>
                
                {/* Business Hours */}
                <div className="flex items-start">
                  <div className="bg-[#121212] border border-[#26241E] p-3.5 rounded-2xl mr-4 text-[#C9A84C] flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF5D6] mb-1">Concierge Hours</h3>
                    <p className="text-xs text-[#A39E93]">Monday - Saturday: 9:00 AM - 9:00 PM</p>
                    <p className="text-xs text-[#A39E93]">Sunday: VIP Priority Only</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF5D6] mb-3">Send us a Message</h2>
              <p className="text-[#A39E93] text-sm mb-8">We respond promptly to all concierge inquiries</p>
              
              {submitSuccess && (
                <div className="mb-6 bg-[#C9A84C]/15 border border-[#C9A84C] text-[#FFF5D6] px-6 py-4 rounded-xl shadow-lg text-xs sm:text-sm font-semibold">
                  Thank you for your message! Our concierge team will reach out to you shortly.
                </div>
              )}
              
              {submitError && (
                <div className="mb-6 bg-rose-950/40 border border-rose-500 text-rose-300 px-6 py-4 rounded-xl shadow-lg text-xs sm:text-sm font-semibold">
                  {submitError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border border-[#26241E] rounded-xl focus:border-[#C9A84C] focus:outline-none bg-[#121212] text-[#E8E0CC] font-semibold text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border border-[#26241E] rounded-xl focus:border-[#C9A84C] focus:outline-none bg-[#121212] text-[#E8E0CC] font-semibold text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border border-[#26241E] rounded-xl focus:border-[#C9A84C] focus:outline-none bg-[#121212] text-[#E8E0CC] font-semibold text-sm"
                    placeholder="How can we assist you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border border-[#26241E] rounded-xl focus:border-[#C9A84C] focus:outline-none bg-[#121212] text-[#E8E0CC] font-semibold text-sm"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-sm py-4 rounded-xl uppercase tracking-widest shadow-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
