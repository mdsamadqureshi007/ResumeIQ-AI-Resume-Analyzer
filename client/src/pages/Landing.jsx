import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  BrainCircuit,
  Target,
  Award,
  ShieldCheck,
  Zap,
  BarChart2,
  CheckCircle,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

const Landing = () => {
  const scrollToFeatures = (e) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 text-center max-w-5xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Powered by Google Gemini 2.5 & Official @google/genai SDK</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-6">
          Your Resume.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Smarter. Stronger. Job-Ready.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
          Transform your resume with objective AI-powered diagnostics. Extract real document text from PDF and Word, measure ATS readability, pinpoint critical skill gaps, and match against specific job descriptions—all without signing up or creating an account.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <span>Analyze My Resume</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#features"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-base font-semibold shadow-xs transition-colors"
          >
            Explore Features
          </a>
        </div>

        <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          No account needed. Instant analysis. Document deleted immediately after parsing.
        </p>

        {/* Polished Preview of the Analysis Dashboard */}
        <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-slate-400 font-mono ml-2">resumeiq-dashboard-preview</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Mockup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Score Ring Mock */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full border-8 border-blue-600 border-t-emerald-500 flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-slate-900">88</span>
              </div>
              <span className="text-xs font-bold text-slate-800">Job-Ready Standing</span>
              <span className="text-[11px] text-slate-500 mt-1">Weighted Quality Score</span>
            </div>

            {/* Quality Breakdown Bars */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-800 block">Resume Quality Diagnostics</span>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Completeness (25%)</span>
                  <span className="text-emerald-600 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Skills Relevance (30%)</span>
                  <span className="text-blue-600 font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Experience Impact (25%)</span>
                  <span className="text-blue-600 font-bold">82%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Readability & Structure (20%)</span>
                  <span className="text-indigo-600 font-bold">90%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explanation of How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How ResumeIQ Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Three simple steps to uncover actionable insights and land your next role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center border border-blue-100">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">Upload Your Resume</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drag and drop your PDF or DOCX file. Optionally paste a job description to calculate role-specific skill alignment.
            </p>
            <div className="text-xs text-blue-600 font-medium">Text extraction via Node.js</div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 font-extrabold text-lg flex items-center justify-center border border-violet-100">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Semantic Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google Gemini evaluates experience wording, checks ATS compliance, and audits skills against current industry standards.
            </p>
            <div className="text-xs text-violet-600 font-medium">Powered by @google/genai</div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-lg flex items-center justify-center border border-emerald-100">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">Review & Optimize</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inspect your overall score, bullet point rewrites, missing skill tags, and tailored recommendations ready for immediate use.
            </p>
            <div className="text-xs text-emerald-600 font-medium">Actionable & Transparent</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Engineered for Precision & Clarity
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Built on a genuine full-stack architecture with no login barriers and transparent scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Real Document Parsing</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Processes actual binary text from PDF and DOCX files on the server using tested node parsing libraries, catching unreadable scans honestly.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Job Description Matching</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calculates deterministic skill coverage percentage in JavaScript and surfaces missing, matched, and partially demonstrated competencies.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Bullet Point Enhancements</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Provides side-by-side phrasing improvements using action verbs and strong clarity without fabricating credentials or unmentioned metrics.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Transparent Weighted Scores</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calculates quality based on documented weights: Completeness (25%), Skills (30%), Experience (25%), and Readability (20%).
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Zero Authentication Friction</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Open directly to analysis without logins, passwords, or registration. Review your analysis history right away.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Privacy & Clean Deletion</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Uploaded files are removed immediately from the disk after extraction. Delete any analysis record from history whenever you want.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to optimize your resume?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Get comprehensive quality scores, ATS recommendations, and role matching in seconds.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-colors"
          >
            Start Free Analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">ResumeIQ</span>
          <span>•</span>
          <span>AI-Powered Resume Analyzer</span>
        </div>
        <div className="text-center sm:text-right">
          <span>Unauthenticated workspace instance • Stored history is shared locally</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
