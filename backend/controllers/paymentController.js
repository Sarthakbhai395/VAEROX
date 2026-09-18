const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendInvoiceEmail } = require('../utils/sendEmail');

let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TQMjx3H66VLczL';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xaSBVRZSTqMcWC3nxfay1w4A';

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};


// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Public
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xaSBVRZSTqMcWC3nxfay1w4A';

    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', razorpay_signature);
    
    // Verify the signature
    const isVerified = expectedSignature === razorpay_signature;
    
    console.log('Signature verification result:', isVerified);
    
    if (isVerified) {
      let emailResult = null;
      if (orderData && orderData.user && orderData.user.email) {
        try {
          emailResult = await sendInvoiceEmail(orderData);
          console.log(`[PAYMENT VERIFY] Email invoice result for ${orderData.user.email}:`, emailResult);
        } catch (emailErr) {
          console.error(`[PAYMENT VERIFY] Email dispatch error:`, emailErr.message);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully and invoice email sent',
        paymentId: razorpay_payment_id,
        emailSent: emailResult ? emailResult.success : false
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
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
    
    // Log the amount being processed
    console.log('Creating order for amount:', amount, 'in currency:', currency);
    
    // Create order options
    const options = {
      amount: validatedAmount, // Use validated amount
      currency,
      receipt: 'receipt_' + Date.now()
    };
    
    console.log('Order options:', options);
    
    // Create order using Razorpay SDK
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);
    
    console.log('Order created successfully:', order);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    // Log more detailed error information
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      description: err.description
    });
    
    res.status(500).json({
      success: false,
      error: 'Order creation failed: ' + err.message
    });
  }
};