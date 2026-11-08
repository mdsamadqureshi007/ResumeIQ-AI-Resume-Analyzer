import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CheckCircle2, BookOpen, Briefcase, FileCode2, Layers } from 'lucide-react';

const getColor = (value) => {
  if (value >= 80) return '#10b981'; // emerald
  if (value >= 65) return '#2563eb'; // blue
  if (value >= 50) return '#f59e0b'; // amber
  return '#f43f5e'; // rose
};

const ScoreChart = ({ breakdown = {} }) => {
  const categories = [
    {
      key: 'completeness',
      name: 'Completeness',
      score: breakdown.completeness ?? 75,
      weight: '25%',
      icon: Layers,
      description: 'Presence of standard sections: contact, education, skills, and experience.',
    },
    {
      key: 'skillsRelevance',
      name: 'Skills Relevance',
      score: breakdown.skillsRelevance ?? 70,
      weight: '30%',
      icon: FileCode2,
      description: 'Depth, breadth, and modern industry relevance of listed technical capabilities.',
    },
    {
      key: 'experienceDescriptions',
      name: 'Experience Impact',
      score: breakdown.experienceDescriptions ?? 70,
      weight: '25%',
      icon: Briefcase,
      description: 'Action-verb orientation, specificity of project scope, and quantifiable results.',
    },
    {
      key: 'readabilityStructure',
      name: 'Readability & Layout',
      score: breakdown.readabilityStructure ?? 80,
      weight: '20%',
      icon: BookOpen,
      description: 'Clean visual hierarchy, consistent formatting, and scannable bullet structure.',
    },
  ];

  const chartData = categories.map((cat) => ({
    name: cat.name,
    score: cat.score,
    weight: cat.weight,
    color: getColor(cat.score),
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Resume Quality Breakdown</h3>
          <p className="text-xs text-slate-500">
            Transparent breakdown across the 4 core dimensions that compose your overall score
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md self-start sm:self-auto">
          Weighted System
        </span>
      </div>

      {/* Recharts Graphical Overview */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
              width={120}
            />
            <Tooltip
              formatter={(value, name, item) => [`${value} / 100 (Weight: ${item.payload.weight})`, 'Score']}
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                border: 'none',
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const colorHex = getColor(cat.score);
          return (
            <div
              key={cat.key}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                      (Weight: {cat.weight})
                    </span>
                  </div>
                </div>
                <span
                  className="text-base font-bold"
                  style={{ color: colorHex }}
                >
                  {cat.score}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${cat.score}%`, backgroundColor: colorHex }}
                />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreChart;
