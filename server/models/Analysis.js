const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    year: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' },
  },
  { _id: false }
);

const ExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
    achievements: [{ type: String }],
  },
  { _id: false }
);

const BulletPointImprovementSchema = new mongoose.Schema(
  {
    original: { type: String, required: true },
    improved: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const JobMatchSchema = new mongoose.Schema(
  {
    targetRole: { type: String, default: '' },
    skillCoverageScore: { type: Number, min: 0, max: 100, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    partiallyDemonstratedSkills: [{ type: String }],
    relevantProjects: [{ type: String }],
    recommendations: [{ type: String }],
    keywordsFound: [{ type: String }],
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    extractedTextLength: {
      type: Number,
      default: 0,
    },
    extractedData: {
      name: { type: String, default: 'Candidate' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      education: [EducationSchema],
      technicalSkills: [{ type: String }],
      projects: [ProjectSchema],
      experience: [ExperienceSchema],
      certifications: [{ type: String }],
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      completeness: { type: Number, min: 0, max: 100, default: 0 },
      skillsRelevance: { type: Number, min: 0, max: 100, default: 0 },
      experienceDescriptions: { type: Number, min: 0, max: 100, default: 0 },
      readabilityStructure: { type: Number, min: 0, max: 100, default: 0 },
      summary: { type: String, default: '' },
    },
    strengths: [{ type: String }],
    improvementAreas: [{ type: String }],
    atsRecommendations: [{ type: String }],
    bulletPointImprovements: [BulletPointImprovementSchema],
    jobDescription: {
      type: String,
      default: null,
    },
    jobMatch: {
      type: JobMatchSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query of history sorted by creation date
AnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);
