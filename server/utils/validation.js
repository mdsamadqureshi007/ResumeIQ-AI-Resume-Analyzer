const mongoose = require('mongoose');

/**
 * Validates if the given string is a valid MongoDB ObjectId.
 */
const isValidObjectId = (id) => {
  return Boolean(id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));
};

/**
 * Validates file upload metadata.
 */
const validateUploadMetadata = (file) => {
  if (!file) {
    const error = new Error('No resume file was uploaded. Please provide a PDF or DOCX file.');
    error.statusCode = 400;
    throw error;
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  const allowedExtensions = ['.pdf', '.docx'];
  const ext = file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase() : '';

  if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are permitted.');
    error.statusCode = 400;
    throw error;
  }

  // File size limit: 5MB
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    const error = new Error('File exceeds the 5MB upload limit. Please upload a smaller document.');
    error.statusCode = 400;
    throw error;
  }

  return true;
};

/**
 * Sanitizes and validates job description text.
 */
const sanitizeJobDescription = (jd) => {
  if (!jd || typeof jd !== 'string') return '';
  const trimmed = jd.trim();
  // Max length check: 20,000 characters
  if (trimmed.length > 20000) {
    return trimmed.substring(0, 20000);
  }
  return trimmed;
};

module.exports = {
  isValidObjectId,
  validateUploadMetadata,
  sanitizeJobDescription,
};
