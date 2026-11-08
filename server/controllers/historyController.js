const Analysis = require('../models/Analysis');
const { isValidObjectId } = require('../utils/validation');

/**
 * Retrieves the list of previous analyses (unauthenticated, instance-shared history).
 * GET /api/analysis/history
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await Analysis.find()
      .select('originalFilename fileSize overallScore scoreBreakdown jobMatch.targetRole jobMatch.skillCoverageScore createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes an individual analysis record by its ID.
 * DELETE /api/analysis/:id
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis ID format.',
      });
    }

    const deleted = await Analysis.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  deleteAnalysis,
};
