const Analysis = require('../models/Analysis');
const { parseResumeDocument } = require('../services/resumeParser');
const { analyzeWithGemini } = require('../services/geminiService');
const { calculateScores } = require('../services/scoringService');
const { deleteTempFile } = require('../middleware/uploadMiddleware');
const { isValidObjectId, validateUploadMetadata, sanitizeJobDescription } = require('../utils/validation');

/**
 * Handles resume upload, text extraction, Gemini AI analysis, and scoring.
 * POST /api/analysis/analyze
 */
const analyzeResume = async (req, res, next) => {
  const filePath = req.file ? req.file.path : null;

  try {
    // 1. Validate file existence and metadata
    validateUploadMetadata(req.file);

    const originalFilename = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;
    const jobDescription = sanitizeJobDescription(req.body.jobDescription);

    // 2. Parse text from PDF or DOCX document
    const extractedText = await parseResumeDocument(filePath, originalFilename);

    // 3. Perform AI analysis using Gemini via @google/genai SDK
    const aiAnalysis = await analyzeWithGemini(extractedText, jobDescription);

    // 4. Calculate deterministic and composite scores on the backend
    const { overallScore, scoreBreakdown, jobMatch } = calculateScores(
      aiAnalysis,
      extractedText,
      jobDescription
    );

    // 5. Persist analysis results to MongoDB
    const analysisRecord = new Analysis({
      originalFilename,
      fileSize,
      mimeType,
      extractedTextLength: extractedText.length,
      extractedData: aiAnalysis.extractedData,
      overallScore,
      scoreBreakdown,
      strengths: aiAnalysis.strengths,
      improvementAreas: aiAnalysis.improvementAreas,
      atsRecommendations: aiAnalysis.atsRecommendations,
      bulletPointImprovements: aiAnalysis.bulletPointImprovements,
      jobDescription: jobDescription || null,
      jobMatch,
    });

    const savedRecord = await analysisRecord.save();

    res.status(201).json({
      success: true,
      data: savedRecord,
      message: 'Resume analyzed successfully.',
    });
  } catch (error) {
    next(error);
  } finally {
    // Always clean up temporary uploaded file from disk, on both success and failure
    if (filePath) {
      deleteTempFile(filePath);
    }
  }
};

/**
 * Retrieves a single analysis record by ID.
 * GET /api/analysis/:id
 */
const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis ID format.',
      });
    }

    const record = await Analysis.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getAnalysisById,
};
