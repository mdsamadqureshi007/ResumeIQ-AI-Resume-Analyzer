import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Trash2,
  Eye,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getAnalysisHistory, deleteAnalysis } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteModal, setPendingDeleteModal] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalysisHistory();
      if (response && response.success && Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteModal) return;
    const idToDelete = pendingDeleteModal._id;
    setDeletingId(idToDelete);
    setPendingDeleteModal(null);

    try {
      await deleteAnalysis(idToDelete);
      // Remove from state immediately
      setHistory((prev) => prev.filter((item) => item._id !== idToDelete));
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(`Failed to delete record: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-8 h-8 text-blue-600" />
            Analysis History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and review past resume evaluations stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze New Resume
          </Link>
        </div>
      </div>

      {/* Unauthenticated Instance Notice */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800">Shared Instance Notice:</strong> Because this application operates without user authentication or login, all resume evaluations are stored in this shared database instance. Anyone with access to this deployed URL can view or delete these records. Avoid uploading sensitive personal identifiers.
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorMessage
          title="History Error"
          message={error}
          onRetry={fetchHistory}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-500">Loading analysis history...</p>
        </div>
      ) : history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Resume Analyses Yet</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You haven't analyzed any resumes in this instance yet. Upload your first PDF or DOCX resume to view deep diagnostics and scoring.
          </p>
          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Your First Resume
            </Link>
          </div>
        </div>
      ) : (
        /* History Grid / Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-bold">Document</th>
                  <th scope="col" className="px-6 py-3.5 font-bold">Analysis Date</th>
                  <th scope="col" className="px-6 py-3.5 font-bold">Resume Score</th>
                  <th scope="col" className="px-6 py-3.5 font-bold">Job Match</th>
                  <th scope="col" className="px-6 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const isBeingDeleted = deletingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isBeingDeleted ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      {/* Document info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/results/${item._id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 truncate block max-w-xs transition-colors"
                            >
                              {item.originalFilename}
                            </Link>
                            <span className="text-xs text-slate-400">
                              {formatFileSize(item.fileSize)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(
                            item.overallScore
                          )}`}
                        >
                          {item.overallScore} / 100
                        </span>
                      </td>

                      {/* Job Match Score */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.jobMatch && item.jobMatch.skillCoverageScore !== undefined && item.jobMatch.skillCoverageScore !== null ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-violet-700">
                              {item.jobMatch.skillCoverageScore}% Coverage
                            </span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {item.jobMatch.targetRole || 'Target Role'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            General Audit
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/results/${item._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                            title="View full report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteModal(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete this analysis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the analysis for{' '}
                <strong className="text-slate-900">{pendingDeleteModal.originalFilename}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingDeleteModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
