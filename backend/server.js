// Express Server Config - VÆROX Backend Engine v2
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { mongoSanitize, rateLimiter, secureHeaders } = require('./middleware/security');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Load env vars
dotenv.config();


// Connect to database
connectDB();

// Initialize app
const app = express();

// Security Middlewares
app.use(helmet());
app.use(secureHeaders);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// General API rate limiter (1000 requests per 15 minutes per IP)
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please slow down.'
});
app.use('/api', apiLimiter);

// NoSQL Injection Sanitization
app.use(mongoSanitize);

// Middleware to normalize request body in serverless/Netlify environments
app.use((req, res, next) => {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString('utf8'));
      } catch (e) {
        // Safe fallback
      }
    } else if (typeof req.body === 'object' && req.body.type === 'Buffer' && Array.isArray(req.body.data)) {
      try {
        req.body = JSON.parse(Buffer.from(req.body.data).toString('utf8'));
      } catch (e) {
        // Safe fallback
      }
    } else if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Safe fallback
      }
    }
  }
  next();
});

// Configure CORS with robust origin checking (localhost + Vercel/Netlify domains)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://vaerox-alpha.vercel.app',
  'https://your-netlify-app.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, postman, same-origin serverless calls, or mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin === allowedOrigin.replace(/\/$/, '');
    }) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app') || origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow in serverless environment to prevent blocked preflights
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Serve static files from uploads folder
app.use('/uploads', cors(corsOptions), (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
}, express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers with dual path support (/api/* and /*) for bulletproof Vercel Serverless Functions
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');
const sellerContactRoutes = require('./routes/sellerContact');
const activityRoutes = require('./routes/activities');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/contact', '/contact'], contactRoutes);
app.use(['/api/payment', '/payment'], paymentRoutes);
app.use(['/api/seller/contact', '/seller/contact'], sellerContactRoutes);
app.use(['/api/activities', '/activities'], activityRoutes);

const { sendInvoiceEmail } = require('./utils/sendEmail');
app.get('/api/test-email', async (req, res) => {
  try {
    const targetEmail = req.query.email || process.env.SMTP_EMAIL || 'sb1258954@gmail.com';
    const targetName = req.query.name || 'Sarthak Bhatnagar';
    const productName = req.query.product || 'VÆROX Executive Double-Breasted Wool Tuxedo';
    const itemPrice = Number(req.query.price) || 18499;
    const itemSize = req.query.size || 'XL';
    const itemQty = Number(req.query.qty) || 1;

    const subtotal = itemPrice * itemQty;
    const tax = req.query.tax != null ? Number(req.query.tax) : 0;
    const totalAmount = subtotal + tax;

    const mockOrder = {
      id: `VRX-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
      date: new Date().toISOString(),
      user: {
        name: targetName,
        email: targetEmail,
        phone: req.query.phone || '+91 98785 43210',
        address: req.query.address || 'Baad Post - Kakua gwalior road agra',
        city: req.query.city || 'Agra',
        state: req.query.state || 'Uttar Pradesh',
        zipCode: req.query.zip || '282009'
      },
      items: [
        {
          id: 'p1',
          name: productName,
          price: itemPrice,
          quantity: itemQty,
          size: itemSize
        }
      ],
      subtotal,
      tax,
      totalAmount,
      paymentMethod: 'Razorpay Secure (Online)'
    };

    const result = await sendInvoiceEmail(mockOrder);
    res.json({
      success: true,
      message: `Invoice email dispatched to ${targetEmail}`,
      orderDetails: {
        orderId: mockOrder.id,
        recipient: targetEmail,
        customerName: targetName,
        product: productName,
        total: totalAmount
      },
      smtpResult: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// Serve frontend files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Serve index.html for all non-API routes
    app.get(/^(?!\/api\/).*$/, (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    // If the frontend is deployed separately and dist doesn't exist, provide a clean JSON fallback
    app.get('/', (req, res) => {
      res.json({ message: 'Akario Mart API is running...' });
    });
  }
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL && !process.env.NETLIFY) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });
}

module.exports = app;