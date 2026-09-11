const express = require('express');
const {
  createContactMessage,
  getContactMessages,
  getUserContactMessages,
  replyContactMessage,
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

router.route('/:id/reply')
  .put(protect, authorize('admin'), replyContactMessage);

router.route('/debug')
  .get(debugAllContacts);

module.exports = router;