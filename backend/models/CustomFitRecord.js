const mongoose = require('mongoose');
const { CUSTOM_FIT_POLICY_TEXT } = require('../utils/customFitValidation');

const CustomFitRecordSchema = new mongoose.Schema({
  uniqueKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      index: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' }
  },
  order: {
    orderRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderId: { type: String, required: true, index: true },
    paymentId: { type: String, required: true },
    paymentMethod: { type: String, default: 'Razorpay Secure (Online)' },
    paymentStatus: { type: String, default: 'Paid' },
    orderStatus: { type: String, default: 'Processing' },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now }
  },
  product: {
    productRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    productId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    category: { type: String, default: '' },
    tier: { type: String, default: 'standard' }
  },
  measurements: {
    chest: { type: Number, required: true },
    shoulder: { type: Number, required: true },
    waist: { type: Number, required: true },
    thigh: { type: Number, required: true },
    torso: { type: Number, required: true },
    hips: { type: Number, required: true },
    fitPreference: { type: String, required: true, trim: true }
  },
  confirmation: {
    confirmed: {
      type: Boolean,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: 'Custom fit measurements must be confirmed.'
      }
    },
    confirmedAt: {
      type: Date,
      required: true
    },
    policyAccepted: {
      type: Boolean,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: 'Custom fit non-return policy must be accepted.'
      }
    },
    policyText: {
      type: String,
      default: CUSTOM_FIT_POLICY_TEXT
    }
  },
  tailoringStatus: {
    type: String,
    enum: ['Pending Tailoring', 'In Tailoring', 'Quality Check', 'Completed'],
    default: 'Pending Tailoring'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomFitRecord', CustomFitRecordSchema);

