import React from 'react';
import { Check, X, AlertTriangle, Tag } from 'lucide-react';

const SkillBadge = ({ name, variant = 'neutral', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size] || 'text-xs px-3 py-1 gap-1.5';

  const variantStyles = {
    matched: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/60',
      icon: <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
    },
    missing: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/60',
      icon: <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
    },
    partial: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/60',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/70',
      icon: null,
    },
    tech: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100/60',
      icon: <Tag className="w-3 h-3 text-blue-500 shrink-0" />,
    },
  }[variant] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border transition-colors ${sizeClasses} ${variantStyles.bg}`}
    >
      {variantStyles.icon}
      <span className="truncate max-w-[200px] sm:max-w-none">{name}</span>
    </span>
  );
};

export default SkillBadge;
