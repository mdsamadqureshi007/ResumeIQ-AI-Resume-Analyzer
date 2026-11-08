const express = require('express');
const rateLimit = require('express-rate-limit');
const { upload } = require('../middleware/uploadMiddleware');
const { analyzeResume, getAnalysisById } = require('../controllers/analysisController');
const { getHistory, deleteAnalysis } = require('../controllers/historyController');

const router = express.Router();

// Rate limiter for expensive AI analysis requests (25 requests per 15-minute window per IP)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many analysis requests submitted from this IP. Please try again in a few minutes.',
  },
});

// Resume analysis routes
router.post('/analyze', analyzeLimiter, upload.single('resume'), analyzeResume);
router.get('/history', getHistory);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

module.exports = router;
