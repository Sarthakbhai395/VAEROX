export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://backend-1-tf17.onrender.com';
  }

  return 'http://localhost:5000';
};

export const getProductImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'no-photo.jpg' || imagePath === '/uploads/no-photo.jpg') {
    return null;
  }

  // Check if image is an external URL, base64 data URL, or blob URL
  if (
    imagePath.startsWith('data:image/') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  const baseUrl = getBackendUrl();

  // For local images that already have the /uploads/ prefix
  if (imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${imagePath}`;
  }

  // For local images without the /uploads/ prefix, add it
  return `${baseUrl}/uploads/${imagePath}`;
};
