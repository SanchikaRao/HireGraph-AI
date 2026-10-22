const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

// Import AI Multi-Agent Processing Layer (Slide 4)
const ingestionAgent = require('./agents/ingestionAgent');
const repoIntelligenceAgent = require('./agents/repoIntelligenceAgent');
const competencyAgent = require('./agents/competencyAgent');
const interviewAgent = require('./agents/interviewAgent');
const recommendationAgent = require('./agents/recommendationAgent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Get all candidates for Recruiter Dashboard
app.get('/api/candidates', (req, res) => {
  try {
    const list = db.getAllCandidates();
    res.json({ success: true, count: list.length, candidates: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get specific candidate full profile
app.get('/api/candidates/:id', (req, res) => {
  try {
    const candidate = db.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get all role evaluation models
app.get('/api/roles', (req, res) => {
  try {
    const roles = db.getRoles();
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Role-Adaptive Evaluation Engine (Slide 3, 5, 6)
app.post('/api/candidates/:id/evaluate', (req, res) => {
  try {
    const { roleId } = req.body;
    const evaluation = db.evaluateCandidateForRole(req.params.id, roleId);
    if (!evaluation) {
      return res.status(404).json({ success: false, error: 'Invalid candidate or role ID' });
    }
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Cross-Platform Evidence Graph API (Slide 3, 4, 5, 7)
app.get('/api/graph/:candidateId', (req, res) => {
  try {
    const graph = db.getCandidateGraph(req.params.candidateId);
    if (!graph) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    res.json({ success: true, graph });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Percentile Benchmarking API (Slide 3, 5, 6)
app.get('/api/benchmarks', (req, res) => {
  try {
    const roleId = req.query.roleId || 'backend-engineer';
    const benchmarkData = db.getApplicantPoolBenchmarks(roleId);
    res.json({ success: true, benchmarks: benchmarkData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Live AI Multi-Agent Interview Simulation (Slide 3, 4, 5)
app.post('/api/candidates/:id/interview', (req, res) => {
  try {
    const candidate = db.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    const targetRole = req.body.roleId || candidate.primaryRole;
    const topRepo = candidate.platforms?.github?.topRepositories?.[0];
    const leetcodeSolved = candidate.platforms?.leetcode?.solvedTotal || 400;

    // Run Interview Planning Agent
    const newInterview = interviewAgent.generateInterview({
      candidateName: candidate.name,
      targetRole,
      topRepo,
      leetcodeSolved
    });

    // Update candidate in database
    const updated = db.updateCandidate(candidate.id, {
      interviewPanel: newInterview
    });

    res.json({ success: true, interviewPanel: newInterview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Multi-Agent Pipeline Ingestion for New Candidate (Slide 4)
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, githubHandle, leetcodeHandle, linkedinHandle, portfolioUrl, targetRole } = req.body;

    if (!name || (!githubHandle && !leetcodeHandle)) {
      return res.status(400).json({
        success: false,
        error: 'Candidate name and at least one platform handle (GitHub or LeetCode) are required.'
      });
    }

    // Step 1: Platform Ingestion Agent
    const ingested = await ingestionAgent.ingestCandidate({
      name,
      githubHandle,
      leetcodeHandle,
      linkedinHandle,
      portfolioUrl,
      targetRole
    });

    // Step 2: Repository Intelligence Agent
    const repoIntelligence = repoIntelligenceAgent.analyze(ingested.platforms.github);

    // Step 3: Competency Mapping Agent
    const competencies = competencyAgent.mapCompetencies({
      repoIntelligence,
      platforms: ingested.platforms,
      targetRole: ingested.targetRole
    });

    // Step 4: AI Multi-Agent Interview Panel (Pre-planning round)
    const interviewPanel = interviewAgent.generateInterview({
      candidateName: name,
      targetRole: ingested.targetRole,
      topRepo: ingested.platforms.github?.topRepositories?.[0],
      leetcodeSolved: ingested.platforms.leetcode?.solvedTotal
    });

    // Step 5: Hiring Recommendation Agent
    const explainableReport = recommendationAgent.generateReport({
      candidateName: name,
      targetRole: ingested.targetRole,
      competencies,
      repoIntelligence,
      interviewPanel,
      platforms: ingested.platforms
    });

    const newCandidate = {
      id: `cand-${Date.now().toString().slice(-4)}`,
      name,
      title: `${targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Specialist`,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
      location: 'Bengaluru / Remote',
      yearsExperience: 3.2,
      primaryRole: ingested.targetRole,
      status: explainableReport.matchScore >= 80 ? 'Available / High Fit' : 'Available / Moderate Fit',
      platforms: ingested.platforms,
      developerIntelligence: repoIntelligence,
      competencies,
      percentileBenchmarking: {
        overallPercentile: Math.min(98.5, Math.max(50, Math.round(explainableReport.matchScore * 1.05))),
        poolSize: 1240,
        systemDesignRank: Math.floor(Math.random() * 50) + 10,
        codeQualityRank: Math.floor(Math.random() * 40) + 12,
        algorithmsRank: Math.floor(Math.random() * 60) + 15,
        architectureRank: Math.floor(Math.random() * 40) + 10
      },
      interviewPanel,
      explainableReport
    };

    const saved = db.addCandidate(newCandidate);

    res.status(201).json({
      success: true,
      message: 'Candidate processed through 5-agent pipeline successfully',
      candidate: saved,
      agentLogs: ingested.logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. High-level dashboard statistics (Impact & Metrics from Slide 6)
app.get('/api/stats', (req, res) => {
  try {
    const candidates = db.getAllCandidates();
    res.json({
      success: true,
      metrics: {
        totalEvaluated: candidates.length,
        reductionInScreeningTime: '70%',
        verifiedCapabilityRate: '98.4%',
        activeApplicantPool: 1240,
        unbiasedHiringIndex: '99.1%'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`  HireGraph-AI Talent Intelligence Platform Running`);
    console.log(`  'From resumes to real capability.'`);
    console.log(`  Team: Team Laapata Ladies (CSE-2nd Year)`);
    console.log(`  Local URL: http://localhost:${port}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[HireGraph-AI] Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[HireGraph-AI] Server startup error:', err);
    }
  });
}

startServer(PORT);
