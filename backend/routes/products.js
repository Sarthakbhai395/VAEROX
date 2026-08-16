const express = require('express');
const multer = require('multer');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload
} = require('../controllers/productController');

const Product = require('../models/Product');

// Include other resource routers
// const reviewRouter = require('./reviews');

const router = express.Router();

// Protect and authorize middleware
const { protect, authorize } = require('../middleware/auth');

// Use memory storage so file buffers are available for ImageKit cloud upload
const storage = multer.memoryStorage();

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer setup for file uploads (memory-based for cloud upload)
const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD) || 1000000 // 1MB default
  },
  fileFilter
});

// Re-route into other resource routers
// router.use('/:productId/reviews', reviewRouter);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router.route('/:id/photo')
  .put(protect, authorize('seller', 'admin'), upload.array('files', 3), productPhotoUpload);

module.exports = router;