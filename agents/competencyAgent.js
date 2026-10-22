/**
 * Competency Mapping Agent (Slide 4 & 5)
 * Synthesizes platform signals into core normalized competency vectors
 */
class CompetencyMappingAgent {
  constructor() {
    this.name = 'Competency Mapping Agent';
  }

  mapCompetencies({ repoIntelligence, platforms, targetRole }) {
    const gh = platforms.github;
    const lc = platforms.leetcode;

    // Algorithmic skills
    let algorithmicSkills = 70;
    if (lc) {
      if (lc.solvedTotal > 500) algorithmicSkills = Math.min(98, 90 + Math.round((lc.hard || 50) / 10));
      else if (lc.solvedTotal > 300) algorithmicSkills = 85;
      else algorithmicSkills = 76;
    }

    // Code Quality
    const codeQuality = repoIntelligence.repoQualityScore || 85;

    // Architecture
    const architecture = repoIntelligence.architectureIndex || 85;

    // System Design (derived from repos, complexity, and tenure)
    let systemDesign = Math.round((architecture * 0.6) + (repoIntelligence.testingCoverage * 0.4));
    if (targetRole === 'backend-engineer') systemDesign = Math.min(97, systemDesign + 4);

    // Collaboration
    const collaboration = Math.min(96, Math.max(78, (repoIntelligence.authenticContributionRate * 0.5) + (gh?.streakDays ? 40 : 35)));

    // Domain Expertise
    const domainExpertise = Math.round((codeQuality * 0.5) + (systemDesign * 0.5));

    return {
      system_design: systemDesign,
      code_quality: codeQuality,
      algorithmic_skills: algorithmicSkills,
      architecture,
      collaboration,
      domain_expertise: domainExpertise
    };
  }
}

module.exports = new CompetencyMappingAgent();
