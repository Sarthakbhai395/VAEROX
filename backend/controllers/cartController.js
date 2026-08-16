const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/users/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product', 'name price discount image');

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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot add products to cart'
      });
    }

    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Find user and update cart
    const user = await User.findById(req.user.id);
    
    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }
    
    await user.save();
    
    // Populate product details
    await user.populate('cart.product', 'name price discount image');
    
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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot modify cart'
      });
    }

    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Find user and update cart
    const user = await User.findById(req.user.id);
    
    // Check if product in cart
    const existingItemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    
    if (existingItemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        user.cart.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        user.cart[existingItemIndex].quantity = quantity;
      }
    } else {
      return res.status(404).json({
        success: false,
        error: 'Product not in cart'
      });
    }
    
    await user.save();
    
    // Populate product details
    await user.populate('cart.product', 'name price discount image');
    
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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot modify cart'
      });
    }

    const productId = req.params.productId;

    // Find user and update cart
    const user = await User.findById(req.user.id);
    
    // Check if product in cart
    const existingItemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    
    if (existingItemIndex > -1) {
      user.cart.splice(existingItemIndex, 1);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Product not in cart'
      });
    }
    
    await user.save();
    
    // Populate product details
    await user.populate('cart.product', 'name price discount image');
    
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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot modify cart'
      });
    }

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
    const user = await User.findById(req.user.id).populate('wishlist', 'name price discount image');

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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot add products to wishlist'
      });
    }

    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Find user and update wishlist
    const user = await User.findById(req.user.id);
    
    // Check if product already in wishlist
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    
    // Populate product details
    await user.populate('wishlist', 'name price discount image');
    
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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot modify wishlist'
      });
    }

    const productId = req.params.productId;

    // Find user and update wishlist
    const user = await User.findById(req.user.id);
    
    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
    await user.save();
    
    // Populate product details
    await user.populate('wishlist', 'name price discount image');
    
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
    // Check if user is admin or seller
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Admins and sellers cannot modify wishlist'
      });
    }

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