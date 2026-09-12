const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Handle contact form submissions and save to MongoDB
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, mobile, message } = req.body;

    // Validate presence
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Create & save contact submission
    const newContact = new Contact({
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim()
    });

    const savedContact = await newContact.save();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get in touch soon.',
      data: {
        id: savedContact._id,
        name: savedContact.name,
        createdAt: savedContact.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving contact submission:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

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
