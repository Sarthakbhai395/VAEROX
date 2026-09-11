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
  'https://your-netlify-app.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, postman, or mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Direct match or stripping trailing slash
      return origin === allowedOrigin || origin === allowedOrigin.replace(/\/$/, '');
    }) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Serve static files from uploads folder
app.use('/uploads', cors(corsOptions), (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
}, express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/seller/contact', require('./routes/sellerContact'));
app.use('/api/activities', require('./routes/activities'));



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