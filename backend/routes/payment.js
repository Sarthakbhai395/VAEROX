const express = require('express');
const {
  verifyPayment,
  createOrder,
  getAdminOrders,
  getMyOrders,
  updateAdminOrderStatus
} = require('../controllers/paymentController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.route('/verify').post(optionalAuth, verifyPayment);
router.route('/order').post(createOrder);
router.route('/orders/my').get(protect, getMyOrders);
router.route('/orders/admin').get(protect, authorize('admin'), getAdminOrders);
router.route('/orders/admin/:orderId/status').patch(protect, authorize('admin'), updateAdminOrderStatus);

module.exports = router;
