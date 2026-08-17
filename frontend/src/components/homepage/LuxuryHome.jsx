import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PersonaLookModal } from './PersonaLookModal';
import { ProductCard } from './ProductCard';
import { useMode } from '../../contexts/ModeContext';
import { LogoEmblem } from '../Logo';
import { Sparkles, Crown, ArrowRight, ShieldCheck, ShoppingBag, Eye, Layers } from 'lucide-react';

/* ── 7 Persona Lifestyle Collections ── */
const personaCollections = [
  {
    id: 'the-ceo',
    title: 'The CEO',
    subtitle: 'The Executive Standard',
    tag: 'Boardroom Leadership',
    description: 'Tailored for high-stakes negotiations, global boardrooms, and executive command.',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'ceo-suit',
        name: 'VÆROX Tailored Double-Breasted Suit Jacket',
        price: 850,
        tag: 'VÆROX Couture',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ceo-watch',
        name: 'VÆROX Executive Chronograph Rose Gold Timepiece',
        price: 1250,
        tag: 'Swiss Automatic',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ceo-shoes',
        name: 'Italian Handcrafted Calfskin Oxford Shoes',
        price: 420,
        tag: 'Italian Leather',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ceo-briefcase',
        name: 'Heritage Full-Grain Leather Briefcase',
        price: 680,
        tag: 'Accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ceo-perfume',
        name: 'Signature Velvet Oud Eau De Parfum (100ml)',
        price: 210,
        tag: 'Niche Fragrance',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-entrepreneur',
    title: 'The Entrepreneur',
    subtitle: 'Disruptive & Refined',
    tag: 'Innovation & Utility',
    description: 'Effortless modern luxury for tech founders, visionaries, and market creators.',
    heroImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'ent-blazer',
        name: 'VÆROX Minimalist Unstructured Wool Blazer',
        price: 490,
        tag: 'VÆROX Apparel',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ent-smartwatch',
        name: 'Titanium Smartwatch with Milanese Mesh Band',
        price: 750,
        tag: 'Tech Luxury',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ent-[#headphones]',
        name: 'Active Noise-Cancelling Wireless Headphones',
        price: 380,
        tag: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ent-eyewear',
        name: 'Japanese Acetate Architectural Eyewear',
        price: 320,
        tag: 'Eyewear',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'ent-folio',
        name: 'Handcrafted Italian Leather Tech Folio',
        price: 240,
        tag: 'Accessories',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-gentleman',
    title: 'The Gentleman',
    subtitle: 'Timeless Sophistication',
    tag: 'Sartorial Perfection',
    description: 'Understated elegance, sartorial heritage, and meticulous craftsmanship.',
    heroImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'gent-coat',
        name: 'VÆROX Double-Breasted Wool Overcoat',
        price: 950,
        tag: 'VÆROX Couture',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'gent-watch',
        name: 'Vintage Mechanical Automatic Timepiece',
        price: 1100,
        tag: 'Horology',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'gent-shoes',
        name: 'Hand-Stitched Genuine Leather Monkstrap Shoes',
        price: 390,
        tag: 'Footwear',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'gent-silk',
        name: 'Mulberry Silk Pocket Square & Bowtie Set',
        price: 160,
        tag: 'Silk Accessories',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-intellectual',
    title: 'The Intellectual',
    subtitle: 'Calculated Elegance',
    tag: 'Academic Prestige',
    description: 'Smart, refined, and scholarly. Designed for thinkers, educators, and connoisseurs.',
    heroImage: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'int-blazer',
        name: 'VÆROX Vintage Tweed Wool Blazer',
        price: 520,
        tag: 'VÆROX Apparel',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'int-notebook',
        name: 'Handcrafted Italian Leather Journal & Fountain Pen',
        price: 140,
        tag: 'Stationery',
        image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'int-glasses',
        name: 'Round Wire-Rimmed Titanium Eyewear',
        price: 290,
        tag: 'Eyewear',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'int-watch',
        name: 'Classic Roman Dial Automatic Timepiece',
        price: 640,
        tag: 'Watches',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-wedding-edit',
    title: 'The Wedding Edit',
    subtitle: 'Black-Tie Distinction',
    tag: 'Groom & Gala Privilege',
    description: 'Curated for groom privilege, luxury galas, and extraordinary celebrations.',
    heroImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'wed-tux',
        name: 'VÆROX Silk-Satin Lapel Tuxedo Jacket',
        price: 1150,
        tag: 'VÆROX Formal',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'wed-cufflinks',
        name: 'Genuine Onyx & 18K Gold Cufflink Set',
        price: 280,
        tag: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'wed-shoes',
        name: 'Black Patent Leather Ceremony Shoes',
        price: 480,
        tag: 'Footwear',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'wed-perfume',
        name: 'Niche Celebration Extrait De Parfum',
        price: 260,
        tag: 'Fragrance',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-traveller',
    title: 'The Traveller',
    subtitle: 'Global Horizon',
    tag: 'First-Class Jetset',
    description: 'First-class comfort, luggage distinction, and utility for global jetsetters.',
    heroImage: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'trv-hoodie',
        name: 'VÆROX Pure Cashmere Travel Hoodie',
        price: 420,
        tag: 'VÆROX Leisure',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'trv-duffel',
        name: 'Full-Grain Leather Weekender Duffel Bag',
        price: 690,
        tag: 'Luggage',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'trv-gmt',
        name: 'GMT World-Time Dual-Zone Watch',
        price: 890,
        tag: 'Horology',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-old-money',
    title: 'The Old Money Edit',
    subtitle: 'Quiet Luxury',
    tag: 'Heritage Elegance',
    description: 'Heritage aesthetics, unbranded luxury materials, and generationally timeless style.',
    heroImage: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80',
    items: [
      {
        id: 'om-knit',
        name: 'VÆROX Cable-Knit Heavyweight Cashmere Sweater',
        price: 580,
        tag: 'VÆROX Heritage',
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'om-ring',
        name: '18K Gold Plated Heritage Signet Ring',
        price: 320,
        tag: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'om-loafers',
        name: 'Handcrafted Suede Penny Loafers',
        price: 410,
        tag: 'Footwear',
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export const LuxuryHome = () => {
  const navigate = useNavigate();
  const { setMode, openModeModal } = useMode();
  const [selectedPersona, setSelectedPersona] = useState(null);

  return (
    <div className="min-h-screen bg-[#040404] text-[#E8E0CC] w-full overflow-x-hidden selection:bg-[#C9A84C] selection:text-black">
      {/* ── Top Floating Switcher Bar ── */}
      <div className="bg-[#0A0A0A] border-b border-[#C9A84C]/30 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#C9A84C] font-semibold tracking-widest uppercase text-[11px]">
            <Crown size={15} />
            <span>AkarioMart Luxury x VÆROX</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode('casual')}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              ← Back to Casual Store
            </button>
            <button
              type="button"
              onClick={openModeModal}
              className="text-[#C9A84C] hover:underline text-[11px] uppercase font-bold cursor-pointer"
            >
              Change Experience ❖
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
         SECTION 1 — HERO BANNER (VÆROX Persona Curation)
         ══════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-black py-16 md:py-24 border-b border-white/10">
        {/* Ambient Gold Halo Glare */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#C9A84C]/20 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 text-[11px] font-bold tracking-[0.3em] text-[#C9A84C] uppercase">
                  <LogoEmblem className="w-4 h-4" />
                  AKARIOMART x VÆROX
                </div>

                <button
                  type="button"
                  onClick={() => setMode('casual')}
                  className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  ← Back to Casual Store
                </button>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight font-serif">
                <span className="text-white block">Not Just Products.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] block">
                  Curating Your Lifestyle.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#E8E0CC]/80 font-light max-w-xl leading-relaxed">
                Step beyond conventional shopping. Explore complete identity collections designed for leaders, founders, jetsetters, and gentlemen.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#personas"
                  className="px-8 py-4 bg-gradient-to-r from-[#C9A84C] via-[#E4C875] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-[0.25em] rounded-full shadow-[0_0_30px_rgba(201,168,76,0.35)] hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  Explore Lifestyle Sets
                  <ArrowRight size={14} />
                </a>

                <button
                  onClick={() => navigate('/products')}
                  className="px-8 py-4 bg-black/80 border border-white/20 hover:border-[#C9A84C] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all"
                >
                  Browse All VÆROX Pieces
                </button>
              </div>
            </motion.div>

            {/* Right Hero Image Card */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden border border-[#C9A84C]/40 shadow-[0_0_60px_rgba(201,168,76,0.25)] group">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
                  alt="VÆROX Luxury Persona"
                  className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] font-bold tracking-widest text-[#C9A84C] uppercase block mb-1">
                    Featured Collection
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white">The CEO Set</h3>
                  <p className="text-xs text-[#E8E0CC]/80 font-light mt-1">Suit, Chronograph, Oxford Shoes & Briefcase</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
         SECTION 2 — THE PERSONA COLLECTIONS (7 LIFESTYLE SETS)
         ══════════════════════════════════════════════ */}
      <section id="personas" className="py-16 md:py-24 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-[0.3em]">
              Identity & Persona Curation
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">
              Choose Your Lifestyle Setup
            </h2>
            <p className="text-xs md:text-sm text-[#E8E0CC]/70 font-light">
              Click on any persona to inspect the curated look, buy individual pieces, or acquire the complete setup in 1 click.
            </p>
          </div>

          {/* 7 Personas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personaCollections.map((persona, index) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 hover:border-[#C9A84C]/60 hover:shadow-[0_0_35px_rgba(201,168,76,0.2)] transition-all duration-500 flex flex-col justify-between"
              >
                {/* Hero Image Area */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={persona.heroImage}
                    alt={persona.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-[#C9A84C] bg-black/80 backdrop-blur-md border border-[#C9A84C]/40 uppercase">
                    {persona.tag}
                  </span>
                </div>

                {/* Info & Items Count */}
                <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#C9A84C] font-semibold tracking-widest uppercase block">
                      {persona.subtitle}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white mt-0.5 group-hover:text-[#FFF5D6] transition-colors">
                      {persona.title}
                    </h3>
                    <p className="text-xs text-[#E8E0CC]/70 font-light leading-relaxed mt-2">
                      {persona.description}
                    </p>
                  </div>

                  {/* Included Items Preview Pills */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {persona.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80"
                        >
                          {item.name.split(' ').slice(0, 3).join(' ')}
                        </span>
                      ))}
                    </div>

                    {/* View Persona Look Button */}
                    <button
                      onClick={() => setSelectedPersona(persona)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-[#C9A84C] hover:to-[#9B782B] text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/15 hover:border-[#C9A84C] cursor-pointer"
                    >
                      <Eye size={14} />
                      Inspect Look & Buy Setup
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
         SECTION 3 — VÆROX APPAREL HIGHLIGHT
         ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#060606] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest block mb-1">
                VÆROX Couture & Apparel
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white">
                Signature Individual Pieces
              </h2>
            </div>

            <button
              onClick={() => navigate('/products')}
              className="text-xs font-bold text-[#C9A84C] hover:text-white uppercase tracking-widest flex items-center gap-1"
            >
              View Full VÆROX Collection
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {personaCollections.flatMap(p => p.items).slice(0, 6).map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.name}
                category={item.tag}
                price={item.price}
                originalPrice={Math.round(item.price * 1.15)}
                image={item.image}
                rating={4.9}
                reviews={140}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Persona Look Inspector Modal */}
      {selectedPersona && (
        <PersonaLookModal
          persona={selectedPersona}
          onClose={() => setSelectedPersona(null)}
        />
      )}
    </div>
  );
};

export default LuxuryHome;
