const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const analysisRoutes = require('./routes/analysisRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Standard parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

  res.status(200).json({
    status: 'ok',
    service: 'ResumeIQ API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: mongoStatus,
    geminiConfigured: hasGeminiKey,
    model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
  });
});

// API Routes
app.use('/api/analysis', analysisRoutes);

// 404 Not Found & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
