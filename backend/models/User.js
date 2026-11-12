const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otpCode: String,
  otpExpire: Date,
  otpAttempts: {
    type: Number,
    default: 0
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      },
      selectedSize: {
        type: String,
        default: 'L'
      },
      selectedSizeType: {
        type: String,
        enum: ['alpha', 'numeric', 'custom'],
        default: 'alpha'
      },
      customMeasurements: {
        chest: { type: String, default: '' },
        shoulder: { type: String, default: '' },
        waist: { type: String, default: '' },
        thigh: { type: String, default: '' },
        torso: { type: String, default: '' },
        hips: { type: String, default: '' },
        fitPreference: { type: String, default: '' },
        confirmed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
        policyAccepted: { type: Boolean, default: false }
      }
    }
  ],
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  // Convert JWT_EXPIRE to seconds if it contains 'd' for days
  let expiresIn = process.env.JWT_EXPIRE || '30d';
  if (typeof expiresIn === 'string' && expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.replace('d', ''));
    expiresIn = days * 24 * 60 * 60; // Convert to seconds
  }
  const secret = getJwtSecret();
  return jwt.sign({ id: this._id }, secret, {
    expiresIn: expiresIn
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = require('crypto').randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate 6-digit OTP for password reset
userSchema.methods.generateOTP = function() {
  const crypto = require('crypto');
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

  // Hash OTP and store it
  this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');

  // Set expiry to 10 minutes and reset brute-force counter
  this.otpExpire = Date.now() + 10 * 60 * 1000;
  this.otpAttempts = 0;

  return otp;
};

module.exports = mongoose.model('User', userSchema);