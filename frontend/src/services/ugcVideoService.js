// Service for managing Admin-controlled UGC Video Reels

const INITIAL_UGC_VIDEOS = [
  {
    id: 'ugc-1',
    title: 'Autumn Royal Tuxedo Walk',
    author: '@marcus_v',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-suit-jacket-over-his-shoulder-41584-large.mp4',
    productName: 'VÆROX Midnight Tuxedo',
    productLink: '/products?category=men',
    views: '124K',
    likes: '14.2K',
    active: true,
  },
  {
    id: 'ugc-2',
    title: 'Bespoke Satin Gown Styling',
    author: '@elena_couture',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-red-dress-walking-in-a-hallway-41582-large.mp4',
    productName: 'VÆROX Atelier Evening Suit',
    productLink: '/products?category=women',
    views: '98.5K',
    likes: '11.8K',
    active: true,
  },
  {
    id: 'ugc-3',
    title: 'Monochrome Power Suiting Details',
    author: '@julian_style',
    thumbnail: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-suit-41583-large.mp4',
    productName: 'Classic Double-Breasted Blazer',
    productLink: '/products?category=men',
    views: '210K',
    likes: '25.6K',
    active: true,
  },
  {
    id: 'ugc-4',
    title: 'Red Carpet Silk Elegance',
    author: '@sophia_atelier',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-in-a-chic-outfit-41585-large.mp4',
    productName: 'High Luxury Velvet Trench',
    productLink: '/products?category=women',
    views: '84.1K',
    likes: '9.3K',
    active: true,
  },
];

const STORAGE_KEY = 'vaerox_admin_ugc_videos';

export const ugcVideoService = {
  getVideos: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading UGC videos:', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UGC_VIDEOS));
    return INITIAL_UGC_VIDEOS;
  },

  getActiveVideos: () => {
    const videos = ugcVideoService.getVideos();
    const active = videos.filter((v) => v.active !== false);
    return active.length > 0 ? active : INITIAL_UGC_VIDEOS;
  },

  addVideo: (video) => {
    const videos = ugcVideoService.getVideos();
    const newVideo = {
      ...video,
      id: 'ugc-' + Date.now(),
      views: '1K',
      likes: '100+',
      active: true,
    };
    const updated = [newVideo, ...videos];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  toggleVideoActive: (id) => {
    const videos = ugcVideoService.getVideos();
    const updated = videos.map((v) => (v.id === id ? { ...v, active: !v.active } : v));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteVideo: (id) => {
    const videos = ugcVideoService.getVideos();
    const updated = videos.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};
