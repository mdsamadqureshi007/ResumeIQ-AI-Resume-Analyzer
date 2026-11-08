# ResumeIQ — AI-Powered Resume Analyzer

An intelligent, full-stack web application built using the **MERN stack** (MongoDB, Express.js, React with Vite, Node.js) and the official **Google Gemini API** (`@google/genai` SDK) that performs real-time resume parsing, ATS scannability audits, transparent multidimensional scoring, and deterministic job-description skill matching.

---

## Table of Contents

1. [Project Title](#1-project-title)
2. [Project Overview](#2-project-overview)
3. [Objectives](#3-objectives)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Application Workflow](#7-application-workflow)
8. [Frontend Folder Structure](#8-frontend-folder-structure)
9. [Backend Folder Structure](#9-backend-folder-structure)
10. [Installation Requirements](#10-installation-requirements)
11. [Frontend Setup](#11-frontend-setup)
12. [Backend Setup](#12-backend-setup)
13. [MongoDB Configuration](#13-mongodb-configuration)
14. [Gemini API Setup](#14-gemini-api-setup)
15. [Environment Variables](#15-environment-variables)
16. [Resume Parsing Implementation](#16-resume-parsing-implementation)
17. [AI Prompt and Structured Response Handling](#17-ai-prompt-and-structured-response-handling)
18. [Scoring Methodology and Weights](#18-scoring-methodology-and-weights)
19. [Job-Description Matching Algorithm](#19-job-description-matching-algorithm)
20. [MongoDB Schema and Data Storage](#20-mongodb-schema-and-data-storage)
21. [API Endpoints, Methods, and Expected Responses](#21-api-endpoints-methods-and-expected-responses)
22. [Error Handling and Validation](#22-error-handling-and-validation)
23. [Security Considerations](#23-security-considerations)
24. [Data Retention and Deletion Behavior](#24-data-retention-and-deletion-behavior)
25. [Testing Instructions](#25-testing-instructions)
26. [Common Errors and Troubleshooting](#26-common-errors-and-troubleshooting)
27. [Known Limitations](#27-known-limitations)
28. [Future Enhancements](#28-future-enhancements)

---

## 1. Project Title

**ResumeIQ: AI-Powered Resume Analyzer**

---

## 2. Project Overview

ResumeIQ is a modern, responsive web application engineered to eliminate guesswork from career applications. By combining binary document text extraction (PDF & DOCX) with Google's Gemini 2.5 Flash model and deterministic JavaScript evaluation, ResumeIQ provides candidates with immediate, honest, and actionable feedback.

The application operates **without user registration, login forms, or authentication barriers**. Resumes are processed immediately upon upload, evaluated against industry best practices and optional job descriptions, and displayed on an intuitive dashboard.

---

## 3. Objectives

- **Frictionless Usability:** Enable candidates to analyze resumes instantly without passwords, sign-up forms, or account management.
- **Genuine Document Processing:** Extract real text streams directly from PDF and DOCX files rather than sending filenames or synthetic placeholders.
- **Transparent Diagnostics:** Provide clear, documented scoring weights rather than opaque proprietary black-box figures.
- **Deterministic Job Alignment:** Calculate exact skill match percentages using backend JavaScript calculations while utilizing Gemini for semantic extraction.
- **Responsible Privacy & Safety:** Treat uploaded resumes as untrusted input, enforce prompt-injection protections, delete temporary files immediately after text parsing, and support voluntary record deletion.

---

## 4. Key Features

- **Document Ingestion:** Drag-and-drop or file browser upload for `.pdf` and `.docx` files (up to 5 MB).
- **Text Stream Extraction:** Native text parsing via `pdf-parse` and `mammoth`, complete with whitespace normalization and scanned document detection (honest OCR disclaimer).
- **Overall Resume Score (0–100):** Visualized via a circular gauge color-coded across four performance tiers (Exceptional, Job-Ready, Needs Refinement, Critical Gaps).
- **Four-Dimension Quality Breakdown:**
  - *Completeness (25%)*
  - *Skills Relevance (30%)*
  - *Experience Impact (25%)*
  - *Readability & Layout (20%)*
- **Grounded Strengths & Actionable Improvements:** Specific points extracted directly from candidate content without fabricating qualifications.
- **ATS Scannability Guidance:** Practical recommendations for layout, headers, and keyword placement.
- **Bullet Point Rewriting:** Side-by-side comparison of original bullet points with strengthened, action-oriented versions without inventing metrics.
- **Job Description Matching:**
  - Deterministic skill coverage percentage: `(Matched Required Skills / Total Identified Required Skills) × 100`
  - Visual categorization: Matched skills (green), Missing skills (rose), Partially demonstrated skills (amber)
  - Extracted job keywords and tailored project recommendations
- **Analysis History:** Instance-wide MongoDB history allowing users to review prior reports or delete individual records.

---

## 5. Technology Stack

### Frontend
- **Framework:** React 19 (via Vite 8)
- **Language:** JavaScript & JSX (Strictly no TypeScript)
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router v7 (`react-router-dom`)
- **HTTP Client:** Axios
- **Iconography:** Lucide React
- **Data Visualization:** Recharts (Horizontal bar chart)

### Backend
- **Runtime:** Node.js (v24+)
- **Server Framework:** Express.js (v5)
- **Database:** MongoDB & Mongoose (v9)
- **File Uploads:** Multer (with disk storage and guaranteed cleanup)
- **PDF Extraction:** `pdf-parse` (v2)
- **DOCX Extraction:** `mammoth` (v1)
- **AI Integration:** Official `@google/genai` JavaScript SDK (v2)
- **Environment Management:** `dotenv`
- **Rate Limiting:** `express-rate-limit`
- **CORS:** `cors`

---

## 6. System Architecture

```
[ Candidate / Browser ]
        │
        ├── (1) Upload PDF/DOCX & Job Description (multipart/form-data)
        ▼
[ Express.js REST API (Port 5000) ]
        │
        ├── (2) Multer saves file to /uploads/temp/
        ├── (3) resumeParser.js extracts raw text (pdf-parse / mammoth)
        ├── (4) Temporary file deleted from disk (finally block)
        │
        ├── (5) Untrusted text formatted into structured prompt
        ├── (6) geminiService.js calls Google Gemini 2.5 via @google/genai
        ├── (7) Gemini returns structured JSON evaluation
        │
        ├── (8) scoringService.js calculates deterministic scores & coverage
        ├── (9) Analysis.js model stores results in MongoDB
        │
        ▼ (10) JSON Response sent to React Client
[ React 19 Dashboard (Port 5173) ]
        │
        ├── Circular Score Gauge
        ├── Recharts Quality Breakdown
        ├── Job Coverage Badges
        └── Bullet Point Rewrites
```

---

## 7. Application Workflow

1. **User Landing:** User opens the application at `http://localhost:5173/` and clicks "Analyze My Resume".
2. **File Selection:** User selects or drops a `.pdf` or `.docx` file into the upload zone. File extension and size (≤ 5MB) are validated on the client.
3. **Optional Job Description:** User can paste a target job posting into the text area.
4. **Backend Processing:**
   - Multer receives the multipart upload and stores it in `uploads/temp/`.
   - `resumeParser` reads the file buffer, extracts raw text, normalizes whitespace, and checks for empty/scanned content.
   - The temporary file is permanently deleted from disk.
   - If extracted text contains fewer than 40 alphanumeric characters, an HTTP 422 error is returned explaining that scanned PDFs requiring OCR are not supported.
5. **AI Extraction & Semantic Audit:**
   - The backend prepares a sanitized prompt instructing Gemini to treat the resume as untrusted data.
   - `@google/genai` invokes the configured Gemini model (`gemini-2.5-flash`).
   - The response is parsed with markdown code fence removal and schema validation.
6. **Deterministic Scoring:**
   - Section completeness is deterministically evaluated.
   - If a job description was provided, the skill coverage score is calculated: `(matched.length / required.length) * 100`.
   - Overall score is calculated using the weighted 25/30/25/20 formula.
7. **Database Storage:** Results are saved to MongoDB in the `analyses` collection.
8. **Results Display:** The client receives the saved record and navigates to `/results/:id`.
9. **Shared History:** Past reports are browsable and manageable at `/history`.

---

## 8. Frontend Folder Structure

```
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ErrorMessage.jsx      # Reusable error alert with retry & dismiss
│   │   ├── LoadingState.jsx      # Multi-step progress animation
│   │   ├── Navbar.jsx            # Responsive header with desktop/mobile navigation
│   │   ├── ResumeUploader.jsx    # Drag-and-drop file upload with validation
│   │   ├── ScoreCard.jsx         # Circular SVG score visualization
│   │   ├── ScoreChart.jsx        # Recharts horizontal bar & weighted dimension cards
│   │   └── SkillBadge.jsx        # Badges for matched, missing, and partial skills
│   ├── pages/
│   │   ├── AnalysisHistory.jsx   # Shared analysis history table with delete modal
│   │   ├── AnalysisResults.jsx   # Comprehensive analysis dashboard
│   │   ├── AnalyzeResume.jsx     # Primary upload & job description form
│   │   └── Landing.jsx           # Landing page with hero, mockup preview, & 3-step guide
│   ├── services/
│   │   └── api.js                # Axios HTTP client with interceptors and endpoints
│   ├── App.jsx                   # React Router route configuration
│   ├── index.css                 # Tailwind CSS v4 directives and base typography
│   └── main.jsx                  # React application entry point
├── index.html                    # HTML shell with fonts and metadata
├── package.json                  # Frontend dependencies and scripts
└── vite.config.js                # Vite configuration with Tailwind plugin & API proxy
```

---

## 9. Backend Folder Structure

```
server/
├── config/
│   └── db.js                     # Mongoose connection with error handling
├── controllers/
│   ├── analysisController.js     # Resume upload, parsing, AI calling, and record fetch
│   └── historyController.js      # History retrieval and record deletion
├── middleware/
│   ├── errorMiddleware.js        # Centralized 404 and global error handlers
│   └── uploadMiddleware.js       # Multer configuration and temp file cleanup
├── models/
│   └── Analysis.js               # Mongoose schema for resume analysis records
├── routes/
│   └── analysisRoutes.js         # REST endpoints with rate limiting
├── services/
│   ├── geminiService.js          # Google Gemini integration via @google/genai
│   ├── resumeParser.js           # PDF & DOCX text extraction and normalization
│   └── scoringService.js         # Transparent scoring and skill coverage calculation
├── tests/
│   └── verifyAll.js              # Comprehensive 29-test automated test suite
├── utils/
│   └── validation.js             # ObjectId, file metadata, and JD sanitization
├── .env                          # Local environment variables (gitignored)
├── .env.example                  # Template for environment variables
├── app.js                        # Express app initialization, CORS, and middleware
├── package.json                  # Backend dependencies and scripts
└── server.js                     # HTTP server startup and graceful shutdown
```

---

## 10. Installation Requirements

Before installing, ensure your environment meets these requirements:

- **Node.js:** v18.0.0 or higher (v24+ recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** A locally running MongoDB instance (e.g. `mongodb://127.0.0.1:27017`) or a MongoDB Atlas cluster URI.
- **Google Gemini API Key:** An API key obtained from [Google AI Studio](https://aistudio.google.com/).

---

## 11. Frontend Setup

1. Open a terminal in the root directory and navigate to `client`:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the frontend at `http://localhost:5173`.

---

## 12. Backend Setup

1. Open a terminal in the root directory and navigate to `server`:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```
4. Start the Express server:
   ```bash
   npm start
   ```
5. The API is accessible at `http://localhost:5000` with the health check at `http://localhost:5000/api/health`.

---

## 13. MongoDB Configuration

1. **Local MongoDB:** Ensure the MongoDB service is active. On Windows:
   ```powershell
   Get-Service -Name "*mongo*"
   ```
   Or start the MongoDB daemon directly:
   ```bash
   mongod --dbpath <path-to-data-directory>
   ```
2. **MongoDB URI:** Configure `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/resumeiq
   ```
3. **MongoDB Atlas (Cloud):** Replace the URI with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resumeiq?retryWrites=true&w=majority
   ```

---

## 14. Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account and click **Get API key**.
3. Generate a new API key for your project.
4. Add the key to `server/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```
5. Select a model name in `server/.env` (default is `gemini-3-flash-preview`):
   ```env
   GEMINI_MODEL=gemini-3-flash-preview
   ```

> [!NOTE]
> Usage limits, rate limits, and billing tiers depend on your Google AI account. The application handles `429 (Resource Exhausted)` and `401 (Invalid Key)` gracefully by surfacing clear messages to the UI.

---

## 15. Environment Variables

### Backend Configuration (`server/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/resumeiq` | MongoDB connection string. |
| `GEMINI_API_KEY` | *(Required)* | Google Gemini API key. |
| `GEMINI_MODEL` | `gemini-3-flash-preview` | Gemini model identifier. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS frontend origin. |
| `NODE_ENV` | `development` | Runtime environment (`development` or `production`). |

---

## 16. Resume Parsing Implementation

Implemented in `server/services/resumeParser.js`:

- **PDF Documents:** Uses `pdf-parse` v2 to extract text strings across all document pages.
- **DOCX Documents:** Uses `mammoth` to extract raw paragraph text from Word OpenXML archives.
- **Normalization:** Cleans extra spaces, tabs, and carriage returns, and collapses excessive newlines into clean section breaks.
- **Scanned Document Detection:** Counts total alphanumeric characters. If fewer than 40 characters exist, the parser rejects the document with HTTP 422:
  ```
  The uploaded document contains no extractable text. Scanned resumes or image-only documents require Optical Character Recognition (OCR), which is not supported in this version. Please upload a standard text-based PDF or DOCX resume.
  ```
- **Text Length Cap:** Extracted text is clamped to 50,000 characters to safeguard against denial-of-service or token exhaustion attacks.

---

## 17. AI Prompt and Structured Response Handling

Implemented in `server/services/geminiService.js`:

- **SDK:** Uses the official `@google/genai` package:
  ```javascript
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  ```
- **Untrusted Input Protection:** The prompt explicitly instructs Gemini to treat resume text as untrusted data, ignoring embedded prompt injections or attempts to alter scoring parameters.
- **Structured JSON Mode:** Enforces strict JSON output containing extracted candidate details, four qualitative dimension assessments, strengths, improvement areas, ATS recommendations, bullet rewrites, and job matching details.
- **Safe Parsing & Validation:**
  - `safeJsonParse()` removes markdown code block delimiters (` ```json `) and falls back to regex matching if extra commentary wraps the JSON.
  - `validateAiResponse()` ensures all expected arrays and objects are present, clamps scores to [0, 100], and prevents malformed AI responses from breaking the client.

---

## 18. Scoring Methodology and Weights

Implemented in `server/services/scoringService.js`:

The Overall Resume Score is computed out of 100 using four transparent, documented weights:

$$\text{Overall Score} = \text{round}\Big(0.25 \times C + 0.30 \times S + 0.25 \times E + 0.20 \times R\Big)$$

Where:
1. **Completeness ($C$ — 25%):** Evaluates the presence of essential resume sections: contact identity, education, technical skills, projects, and work experience.
2. **Skills Relevance ($S$ — 30%):** Assesses the breadth, depth, and modern industry relevance of listed capabilities. When a job description is supplied, this incorporates the deterministic skill coverage ratio.
3. **Experience Impact ($E$ — 25%):** Measures action-verb orientation, specificity of scope, and quantified achievements.
4. **Readability & Layout ($R$ — 20%):** Evaluates structural flow, bullet scannability, and heading organization.

> [!NOTE]
> These weights represent project-defined quality metrics designed to guide resume improvements; they are not intended as predictive guarantees of hiring outcomes.

---

## 19. Job-Description Matching Algorithm

When a job description is provided, the backend computes an objective skill coverage score in JavaScript:

$$\text{Skill Coverage Score} = \text{round}\left(\frac{\text{Matched Required Skills}}{\text{Total Identified Required Skills}} \times 100\right)$$

- **Role Identification:** Gemini extracts the target role title from the job post.
- **Requirement Extraction:** All hard and soft skills requested by the employer are identified as `identifiedRequiredSkills`.
- **Semantic Comparison:** Gemini classifies candidate skills into:
  - `matchedSkills`: Fully demonstrated in the resume.
  - `missingSkills`: Required by the job description but absent from the resume.
  - `partiallyDemonstratedSkills`: Mentioned tangentially or without depth.
- **Deterministic Calculation:** The final percentage score is computed directly in backend JavaScript, clamped to $[0, 100]$.

---

## 20. MongoDB Schema and Data Storage

The `Analysis` model (`server/models/Analysis.js`) stores the following fields:

```javascript
{
  originalFilename: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  extractedTextLength: { type: Number, default: 0 },
  extractedData: {
    name: String,
    email: String,
    phone: String,
    education: [{ institution: String, degree: String, year: String, details: String }],
    technicalSkills: [String],
    projects: [{ title: String, description: String, technologies: [String], link: String }],
    experience: [{ company: String, role: String, duration: String, description: String, achievements: [String] }],
    certifications: [String]
  },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: {
    completeness: Number,
    skillsRelevance: Number,
    experienceDescriptions: Number,
    readabilityStructure: Number,
    summary: String
  },
  strengths: [String],
  improvementAreas: [String],
  atsRecommendations: [String],
  bulletPointImprovements: [{
    original: String,
    improved: String,
    reason: String
  }],
  jobDescription: { type: String, default: null },
  jobMatch: {
    targetRole: String,
    skillCoverageScore: Number,
    matchedSkills: [String],
    missingSkills: [String],
    partiallyDemonstratedSkills: [String],
    relevantProjects: [String],
    recommendations: [String],
    keywordsFound: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 21. API Endpoints, Methods, and Expected Responses

### 1. `GET /api/health`
Checks server health, MongoDB connection state, and Gemini configuration.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "ResumeIQ API",
    "uptime": 120,
    "timestamp": "2026-10-20T14:00:00.000Z",
    "database": "connected",
    "geminiConfigured": true,
    "model": "gemini-2.5-flash"
  }
  ```

### 2. `POST /api/analysis/analyze`
Uploads a resume file with an optional job description.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `resume`: File (`.pdf` or `.docx`, max 5MB)
  - `jobDescription`: String (optional, max 20,000 characters)
- **Rate Limit:** 25 requests per 15-minute window per IP.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": { "_id": "67150c...", "overallScore": 84, ... },
    "message": "Resume analyzed successfully."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: No file attached, file format unsupported, or file exceeds 5MB.
  - `422 Unprocessable Entity`: Scanned document containing no extractable text.
  - `429 Too Many Requests`: Rate limit or Gemini quota exceeded.
  - `503 Service Unavailable`: Gemini API key missing or unconfigured.

### 3. `GET /api/analysis/history`
Returns recent analysis records for the shared instance.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "67150c...",
        "originalFilename": "alex_johnson_resume.pdf",
        "fileSize": 145020,
        "overallScore": 88,
        "jobMatch": { "targetRole": "Frontend Engineer", "skillCoverageScore": 80 },
        "createdAt": "2026-10-20T13:45:00.000Z"
      }
    ]
  }
  ```

### 4. `GET /api/analysis/:id`
Retrieves a specific analysis report by MongoDB ObjectId.
- **Response `200 OK`:** Returns full analysis document.
- **Error Responses:**
  - `400 Bad Request`: Invalid ObjectId format.
  - `404 Not Found`: Record not found.

### 5. `DELETE /api/analysis/:id`
Deletes an individual analysis record from the database.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Analysis record deleted successfully.",
    "deletedId": "67150c..."
  }
  ```

---

## 22. Error Handling and Validation

- **File Validation:** Validates MIME types (`application/pdf`, `.docx`) and file size limits (5 MB) on both client and server.
- **Document Readability:** Catches unreadable or password-protected files and returns clear, actionable error messages.
- **API Errors:** Normalizes upstream Gemini rate limits (`429`), invalid keys (`401`), and timeouts (`504`) into friendly messages.
- **Stack Trace Protection:** Production and development responses mask internal stack traces and server file paths.

---

## 23. Security Considerations

- **Prompt Injection Defense:** Resumes and job descriptions are treated as untrusted data. Explicit system prompts prevent embedded instructions from overriding evaluation tasks.
- **Secret Isolation:** The Gemini API key is stored exclusively in `server/.env` and is never exposed to the client bundle.
- **Strict Size Bounds:** Uploads are restricted to 5 MB; extracted text is capped at 50,000 characters; job descriptions are truncated to 20,000 characters.
- **Rate Limiting:** Protects the expensive Gemini endpoint against abusive request loops.
- **CORS Restrictions:** Restricts cross-origin requests to configured client domains.

---

## 24. Data Retention and Deletion Behavior

- **Zero Permanent File Storage:** Uploaded PDF and DOCX files are deleted from the server disk immediately after text extraction (in a guaranteed `finally` block).
- **Structured Data Only:** MongoDB stores only the extracted entities and evaluation scores needed to render dashboard reports.
- **User-Initiated Deletion:** Users can delete individual analysis records from the history page via a confirmation modal.
- **Shared Instance Disclaimer:** Because authentication is excluded, all records in MongoDB are visible to anyone accessing that specific instance. Users are warned against uploading sensitive personal data.

---

## 25. Testing Instructions

The project includes an automated test suite verifying scoring, document parsing, AI normalization, and live API endpoints.

To run the complete test suite:
```bash
cd server
npm test
```

### Verified Test Cases (29/29 Passing):
- **Scoring Service:** Deterministic completeness checks, skill coverage calculation ($3/5 \times 100 = 60\%$), boundary score clamping ($[0, 100]$).
- **Parser Service:** Whitespace normalization, text extraction from valid PDF, scanned document detection (422 OCR requirement error).
- **Validation:** Valid and invalid MongoDB ObjectIds, job description truncation at 20,000 characters.
- **Gemini Service:** Markdown code block stripping (` ```json `), fallback JSON extraction, score clamping, schema fallback.
- **Live API Endpoints:** `GET /api/health`, `GET /api/analysis/history`, 400 bad ID format, 404 non-existent record, model persistence in MongoDB, retrieval, and complete deletion lifecycle.

---

## 26. Common Errors and Troubleshooting

### 1. `Gemini API key is not configured` (503)
- **Cause:** `GEMINI_API_KEY` is missing or set to the placeholder in `server/.env`.
- **Solution:** Add your valid key from [Google AI Studio](https://aistudio.google.com/) to `server/.env` and restart the server.

### 2. `Scanned PDF or unreadable document detected` (422)
- **Cause:** The uploaded PDF is an image scan without an embedded digital text layer.
- **Solution:** Upload a digital text-based PDF or a `.docx` file (OCR is not supported in this version).

### 3. `Failed to connect to MongoDB`
- **Cause:** The MongoDB service is not running locally.
- **Solution:** Check Windows services (`Get-Service "*mongo*"`) or start your MongoDB daemon (`mongod`).

### 4. `Too many analysis requests submitted` (429)
- **Cause:** The IP-based rate limiter triggered after 25 requests in 15 minutes.
- **Solution:** Wait a few minutes or adjust the rate limit threshold in `server/routes/analysisRoutes.js`.

---

## 27. Known Limitations

- **No Optical Character Recognition (OCR):** Resumes created as flat images or scanned documents without selectable text cannot be parsed.
- **Shared History:** Without authentication or multi-tenant user accounts, analysis history is shared across the server instance.
- **Gemini Quota Constraints:** Free-tier Gemini API keys are subject to Google's requests-per-minute (RPM) limits.
- **Non-Proprietary ATS Guidance:** ATS recommendations are based on industry best practices and do not claim to reproduce proprietary scoring algorithms from Workday, Taleo, or Greenhouse.

---

## 28. Future Enhancements

- **Client-Side PDF Preview:** Side-by-side split screen showing the original document alongside the analysis report.
- **Target Role Auto-Suggestions:** Suggesting alternative career titles that match the candidate's existing skill set.
- **Exportable PDF Reports:** One-click generation of styled PDF audit summaries.
- **Optional Tesseract.js OCR:** Fallback optical character recognition for scanned resumes.
- **Keyword Density Heatmaps:** Visual highlight of high-frequency keywords found in matching job descriptions.
