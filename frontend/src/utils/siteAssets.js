// Global Site Assets Utility for Dynamic Card & Banner Images
export const DEFAULT_SITE_ASSETS = {
  homeMensCard: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  homeWomensCard: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  productsMensBanner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  productsWomensBanner: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  drawerHeader: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
}

export const getSiteAssets = () => {
  try {
    const saved = localStorage.getItem('vaerox_site_assets')
    if (saved) {
      return { ...DEFAULT_SITE_ASSETS, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Error reading site assets:', e)
  }
  return DEFAULT_SITE_ASSETS
}

export const saveSiteAssets = (newAssets) => {
  try {
    const current = getSiteAssets()
    const merged = { ...current, ...newAssets }
    localStorage.setItem('vaerox_site_assets', JSON.stringify(merged))
    window.dispatchEvent(new Event('vaerox_site_assets_updated'))
    return merged
  } catch (e) {
    console.error('Error saving site assets:', e)
    return getSiteAssets()
  }
}
