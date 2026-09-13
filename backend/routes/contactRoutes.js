const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');

// Rate limiting for contact form: max 10 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Basic string sanitization: strip dangerous HTML/script tags and excessive control characters
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove ASCII control characters
    .trim();
};

// @route   POST /api/contact
// @desc    Handle contact form submissions and save to MongoDB
// @access  Public (Rate limited)
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, mobile, message } = req.body;

    // Reject NoSQL injection payloads or non-string inputs
    if (
      typeof name !== 'string' ||
      typeof mobile !== 'string' ||
      typeof message !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload format. All fields must be text.'
      });
    }

    const cleanName = sanitizeInput(name);
    const cleanMobile = mobile.trim();
    const cleanMessage = sanitizeInput(message);

    // Validate presence & lengths
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.'
      });
    }

    if (!cleanMobile || !/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    if (!cleanMessage || cleanMessage.length < 2 || cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 2 and 2000 characters.'
      });
    }

    // Create & save contact submission
    const newContact = new Contact({
      name: cleanName,
      mobile: cleanMobile,
      message: cleanMessage
    });

    const savedContact = await newContact.save();

    // Privacy-safe log: Do NOT log full personal data or message content
    console.log(`[Contact Submission] New contact received: ID ${savedContact._id}`);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get in touch soon.',
      data: {
        id: savedContact._id,
        createdAt: savedContact.createdAt
      }
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    console.error('Error handling contact submission:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your message. Please try again.'
    });
  }
});

// @route   GET /api/contact/health
// @desc    Health check for contact service
// @access  Public
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'contact-api' });
});

module.exports = router;
