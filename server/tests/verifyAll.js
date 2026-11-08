const fs = require('fs');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { parseResumeDocument, normalizeText } = require('../services/resumeParser');
const { calculateScores, calculateSkillCoverageScore, evaluateDeterministicCompleteness } = require('../services/scoringService');
const { safeJsonParse, validateAiResponse } = require('../services/geminiService');
const { isValidObjectId, validateUploadMetadata, sanitizeJobDescription } = require('../utils/validation');
const Analysis = require('../models/Analysis');
const app = require('../app');

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failedTests++;
  }
};

const runAllTests = async () => {
  console.log('\n========================================');
  console.log('   ResumeIQ Comprehensive Test Suite    ');
  console.log('========================================\n');

  // ---------------------------------------------------------
  // 1. Scoring Service Unit Tests
  // ---------------------------------------------------------
  console.log('[Suite 1: Scoring Service]');

  // Test 1.1: Deterministic Completeness
  const mockExtractedFull = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    education: [{ institution: 'MIT', degree: 'B.S. CS', year: '2022' }],
    technicalSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
    projects: [{ title: 'ResumeIQ', description: 'AI platform' }],
    experience: [{ company: 'TechCorp', role: 'Full Stack Engineer' }],
    certifications: ['AWS Cloud Practitioner'],
  };
  const compScore = evaluateDeterministicCompleteness(mockExtractedFull);
  assert(compScore >= 90, 'Deterministic completeness evaluates rich profile accurately', `Score: ${compScore}`);

  const mockExtractedSparse = {
    name: 'Candidate',
    education: [],
    technicalSkills: [],
    projects: [],
    experience: [],
  };
  const sparseScore = evaluateDeterministicCompleteness(mockExtractedSparse);
  assert(sparseScore < 40, 'Deterministic completeness penalizes missing sections', `Score: ${sparseScore}`);

  // Test 1.2: Job Match Skill Coverage Calculation (Matched / Total * 100)
  const jmSample = {
    identifiedRequiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'GraphQL'],
    matchedSkills: ['React', 'Node.js', 'MongoDB'],
  };
  const coverageScore = calculateSkillCoverageScore(jmSample);
  // 3 / 5 = 60%
  assert(coverageScore === 60, 'Skill coverage calculated as (3/5)*100 = 60%', `Got: ${coverageScore}%`);

  const jmEmptyRequired = {
    identifiedRequiredSkills: [],
    matchedSkills: [],
  };
  assert(calculateSkillCoverageScore(jmEmptyRequired) === 100, 'Empty required skills defaults safely to 100%');

  // Test 1.3: Weighted Overall Resume Score
  const mockAiOutput = {
    extractedData: mockExtractedFull,
    scoreAssessments: {
      completenessScore: 90,
      skillsRelevanceScore: 80,
      experienceDescriptionsScore: 70,
      readabilityStructureScore: 85,
    },
    jobMatch: jmSample,
  };
  const scores = calculateScores(mockAiOutput, 'Resume text...', 'Job description...');
  // Check formula:
  // Completeness = round(100 * 0.4 + 90 * 0.6) = 94
  // Skills = round(80 * 0.5 + 60 * 0.5) = 70
  // Experience = 70
  // Readability = 85
  // Overall = round(94*0.25 + 70*0.30 + 70*0.25 + 85*0.20) = round(23.5 + 21 + 17.5 + 17) = round(79) = 79
  assert(scores.overallScore >= 0 && scores.overallScore <= 100, 'Overall score is clamped between 0 and 100', `Score: ${scores.overallScore}`);
  assert(scores.jobMatch.skillCoverageScore === 60, 'Scores include calculated deterministic job coverage');

  // ---------------------------------------------------------
  // 2. Resume Parser Unit Tests
  // ---------------------------------------------------------
  console.log('\n[Suite 2: Document Parser Service]');

  // Test 2.1: Text normalization
  const messyText = '  John   Doe   \r\n\r\n\r\n\r\nSoftware   Engineer  \n\n\n\nSkills:   Node.js  ';
  const clean = normalizeText(messyText);
  assert(!clean.includes('\r'), 'Normalized text contains no carriage returns');
  assert(!clean.includes('   '), 'Normalized text condenses redundant horizontal spaces');

  // Test 2.2: Valid Text PDF Generation and Parsing
  const testPdfDir = path.join(__dirname, 'temp_test_files');
  if (!fs.existsSync(testPdfDir)) fs.mkdirSync(testPdfDir, { recursive: true });

  const validPdfPath = path.join(testPdfDir, 'valid_resume.pdf');
  const validResumeBody = 'Alex Morgan Senior Frontend Engineer React JavaScript HTML5 CSS3 Redux Node.js Webpack Experience at Stripe and Shopify Education University of Washington BS Computer Science';
  const streamContent = `BT /F1 12 Tf 50 700 Td (${validResumeBody}) Tj ET`;
  const validPdfBytes = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamContent.length} >>
stream
${streamContent}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000344 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
422
%%EOF`;
  fs.writeFileSync(validPdfPath, validPdfBytes);

  try {
    const extracted = await parseResumeDocument(validPdfPath, 'valid_resume.pdf');
    assert(extracted.includes('Alex Morgan') && extracted.includes('React'), 'PDF parser extracts valid text successfully');
  } catch (err) {
    assert(false, 'PDF parser extracts valid text successfully', err.message);
  }

  // Test 2.3: Scanned / Empty PDF Detection (OCR requirement honest error)
  const emptyPdfPath = path.join(testPdfDir, 'scanned_empty.pdf');
  const emptyStream = `BT /F1 12 Tf 50 700 Td () Tj ET`;
  const emptyPdfBytes = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${emptyStream.length} >>
stream
${emptyStream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000344 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
422
%%EOF`;
  fs.writeFileSync(emptyPdfPath, emptyPdfBytes);

  try {
    await parseResumeDocument(emptyPdfPath, 'scanned_empty.pdf');
    assert(false, 'Scanned/empty PDF should throw 422 with OCR message');
  } catch (err) {
    assert(
      err.statusCode === 422 && err.message.includes('Optical Character Recognition'),
      'Scanned/empty PDF correctly throws 422 with clear OCR explanation'
    );
  }

  // ---------------------------------------------------------
  // 3. Validation Utility Tests
  // ---------------------------------------------------------
  console.log('\n[Suite 3: Validation Utilities]');

  assert(isValidObjectId('507f1f77bcf86cd799439011'), 'Recognizes valid 24-character hexadecimal MongoDB ObjectId');
  assert(!isValidObjectId('invalid_id_123'), 'Rejects non-hexadecimal MongoDB ObjectId');
  assert(!isValidObjectId(''), 'Rejects empty string as ObjectId');
  assert(!isValidObjectId(null), 'Rejects null as ObjectId');

  const longText = 'A'.repeat(25000);
  const sanitized = sanitizeJobDescription(longText);
  assert(sanitized.length === 20000, 'Truncates job descriptions exceeding 20,000 characters');

  // ---------------------------------------------------------
  // 4. Gemini Service Robustness & Normalizer Tests
  // ---------------------------------------------------------
  console.log('\n[Suite 4: Gemini AI Service Output & Error Handling]');

  // Test 4.1: Safe JSON parsing with markdown code fences
  const fencedJson = '```json\n{\n  "test": "value",\n  "count": 42\n}\n```';
  const parsedFenced = safeJsonParse(fencedJson);
  assert(parsedFenced.test === 'value' && parsedFenced.count === 42, 'Strips markdown code fences from AI response');

  // Test 4.2: Normalizing missing fields and clamping scores
  const rawAiResultWithMissingFields = {
    scoreAssessments: {
      completenessScore: 120, // out of range
      skillsRelevanceScore: -15, // out of range
    },
    strengths: ['Only one strength'],
  };
  const normalized = validateAiResponse(rawAiResultWithMissingFields, false);
  assert(normalized.scoreAssessments.completenessScore === 100, 'Clamps upper bound score to 100');
  assert(normalized.scoreAssessments.skillsRelevanceScore === 0, 'Clamps lower bound score to 0');
  assert(Array.isArray(normalized.extractedData.technicalSkills), 'Provides empty array fallback for missing skills');
  assert(Array.isArray(normalized.atsRecommendations), 'Provides default ATS recommendations if omitted');

  // ---------------------------------------------------------
  // 5. Live Server & MongoDB Integration Tests
  // ---------------------------------------------------------
  console.log('\n[Suite 5: Express Server & MongoDB API Endpoints]');

  const connectDB = require('../config/db');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));

  const makeRequest = (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5099,
          path,
          method: options.method || 'GET',
          headers: options.headers || {},
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  };

  // Test 5.1: Health check endpoint
  const healthRes = await makeRequest('/api/health');
  assert(healthRes.status === 200 && healthRes.data.database === 'connected', 'GET /api/health returns 200 and database connected');

  // Test 5.2: Invalid analysis ID format
  const badIdRes = await makeRequest('/api/analysis/not_a_valid_id');
  assert(badIdRes.status === 400 && badIdRes.data.message.includes('Invalid'), 'GET /api/analysis/invalid_id returns 400 Bad Request');

  // Test 5.3: Valid format but non-existent analysis ID
  const nonExistentRes = await makeRequest('/api/analysis/507f1f77bcf86cd799439011');
  assert(nonExistentRes.status === 404, 'GET /api/analysis/:id returns 404 when record does not exist');

  // Test 5.4: History retrieval
  const historyRes = await makeRequest('/api/analysis/history');
  assert(historyRes.status === 200 && Array.isArray(historyRes.data.data), 'GET /api/analysis/history returns array of records');

  // Test 5.5: Database model persistence, retrieval, and deletion lifecycle
  const testRecord = new Analysis({
    originalFilename: 'test-verification-resume.pdf',
    fileSize: 10240,
    mimeType: 'application/pdf',
    extractedTextLength: 450,
    extractedData: {
      name: 'Integration Test User',
      technicalSkills: ['JavaScript', 'React', 'Node.js'],
      education: [{ degree: 'BS Computer Science', institution: 'State University' }],
    },
    overallScore: 84,
    scoreBreakdown: {
      completeness: 85,
      skillsRelevance: 80,
      experienceDescriptions: 85,
      readabilityStructure: 86,
      summary: 'Automated test record',
    },
    strengths: ['Strong technical foundations in MERN stack.'],
    improvementAreas: ['Add quantifiable project outcomes.'],
    atsRecommendations: ['Standardize heading typography.'],
    jobMatch: {
      targetRole: 'Full Stack Engineer',
      skillCoverageScore: 80,
      matchedSkills: ['JavaScript', 'React', 'Node.js'],
      missingSkills: ['Kubernetes'],
    },
  });

  const saved = await testRecord.save();
  assert(Boolean(saved._id), 'Successfully persisted test Analysis record to MongoDB');

  // Retrieve by ID
  const fetchSavedRes = await makeRequest(`/api/analysis/${saved._id}`);
  assert(
    fetchSavedRes.status === 200 && fetchSavedRes.data.data.originalFilename === 'test-verification-resume.pdf',
    'GET /api/analysis/:id retrieves persisted record with exact fields'
  );

  // Check presence in history
  const historyAfterSaveRes = await makeRequest('/api/analysis/history');
  const foundInHistory = historyAfterSaveRes.data.data.some((item) => String(item._id) === String(saved._id));
  assert(foundInHistory, 'Newly saved record is indexed and visible in shared history');

  // Delete by ID
  const deleteRes = await makeRequest(`/api/analysis/${saved._id}`, { method: 'DELETE' });
  assert(deleteRes.status === 200 && deleteRes.data.success === true, 'DELETE /api/analysis/:id removes record successfully');

  // Confirm deleted record no longer exists
  const fetchDeletedRes = await makeRequest(`/api/analysis/${saved._id}`);
  assert(fetchDeletedRes.status === 404, 'Deleted record returns 404 Not Found upon subsequent query');

  // ---------------------------------------------------------
  // Cleanup & Teardown
  // ---------------------------------------------------------
  server.close();
  await mongoose.disconnect();

  // Clean up temporary test files
  try {
    fs.rmSync(testPdfDir, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }

  console.log('\n========================================');
  console.log(`   Tests Completed: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
};

runAllTests().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
