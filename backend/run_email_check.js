const fs = require('fs');
require('dotenv').config();
const { sendInvoiceEmail } = require('./utils/sendEmail');

const mockOrder = {
  id: 'VRX-849201',
  paymentId: 'pay_TEST998877',
  date: new Date().toISOString(),
  user: {
    name: 'Sarthak Bhatnagar',
    email: 'sarthakbhatnagar2005@gmail.com',
    phone: '+91 98765 43210',
    address: '402 Regency Towers, Bandra Kurla Complex',
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

async function testEmail() {
  const logFile = './email_test.log';
  fs.writeFileSync(logFile, `=== STARTING SMTP TEST AT ${new Date().toISOString()} ===\n`);
  
  try {
    const res = await sendInvoiceEmail(mockOrder);
    fs.appendFileSync(logFile, `RESULT: ${JSON.stringify(res, null, 2)}\n`);
  } catch (err) {
    fs.appendFileSync(logFile, `ERROR: ${err.stack || err.message}\n`);
  }
}

testEmail();
