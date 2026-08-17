import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { useMode } from '../../contexts/ModeContext';
import { ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw, Crown, Tag } from 'lucide-react';

const casualCategories = [
  { name: 'Electronics', icon: '💻', count: '120+ Products', color: 'from-blue-600 to-indigo-600' },
  { name: 'Fashion', icon: '👗', count: '250+ Products', color: 'from-rose-500 to-pink-600' },
  { name: 'Home & Kitchen', icon: '🏠', count: '90+ Products', color: 'from-amber-500 to-orange-600' },
  { name: 'Beauty', icon: '💄', count: '75+ Products', color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Sports', icon: '⚽', count: '60+ Products', color: 'from-emerald-500 to-teal-600' },
  { name: 'Books', icon: '📚', count: '40+ Products', color: 'from-sky-500 to-cyan-600' },
];

const casualDeals = [
  {
    id: 'c1',
    title: 'Wireless Earbuds',
    category: 'Electronics',
    price: 39,
    originalPrice: 79,
    discount: 50,
    rating: 4.6,
    reviews: 580,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c2',
    title: 'Casual Denim Jacket',
    category: 'Fashion',
    price: 49,
    originalPrice: 89,
    discount: 45,
    rating: 4.7,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c3',
    title: 'Smart Fitness Tracker',
    category: 'Electronics',
    price: 29,
    originalPrice: 59,
    discount: 50,
    rating: 4.5,
    reviews: 840,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c4',
    title: 'Stainless Steel Coffee Maker',
    category: 'Home & Kitchen',
    price: 65,
    originalPrice: 110,
    discount: 40,
    rating: 4.8,
    reviews: 410,
    image: 'https://images.unsplash.com/photo-1517668808822-9e428824603b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c5',
    title: 'Minimalist Unisex Backpack',
    category: 'Fashion',
    price: 35,
    originalPrice: 60,
    discount: 42,
    rating: 4.6,
    reviews: 290,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c6',
    title: 'Portable Bluetooth Speaker',
    category: 'Electronics',
    price: 45,
    originalPrice: 80,
    discount: 44,
    rating: 4.7,
    reviews: 620,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  },
];

export const CasualHome = () => {
  const navigate = useNavigate();
  const { setMode, openModeModal } = useMode();

  return (
    <div className="min-h-screen bg-black text-[#E8E0CC] w-full overflow-x-hidden">
      {/* ── Top Mode Switcher Bar ── */}
      <div className="bg-[#0D1117] border-b border-blue-500/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <Zap size={14} />
            <span>AkarioMart Casual Marketplace Active</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/60 text-[11px]">Looking for curated luxury collections?</span>
            <button
              onClick={() => setMode('luxury')}
              className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#9B782B] text-black font-extrabold text-[10px] uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              Switch to AkarioMart Luxury ❖
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative py-14 md:py-20 px-4 md:px-8 bg-gradient-to-b from-[#0F172A] to-black border-b border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Tag size={14} />
              Best Value Marketplace
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans text-white leading-tight">
              Everyday Products, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Unbeatable Prices.
              </span>
            </h1>

            <p className="text-base text-[#E8E0CC]/80 font-light max-w-lg">
              Shop thousands of affordable items across Electronics, Fashion, Home, and Beauty with fast delivery and easy returns.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-105 transition-all"
              >
                Shop All Deals
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#111]">
              <img
                src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=800&q=80"
                alt="AkarioMart Casual Deals"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Mega Savings Event</span>
                <h3 className="text-lg font-bold text-white">Up to 50% Off Everything</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Ribbon ── */}
      <section className="py-12 px-4 md:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold font-sans text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {casualCategories.map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="bg-[#0F0F0F] border border-white/10 hover:border-blue-500 rounded-2xl p-4 flex flex-col items-center text-center group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</span>
                <span className="text-[10px] text-white/50">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-sans text-white">Top Deals & Best Sellers</h2>
              <p className="text-xs text-white/60">Popular items at discounted prices</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-blue-400 hover:underline uppercase">View All</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {casualDeals.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CasualHome;
