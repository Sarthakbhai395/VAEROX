const Contact = require('../models/Contact');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('Creating contact message with req.user:', req.user);

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      // Associate with user if logged in
      user: req.user ? req.user.id : undefined
    });

    console.log('Contact created:', contact);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    console.error('Error creating contact message:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getContactMessages = async (req, res, next) => {
  try {
    const contacts = await Contact.find().populate('user', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get contact messages for a specific user
// @route   GET /api/contact/user
// @access  Private (User only)
exports.getUserContactMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Fetch original messages sent by user ID or email
    const userMessages = await Contact.find({
      $or: [{ user: userId }, { email: userEmail }]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: userMessages.length,
      data: userMessages
    });
  } catch (err) {
    console.error('Error in getUserContactMessages:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Reply to a contact message
// @route   PUT /api/contact/:id/reply
// @access  Private (Admin only)
exports.replyContactMessage = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a reply message'
      });
    }

    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    contact.replyMessage = replyMessage.trim();
    contact.replyDate = Date.now();
    contact.isReplied = true;

    await contact.save();

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    console.error('Error replying to contact message:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Debug all contacts
// @route   GET /api/contact/debug
// @access  Public
exports.debugAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};