import React from 'react';
import { HelpCircle, Award, CheckCircle } from 'lucide-react';

const getScoreTier = (score) => {
  if (score >= 85) {
    return {
      label: 'Exceptional',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      strokeColor: '#10b981',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      description: 'Your resume shows strong organization, clear qualifications, and impactful experience phrasing.',
    };
  }
  if (score >= 70) {
    return {
      label: 'Job-Ready',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      strokeColor: '#2563eb',
      badgeBg: 'bg-blue-100 text-blue-800',
      description: 'Solid foundation with good technical coverage. Targeted refinements can make it stand out even further.',
    };
  }
  if (score >= 50) {
    return {
      label: 'Needs Refinement',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      strokeColor: '#f59e0b',
      badgeBg: 'bg-amber-100 text-amber-800',
      description: 'Foundational elements exist, but several sections require deeper descriptions, clearer metrics, or skill alignment.',
    };
  }
  return {
    label: 'Critical Gaps',
    textColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    strokeColor: '#f43f5e',
    badgeBg: 'bg-rose-100 text-rose-800',
    description: 'Significant sections, details, or keywords are missing. Review the feedback below to rebuild key sections.',
  };
};

const ScoreCard = ({ score = 0, summary = '' }) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const tier = getScoreTier(normalizedScore);

  // SVG circular gauge math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
      {/* Circular Score Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-slate-100"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={tier.strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${tier.textColor}`}>
            {normalizedScore}
          </span>
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      {/* Score Context and Breakdown Narrative */}
      <div className="flex-1 space-y-3 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Quality Score
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tier.badgeBg}`}>
            {tier.label}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
          {normalizedScore >= 70 ? 'Strong Candidate Presentation' : 'Actionable Improvements Needed'}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">
          {tier.description}
        </p>

        {/* Scoring Methodology Note */}
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Scoring Methodology:</strong> Weighted composite score evaluated across Completeness (25%), Skills Relevance (30%), Experience Descriptions (25%), and Readability & Structure (20%).
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
