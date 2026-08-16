import React from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

const About = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  }

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC]">
      {/* Hero Section */}
      <div className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-10"></div>
        <motion.img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=80" 
          alt="Luxury VÆROX Collection" 
          className="w-full h-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8 }}
        />
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="mb-4">
            <Logo variant="full" size="lg" />
          </div>
          <motion.h1 
            className="text-4xl md:text-6xl font-serif font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The Heritage of VÆROX
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-[#E8E0CC]/80 font-light max-w-2xl uppercase tracking-[0.3em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Elevating Everyday Living Through Uncompromising Luxury
          </motion.p>
          <motion.div 
            className="mt-10 flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md rounded-2xl border border-[#26241E]">
              <div className="text-3xl font-serif font-bold text-[#FFF5D6]">10K+</div>
              <div className="text-[#C9A84C] text-xs uppercase tracking-widest mt-1">Curated Items</div>
            </div>
            <div className="text-center px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md rounded-2xl border border-[#26241E]">
              <div className="text-3xl font-serif font-bold text-[#FFF5D6]">50K+</div>
              <div className="text-[#C9A84C] text-xs uppercase tracking-widest mt-1">Distinguished Clients</div>
            </div>
            <div className="text-center px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md rounded-2xl border border-[#26241E]">
              <div className="text-3xl font-serif font-bold text-[#FFF5D6]">500+</div>
              <div className="text-[#C9A84C] text-xs uppercase tracking-widest mt-1">Global Maisons</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Story Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-12 bg-gradient-to-b from-[#FFF5D6] via-[#C9A84C] to-[#8A6C1B] mr-4 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF5D6]">Our Story</h2>
              </div>
              <p className="text-[#E8E0CC]/80 text-base md:text-lg leading-relaxed mb-6">
                VÆROX x Akariomart stands as a pinnacle of luxury and refine, bringing together 
                world-class fashion, cutting-edge technology, and artisanal lifestyle collections under one roof.
              </p>
              <p className="text-[#E8E0CC]/80 text-base md:text-lg leading-relaxed mb-6">
                Founded with an ethos to redefine premium shopping, we partner directly with elite designers 
                and verified luxury houses, ensuring absolute authenticity and craftsmanship in every order.
              </p>
              <p className="text-[#E8E0CC]/80 text-base md:text-lg leading-relaxed">
                With white-glove concierge support, fast delivery, and bespoke packaging, 
                VÆROX transforms ordinary shopping into an unforgettable journey.
              </p>
            </div>
            <motion.div 
              className="relative h-96 rounded-3xl overflow-hidden border border-[#26241E] shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80" 
                alt="VÆROX Luxury Flagship" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="bg-[#0A0A0A] rounded-3xl shadow-2xl overflow-hidden border border-[#26241E] group hover:border-[#C9A84C]/60 transition-all duration-500"
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-64 overflow-hidden relative">
              <motion.img 
                src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600&fit=crop&q=80" 
                alt="Our Mission" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <div className="w-14 h-14 bg-black/80 border border-[#C9A84C] rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-7 h-7 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-serif font-bold text-[#FFF5D6] mb-3">Our Mission</h2>
              <p className="text-[#E8E0CC]/80 leading-relaxed text-sm md:text-base">
                To deliver an unmatched high-luxury e-commerce experience by pairing rare craftsmanship 
                and verified premium goods with white-glove customer care.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-[#0A0A0A] rounded-3xl shadow-2xl overflow-hidden border border-[#26241E] group hover:border-[#C9A84C]/60 transition-all duration-500"
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-64 overflow-hidden relative">
              <motion.img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80" 
                alt="Our Vision" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <div className="w-14 h-14 bg-black/80 border border-[#C9A84C] rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-7 h-7 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-serif font-bold text-[#FFF5D6] mb-3">Our Vision</h2>
              <p className="text-[#E8E0CC]/80 leading-relaxed text-sm md:text-base">
                To stand as the global benchmark in luxury retail, inspiring refined taste 
                and elevating everyday life across every digital touchpoint.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Values Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF5D6] mb-3">Our Core Pillars</h2>
            <p className="text-[#C9A84C] text-sm uppercase tracking-[0.3em]">
              The principles behind the VÆROX mark of excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-[#0A0A0A] p-8 rounded-3xl border border-[#26241E] hover:border-[#C9A84C]/60 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#FFF5D6] mb-3">Certified Authenticity</h3>
              <p className="text-[#E8E0CC]/70 text-sm leading-relaxed">
                Every single item undergoes strict multi-tier verification before reaching your doorstep.
              </p>
            </motion.div>

            <motion.div 
              className="bg-[#0A0A0A] p-8 rounded-3xl border border-[#26241E] hover:border-[#C9A84C]/60 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#FFF5D6] mb-3">Privileged Support</h3>
              <p className="text-[#E8E0CC]/70 text-sm leading-relaxed">
                Our dedicated luxury advisors provide round-the-clock concierge level assistance.
              </p>
            </motion.div>

            <motion.div 
              className="bg-[#0A0A0A] p-8 rounded-3xl border border-[#26241E] hover:border-[#C9A84C]/60 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#FFF5D6] mb-3">Swift Global Delivery</h3>
              <p className="text-[#E8E0CC]/70 text-sm leading-relaxed">
                Priority climate-controlled shipping ensures your items arrive in immaculate condition.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer CTA Section */}
        <motion.div 
          className="text-center bg-[#0A0A0A] border border-[#26241E] rounded-3xl shadow-2xl p-12 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute -inset-10 bg-gradient-to-r from-[#C9A84C]/10 via-transparent to-[#C9A84C]/10 blur-2xl pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF5D6] mb-4">
            Welcome to the VÆROX Inner Circle
          </h2>
          <p className="text-base text-[#E8E0CC]/80 max-w-2xl mx-auto leading-relaxed">
            Discover unprecedented elegance and elevate your everyday lifestyle with our exclusive luxury catalogue.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default About
