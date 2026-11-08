const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Normalizes extracted text: cleans extra spaces, carriage returns, and excessive newlines.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Extracts raw text from a PDF file.
 */
const extractFromPDF = async (filePath) => {
  let parser = null;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text || '';
  } catch (error) {
    if (error.name === 'PasswordException') {
      const err = new Error('The PDF document is password-protected and cannot be parsed.');
      err.statusCode = 422;
      throw err;
    }
    const err = new Error(`Failed to parse PDF document: ${error.message}`);
    err.statusCode = 422;
    throw err;
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch (destroyErr) {
        // Ignore destroy error
      }
    }
  }
};

/**
 * Extracts raw text from a DOCX file.
 */
const extractFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    const err = new Error(`Failed to parse Word (.docx) document: ${error.message}`);
    err.statusCode = 422;
    throw err;
  }
};

/**
 * Main parser entry point: extracts text from PDF or DOCX file,
 * validates extracted content length, and normalizes text.
 */
const parseResumeDocument = async (filePath, originalName) => {
  if (!fs.existsSync(filePath)) {
    const err = new Error('Uploaded file could not be located on the server.');
    err.statusCode = 400;
    throw err;
  }

  const ext = path.extname(originalName || filePath).toLowerCase();
  let rawText = '';

  if (ext === '.pdf') {
    rawText = await extractFromPDF(filePath);
  } else if (ext === '.docx') {
    rawText = await extractFromDOCX(filePath);
  } else {
    const err = new Error('Unsupported file extension. Please provide a .pdf or .docx document.');
    err.statusCode = 400;
    throw err;
  }

  const cleanText = normalizeText(rawText);

  // Check for scanned or image-based PDF where no text could be extracted
  // Minimum 40 characters required for a plausible resume text
  const alphanumericCount = (cleanText.match(/[a-zA-Z0-9]/g) || []).length;
  if (alphanumericCount < 40) {
    const err = new Error(
      'The uploaded document contains no extractable text. Scanned resumes or image-only documents require Optical Character Recognition (OCR), which is not supported in this version. Please upload a standard text-based PDF or DOCX resume.'
    );
    err.statusCode = 422;
    throw err;
  }

  // Safety limit: clamp extreme document length to prevent token overflow (50,000 characters)
  const MAX_TEXT_LENGTH = 50000;
  if (cleanText.length > MAX_TEXT_LENGTH) {
    return cleanText.substring(0, MAX_TEXT_LENGTH);
  }

  return cleanText;
};

module.exports = {
  parseResumeDocument,
  normalizeText,
};
