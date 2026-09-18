const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to safely find a valid Product in MongoDB
const findValidProduct = async (productId) => {
  if (!productId) return null;

  // 1. Check directly by MongoDB _id if valid ObjectId
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const prod = await Product.findById(productId);
    if (prod) return prod;
  }

  // 2. Check by custom 'id' field if stored as string ID
  const prodCustom = await Product.findOne({ id: productId });
  if (prodCustom) return prodCustom;

  return null;
};

// @desc    Get user's cart
// @route   GET /api/users/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product', 'name price discount image category');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.cart) {
      user.cart = [];
    }

    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity'
      });
    }

    const product = await findValidProduct(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Product not found in catalog. Invalid product ID.'
      });
    }

    const validProductId = product._id;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }
    
    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product && item.product.toString() === validProductId.toString()
    );
    
    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += numQuantity;
    } else {
      user.cart.push({ product: validProductId, quantity: numQuantity });
    }
    
    await user.save();
    await user.populate('cart.product', 'name price discount image category');
    
    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/users/cart
// @access  Private
exports.updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }
    
    const existingItemIndex = user.cart.findIndex(
      item => item.product && (
        item.product.toString() === productId || 
        (mongoose.Types.ObjectId.isValid(productId) && item.product.toString() === productId.toString())
      )
    );
    
    if (existingItemIndex > -1) {
      if (numQuantity <= 0) {
        user.cart.splice(existingItemIndex, 1);
      } else {
        user.cart[existingItemIndex].quantity = numQuantity;
      }
    } else if (numQuantity > 0) {
      const product = await findValidProduct(productId);
      if (product) {
        user.cart.push({ product: product._id, quantity: numQuantity });
      } else {
        return res.status(400).json({ success: false, error: 'Product not found' });
      }
    }
    
    await user.save();
    await user.populate('cart.product', 'name price discount image category');
    
    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    user.cart = user.cart.filter(
      item => item.product && item.product.toString() !== productId
    );
    
    await user.save();
    await user.populate('cart.product', 'name price discount image category');
    
    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user.cart = [];
    await user.save();
    
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price discount image category');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to wishlist
// @route   POST /api/users/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await findValidProduct(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Product not found. Cannot add invalid product to wishlist.'
      });
    }

    const validProductId = product._id;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    // Check if product already in wishlist
    const exists = user.wishlist.some(
      item => item && item.toString() === validProductId.toString()
    );

    if (!exists) {
      user.wishlist.push(validProductId);
      await user.save();
    }
    
    await user.populate('wishlist', 'name price discount image category');
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    user.wishlist = user.wishlist.filter(
      item => item && item.toString() !== productId
    );
    
    await user.save();
    await user.populate('wishlist', 'name price discount image category');
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/users/wishlist
// @access  Private
exports.clearWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user.wishlist = [];
    await user.save();
    
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (err) {
    next(err);
  }
};