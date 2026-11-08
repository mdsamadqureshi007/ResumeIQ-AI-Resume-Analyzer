import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Printer,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
} from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import ScoreChart from '../components/ScoreChart';
import SkillBadge from '../components/SkillBadge';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { getAnalysisById } from '../services/api';

const AnalysisResults = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalysisById(id);
      if (response && response.success && response.data) {
        setAnalysis(response.data);
      } else {
        throw new Error('Analysis record not found or returned empty data.');
      }
    } catch (err) {
      console.error('Error fetching analysis details:', err);
      setError(err.message || 'Unable to load analysis results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 px-4">
        <LoadingState message="Retrieving analysis report..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 space-y-6">
        <ErrorMessage
          title="Analysis Not Found"
          message={error || 'The requested analysis record does not exist or may have been deleted.'}
          onRetry={fetchAnalysis}
        />
        <div className="text-center pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze a New Resume
          </Link>
        </div>
      </div>
    );
  }

  const {
    originalFilename,
    overallScore,
    scoreBreakdown,
    extractedData = {},
    strengths = [],
    improvementAreas = [],
    atsRecommendations = [],
    bulletPointImprovements = [],
    jobDescription,
    jobMatch,
    createdAt,
  } = analysis;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Top Bar with Navigation and Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/analyze" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Analyzer
            </Link>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            {extractedData.name ? `${extractedData.name}'s Resume Analysis` : originalFilename}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Original document: <span className="font-medium text-slate-700">{originalFilename}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Report
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Another
          </Link>
        </div>
      </div>

      {/* 1. Overall Score & 2. Quality Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <ScoreCard score={overallScore} summary={scoreBreakdown?.summary} />
        </div>
        <div className="lg:col-span-7">
          <ScoreChart breakdown={scoreBreakdown} />
        </div>
      </div>

      {/* Job Description Matching Section */}
      {jobMatch ? (
        <section className="bg-white rounded-2xl border border-blue-200/90 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                  Job Match Diagnostics
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Target Role: {jobMatch.targetRole || 'Identified Position'}
                </h3>
              </div>
            </div>

            {/* Deterministic Skill Coverage Badge */}
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200/80 px-4 py-2 rounded-xl self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider block">
                  Skill Coverage
                </span>
                <span className="text-xs text-slate-500">
                  {jobMatch.matchedSkills?.length || 0} of {((jobMatch.matchedSkills?.length || 0) + (jobMatch.missingSkills?.length || 0))} skills
                </span>
              </div>
              <div className="text-2xl font-black text-violet-700">
                {jobMatch.skillCoverageScore}%
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
            <strong>Formula & Interpretation:</strong> Skill Coverage is calculated deterministically as{' '}
            <code className="text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              (Matched Required Skills ÷ Total Identified Required Skills) × 100
            </code>
            . Skill coverage reflects keyword and capability alignment with the job description and is distinct from the probability of getting hired.
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Matched Required Skills ({jobMatch.matchedSkills?.length || 0})
              </h4>
              {jobMatch.matchedSkills && jobMatch.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobMatch.matchedSkills.map((skill, idx) => (
                    <SkillBadge key={idx} name={skill} variant="matched" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No exact skill matches identified from the job post.</p>
              )}
            </div>

            {/* Missing Required Skills */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Missing Required Skills ({jobMatch.missingSkills?.length || 0})
              </h4>
              {jobMatch.missingSkills && jobMatch.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobMatch.missingSkills.map((skill, idx) => (
                    <SkillBadge key={idx} name={skill} variant="missing" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 italic">Great news! No critical required skills were missing.</p>
              )}
            </div>
          </div>

          {/* Partially Demonstrated Skills */}
          {jobMatch.partiallyDemonstratedSkills && jobMatch.partiallyDemonstratedSkills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Partially Demonstrated Skills ({jobMatch.partiallyDemonstratedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {jobMatch.partiallyDemonstratedSkills.map((skill, idx) => (
                  <SkillBadge key={idx} name={skill} variant="partial" />
                ))}
              </div>
            </div>
          )}

          {/* Relevant Projects & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {jobMatch.relevantProjects && jobMatch.relevantProjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Relevant Projects Supporting This Role
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {jobMatch.relevantProjects.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {jobMatch.recommendations && jobMatch.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Role-Specific Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {jobMatch.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Keywords extracted from Job Description */}
          {jobMatch.keywordsFound && jobMatch.keywordsFound.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Keywords Extracted from Job Post
              </span>
              <div className="flex flex-wrap gap-1.5">
                {jobMatch.keywordsFound.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Explanatory Banner When No Job Description was provided */
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">No Job Description Provided</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              General resume-quality evaluation was performed. To see deterministic skill coverage percentage, identify missing required skills, and receive role-specific tailoring recommendations, paste a job description when running an analysis.
            </p>
          </div>
        </div>
      )}

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Key Resume Strengths</h3>
              <p className="text-xs text-slate-500">Grounded strictly in the uploaded resume</p>
            </div>
          </div>

          <ul className="space-y-3">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Improvement Areas */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Areas for Improvement</h3>
              <p className="text-xs text-slate-500">Specific gaps and actionable refinements</p>
            </div>
          </div>

          <ul className="space-y-3">
            {improvementAreas.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs sm:text-sm text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ATS-Friendly Recommendations */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ATS Compliance & Scannability Guidance</h3>
              <p className="text-xs text-slate-500">Structural recommendations for Applicant Tracking Systems</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Best-practice guidance (Non-proprietary)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {atsRecommendations.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Improved Bullet Points Comparison */}
      {bulletPointImprovements && bulletPointImprovements.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-bold text-slate-900">Suggested Bullet Point Improvements</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rewritten to demonstrate stronger action verbs and clarity without fabricating unmentioned qualifications or metrics.
            </p>
          </div>

          <div className="space-y-6">
            {bulletPointImprovements.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden text-xs sm:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {/* Original Bullet */}
                  <div className="p-4 bg-slate-50/80 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span> Original Phrasing
                    </span>
                    <p className="text-slate-700 leading-relaxed italic">
                      "{item.original}"
                    </p>
                  </div>

                  {/* Improved Bullet */}
                  <div className="p-4 bg-emerald-50/30 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Strengthened Version
                    </span>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      "{item.improved}"
                    </p>
                  </div>
                </div>

                {item.reason && (
                  <div className="bg-white px-4 py-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Rationale:</strong> {item.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extracted Resume Information Overview */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Extracted Resume Information
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Verified structured data extracted from the document text
          </p>
        </div>

        {/* Technical Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Technical & Professional Skills ({extractedData.technicalSkills?.length || 0})
          </h4>
          {extractedData.technicalSkills && extractedData.technicalSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {extractedData.technicalSkills.map((skill, idx) => (
                <SkillBadge key={idx} name={skill} variant="tech" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No explicit technical skills list detected.</p>
          )}
        </div>

        {/* Experience Section */}
        {extractedData.experience && extractedData.experience.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Experience & Internships ({extractedData.experience.length})
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {extractedData.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900">{exp.role}</h5>
                    <span className="text-xs text-slate-500 font-medium">{exp.duration}</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    {exp.company}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pt-1">
                      {exp.achievements.map((ach, aIdx) => (
                        <li key={aIdx}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Projects Two-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Education */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Education ({extractedData.education?.length || 0})
            </h4>
            {extractedData.education && extractedData.education.length > 0 ? (
              <div className="space-y-2.5">
                {extractedData.education.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    {edu.year && <div className="text-slate-400 text-[11px]">{edu.year}</div>}
                    {edu.details && <div className="text-slate-500">{edu.details}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No explicit education details found.</p>
            )}
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Projects ({extractedData.projects?.length || 0})
            </h4>
            {extractedData.projects && extractedData.projects.length > 0 ? (
              <div className="space-y-2.5">
                {extractedData.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-slate-600">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific projects identified.</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        {extractedData.certifications && extractedData.certifications.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-500" />
              Certifications & Credentials ({extractedData.certifications.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {extractedData.certifications.map((cert, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
        <Link to="/history" className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> View Analysis History
        </Link>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors"
        >
          Analyze Another Resume
        </Link>
      </div>
    </div>
  );
};

export default AnalysisResults;
