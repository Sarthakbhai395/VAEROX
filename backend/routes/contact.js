const express = require('express');
const {
  createContactMessage,
  getContactMessages,
  getUserContactMessages,
  debugAllContacts
} = require('../controllers/contactController');

const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (but can optionally use authentication)
router.route('/')
  .post(optionalAuth, createContactMessage);

// Private routes
router.route('/')
  .get(protect, authorize('admin'), getContactMessages);

router.route('/user')
  .get(protect, getUserContactMessages);

// DEBUG route - temporary
router.route('/debug')
  .get(debugAllContacts);

module.exports = router;