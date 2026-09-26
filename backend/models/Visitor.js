const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      default: 'Unknown',
      trim: true
    },
    os: {
      type: String,
      default: 'Unknown',
      trim: true
    },
    browser: {
      type: String,
      default: 'Unknown',
      trim: true
    },
    device: {
      type: String,
      default: 'Desktop',
      trim: true
    },
    section: {
      type: String,
      default: 'home',
      trim: true
    },
    path: {
      type: String,
      default: '/',
      trim: true
    },
    referrer: {
      type: String,
      default: 'Direct',
      trim: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    // MongoDB TTL Index: Documents automatically deleted after 60 days (5,184,000 seconds)
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 5184000 // 60 days in seconds
    }
  },
  {
    // Do not add automatic updatedAt so createdAt remains the anchor for TTL
    timestamps: false
  }
);

// Explicitly ensure TTL index is created on createdAt
visitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5184000 });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
