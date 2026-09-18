import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { ShieldCheck, Heart, Mail } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'All Products', to: '/products' },
    { label: "Men's Formal Collection", to: '/products?category=men' },
    { label: "Women's Evening Atelier", to: '/products?category=women' },
    { label: 'Bespoke Custom Tailoring', to: '/contact' },
  ],
  support: [
    { label: 'Contact Concierge', to: '/contact' },
    { label: 'About VÆROX', to: '/about' },
    { label: 'Client FAQs', to: '/' },
    { label: 'Express Shipping Info', to: '/about' },
    { label: 'Returns & Exchange', to: '/about' },
  ],
  account: [
    { label: 'My Account', to: '/user/dashboard' },
    { label: 'Orders & Bespoke Fits', to: '/user/dashboard' },
    { label: 'Saved Wishlist', to: '/user/wishlist' },
    { label: 'Shopping Bag', to: '/user/cart' },
  ],
}

const socialLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'X / Twitter', href: '#' },
  { label: 'LinkedIn', href: '#' },
]

/* Routes where footer should NOT be displayed */
const hiddenRoutes = ['/admin/dashboard', '/login', '/register', '/forgot-password']

const Footer = () => {
  const location = useLocation()

  /* Hide footer on dashboard and auth routes */
  const isHidden = hiddenRoutes.some((route) => location.pathname.startsWith(route))
  if (isHidden) return null

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-[#26241E] text-[#E8E0CC] select-none">
      {/* ── Top Bespoke Highlight Ribbon ── */}
      <div className="bg-[#050505] border-b border-[#26241E] py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs tracking-[0.2em] text-[#C9A84C] uppercase font-serif">
          <div className="flex items-center gap-2">
            <span>VÆROX HANDMADE ATELIER • BESPOKE CUSTOM TAILORING AVAILABLE</span>
          </div>
          <Link
            to="/contact"
            className="px-4 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#FFF5D6] hover:bg-[#C9A84C] hover:text-black transition-all text-[10px] font-bold"
          >
            REQUEST CUSTOM OUTFIT →
          </Link>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-4 lg:col-span-2 flex flex-col items-start">
            <Link to="/" className="inline-block mb-4">
              <Logo layout="horizontal" size="md" />
            </Link>
            <p className="text-xs text-[#E8E0CC]/70 leading-relaxed mb-6 max-w-sm font-light">
              VÆROX is a premiere haute couture fashion atelier crafting custom, handmade luxury formal wear & bespoke classic garments. Engineered for those who demand distinction.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-[#26241E] text-[11px] font-semibold text-[#E8E0CC]/80 hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all duration-300 shadow-md uppercase tracking-wider"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-[#C9A84C] font-bold text-xs uppercase tracking-[0.25em] mb-4 font-serif">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-[#E8E0CC]/70 hover:text-[#C9A84C] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-[#C9A84C] font-bold text-xs uppercase tracking-[0.25em] mb-4 font-serif">
              Client Service
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-[#E8E0CC]/70 hover:text-[#C9A84C] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-[#C9A84C] font-bold text-xs uppercase tracking-[0.25em] mb-4 font-serif">
              Membership
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-[#E8E0CC]/70 hover:text-[#C9A84C] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom Bar ── */}
      <div className="border-t border-[#26241E] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[#E8E0CC]/50 text-center md:text-left tracking-widest uppercase font-light">
              © {currentYear} VÆROX • HIGH LUXURY HANDMADE CLOTHING. ALL RIGHTS RESERVED.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              {['RAZORPAY', 'UPI', 'VISA', 'MASTERCARD', 'AMEX'].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded-md bg-[#121212] border border-[#26241E] text-[9px] font-extrabold text-[#C9A84C] tracking-widest"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
