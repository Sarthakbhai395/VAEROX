import React from 'react';
import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { BannerCarousel } from "./components/BannerCarousel";
import { ProductCard } from "./components/ProductCard";
import { DealsSection } from "./components/DealsSection";

const deals = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1631011714977-a6068c048b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2MDY4MTUyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Smartphones",
    discount: "Up to 40% Off",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Laptops",
    discount: "Min 30% Off",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwNjk5Mjc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Headphones",
    discount: "From ₹499",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYwNzk4NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Fashion",
    discount: "50-80% Off",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlc3xlbnwxfHx8fDE3NjA3MzIxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Home Appliances",
    discount: "Up to 60% Off",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1717295248494-937c3a5655b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGdhZGdldHN8ZW58MXx8fHwxNzYwNzMxMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Electronics",
    discount: "Great Savings!",
  },
];

const products = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1631011714977-a6068c048b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2MDY4MTUyOXww&ixlib=rb-4.1.0&q=80&w=400",
    title: "Samsung Galaxy S23 Ultra 5G (Green, 256 GB) (12 GB RAM)",
    price: 89999,
    originalPrice: 124999,
    discount: 28,
    rating: 4.6,
    reviews: 1240,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    title: "ASUS VivoBook 15 Intel Core i5 12th Gen - (8 GB/512 GB SSD/Windows 11)",
    price: 45990,
    originalPrice: 62990,
    discount: 27,
    rating: 4.3,
    reviews: 3892,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1558756520-22cfe5d382ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzYwNjk5Mjc4fDA&ixlib=rb-4.1.0&q=80&w=400",
    title: "Sony WH-1000XM5 Wireless Over-Ear Active Noise Cancelling Headphones",
    price: 26990,
    originalPrice: 34990,
    discount: 23,
    rating: 4.8,
    reviews: 892,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1717295248494-937c3a5655b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMGdhZGdldHN8ZW58MXx8fHwxNzYwNzMxMzc0fDA&ixlib=rb-4.1.0&q=80&w=400",
    title: "Apple Watch Series 9 GPS + Cellular 45 mm Midnight Aluminium Case",
    price: 44900,
    originalPrice: 52900,
    discount: 15,
    rating: 4.7,
    reviews: 567,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1631011714977-a6068c048b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlfGVufDF8fHx8MTc2MDY4MTUyOXww&ixlib=rb-4.1.0&q=80&w=400",
    title: "iPhone 15 Pro Max (Blue Titanium, 256 GB)",
    price: 149900,
    originalPrice: 159900,
    discount: 6,
    rating: 4.9,
    reviews: 2340,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA3Nzg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    title: "HP Pavilion Gaming Intel Core i5 12th Gen (16GB/512GB SSD/RTX 3050)",
    price: 67990,
    originalPrice: 89990,
    discount: 24,
    rating: 4.5,
    reviews: 1563,
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlc3xlbnwxfHx8fDE3NjA3MzIxMDB8MA&ixlib=rb-4.1.0&q=80&w=400",
    title: "Samsung 198 L 4 Star Inverter Direct-Cool Single Door Refrigerator",
    price: 13490,
    originalPrice: 17900,
    discount: 25,
    rating: 4.2,
    reviews: 4521,
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYwNzk4NDE2fDA&ixlib=rb-4.1.0&q=80&w=400",
    title: "Levi's Men's Slim Fit Mid Rise Jeans",
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    rating: 4.1,
    reviews: 7834,
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />
      
      <main>
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Content Container */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Deals Section */}
          <DealsSection title="Top Deals on Electronics" deals={deals} />

          {/* Products Section */}
          <div className="bg-white rounded-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Best of Electronics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>

          {/* Another Deals Section */}
          <DealsSection title="Fashion & Lifestyle" deals={deals.slice().reverse()} />

          {/* Footer Banner */}
          <div className="bg-[#172337] text-white rounded-sm p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-2">Shop for Everything You Need</h2>
            <p className="text-gray-300 mb-6">
              Electronics, Fashion, Home & Kitchen, and more - All at amazing prices!
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              <div>
                <p className="text-gray-400">100% Secure Payments</p>
              </div>
              <div>
                <p className="text-gray-400">Easy Returns & Refunds</p>
              </div>
              <div>
                <p className="text-gray-400">Free Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
