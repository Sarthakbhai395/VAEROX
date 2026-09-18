import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { getFaqs } from '../../utils/faqStorage'

export const FAQSection = () => {
  const [faqs, setFaqs] = useState(getFaqs())
  const [openIndex, setOpenIndex] = useState(0)

  useEffect(() => {
    const handleFaqUpdate = () => {
      setFaqs(getFaqs())
    }
    window.addEventListener('vaerox_faqs_updated', handleFaqUpdate)
    return () => window.removeEventListener('vaerox_faqs_updated', handleFaqUpdate)
  }, [])

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-14 md:py-20 bg-black text-[#E8E0CC] border-t border-[#26241E] select-none">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase mb-2 sm:mb-3">
            ASSISTANCE & FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-2 sm:mb-3">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-[#E8E0CC]/70 text-xs sm:text-base max-w-lg mx-auto font-light">
            Everything you need to know about ordering, delivery, sizing, and luxury authenticity
          </p>
        </motion.div>

        {/* Dynamic FAQ List (Flat list without categories) */}
        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="border border-[#26241E] rounded-2xl bg-[#0A0A0A] overflow-hidden hover:border-[#C9A84C]/40 transition-colors shadow-lg"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm md:text-base font-bold text-[#FFF5D6] font-serif pr-2">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${isOpen
                        ? 'bg-[#C9A84C] text-black border-[#C9A84C] rotate-180'
                        : 'bg-black text-[#C9A84C] border-[#C9A84C]/30'
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#E8E0CC]/80 leading-relaxed border-t border-[#1C1A16] font-light">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
