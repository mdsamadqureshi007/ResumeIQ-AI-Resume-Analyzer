import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Briefcase, FileText, Info, HelpCircle } from 'lucide-react';
import ResumeUploader from '../components/ResumeUploader';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { analyzeResume } from '../services/api';

const AnalyzeResume = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleFileRemoved = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError({
        title: 'Missing File',
        message: 'Please select or drop a valid PDF or DOCX resume document before proceeding.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeResume(selectedFile, jobDescription);
      if (response && response.success && response.data && response.data._id) {
        // Navigate to the results page with the saved analysis ID
        navigate(`/results/${response.data._id}`);
      } else {
        throw new Error('Analysis completed but did not return a valid record identifier.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError({
        title: 'Analysis Failed',
        message: err.message || 'An unexpected error occurred while analyzing the resume.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6">
        <LoadingState message="Analyzing your resume with Google Gemini AI..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analyze Your Resume
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Upload your resume in PDF or DOCX format. Optionally paste a target job description to evaluate skill coverage and role-specific keywords.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorMessage
          title={error.title}
          message={error.message}
          onRetry={handleSubmit}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Upload Resume Document <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">PDF, DOCX (Max 5MB)</span>
          </div>

          <ResumeUploader
            selectedFile={selectedFile}
            onFileSelected={handleFileSelected}
            onFileRemoved={handleFileRemoved}
            disabled={isLoading}
          />

          <div className="text-xs text-slate-500 flex items-start gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Text is extracted directly from the file. Scanned images or password-protected files cannot be read without OCR.
            </span>
          </div>
        </div>

        {/* Job Description Card (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label htmlFor="jobDescription" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-600" />
              Target Job Description <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>
            <span className="text-xs text-slate-400">
              {jobDescription.length} / 20,000 characters
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Paste the complete job post or requirements. ResumeIQ will compute a deterministic Skill Coverage Score and highlight matched vs. missing qualifications.
          </p>

          <textarea
            id="jobDescription"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job title, responsibilities, and required qualifications here..."
            maxLength={20000}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans leading-relaxed"
          />

          {jobDescription.trim() && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="text-emerald-600 font-medium">
                ✓ Job matching enabled: Skill coverage and keyword analysis will be included.
              </span>
              <button
                type="button"
                onClick={() => setJobDescription('')}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                Clear description
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className={`w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold shadow-md transition-all duration-200 ${
              !selectedFile || isLoading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.01]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze Resume</span>
          </button>

          <p className="text-xs text-slate-400 text-center">
            No registration required. Analysis results are stored in local history.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AnalyzeResume;
