import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

const ErrorMessage = ({ title = 'Analysis Failed', message, onRetry, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm text-rose-900 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-950">{title}</h4>
          <p className="text-xs sm:text-sm text-rose-800 leading-relaxed whitespace-pre-line">
            {message}
          </p>

          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-3 pt-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-xs font-medium text-rose-700 hover:text-rose-950 underline underline-offset-2 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-700 p-1 rounded-lg transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
