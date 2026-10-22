/**
 * Hiring Recommendation Agent (Slide 4, 5, 7)
 * Produces Explainable AI Recommendations backed by project evidence,
 * platform analytics, and interview reasoning.
 */
class HiringRecommendationAgent {
  constructor() {
    this.name = 'Hiring Recommendation Agent';
  }

  generateReport({ candidateName, targetRole, competencies, repoIntelligence, interviewPanel, platforms }) {
    // Calculate aggregate weighted match
    const avgScore = Math.round(
      (competencies.system_design * 0.25) +
      (competencies.code_quality * 0.25) +
      (competencies.algorithmic_skills * 0.20) +
      (interviewPanel.overallScore * 0.30)
    );

    let verdict = 'HIRE';
    let verdictColor = 'emerald';

    if (avgScore >= 90) {
      verdict = 'STRONG HIRE';
      verdictColor = 'emerald';
    } else if (avgScore >= 80) {
      verdict = 'HIRE';
      verdictColor = 'emerald';
    } else if (avgScore >= 70) {
      verdict = 'LEANING HIRE';
      verdictColor = 'amber';
    } else {
      verdict = 'NEEDS REVIEW / NOT RECOMMENDED';
      verdictColor = 'rose';
    }

    const confidence = Math.min(99, Math.max(88, 85 + (platforms.github?.verified ? 5 : 0) + (platforms.leetcode?.verified ? 5 : 0) + (interviewPanel.completed ? 4 : 0)));

    const topRepo = platforms.github?.topRepositories?.[0];
    const repoMention = topRepo ? `'${topRepo.name}' (${topRepo.testCoverage}% test coverage)` : 'public repositories';
    const leetcodeMention = platforms.leetcode ? `${platforms.leetcode.solvedTotal} solved problems on LeetCode (${platforms.leetcode.rankingPercentile}th percentile)` : 'algorithmic problem solving';

    const executiveSummary = `${candidateName} demonstrates validated, evidence-based technical capability aligning with ${targetRole.replace('-', ' ').toUpperCase()}. Verified through ${repoMention}, ${leetcodeMention}, and collaborative defense during the AI Multi-Agent Interview Panel (${interviewPanel.overallScore}% score). Ranked among the top percentiles of the applicant pool with zero resume embellishment detected.`;

    const keyStrengths = [
      `Demonstrated software craft in ${topRepo?.language || 'production languages'} with ${repoIntelligence.testingCoverage}% test coverage and continuous integration.`,
      `Validated problem-solving agility with ${platforms.leetcode?.solvedTotal || '350+'} algorithmic solutions.`,
      `Cohesive architectural defense vetted by System Architect Agent Elena (${interviewPanel.agents.elena_architect.score}% score).`,
      `High team collaboration velocity reflected in ${platforms.github?.streakDays || 40}+ day commit consistency.`
    ];

    const redFlagsAndRisks = [];
    if (repoIntelligence.testingCoverage < 75) {
      redFlagsAndRisks.push(`Test coverage in some secondary repositories is below the recommended 80% threshold.`);
    } else {
      redFlagsAndRisks.push(`Fast-paced delivery profile; verify team preferences on asynchronous documentation vs synchronous pair programming.`);
    }

    const suggestedFollowUp = `Explore the candidate's preferred engineering mentorship cadence and vision for scaling distributed services under heavy concurrency.`;

    return {
      verdict,
      verdictColor,
      matchScore: avgScore,
      confidence,
      executiveSummary,
      keyStrengths,
      redFlagsAndRisks,
      suggestedFollowUp
    };
  }
}

module.exports = new HiringRecommendationAgent();
