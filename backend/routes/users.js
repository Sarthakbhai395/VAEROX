const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  blockUser,
  unblockUser,
  getSellers
} = require('../controllers/userController');

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/cartController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Admin sub-router: All routes mounted at /admin are protected and require 'admin' role
const adminRouter = express.Router();
adminRouter.use(protect, authorize('admin'));

adminRouter.route('/')
  .get(getUsers)
  .post(createUser);

adminRouter.route('/sellers')
  .get(getSellers);

adminRouter.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

adminRouter.route('/:id/block')
  .put(blockUser);

adminRouter.route('/:id/unblock')
  .put(unblockUser);

router.use('/admin', adminRouter);

// User profile route (protected but no admin required)
router.route('/profile')
  .put(protect, updateProfile);

// Cart routes (protected)
router.route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart)
  .put(protect, updateCart)
  .delete(protect, clearCart);

router.route('/cart/:productId')
  .delete(protect, removeFromCart);

// Wishlist routes (protected)
router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/wishlist/:productId')
  .delete(protect, removeFromWishlist);

module.exports = router;