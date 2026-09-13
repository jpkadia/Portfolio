const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware for Admin routes
 * Validates JWT token in Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[CRITICAL] JWT_SECRET is not configured on the server.');
      return res.status(500).json({
        success: false,
        message: 'Authentication service unavailable.'
      });
    }

    const decoded = jwt.verify(token, secret);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient permissions.'
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

module.exports = authMiddleware;
