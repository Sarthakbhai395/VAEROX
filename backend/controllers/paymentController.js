const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const CustomFitRecord = require('../models/CustomFitRecord');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendInvoiceEmail } = require('../utils/sendEmail');
const {
  validateCustomMeasurements,
  CUSTOM_FIT_POLICY_TEXT
} = require('../utils/customFitValidation');

let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};

const VALID_COUPONS = {
  WELCOME10: 0.10,
  VAEROX20: 0.20,
  AKARIO20: 0.20
};

const formatOrderForClient = (order) => ({
  _id: order._id,
  id: order.orderId,
  paymentId: order.paymentId,
  date: order.createdAt,
  user: order.customer,
  items: order.items,
  subtotal: order.subtotal,
  tax: order.tax,
  totalAmount: order.totalAmount,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  cancelReason: order.cancelReason || ''
});

// @desc    Verify Razorpay payment & persist Order + confirmed Custom Fit records
// @route   POST /api/payment/verify
// @access  Public (uses optionalAuth to link authenticated user)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Razorpay verification credentials.'
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        error: 'Payment verification secret is not configured on the server.'
      });
    }

    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const sigBuffer = Buffer.from(String(razorpay_signature), 'utf8');
    const expBuffer = Buffer.from(expectedSignature, 'utf8');
    const isVerified = sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    let savedOrder = null;
    let customFitCount = 0;

    if (orderData && orderData.user && Array.isArray(orderData.items) && orderData.items.length > 0) {
      // Resolve customer user record
      let customerUser = req.user || null;
      if (!customerUser && orderData.user.email) {
        customerUser = await User.findOne({ email: String(orderData.user.email).trim().toLowerCase() });
      }

      const resolvedOrderId = orderData.id || razorpay_order_id;

      // Idempotency check so duplicate verify requests never duplicate orders/custom fits
      savedOrder = await Order.findOne({
        $or: [{ orderId: resolvedOrderId }, { paymentId: razorpay_payment_id }]
      });

      if (!savedOrder) {
        const preparedItems = [];
        const pendingCustomFitPayloads = [];
        let computedRawSubtotal = 0;

        for (let idx = 0; idx < orderData.items.length; idx++) {
          const item = orderData.items[idx];
          const rawProductId = String(item.id || item._id || `item_${idx}`);
          let productDoc = null;

          if (mongoose.Types.ObjectId.isValid(rawProductId)) {
            productDoc = await Product.findById(rawProductId).select('_id name image price discount category tier');
          }

          const isCustomFit = item.size === 'Custom Fit' || item.sizeType === 'custom';

          // Fallback to user's DB cart item customMeasurements if omitted on client payload
          let rawMeasurements = item.customMeasurements || null;
          if (isCustomFit && !rawMeasurements && customerUser && Array.isArray(customerUser.cart)) {
            const matchedCartItem = customerUser.cart.find(
              (c) => c.product && c.product.toString() === rawProductId && c.selectedSize === 'Custom Fit'
            );
            if (matchedCartItem && matchedCartItem.customMeasurements) {
              rawMeasurements = matchedCartItem.customMeasurements;
            }
          }

          let validatedCustom = null;
          if (isCustomFit && rawMeasurements) {
            const check = validateCustomMeasurements(rawMeasurements, { requireConfirmed: true });
            if (check.valid) {
              validatedCustom = check.normalized;
            }
          }

          const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
          let authoritativeUnitPrice = Math.max(0, Number(item.price || 0));

          if (productDoc) {
            const basePrice = Number(productDoc.price || 0);
            const discountPct = Math.min(100, Math.max(0, Number(productDoc.discount || 0)));
            authoritativeUnitPrice = Number((basePrice * (1 - discountPct / 100)).toFixed(2));

            if (item.price !== undefined && Number(item.price) < authoritativeUnitPrice - 0.5) {
              return res.status(400).json({
                success: false,
                error: `Order item price mismatch detected for ${productDoc.name}. Please refresh cart and retry.`
              });
            }
          }

          computedRawSubtotal += authoritativeUnitPrice * itemQty;

          preparedItems.push({
            product: productDoc ? productDoc._id : undefined,
            productId: rawProductId,
            name: productDoc?.name || item.name || 'VÆROX Product',
            image: productDoc?.image || item.image || '',
            price: authoritativeUnitPrice,
            quantity: itemQty,
            size: isCustomFit ? 'Custom Fit' : (item.size || 'L'),
            sizeType: isCustomFit ? 'custom' : (item.sizeType || 'alpha'),
            tier: productDoc?.tier || item.tier || 'standard',
            category: productDoc?.category || item.category || 'clothes',
            ...(validatedCustom
              ? {
                  customMeasurements: {
                    chest: validatedCustom.chest,
                    shoulder: validatedCustom.shoulder,
                    waist: validatedCustom.waist,
                    thigh: validatedCustom.thigh,
                    torso: validatedCustom.torso,
                    hips: validatedCustom.hips,
                    fitPreference: validatedCustom.fitPreference,
                    confirmed: true,
                    confirmedAt: validatedCustom.confirmedAt,
                    policyAccepted: true
                  }
                }
              : {})
          });

          if (isCustomFit && validatedCustom) {
            pendingCustomFitPayloads.push({
              uniqueKey: `${resolvedOrderId}::${rawProductId}::${idx}`,
              productRef: productDoc ? productDoc._id : undefined,
              productId: rawProductId,
              name: productDoc?.name || item.name || 'VÆROX Custom Fit Garment',
              image: productDoc?.image || item.image || '',
              price: authoritativeUnitPrice,
              quantity: itemQty,
              category: productDoc?.category || item.category || 'clothes',
              tier: productDoc?.tier || item.tier || 'standard',
              validatedCustom
            });
          }
        }

        const couponKey = String(orderData.couponCode || '').trim().toUpperCase();
        const couponRate = VALID_COUPONS[couponKey] || 0;
        const authoritativeSubtotal = Number((computedRawSubtotal * (1 - couponRate)).toFixed(2));
        const clientTotal = Number(orderData.totalAmount ?? authoritativeSubtotal);
        if (authoritativeSubtotal > 0 && clientTotal < authoritativeSubtotal - 1) {
          return res.status(400).json({
            success: false,
            error: 'Order total mismatch detected. Please refresh checkout and retry.'
          });
        }
        const safeTax = Math.max(0, Number(orderData.tax || 0));
        const authoritativeTotal = Number((authoritativeSubtotal + safeTax).toFixed(2));

        const customerInfo = {
          name: String(orderData.user.name || customerUser?.name || '').trim(),
          email: String(orderData.user.email || customerUser?.email || '').trim().toLowerCase(),
          phone: String(orderData.user.phone || customerUser?.phone || '').trim(),
          address: String(orderData.user.address || customerUser?.address || '').trim(),
          city: String(orderData.user.city || '').trim(),
          state: String(orderData.user.state || '').trim(),
          zipCode: String(orderData.user.zipCode || '').trim()
        };

        savedOrder = await Order.create({
          orderId: resolvedOrderId,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          user: customerUser ? customerUser._id : undefined,
          customer: customerInfo,
          items: preparedItems,
          subtotal: authoritativeSubtotal,
          tax: safeTax,
          totalAmount: authoritativeTotal,
          paymentMethod: orderData.paymentMethod || 'Razorpay Secure (Online)',
          paymentStatus: 'Paid',
          orderStatus: 'Processing'
        });

        // Create CustomFitRecord entries ONLY after verified successful checkout
        for (const cf of pendingCustomFitPayloads) {
          const existingRecord = await CustomFitRecord.findOne({ uniqueKey: cf.uniqueKey });
          if (!existingRecord) {
            await CustomFitRecord.create({
              uniqueKey: cf.uniqueKey,
              customer: {
                userId: customerUser ? customerUser._id : undefined,
                ...customerInfo
              },
              order: {
                orderRef: savedOrder._id,
                orderId: savedOrder.orderId,
                paymentId: savedOrder.paymentId,
                paymentMethod: savedOrder.paymentMethod,
                paymentStatus: savedOrder.paymentStatus,
                orderStatus: savedOrder.orderStatus,
                subtotal: savedOrder.subtotal,
                tax: savedOrder.tax,
                totalAmount: savedOrder.totalAmount,
                orderDate: savedOrder.createdAt
              },
              product: {
                productRef: cf.productRef,
                productId: cf.productId,
                name: cf.name,
                image: cf.image,
                price: cf.price,
                quantity: cf.quantity,
                category: cf.category,
                tier: cf.tier
              },
              measurements: {
                chest: cf.validatedCustom.chestNum,
                shoulder: cf.validatedCustom.shoulderNum,
                waist: cf.validatedCustom.waistNum,
                thigh: cf.validatedCustom.thighNum,
                torso: cf.validatedCustom.torsoNum,
                hips: cf.validatedCustom.hipsNum,
                fitPreference: cf.validatedCustom.fitPreference
              },
              confirmation: {
                confirmed: true,
                confirmedAt: cf.validatedCustom.confirmedAt,
                policyAccepted: true,
                policyText: CUSTOM_FIT_POLICY_TEXT
              }
            });
            customFitCount += 1;
          }
        }
      }
    }

    let emailResult = null;
    if (orderData && orderData.user && orderData.user.email) {
      try {
        emailResult = await sendInvoiceEmail(savedOrder ? formatOrderForClient(savedOrder) : orderData);
        console.log(`[PAYMENT VERIFY] Email invoice result for ${orderData.user.email}:`, emailResult);
      } catch (emailErr) {
        console.error('[PAYMENT VERIFY] Email dispatch error:', emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and invoice email sent',
      paymentId: razorpay_payment_id,
      orderId: savedOrder ? savedOrder.orderId : (orderData?.id || razorpay_order_id),
      order: savedOrder ? formatOrderForClient(savedOrder) : null,
      customFitCount,
      emailSent: emailResult ? emailResult.success : false
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed: ' + err.message
    });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    // Validate amount
    const validatedAmount = Math.round(parseFloat(amount) * 100); // Convert to paise
    if (!validatedAmount || validatedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const options = {
      amount: validatedAmount,
      currency,
      receipt: 'receipt_' + Date.now()
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      error: 'Order creation failed: ' + err.message
    });
  }
};

// @desc    Get all verified orders for Admin Panel
// @route   GET /api/payment/orders/admin
// @access  Private/Admin
exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders.map(formatOrderForClient)
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/payment/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': req.user.email.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders.map(formatOrderForClient)
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your orders'
    });
  }
};

// @desc    Update order status (and sync associated CustomFitRecord orderStatus)
// @route   PATCH /api/payment/orders/admin/:orderId/status
// @access  Private/Admin
exports.updateAdminOrderStatus = async (req, res) => {
  try {
    const { orderStatus, cancelReason } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    if (cancelReason !== undefined) {
      order.cancelReason = String(cancelReason).trim();
    }
    await order.save();

    await CustomFitRecord.updateMany(
      { 'order.orderId': order.orderId },
      { $set: { 'order.orderStatus': orderStatus } }
    );

    res.status(200).json({
      success: true,
      data: formatOrderForClient(order)
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
};
