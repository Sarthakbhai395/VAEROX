import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'Ordering & Authenticity',
    items: [
      {
        q: 'Are all VÆROX products 100% authentic and certified?',
        a: 'Yes. Every VÆROX item is meticulously handcrafted or sourced directly from verified luxury ateliers. Each purchase includes a digital Certificate of Authenticity and unique serial verification.',
      },
      {
        q: 'Can I request bespoke sizing or custom tailoring for formal wear?',
        a: 'Absolutely. We offer complimentary luxury concierge tailoring services. After placing your order, select "Custom Fit" in your user dashboard or contact our 24/7 VIP Concierge.',
      },
    ],
  },
  {
    category: 'Delivery & Shipping',
    items: [
      {
        q: 'What are the delivery timelines and shipping charges?',
        a: 'We offer complimentary express delivery across India on all orders above ₹1999. Standard orders are dispatched within 24 hours and delivered within 2-4 business days via insured express transit.',
      },
      {
        q: 'Do you offer real-time order tracking and discrete packaging?',
        a: 'Yes. All orders are packed in signature VÆROX hard-box luxury packaging with tamper-evident security seals. Real-time SMS and email tracking links are provided upon dispatch.',
      },
    ],
  },
  {
    category: 'Returns & Exchange',
    items: [
      {
        q: 'What is the VÆROX return and exchange policy?',
        a: 'We provide a 15-day hassle-free return and instant exchange policy. Items must be unworn, undamaged, with original luxury tags and security seals intact.',
      },
      {
        q: 'How long does a refund take to reflect in my bank account?',
        a: 'Once returned items pass quality verification at our atelier, refunds are processed instantly within 24-48 business hours back to your original payment mode.',
      },
    ],
  },
]

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState('0-0')

  const toggleFAQ = (id) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <section className="py-14 md:py-20 bg-black text-[#E8E0CC] border-t border-[#26241E]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 uppercase mb-3">
            ASSISTANCE & FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#FFF5D6] font-serif tracking-tight mb-3">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-[#E8E0CC]/70 text-sm md:text-base max-w-lg mx-auto font-light">
            Everything you need to know about ordering, delivery, sizing, and luxury authenticity
          </p>
        </motion.div>

        {/* FAQ Accordion Groups */}
        <div className="space-y-8">
          {FAQ_DATA.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h3 className="text-xs font-extrabold tracking-[0.25em] text-[#C9A84C] uppercase border-b border-[#26241E] pb-2 font-serif">
                ✦ {group.category}
              </h3>

              <div className="space-y-3">
                {group.items.map((item, itemIdx) => {
                  const itemId = `${groupIdx}-${itemIdx}`
                  const isOpen = openIndex === itemId

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="border border-[#26241E] rounded-2xl bg-[#0A0A0A] overflow-hidden hover:border-[#C9A84C]/40 transition-colors"
                    >
                      <button
                        onClick={() => toggleFAQ(itemId)}
                        className="w-full p-5 text-left flex justify-between items-center gap-4 focus:outline-none"
                      >
                        <span className="text-sm md:text-base font-bold text-[#FFF5D6] font-serif pr-2">
                          {item.q}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                            isOpen
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
          ))}
        </div>
      </div>
    </section>
  )
}
