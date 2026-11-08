import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ResumeUploader = ({ selectedFile, onFileSelected, onFileRemoved, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateAndSelectFile = (file) => {
    setValidationError('');

    if (!file) return;

    // Check file extension
    const fileName = file.name || '';
    const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.docx'];

    if (!validExtensions.includes(fileExtension)) {
      setValidationError('Unsupported format. Please upload a PDF (.pdf) or Word (.docx) document.');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`File is too large (${formatFileSize(file.size)}). Maximum permitted size is 5 MB.`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleTriggerBrowse = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemoved();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        /* Dropzone area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerBrowse}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800">
                <span className="text-blue-600 underline underline-offset-2">Click to browse</span> or drag and drop your resume
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF and DOCX text documents (up to 5 MB)
              </p>
            </div>

            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <span>Text-based PDF</span>
              <span>•</span>
              <span>Word .docx</span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected file card */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatFileSize(selectedFile.size)} • {selectedFile.name.endsWith('.docx') ? 'DOCX Document' : 'PDF Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTriggerBrowse}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                title="Replace with another file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replace</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation error display */}
      {validationError && (
        <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{validationError}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
