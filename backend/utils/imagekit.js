const ImageKit = require('@imagekit/nodejs').default;
const { toFile } = require('@imagekit/nodejs');

// Singleton ImageKit instance — initialized lazily for serverless cold-start efficiency
let imagekitInstance = null;

/**
 * Returns the shared ImageKit client instance.
 * Throws a descriptive error if environment variables are missing.
 */
const getImageKit = () => {
  if (imagekitInstance) return imagekitInstance;

  const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error(
      'ImageKit configuration is incomplete. Ensure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT are set.'
    );
  }

  imagekitInstance = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });

  return imagekitInstance;
};

/**
 * Uploads a file buffer to ImageKit.
 *
 * @param {Buffer}  fileBuffer   - The raw file buffer (e.g. from multer memoryStorage)
 * @param {string}  fileName     - Original file name (used for SEO-friendly URLs)
 * @param {string}  [folder]     - Optional folder path inside ImageKit (default: '/products')
 * @returns {Promise<{ url: string, fileId: string, thumbnailUrl: string }>}
 */
const uploadToImageKit = async (fileBuffer, fileName, folder = '/products') => {
  const imagekit = getImageKit();

  // Sanitize the filename — remove spaces, special chars
  const sanitizedName = `${Date.now()}_${fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')}`;

  const response = await imagekit.files.upload({
    file: await toFile(fileBuffer, sanitizedName),
    fileName: sanitizedName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: response.url,
    fileId: response.fileId,
    thumbnailUrl: response.thumbnailUrl,
  };
};

/**
 * Deletes a file from ImageKit by its fileId.
 *
 * @param {string} fileId - The ImageKit fileId to delete
 * @returns {Promise<void>}
 */
const deleteFromImageKit = async (fileId) => {
  const imagekit = getImageKit();
  await imagekit.files.deleteFile(fileId);
};

module.exports = { uploadToImageKit, deleteFromImageKit, getImageKit };
