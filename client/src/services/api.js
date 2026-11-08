import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s timeout for large PDF parsing + Gemini AI analysis
  headers: {
    'Accept': 'application/json',
  },
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'An unexpected error occurred while communicating with the server.';

    if (error.response) {
      // Backend returned an error response
      if (error.response.data && error.response.data.message) {
        customMessage = error.response.data.message;
      } else if (error.response.status === 404) {
        customMessage = 'The requested resource was not found.';
      } else if (error.response.status === 413) {
        customMessage = 'The uploaded file exceeds the maximum allowed size (5MB).';
      } else if (error.response.status === 429) {
        customMessage = 'Rate limit exceeded. Please wait a few moments before trying again.';
      } else if (error.response.status >= 500) {
        customMessage = 'Server error processing your request. Please try again.';
      }
    } else if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      customMessage = 'The request timed out. Analyzing this document with Google Gemini took longer than expected. Please try again.';
    } else if (error.request) {
      // Request was made but no response received (server down or network disconnect)
      customMessage = 'Unable to reach the backend server. Please verify the Express server is running on port 5000 (run `cd server && npm start`).';
    } else {
      customMessage = error.message;
    }

    const enhancedError = new Error(customMessage);
    enhancedError.status = error.response ? error.response.status : null;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

/**
 * Uploads a resume document and optional job description for analysis.
 */
export const analyzeResume = async (file, jobDescription = '', onUploadProgress = null) => {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobDescription && jobDescription.trim()) {
    formData.append('jobDescription', jobDescription.trim());
  }

  const response = await apiClient.post('/analysis/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

/**
 * Retrieves the full analysis record by ID.
 */
export const getAnalysisById = async (id) => {
  const response = await apiClient.get(`/analysis/${id}`);
  return response.data;
};

/**
 * Retrieves all stored analyses from history.
 */
export const getAnalysisHistory = async () => {
  const response = await apiClient.get('/analysis/history');
  return response.data;
};

/**
 * Deletes an analysis record by ID.
 */
export const deleteAnalysis = async (id) => {
  const response = await apiClient.delete(`/analysis/${id}`);
  return response.data;
};

/**
 * Checks server health and configuration status.
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
