const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const Contact = require('../models/Contact');
const Setting = require('../models/Setting');

// Rate limiting for admin login: max 5 requests per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  }
});

// Rate limiting for admin submissions fetch
const submissionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

/**
 * Constant-time password comparison to prevent timing attacks
 */
const verifyPassword = async (inputPassword, storedPassword) => {
  if (!inputPassword || !storedPassword) return false;

  // Support bcrypt hashed passwords
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }

  // Support secure timing-safe string comparison
  const hashA = crypto.createHash('sha256').update(String(inputPassword)).digest();
  const hashB = crypto.createHash('sha256').update(String(storedPassword)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

// @route   POST /api/admin/login
// @desc    Authenticate admin and return JWT
// @access  Public (Rate limited)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Strict type check to prevent NoSQL injection or unexpected object payloads
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload format.'
      });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!envEmail || !envPassword || !jwtSecret) {
      console.error('[CRITICAL] Admin credentials or JWT_SECRET are not configured on the server.');
      return res.status(500).json({
        success: false,
        message: 'Authentication service temporarily unavailable.'
      });
    }

    // Compare email case-insensitively
    const isEmailMatch = (trimmedEmail.toLowerCase() === envEmail.trim().toLowerCase());
    const isPasswordMatch = await verifyPassword(password, envPassword);

    // Generic response regardless of whether email or password failed
    if (!isEmailMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Sign JWT token valid for 2 hours
    const token = jwt.sign(
      { role: 'admin', email: envEmail },
      jwtSecret,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      expiresIn: '2h'
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred during authentication.'
    });
  }
});

// @route   GET /api/admin/submissions
// @desc    Retrieve contact submissions (minimal data: count + submissions list)
// @access  Private (Admin auth required)
router.get('/submissions', authMiddleware, submissionsLimiter, async (req, res) => {
  try {
    // Return only required fields: _id, name, mobile, message, createdAt
    const submissions = await Contact.find()
      .sort({ createdAt: -1 })
      .select('_id name mobile message createdAt')
      .lean();

    const totalCount = submissions.length;

    return res.status(200).json({
      success: true,
      count: totalCount,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions for admin:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving contact submissions.'
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Retrieve all configurable admin settings
// @access  Private (Admin auth required)
router.get('/settings', authMiddleware, submissionsLimiter, async (req, res) => {
  try {
    const settingDoc = await Setting.findOne({ key: 'showCoFounderExperience' }).lean();
    const showCoFounderExperience = settingDoc !== null ? Boolean(settingDoc.value) : true;

    return res.status(200).json({
      success: true,
      settings: {
        showCoFounderExperience
      }
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin settings.'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update configurable admin settings
// @access  Private (Admin auth required)
router.put('/settings', authMiddleware, submissionsLimiter, async (req, res) => {
  try {
    const { showCoFounderExperience } = req.body;

    if (typeof showCoFounderExperience !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: showCoFounderExperience must be a boolean (true or false).'
      });
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'showCoFounderExperience' },
      { value: showCoFounderExperience },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `Co-Founder experience visibility set to ${showCoFounderExperience ? 'ON (Visible)' : 'OFF (Hidden)'}.`,
      settings: {
        showCoFounderExperience: Boolean(updated.value)
      }
    });
  } catch (error) {
    console.error('Error updating admin settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update admin settings.'
    });
  }
});

module.exports = router;
