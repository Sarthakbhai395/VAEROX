const express = require('express');
const { verifyPayment, createOrder } = require('../controllers/paymentController');

const router = express.Router();

router.route('/verify').post(verifyPayment);
router.route('/order').post(createOrder);

module.exports = router;