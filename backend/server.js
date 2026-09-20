const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables reliably regardless of working directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Also check root .env

const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust proxy for secure headers and accurate IP rate limiting on reverse proxies (Render, Vercel, Heroku)
app.set('trust proxy', 1);

// Connect to MongoDB Atlas
connectDB();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // API responses don't render HTML; prevents header conflicts with frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Allowed CORS Origins
const allowedOrigins = [
  'https://parthkadiya.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g. mobile apps, curl, health-checks, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Payload Size Limits (DoS & abuse mitigation)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Application Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Health check route for client pre-warming & cold-start detection
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', uptime: process.uptime() });
});

// Base Route - Minimal and safe
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Portfolio Backend Server Running',
    database: 'MongoDB Atlas Connected'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Centralized Safe Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large. Maximum size is 10KB.'
    });
  }
  if (err.message === 'Blocked by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS request rejected.'
    });
  }
  console.error('Unhandled server error:', err.message);
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred.'
  });
});

// Port configuration (Supports Render.com process.env.PORT, local SERVER_PORT or 5000)
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server Running] http://localhost:${PORT}`);
});

// Process-level error resilience handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception thrown]:', err);
});

module.exports = { app, server };
