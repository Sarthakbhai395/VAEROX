const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
    // Removed strict enum to support dynamic VÆROX categories like 
    // standard-men, standard-women, premium-men-CEO, etc.
  },
  tier: {
    type: String,
    enum: ['standard', 'premium'],
    default: 'standard'
  },
  gender: {
    type: String,
    enum: ['men', 'women'],
    default: 'men'
  },
  role: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: '/uploads/no-photo.jpg'
  },
  images: {
    type: [String],
    default: []
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate discounted price before saving
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Product', productSchema);