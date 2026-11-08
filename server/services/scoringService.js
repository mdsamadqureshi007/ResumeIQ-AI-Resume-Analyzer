/**
 * Scoring Service for ResumeIQ
 *
 * Implements transparent, documented project scoring rules:
 * - Completeness: 25%
 * - Skills Relevance: 30%
 * - Project and Experience Descriptions: 25%
 * - Readability and Structure: 20%
 *
 * Job Match Skill Coverage Score:
 * (Matched required skills / Total identified required skills) * 100
 * (Calculated strictly in backend JavaScript)
 */

/**
 * Evaluates deterministic section completeness based on extracted entities.
 * Returns a score between 0 and 100.
 */
const evaluateDeterministicCompleteness = (extractedData) => {
  if (!extractedData) return 50;

  let points = 0;
  const maxPoints = 100;

  // Contact / Identity (20 pts)
  if (extractedData.name && extractedData.name !== 'Candidate') points += 10;
  if (extractedData.email || extractedData.phone) points += 10;

  // Education (20 pts)
  if (Array.isArray(extractedData.education) && extractedData.education.length > 0) {
    points += 20;
  }

  // Skills (25 pts)
  if (Array.isArray(extractedData.technicalSkills)) {
    const count = extractedData.technicalSkills.length;
    if (count >= 5) points += 25;
    else if (count >= 2) points += 15;
    else if (count >= 1) points += 8;
  }

  // Experience and Projects (25 pts)
  const expCount = Array.isArray(extractedData.experience) ? extractedData.experience.length : 0;
  const projCount = Array.isArray(extractedData.projects) ? extractedData.projects.length : 0;
  if (expCount > 0 && projCount > 0) points += 25;
  else if (expCount > 0 || projCount > 0) points += 18;

  // Certifications or additional depth (10 pts)
  if (Array.isArray(extractedData.certifications) && extractedData.certifications.length > 0) {
    points += 10;
  } else if (expCount >= 2 || projCount >= 2) {
    points += 5;
  }

  return Math.min(maxPoints, points);
};

/**
 * Calculates the deterministic Skill Coverage Score for job matching.
 */
const calculateSkillCoverageScore = (jobMatch) => {
  if (!jobMatch) return null;

  const required = Array.isArray(jobMatch.identifiedRequiredSkills) ? jobMatch.identifiedRequiredSkills : [];
  const matched = Array.isArray(jobMatch.matchedSkills) ? jobMatch.matchedSkills : [];

  if (required.length === 0) {
    // If no explicit required skills were extracted from the JD, default to 100 or neutral indicator
    return 100;
  }

  // Pure JavaScript deterministic calculation:
  // (Matched required skills / Total identified required skills) * 100
  const rawRatio = (matched.length / required.length) * 100;
  return Math.max(0, Math.min(100, Math.round(rawRatio)));
};

/**
 * Computes composite resume quality scores and breakdown.
 */
const calculateScores = (aiAnalysisResult, rawResumeText, jobDescription = '') => {
  const { extractedData, scoreAssessments, jobMatch } = aiAnalysisResult;

  // Deterministic checks
  const deterministicCompleteness = evaluateDeterministicCompleteness(extractedData);

  // Combine AI qualitative assessment with deterministic checks for completeness
  const aiCompleteness = scoreAssessments?.completenessScore ?? 75;
  const blendedCompleteness = Math.round(deterministicCompleteness * 0.4 + aiCompleteness * 0.6);

  // Skills relevance: if job description exists, consider matched ratio
  let skillsRelevance = scoreAssessments?.skillsRelevanceScore ?? 70;
  if (jobMatch && Array.isArray(jobMatch.identifiedRequiredSkills) && jobMatch.identifiedRequiredSkills.length > 0) {
    const coverage = (jobMatch.matchedSkills.length / jobMatch.identifiedRequiredSkills.length) * 100;
    // Blend AI depth score with deterministic coverage
    skillsRelevance = Math.round(skillsRelevance * 0.5 + coverage * 0.5);
  }

  const experienceDescriptions = scoreAssessments?.experienceDescriptionsScore ?? 70;
  const readabilityStructure = scoreAssessments?.readabilityStructureScore ?? 75;

  // Clamp all sub-scores to [0, 100]
  const clamp = (val) => Math.max(0, Math.min(100, Math.round(val)));

  const finalCompleteness = clamp(blendedCompleteness);
  const finalSkillsRelevance = clamp(skillsRelevance);
  const finalExperienceDescriptions = clamp(experienceDescriptions);
  const finalReadabilityStructure = clamp(readabilityStructure);

  // Weighted overall score:
  // Completeness: 25%, Skills relevance: 30%, Experience: 25%, Readability: 20%
  const overallScore = Math.round(
    finalCompleteness * 0.25 +
      finalSkillsRelevance * 0.3 +
      finalExperienceDescriptions * 0.25 +
      finalReadabilityStructure * 0.2
  );

  // Job matching calculation
  let finalJobMatch = null;
  if (jobMatch && jobDescription && jobDescription.trim()) {
    const skillCoverage = calculateSkillCoverageScore(jobMatch);
    finalJobMatch = {
      targetRole: jobMatch.targetRole || 'Target Role',
      skillCoverageScore: skillCoverage,
      matchedSkills: jobMatch.matchedSkills || [],
      missingSkills: jobMatch.missingSkills || [],
      partiallyDemonstratedSkills: jobMatch.partiallyDemonstratedSkills || [],
      relevantProjects: jobMatch.relevantProjects || [],
      recommendations: jobMatch.recommendations || [],
      keywordsFound: jobMatch.keywordsFound || [],
    };
  }

  return {
    overallScore: clamp(overallScore),
    scoreBreakdown: {
      completeness: finalCompleteness,
      skillsRelevance: finalSkillsRelevance,
      experienceDescriptions: finalExperienceDescriptions,
      readabilityStructure: finalReadabilityStructure,
      summary:
        scoreAssessments?.summary ||
        'Calculated based on standard weighted resume criteria: Completeness (25%), Skills Relevance (30%), Experience Descriptions (25%), and Readability & Structure (20%).',
    },
    jobMatch: finalJobMatch,
  };
};

module.exports = {
  calculateScores,
  calculateSkillCoverageScore,
  evaluateDeterministicCompleteness,
};
