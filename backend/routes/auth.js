const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { rateLimiter } = require('../middleware/security');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Auth rate limiter: 15 attempts per 15 minutes per IP
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;