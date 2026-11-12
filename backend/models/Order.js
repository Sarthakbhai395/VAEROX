const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    size: {
      type: String,
      default: 'L'
    },
    sizeType: {
      type: String,
      enum: ['alpha', 'numeric', 'custom'],
      default: 'alpha'
    },
    tier: {
      type: String,
      default: 'standard'
    },
    category: {
      type: String,
      default: 'clothes'
    },
    customMeasurements: {
      chest: { type: String },
      shoulder: { type: String },
      waist: { type: String },
      thigh: { type: String },
      torso: { type: String },
      hips: { type: String },
      fitPreference: { type: String },
      confirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date },
      policyAccepted: { type: Boolean, default: false }
    }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true
  },
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' }
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [(val) => Array.isArray(val) && val.length > 0, 'Order must contain at least one item']
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay Secure (Online)'
  },
  paymentStatus: {
    type: String,
    default: 'Paid'
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  cancelReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);

