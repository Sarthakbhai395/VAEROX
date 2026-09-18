require('dotenv').config();
const { sendInvoiceEmail } = require('./utils/sendEmail');

const mockOrder = {
  id: 'VRX-998822',
  paymentId: 'pay_TEST12345678',
  date: new Date().toISOString(),
  user: {
    name: 'Sarthak Bhatnagar',
    email: process.env.SMTP_EMAIL || 'sarthakbhatnagar2005@gmail.com',
    phone: '+91 98765 43210',
    address: '102 VÆROX Luxury Suites, BKC',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400051'
  },
  items: [
    {
      id: 'p1',
      name: 'VÆROX Executive Double-Breasted Wool Tuxedo',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      price: 18499,
      quantity: 1,
      size: 'XL',
      customMeasurements: null
    }
  ],
  subtotal: 18499,
  tax: 1479.92,
  totalAmount: 19978.92,
  paymentMethod: 'Razorpay Secure (Online)'
};

console.log('--- Testing VÆROX Email Invoice Dispatch ---');
sendInvoiceEmail(mockOrder)
  .then(res => {
    console.log('RESULT:', res);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
