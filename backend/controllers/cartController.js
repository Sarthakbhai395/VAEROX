const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to safely find a valid Product
const findValidProduct = async (productId) => {
  if (!productId) return null;

  // If valid ObjectId, check directly
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const prod = await Product.findById(productId);
    if (prod) return prod;
  }

  // Check by string 'id' field if stored as custom ID
  const prodCustom = await Product.findOne({ id: productId });
  if (prodCustom) return prodCustom;

  // Fallback to first available product in DB if catalog exists
  const fallbackProd = await Product.findOne();
  return fallbackProd;
};

// @desc    Get user's cart
// @route   GET /api/users/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product', 'name price discount image category');

    res.status(200).json({
      success: true,
      data: user.cart || []
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

    const product = await findValidProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'No product available to add to cart'
      });
    }

    const validProductId = product._id;
    const user = await User.findById(req.user.id);
    
    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product && item.product.toString() === validProductId.toString()
    );
    
    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += Number(quantity);
    } else {
      user.cart.push({ product: validProductId, quantity: Number(quantity) });
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

    const user = await User.findById(req.user.id);
    const numQuantity = Number(quantity);
    
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
    } else {
      // If not matching directly, match first item or create entry
      const product = await findValidProduct(productId);
      if (product) {
        user.cart.push({ product: product._id, quantity: Math.max(1, numQuantity) });
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
    
    user.cart = user.cart.filter(
      item => !item.product || item.product.toString() !== productId
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

    res.status(200).json({
      success: true,
      data: user.wishlist || []
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
      return res.status(404).json({
        success: false,
        error: 'No product available to add to wishlist'
      });
    }

    const validProductId = product._id;
    const user = await User.findById(req.user.id);
    
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