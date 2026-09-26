const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const Visitor = require('../models/Visitor');

// Rate limiting for analytics tracking: allow up to 300 hits per 15 minutes per IP
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many analytics pings.' }
});

// Rate limiting for admin visitor log queries
const adminVisitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Accurately extract real client IP address from proxy headers (Vercel, Render, Cloudflare)
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp.replace(/^::ffff:/, '');
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) return realIp.trim().replace(/^::ffff:/, '');
  const socketIp = req.socket?.remoteAddress || req.ip || 'Unknown';
  return socketIp.replace(/^::ffff:/, '');
};

/**
 * Clean regex parser for Operating System
 */
const parseOS = (ua = '') => {
  if (!ua) return 'Unknown';
  if (/windows phone/i.test(ua)) return 'Windows Phone';
  if (/win(dows|98|nt|95)/i.test(ua)) {
    if (/windows nt 10\.0/i.test(ua)) return 'Windows 10/11';
    if (/windows nt 6\.3/i.test(ua)) return 'Windows 8.1';
    if (/windows nt 6\.2/i.test(ua)) return 'Windows 8';
    if (/windows nt 6\.1/i.test(ua)) return 'Windows 7';
    return 'Windows';
  }
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other OS';
};

/**
 * Clean regex parser for Browser
 */
const parseBrowser = (ua = '') => {
  if (!ua) return 'Unknown';
  if (/edg/i.test(ua)) return 'Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
  return 'Other Browser';
};

/**
 * Detect Device Type
 */
const parseDevice = (ua = '') => {
  if (!ua) return 'Desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|android|touch/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

// @route   POST /api/analytics/track
// @desc    Track visitor session and viewed section (Safe & non-blocking)
// @access  Public
router.post('/track', trackLimiter, async (req, res) => {
  try {
    const ua = req.headers['user-agent'] || '';
    const ip = getClientIp(req);
    const os = parseOS(ua);
    const browser = parseBrowser(ua);
    const device = parseDevice(ua);

    const section = (req.body?.section && typeof req.body.section === 'string')
      ? req.body.section.slice(0, 50).trim()
      : 'home';

    const path = (req.body?.path && typeof req.body.path === 'string')
      ? req.body.path.slice(0, 100).trim()
      : '/';

    const referrer = (req.body?.referrer && typeof req.body.referrer === 'string')
      ? req.body.referrer.slice(0, 200).trim()
      : (req.headers['referer'] ? req.headers['referer'].slice(0, 200) : 'Direct');

    // Async save, non-blocking to client
    await Visitor.create({
      ip,
      os,
      browser,
      device,
      section,
      path,
      referrer,
      userAgent: ua.slice(0, 300)
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    // Non-blocking fallback: never fail or throw 500 to visitor or search bot
    console.error('Visitor tracking silent error:', error.message);
    return res.status(200).json({ success: true, silentFallback: true });
  }
});

// @route   GET /api/analytics/visitors
// @desc    Fetch paginated visitor logs for admin dashboard
// @access  Private (Admin auth required)
router.get('/visitors', authMiddleware, adminVisitorLimiter, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter = {
        $or: [
          { ip: searchRegex },
          { os: searchRegex },
          { browser: searchRegex },
          { device: searchRegex },
          { section: searchRegex },
          { path: searchRegex },
          { referrer: searchRegex }
        ]
      };
    }

    const totalCount = await Visitor.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const skip = (page - 1) * limit;

    const visitors = await Visitor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: totalCount,
      page,
      totalPages,
      limit,
      visitors
    });
  } catch (error) {
    console.error('Error fetching visitor analytics:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve visitor analytics.'
    });
  }
});

// @route   DELETE /api/analytics/visitors/:id
// @desc    Delete a single visitor log
// @access  Private (Admin auth required)
router.delete('/visitors/:id', authMiddleware, adminVisitorLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    await Visitor.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Visitor log deleted.' });
  } catch (error) {
    console.error('Error deleting visitor log:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete visitor log.' });
  }
});

module.exports = router;
