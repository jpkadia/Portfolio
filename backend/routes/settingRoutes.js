const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Setting = require('../models/Setting');

// Rate limiting for public settings endpoint
const publicSettingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// @route   GET /api/settings/public
// @desc    Get public configuration settings (e.g. experience toggle)
// @access  Public
router.get('/public', publicSettingsLimiter, async (req, res) => {
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
    console.error('Error fetching public settings:', error.message);
    // Graceful fallback to true if database is temporarily unavailable
    return res.status(200).json({
      success: true,
      settings: {
        showCoFounderExperience: true
      },
      fallback: true
    });
  }
});

module.exports = router;
