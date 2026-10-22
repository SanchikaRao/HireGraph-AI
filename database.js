const fs = require('fs');
const path = require('path');

const CANDIDATES_FILE = path.join(__dirname, 'data', 'candidates.json');
const ROLES_FILE = path.join(__dirname, 'data', 'roles.json');

class Database {
  constructor() {
    this.candidates = [];
    this.roles = [];
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(CANDIDATES_FILE)) {
        const raw = fs.readFileSync(CANDIDATES_FILE, 'utf-8');
        this.candidates = JSON.parse(raw).candidates || [];
      } else {
        this.candidates = [];
      }

      if (fs.existsSync(ROLES_FILE)) {
        const raw = fs.readFileSync(ROLES_FILE, 'utf-8');
        this.roles = JSON.parse(raw).roles || [];
      } else {
        this.roles = [];
      }
    } catch (err) {
      console.error('Error loading database files:', err);
      this.candidates = [];
      this.roles = [];
    }
  }

  saveCandidates() {
    try {
      const data = { candidates: this.candidates };
      fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving candidates file:', err);
    }
  }

  getAllCandidates() {
    return this.candidates.map(c => ({
      id: c.id,
      name: c.name,
      title: c.title,
      avatar: c.avatar,
      location: c.location,
      yearsExperience: c.yearsExperience,
      primaryRole: c.primaryRole,
      status: c.status,
      matchScore: c.explainableReport?.matchScore || 85,
      overallPercentile: c.percentileBenchmarking?.overallPercentile || 85,
      verdict: c.explainableReport?.verdict || 'HIRE',
      verdictColor: c.explainableReport?.verdictColor || 'emerald',
      platforms: {
        github: !!c.platforms?.github?.verified,
        leetcode: !!c.platforms?.leetcode?.verified,
        linkedin: !!c.platforms?.linkedin?.verified,
        kaggle: !!c.platforms?.kaggle?.verified,
        behance: !!c.platforms?.behance?.verified,
        portfolio: !!c.platforms?.portfolio?.verified
      }
    }));
  }

  getCandidateById(id) {
    return this.candidates.find(c => c.id === id) || null;
  }

  getRoles() {
    return this.roles;
  }

  getRoleById(roleId) {
    return this.roles.find(r => r.id === roleId) || null;
  }

  addCandidate(newCandidate) {
    this.candidates.unshift(newCandidate);
    this.saveCandidates();
    return newCandidate;
  }

  updateCandidate(id, updates) {
    const idx = this.candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.candidates[idx] = { ...this.candidates[idx], ...updates };
      this.saveCandidates();
      return this.candidates[idx];
    }
    return null;
  }

  // Cross-Platform Evidence Graph Generator (Slide 3, 4, 5, 7)
  getCandidateGraph(candidateId) {
    const candidate = this.getCandidateById(candidateId);
    if (!candidate) return null;

    const nodes = [];
    const edges = [];

    // 1. Root Candidate Node
    nodes.push({
      id: `cand_${candidate.id}`,
      label: candidate.name,
      type: 'candidate',
      category: 'root',
      color: '#4338ca', // Solid Royal Indigo
      size: 34,
      details: {
        role: candidate.title,
        status: candidate.status,
        matchScore: candidate.explainableReport.matchScore,
        percentile: candidate.percentileBenchmarking.overallPercentile
      }
    });

    // 2. Platforms
    const platforms = candidate.platforms || {};

    if (platforms.github && platforms.github.verified) {
      const ghId = `plat_github_${candidate.id}`;
      nodes.push({
        id: ghId,
        label: `GitHub (${platforms.github.publicRepos} repos)`,
        type: 'platform',
        category: 'github',
        color: '#0284c7', // Solid Cyan/Blue
        size: 26,
        details: {
          handle: platforms.github.handle,
          stars: platforms.github.totalStars,
          commits: platforms.github.totalCommitsLastYear,
          streak: `${platforms.github.streakDays} days`
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: ghId,
        label: 'VERIFIED_PROFILE',
        color: '#0284c7'
      });

      // Add Top Repositories as Evidence Nodes
      (platforms.github.topRepositories || []).forEach((repo, idx) => {
        const repoNodeId = `repo_${candidate.id}_${idx}`;
        nodes.push({
          id: repoNodeId,
          label: repo.name,
          type: 'repository',
          category: 'project',
          color: '#7c3aed', // Solid Violet
          size: 22,
          details: {
            description: repo.description,
            language: repo.language,
            testCoverage: `${repo.testCoverage}%`,
            architectureScore: `${repo.architectureScore}/100`,
            verifiedEvidence: repo.verifiedEvidence
          }
        });
        edges.push({
          source: ghId,
          target: repoNodeId,
          label: 'AUTHORED_CODE',
          color: '#7c3aed'
        });
      });
    }

    if (platforms.leetcode && platforms.leetcode.verified) {
      const lcId = `plat_leetcode_${candidate.id}`;
      nodes.push({
        id: lcId,
        label: `LeetCode (${platforms.leetcode.solvedTotal} Solved)`,
        type: 'platform',
        category: 'leetcode',
        color: '#d97706', // Solid Amber
        size: 24,
        details: {
          solved: platforms.leetcode.solvedTotal,
          rating: platforms.leetcode.contestRating,
          percentile: `${platforms.leetcode.rankingPercentile}th`,
          hard: platforms.leetcode.hard
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: lcId,
        label: 'ALGORITHMIC_EVIDENCE',
        color: '#d97706'
      });
    }

    if (platforms.linkedin && platforms.linkedin.verified) {
      const liId = `plat_linkedin_${candidate.id}`;
      nodes.push({
        id: liId,
        label: 'LinkedIn (Verified Career)',
        type: 'platform',
        category: 'linkedin',
        color: '#2563eb', // Solid Blue
        size: 22,
        details: {
          tenure: platforms.linkedin.verifiedTenure,
          endorsements: platforms.linkedin.endorsements
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: liId,
        label: 'CAREER_HISTORY',
        color: '#2563eb'
      });
    }

    if (platforms.kaggle && platforms.kaggle.verified) {
      const kgId = `plat_kaggle_${candidate.id}`;
      nodes.push({
        id: kgId,
        label: `Kaggle (${platforms.kaggle.rank})`,
        type: 'platform',
        category: 'kaggle',
        color: '#0891b2',
        size: 22,
        details: {
          rank: platforms.kaggle.rank,
          medals: platforms.kaggle.medals
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: kgId,
        label: 'COMPETITION_EVIDENCE',
        color: '#0891b2'
      });
    }

    if (platforms.behance && platforms.behance.verified) {
      const beId = `plat_behance_${candidate.id}`;
      nodes.push({
        id: beId,
        label: `Behance (${platforms.behance.projectCount} Designs)`,
        type: 'platform',
        category: 'behance',
        color: '#db2777', // Solid Pink
        size: 22,
        details: {
          featured: platforms.behance.featuredDesign,
          appreciations: platforms.behance.appreciations
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: beId,
        label: 'DESIGN_PORTFOLIO',
        color: '#db2777'
      });
    }

    // 3. Competency / Skill Nodes
    const comps = candidate.competencies || {};
    const skillNodes = [
      { key: 'system_design', label: 'System Design', score: comps.system_design || 85 },
      { key: 'code_quality', label: 'Code Quality', score: comps.code_quality || 85 },
      { key: 'algorithmic_skills', label: 'Algorithmic Skills', score: comps.algorithmic_skills || 85 },
      { key: 'architecture', label: 'Architecture & CI/CD', score: comps.architecture || 85 },
      { key: 'collaboration', label: 'Collaboration & Ownership', score: comps.collaboration || 85 }
    ];

    skillNodes.forEach(s => {
      const sId = `skill_${candidate.id}_${s.key}`;
      nodes.push({
        id: sId,
        label: `${s.label} (${s.score}%)`,
        type: 'skill',
        category: 'competency',
        color: '#059669', // Solid Emerald
        size: 20,
        details: {
          competency: s.label,
          score: `${s.score}/100`,
          source: 'Synthesized from Git commit telemetry and multi-agent interview'
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: sId,
        label: 'EXHIBITS_COMPETENCY',
        color: '#059669'
      });

      // Link skills to repos or leetcode if applicable
      if (s.key === 'algorithmic_skills' && platforms.leetcode) {
        edges.push({
          source: `plat_leetcode_${candidate.id}`,
          target: sId,
          label: 'VERIFIES_SKILL',
          color: '#d97706'
        });
      }
      if (s.key === 'architecture' && (platforms.github?.topRepositories?.length || 0) > 0) {
        edges.push({
          source: `repo_${candidate.id}_0`,
          target: sId,
          label: 'DEMONSTRATES_IN_PROD',
          color: '#7c3aed'
        });
      }
    });

    // 4. AI Multi-Agent Interview Signals (Slide 3 & 5)
    if (candidate.interviewPanel?.completed) {
      const interviewNodeId = `interview_${candidate.id}`;
      nodes.push({
        id: interviewNodeId,
        label: `AI Panel Consensus (${candidate.interviewPanel.overallScore}/100)`,
        type: 'interview_panel',
        category: 'ai_panel',
        color: '#e11d48', // Solid Rose
        size: 24,
        details: {
          alexScore: `${candidate.interviewPanel.agents.alex_tech_lead.score}% (Tech Lead)`,
          elenaScore: `${candidate.interviewPanel.agents.elena_architect.score}% (System Architect)`,
          marcusScore: `${candidate.interviewPanel.agents.marcus_behavioral.score}% (Culture & Comms)`
        }
      });
      edges.push({
        source: `cand_${candidate.id}`,
        target: interviewNodeId,
        label: 'CROSS_EXAMINED_BY_AI',
        color: '#e11d48'
      });

      // Connect interview panel to skills
      edges.push({
        source: interviewNodeId,
        target: `skill_${candidate.id}_system_design`,
        label: 'VALIDATED_IN_DEFENSE',
        color: '#e11d48'
      });
    }

    return { nodes, edges };
  }

  // Role-Adaptive Evaluation Engine (Slide 3, 5, 6)
  evaluateCandidateForRole(candidateId, roleId) {
    const candidate = this.getCandidateById(candidateId);
    const role = this.getRoleById(roleId);
    if (!candidate || !role) return null;

    const comps = candidate.competencies;
    let weightedSum = 0;
    let totalWeight = 0;

    const breakdown = [];

    for (const [key, weight] of Object.entries(role.weights)) {
      const candidateScore = comps[key] || 75;
      const contribution = candidateScore * weight;
      weightedSum += contribution;
      totalWeight += weight;

      breakdown.push({
        competency: key.replace('_', ' ').toUpperCase(),
        weight: Math.round(weight * 100),
        candidateScore,
        contribution: Math.round(contribution * 10) / 10
      });
    }

    const calculatedMatch = Math.round(weightedSum / totalWeight);

    let verdict = 'HIRE';
    let verdictColor = 'emerald';

    if (calculatedMatch >= 90) {
      verdict = 'STRONG HIRE';
      verdictColor = 'emerald';
    } else if (calculatedMatch >= 80) {
      verdict = 'HIRE';
      verdictColor = 'emerald';
    } else if (calculatedMatch >= 70) {
      verdict = 'LEANING HIRE';
      verdictColor = 'amber';
    } else {
      verdict = 'NEEDS REVIEW / NOT RECOMMENDED';
      verdictColor = 'rose';
    }

    // Role percentile estimate
    const rolePercentile = Math.min(99.4, Math.max(20, Math.round(calculatedMatch * 1.05 - 2)));

    return {
      candidateId,
      candidateName: candidate.name,
      roleId: role.id,
      roleName: role.name,
      matchScore: calculatedMatch,
      verdict,
      verdictColor,
      rolePercentile,
      benchmarkMedian: role.benchmark_median,
      breakdown,
      radarData: {
        labels: Object.keys(role.weights).map(k => k.replace('_', ' ').toUpperCase()),
        candidateScores: Object.keys(role.weights).map(k => comps[k] || 75),
        roleAverages: Object.keys(role.weights).map(() => role.benchmark_median)
      }
    };
  }

  // Percentile Benchmarking Data (Slide 3 & 5)
  getApplicantPoolBenchmarks(roleId) {
    const role = this.getRoleById(roleId) || this.roles[0];
    
    // Generate bell curve distribution buckets (0-100 score distribution)
    const distribution = [
      { scoreRange: '40-49', count: 48, percentile: 'Bottom 5%' },
      { scoreRange: '50-59', count: 180, percentile: '20th' },
      { scoreRange: '60-69', count: 340, percentile: '45th' },
      { scoreRange: '70-79', count: 420, percentile: '70th (Median)' },
      { scoreRange: '80-89', count: 190, percentile: '88th' },
      { scoreRange: '90-100', count: 62, percentile: 'Top 5%' }
    ];

    const candidatesInRole = this.candidates.map(c => {
      const evalResult = this.evaluateCandidateForRole(c.id, role.id);
      return {
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        matchScore: evalResult.matchScore,
        percentile: evalResult.rolePercentile,
        verdict: evalResult.verdict,
        verdictColor: evalResult.verdictColor,
        testCoverage: c.developerIntelligence.testingCoverage,
        architectureIndex: c.developerIntelligence.architectureIndex,
        leetcodeSolved: c.platforms.leetcode ? c.platforms.leetcode.solvedTotal : 0
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      role: role.name,
      totalPoolCount: 1240,
      distribution,
      candidatesInRole
    };
  }
}

module.exports = new Database();
