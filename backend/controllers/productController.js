const Product = require('../models/Product');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { uploadToImageKit } = require('../utils/imagekit');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('seller', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Sellers and Admins)
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller to req.body
    req.body.seller = req.user.id;

    // Sync image and images fields
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.image = req.body.images.length > 0 ? req.body.images[0] : '/uploads/no-photo.jpg';
    } else if (req.body.image) {
      req.body.images = [req.body.image];
    }

    const product = await Product.create(req.body);
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'CREATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });
    
    console.log('Product created:', product); // Debug log

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller of product or Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    // Sync image and images fields
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.image = req.body.images.length > 0 ? req.body.images[0] : '/uploads/no-photo.jpg';
    } else if (req.body.image) {
      req.body.images = [req.body.image];
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'UPDATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller of product or Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Use deleteOne() instead of remove() for newer Mongoose versions
    await product.deleteOne();
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'DELETE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload photo for product
// @route   PUT /api/products/:id/photo
// @access  Private (Seller of product or Admin)
exports.productPhotoUpload = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    // Parse the image layout sent from the frontend
    let images = [];
    if (req.body.images) {
      try {
        images = JSON.parse(req.body.images);
      } catch (e) {
        images = [];
      }
    }

    // Collect uploaded files from multer (memory storage — buffers)
    const uploadedFiles = req.files || (req.file ? [req.file] : []);

    if (uploadedFiles.length > 0) {
      // Upload each file buffer to ImageKit in parallel
      const uploadPromises = uploadedFiles.map((file) =>
        uploadToImageKit(
          file.buffer,
          file.originalname,
          `/products/${req.params.id}`
        )
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Replace 'file' placeholders in the layout with ImageKit CDN URLs
      let fileIndex = 0;
      images = images.map((img) => {
        if (img === 'file' && fileIndex < uploadResults.length) {
          return uploadResults[fileIndex++].url;
        }
        return img;
      });

      // Append any remaining uploaded files that weren't mapped to placeholders
      while (fileIndex < uploadResults.length) {
        images.push(uploadResults[fileIndex++].url);
      }
    }

    // Clean up empty slots or leftover placeholders
    images = images.filter((img) => img && img !== 'file');

    // Validate that we have at least one image
    if (images.length === 0 && uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one image file'
      });
    }

    // Primary image is always the first in the array
    const image = images.length > 0 ? images[0] : '/uploads/no-photo.jpg';

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { images, image },
      { new: true }
    );

    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'UPDATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    next(err);
  }
};