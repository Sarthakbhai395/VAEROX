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

// Strict Auth Rate Limiter: 5 attempts per 5 minutes per IP
const authLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts from this IP. Please wait 5 minutes before trying again.'
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;