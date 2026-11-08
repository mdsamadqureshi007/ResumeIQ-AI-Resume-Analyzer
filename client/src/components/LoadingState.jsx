import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, FileSearch, BrainCircuit, BarChart3 } from 'lucide-react';

const steps = [
  { label: 'Reading and extracting document text from file...', icon: FileSearch },
  { label: 'Analyzing content with Google Gemini AI...', icon: BrainCircuit },
  { label: 'Auditing skills, experience, and ATS compatibility...', icon: Sparkles },
  { label: 'Computing deterministic scores and recommendations...', icon: BarChart3 },
];

const LoadingState = ({ message = 'Analyzing your resume with Gemini AI...' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md max-w-xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
      {/* Animated Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">{message}</h3>
        <p className="text-sm text-slate-500">
          This typically takes 4–10 seconds as our backend extracts text and conducts semantic evaluation.
        </p>
      </div>

      {/* Step Progress Sequence */}
      <div className="text-left space-y-3.5 max-w-md mx-auto pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-sm'
                  : isDone
                  ? 'bg-slate-50 text-slate-700'
                  : 'opacity-40 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs sm:text-sm font-medium leading-tight">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400">
        Google Gemini AI is processing your document securely on the Express server.
      </p>
    </div>
  );
};

export default LoadingState;
