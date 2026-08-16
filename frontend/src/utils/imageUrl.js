export const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

export const getProductImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'no-photo.jpg' || imagePath === '/uploads/no-photo.jpg') {
    return null;
  }

  // Check if image is an external URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
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
