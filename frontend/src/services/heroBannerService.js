// Service for managing Admin-controlled sliding hero banners

const INITIAL_BANNERS = [
  {
    id: 'hero-1',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1920&q=80',
    tag: 'VÆROX ATELIER 2026',
    title: 'FASHION THAT MOVES WITH YOU',
    subtitle: 'Redefining Classical Elegance & Modern High-Couture Luxury',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/products',
    active: true,
  },
  {
    id: 'hero-2',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=80',
    tag: 'VÆROX BESPOKE TAILORING',
    title: 'THE ART OF POWER SUITING',
    subtitle: 'Handcrafted Precision Formal Wear For Discerning Gentlemen & Women',
    ctaText: 'SHOP FORMAL WEAR',
    ctaLink: '/products?category=men',
    active: true,
  },
  {
    id: 'hero-3',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80',
    tag: 'EXCLUSIVE ATELIER RELEASE',
    title: 'COUTURE WITHOUT COMPROMISE',
    subtitle: 'Step Into Utter Distinction With Signature VÆROX Eveningwear',
    ctaText: 'DISCOVER MORE',
    ctaLink: '/products?category=women',
    active: true,
  },
];

const STORAGE_KEY = 'vaerox_admin_hero_banners';

export const heroBannerService = {
  getBanners: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading hero banners:', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANNERS));
    return INITIAL_BANNERS;
  },

  getActiveBanners: () => {
    const banners = heroBannerService.getBanners();
    const active = banners.filter((b) => b.active !== false);
    return active.length > 0 ? active : INITIAL_BANNERS;
  },

  addBanner: (banner) => {
    const banners = heroBannerService.getBanners();
    const newBanner = {
      id: 'hero-' + Date.now(),
      image: banner.image || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tag: banner.tag && banner.tag.trim() ? banner.tag.trim() : 'VÆROX LUXURY',
      ctaText: banner.ctaText && banner.ctaText.trim() ? banner.ctaText.trim() : 'EXPLORE COLLECTION',
      ctaLink: banner.ctaLink && banner.ctaLink.trim() ? banner.ctaLink.trim() : '/products',
      active: true,
    };
    const updated = [newBanner, ...banners];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  updateBanner: (id, updatedData) => {
    const banners = heroBannerService.getBanners();
    const updated = banners.map((b) => (b.id === id ? { ...b, ...updatedData } : b));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  toggleBannerActive: (id) => {
    const banners = heroBannerService.getBanners();
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteBanner: (id) => {
    const banners = heroBannerService.getBanners();
    const updated = banners.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};

