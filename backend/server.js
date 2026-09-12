const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables reliably regardless of working directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Also check root .env

const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/contact', contactRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Portfolio Backend Server Running',
    database: 'MongoDB Atlas Connected'
  });
});

// Port configuration (Supports Render.com process.env.PORT, local SERVER_PORT or 5000)
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server Running] http://localhost:${PORT}`);
});

module.exports = { app, server };
