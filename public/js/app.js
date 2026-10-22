/**
 * HireGraph-AI Application Controller
 * 'From resumes to real capability.'
 * Light theme with solid vibrant colors
 */

let candidates = [];
let currentCandidate = null;
let roles = [];
let currentRoleId = 'backend-engineer';
let evidenceGraph = null;
let radarChartInstance = null;
let benchmarkChartInstance = null;
let languageChartInstance = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupModal();
  setupGraph();
  await loadRoles();
  await loadCandidates();
});

// Setup Tab Navigation
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');

      // Re-render charts or graph if active
      if (btn.dataset.tab === 'tab-graph' && evidenceGraph) {
        setTimeout(() => evidenceGraph.initCanvasSize(), 50);
      } else if (btn.dataset.tab === 'tab-role-eval') {
        renderRadarChart();
      } else if (btn.dataset.tab === 'tab-benchmarks') {
        renderBenchmarkChart();
      } else if (btn.dataset.tab === 'tab-developer') {
        renderLanguageDonut();
      }
    });
  });
}

// Setup Graph Visualizer
function setupGraph() {
  evidenceGraph = new EvidenceGraph('evidenceCanvas', node => {
    renderNodeInspector(node);
  });

  document.getElementById('btnZoomIn')?.addEventListener('click', () => evidenceGraph.zoomIn());
  document.getElementById('btnZoomOut')?.addEventListener('click', () => evidenceGraph.zoomOut());
  document.getElementById('btnResetView')?.addEventListener('click', () => evidenceGraph.resetView());
}

// Load Roles
async function loadRoles() {
  try {
    const res = await fetch('/api/roles');
    const data = await res.json();
    if (data.success) {
      roles = data.roles;
      const select = document.getElementById('roleSelect');
      select.innerHTML = roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
      select.value = currentRoleId;

      select.addEventListener('change', async (e) => {
        currentRoleId = e.target.value;
        if (currentCandidate) {
          await evaluateRoleAdaptive(currentCandidate.id, currentRoleId);
        }
      });
    }
  } catch (err) {
    console.error('Failed to load roles:', err);
  }
}

// Load Candidates
async function loadCandidates() {
  try {
    const res = await fetch('/api/candidates');
    const data = await res.json();
    if (data.success) {
      candidates = data.candidates;
      renderCandidateList(candidates);
      if (candidates.length > 0) {
        await selectCandidate(candidates[0].id);
      }
    }
  } catch (err) {
    console.error('Failed to load candidates:', err);
  }
}

// Render Left Candidate Sidebar
function renderCandidateList(list) {
  const container = document.getElementById('candidateList');
  document.getElementById('candidateCountBadge').textContent = `${list.length} Candidates`;

  container.innerHTML = list.map(c => `
    <div class="candidate-card ${currentCandidate?.id === c.id ? 'active' : ''}" onclick="selectCandidate('${c.id}')">
      <div class="card-top">
        <img class="candidate-avatar" src="${c.avatar}" alt="${c.name}" />
        <div class="candidate-meta">
          <div class="candidate-name">${c.name}</div>
          <div class="candidate-role-text">${c.title}</div>
        </div>
      </div>
      <div class="card-badges">
        <span class="match-pill ${c.verdictColor}">
          ★ ${c.matchScore}% Match
        </span>
        <span class="percentile-pill">Top ${Math.round(100 - c.overallPercentile)}%</span>
      </div>
      <div class="platform-icons-row">
        ${c.platforms.github ? '<span class="platform-tag github">GitHub</span>' : ''}
        ${c.platforms.leetcode ? '<span class="platform-tag leetcode">LeetCode</span>' : ''}
        ${c.platforms.linkedin ? '<span class="platform-tag linkedin">LinkedIn</span>' : ''}
        ${c.platforms.kaggle ? '<span class="platform-tag kaggle">Kaggle</span>' : ''}
        ${c.platforms.behance ? '<span class="platform-tag behance">Behance</span>' : ''}
      </div>
    </div>
  `).join('');

  // Setup search filter
  const searchInput = document.getElementById('searchCandidateInput');
  searchInput.oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = candidates.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.title.toLowerCase().includes(q)
    );
    renderCandidateList(filtered);
  };
}

// Select Candidate and populate all views
async function selectCandidate(id) {
  try {
    const res = await fetch(`/api/candidates/${id}`);
    const data = await res.json();
    if (!data.success) return;

    currentCandidate = data.candidate;

    // Update active highlight in sidebar
    document.querySelectorAll('.candidate-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('onclick')?.includes(id));
    });

    renderHeroProfile();
    await loadEvidenceGraph(id);
    renderDeveloperIntelligence();
    await evaluateRoleAdaptive(id, currentRoleId);
    renderInterviewPanel();
    renderExplainableReport();
    renderBenchmarkData();
  } catch (err) {
    console.error('Error selecting candidate:', err);
  }
}

// Render Top Candidate Hero Banner
function renderHeroProfile() {
  const c = currentCandidate;
  if (!c) return;

  document.getElementById('heroAvatar').src = c.avatar;
  document.getElementById('heroName').textContent = c.name;
  document.getElementById('heroTitle').textContent = c.title;
  document.getElementById('heroLocation').textContent = `📍 ${c.location}`;
  document.getElementById('heroExp').textContent = `💼 ${c.yearsExperience} yrs Experience`;
  document.getElementById('heroStatus').textContent = `⚡ ${c.status}`;

  const verdictEl = document.getElementById('heroVerdictBadge');
  verdictEl.textContent = c.explainableReport?.verdict || 'HIRE';
  verdictEl.className = `match-pill ${c.explainableReport?.verdictColor || 'emerald'}`;

  document.getElementById('heroStatMatch').textContent = `${c.explainableReport?.matchScore || 85}%`;
  document.getElementById('heroStatPercentile').textContent = `${c.percentileBenchmarking?.overallPercentile || 90}th`;
  document.getElementById('heroStatRepos').textContent = c.platforms?.github?.publicRepos || 0;
  document.getElementById('heroStatLeetCode').textContent = c.platforms?.leetcode?.solvedTotal || 0;
}

// Load Cross-Platform Evidence Graph
async function loadEvidenceGraph(candidateId) {
  try {
    const res = await fetch(`/api/graph/${candidateId}`);
    const data = await res.json();
    if (data.success && evidenceGraph) {
      evidenceGraph.setData(data.graph);
    }
  } catch (err) {
    console.error('Error loading graph:', err);
  }
}

// Render Graph Node Inspector (Sidebar in Graph Tab)
function renderNodeInspector(node) {
  const container = document.getElementById('nodeInspectorContent');
  if (!container || !node) return;

  const typeColors = {
    candidate: '#4338ca',
    platform: '#0284c7',
    repository: '#7c3aed',
    skill: '#059669',
    interview_panel: '#e11d48'
  };

  const badgeColor = typeColors[node.type] || '#4338ca';

  let propsRows = '';
  if (node.details) {
    propsRows = Object.entries(node.details).map(([k, v]) => `
      <tr>
        <td class="prop-name">${k.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
        <td class="prop-val">${v}</td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
    <div class="inspector-node-card">
      <span class="node-badge-type" style="background-color: ${badgeColor};">${node.type.replace('_', ' ')}</span>
      <h3 class="node-inspect-label">${node.label}</h3>
      <p class="node-inspect-desc">
        ${node.details?.description || node.details?.verifiedEvidence || 'Verifiable node in the HireGraph talent intelligence network.'}
      </p>
      <table class="node-props-table">
        <tbody>${propsRows}</tbody>
      </table>
    </div>
  `;
}

// Render Developer Intelligence Dashboard (Slide 3 & 5)
function renderDeveloperIntelligence() {
  const c = currentCandidate;
  if (!c) return;

  const dev = c.developerIntelligence;
  const gh = c.platforms.github;

  document.getElementById('devQualityScore').textContent = `${dev.repoQualityScore}/100`;
  document.getElementById('devQualityProgress').style.width = `${dev.repoQualityScore}%`;
  document.getElementById('devQualityProgress').style.backgroundColor = '#4338ca';

  document.getElementById('devArchIndex').textContent = `${dev.architectureIndex}/100`;
  document.getElementById('devArchProgress').style.width = `${dev.architectureIndex}%`;
  document.getElementById('devArchProgress').style.backgroundColor = '#7c3aed';

  document.getElementById('devTestCoverage').textContent = `${dev.testingCoverage}%`;
  document.getElementById('devTestProgress').style.width = `${dev.testingCoverage}%`;
  document.getElementById('devTestProgress').style.backgroundColor = '#059669';

  document.getElementById('devCommitCadence').textContent = `${dev.commitCadence}%`;
  document.getElementById('devCommitProgress').style.width = `${dev.commitCadence}%`;
  document.getElementById('devCommitProgress').style.backgroundColor = '#d97706';

  document.getElementById('devComplexityText').textContent = dev.codeComplexity;
  document.getElementById('devDocsText').textContent = dev.documentationQuality;

  // Render Repositories List
  const repoListEl = document.getElementById('devRepoList');
  if (gh && gh.topRepositories) {
    repoListEl.innerHTML = gh.topRepositories.map(r => `
      <div class="repo-card">
        <div class="repo-top-row">
          <div class="repo-name">
            📁 ${r.name}
          </div>
          <div class="repo-stats-pills">
            <span class="stat-pill">★ ${r.stars} stars</span>
            <span class="stat-pill">⚡ ${r.language}</span>
            <span class="stat-pill">🧪 ${r.testCoverage}% Tests</span>
            ${r.hasCI ? '<span class="stat-pill" style="color: #059669; font-weight:800;">✓ CI Passed</span>' : ''}
          </div>
        </div>
        <p class="repo-desc">${r.description}</p>
        <div class="repo-evidence-callout">
          <strong>Verified Proof:</strong> ${r.verifiedEvidence}
        </div>
      </div>
    `).join('');
  } else {
    repoListEl.innerHTML = '<p style="color: #64748b;">No public repositories recorded.</p>';
  }

  renderLanguageDonut();
}

// Render Languages Donut Chart
function renderLanguageDonut() {
  const c = currentCandidate;
  if (!c || !c.platforms?.github?.languages) return;

  const ctx = document.getElementById('languageDonutChart')?.getContext('2d');
  if (!ctx) return;

  if (languageChartInstance) languageChartInstance.destroy();

  const langs = c.platforms.github.languages;
  const solidColors = ['#4338ca', '#059669', '#d97706', '#7c3aed', '#0284c7'];

  languageChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: langs.map(l => l.name),
      datasets: [{
        data: langs.map(l => l.percentage),
        backgroundColor: solidColors.slice(0, langs.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14,
            font: { weight: 'bold', family: '-apple-system, sans-serif' }
          }
        }
      }
    }
  });
}

// Role-Adaptive Evaluation Engine (Slide 3, 5, 6)
async function evaluateRoleAdaptive(candidateId, roleId) {
  try {
    const res = await fetch(`/api/candidates/${candidateId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    });
    const data = await res.json();
    if (!data.success) return;

    const evalData = data.evaluation;

    document.getElementById('roleEvalRoleName').textContent = evalData.roleName;
    document.getElementById('roleEvalMatchScore').textContent = `${evalData.matchScore}%`;
    document.getElementById('roleEvalPercentile').textContent = `Top ${Math.round(100 - evalData.rolePercentile)}%`;

    const verdictBadge = document.getElementById('roleEvalVerdictBadge');
    verdictBadge.textContent = evalData.verdict;
    verdictBadge.className = `match-pill ${evalData.verdictColor}`;

    // Render weights and contributions table
    const tableBody = document.getElementById('roleWeightsTableBody');
    tableBody.innerHTML = evalData.breakdown.map(b => `
      <tr>
        <td><strong>${b.competency}</strong></td>
        <td><span class="stat-pill">${b.weight}%</span></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span>${b.candidateScore}/100</span>
            <div style="flex:1; height:6px; background:#e2e8f0; border-radius:4px;">
              <div style="height:100%; width:${b.candidateScore}%; background:#4338ca; border-radius:4px;"></div>
            </div>
          </div>
        </td>
        <td><strong>+${b.contribution} pts</strong></td>
      </tr>
    `).join('');

    renderRadarChart(evalData.radarData);
  } catch (err) {
    console.error('Error evaluating role adaptive:', err);
  }
}

// Render Radar Chart for Role Competency
function renderRadarChart(radarData) {
  const ctx = document.getElementById('roleRadarChart')?.getContext('2d');
  if (!ctx) return;

  if (radarChartInstance) radarChartInstance.destroy();

  if (!radarData && currentCandidate) {
    const comps = currentCandidate.competencies;
    radarData = {
      labels: ['System Design', 'Code Quality', 'Algorithms', 'Architecture', 'Collaboration', 'Domain'],
      candidateScores: [comps.system_design, comps.code_quality, comps.algorithmic_skills, comps.architecture, comps.collaboration, comps.domain_expertise],
      roleAverages: [72, 72, 72, 72, 72, 72]
    };
  }

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: radarData.labels,
      datasets: [
        {
          label: `${currentCandidate?.name || 'Candidate'}`,
          data: radarData.candidateScores,
          backgroundColor: 'rgba(67, 56, 202, 0.25)',
          borderColor: '#4338ca',
          borderWidth: 2.5,
          pointBackgroundColor: '#4338ca',
          pointBorderColor: '#ffffff',
          pointRadius: 4
        },
        {
          label: 'Applicant Pool Median',
          data: radarData.roleAverages,
          backgroundColor: 'rgba(217, 119, 6, 0.15)',
          borderColor: '#d97706',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointBackgroundColor: '#d97706',
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 40,
          max: 100,
          ticks: { stepSize: 15, font: { weight: 'bold' } },
          pointLabels: { font: { weight: 'bold', size: 11, family: '-apple-system, sans-serif' }, color: '#0f172a' }
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 'bold' } } }
      }
    }
  });
}

// Render AI Multi-Agent Interview Panel (Slide 3 & 5)
function renderInterviewPanel() {
  const c = currentCandidate;
  if (!c || !c.interviewPanel) return;

  const panel = c.interviewPanel;
  const agents = panel.agents;

  // Alex (Tech Lead)
  document.getElementById('alexScore').textContent = `${agents.alex_tech_lead.score}%`;
  document.getElementById('alexVerdict').textContent = agents.alex_tech_lead.verdict;
  document.getElementById('alexNotes').textContent = agents.alex_tech_lead.feedback;

  // Elena (System Architect)
  document.getElementById('elenaScore').textContent = `${agents.elena_architect.score}%`;
  document.getElementById('elenaVerdict').textContent = agents.elena_architect.verdict;
  document.getElementById('elenaNotes').textContent = agents.elena_architect.feedback;

  // Marcus (Behavioral & Culture)
  document.getElementById('marcusScore').textContent = `${agents.marcus_behavioral.score}%`;
  document.getElementById('marcusVerdict').textContent = agents.marcus_behavioral.verdict;
  document.getElementById('marcusNotes').textContent = agents.marcus_behavioral.feedback;

  // Render Transcript Chat
  const chatContainer = document.getElementById('interviewChatTranscript');
  chatContainer.innerHTML = panel.transcript.map(msg => {
    const isCandidate = msg.speaker.includes(c.name);
    return `
      <div class="chat-bubble ${isCandidate ? 'candidate' : 'agent'}">
        <div class="chat-bubble-avatar">${msg.avatar}</div>
        <div class="chat-bubble-content">
          <div class="chat-speaker-name">${msg.speaker}</div>
          <div class="chat-speaker-msg">${msg.message}</div>
        </div>
      </div>
    `;
  }).join('');

  // Setup Live Simulation Button
  const simBtn = document.getElementById('btnSimulateInterview');
  simBtn.onclick = async () => {
    simBtn.disabled = true;
    simBtn.textContent = '⏳ Simulating AI Agent Panel...';
    try {
      const res = await fetch(`/api/candidates/${c.id}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: currentRoleId })
      });
      const data = await res.json();
      if (data.success) {
        c.interviewPanel = data.interviewPanel;
        renderInterviewPanel();
        await loadEvidenceGraph(c.id);
      }
    } finally {
      simBtn.disabled = false;
      simBtn.textContent = '⚡ Run Live Interview Simulation';
    }
  };
}

// Render Explainable Hiring Report (Slide 3, 5, 7)
function renderExplainableReport() {
  const c = currentCandidate;
  if (!c || !c.explainableReport) return;

  const rep = c.explainableReport;

  const verdictEl = document.getElementById('reportVerdictBadge');
  verdictEl.textContent = rep.verdict;
  verdictEl.className = `verdict-large-badge ${rep.verdictColor}`;

  document.getElementById('reportMatchScore').textContent = `${rep.matchScore}% Match Score`;
  document.getElementById('reportConfidenceScore').textContent = `Confidence: ${rep.confidence}%`;
  document.getElementById('reportSummaryText').textContent = rep.executiveSummary;

  // Key Strengths
  const strengthsContainer = document.getElementById('reportStrengthsList');
  strengthsContainer.innerHTML = rep.keyStrengths.map(s => `
    <div class="strength-item">
      <span>✓</span>
      <div>${s}</div>
    </div>
  `).join('');

  // Red Flags / Risks
  const risksContainer = document.getElementById('reportRisksList');
  risksContainer.innerHTML = (rep.redFlagsAndRisks || []).map(r => `
    <div class="risk-item">
      <span>⚠</span>
      <div>${r}</div>
    </div>
  `).join('');

  // Follow-up
  document.getElementById('reportFollowUpText').textContent = rep.suggestedFollowUp;

  // Print button
  document.getElementById('btnPrintReport').onclick = () => window.print();
}

// Render Applicant Pool Benchmarking Tab (Slide 3 & 5)
async function renderBenchmarkData() {
  try {
    const res = await fetch(`/api/benchmarks?roleId=${currentRoleId}`);
    const data = await res.json();
    if (!data.success) return;

    const b = data.benchmarks;
    document.getElementById('benchmarkRoleTitle').textContent = b.role;
    document.getElementById('benchmarkPoolSize').textContent = `${b.totalPoolCount} Analyzed Engineers`;

    // Render table of candidates in role
    const tbody = document.getElementById('benchmarkTableBody');
    tbody.innerHTML = b.candidatesInRole.map((cand, idx) => `
      <tr style="${cand.id === currentCandidate?.id ? 'background-color: #f5f3ff; font-weight:800;' : ''}">
        <td><strong>#${idx + 1}</strong></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <img src="${cand.avatar}" style="width:28px; height:28px; border-radius:50%;" />
            <span>${cand.name}</span>
          </div>
        </td>
        <td><span class="match-pill ${cand.verdictColor}">${cand.matchScore}%</span></td>
        <td><strong>${cand.percentile}th</strong></td>
        <td>${cand.testCoverage}%</td>
        <td>${cand.architectureIndex}/100</td>
        <td>${cand.leetcodeSolved}</td>
      </tr>
    `).join('');

    renderBenchmarkChart(b.distribution);
  } catch (err) {
    console.error('Error rendering benchmarks:', err);
  }
}

// Render Bell Curve Distribution Chart
function renderBenchmarkChart(distribution) {
  const ctx = document.getElementById('benchmarkBellCurveChart')?.getContext('2d');
  if (!ctx) return;

  if (benchmarkChartInstance) benchmarkChartInstance.destroy();

  const labels = distribution ? distribution.map(d => d.scoreRange) : ['40-49', '50-59', '60-69', '70-79', '80-89', '90-100'];
  const counts = distribution ? distribution.map(d => d.count) : [48, 180, 340, 420, 190, 62];

  benchmarkChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Applicant Distribution (1,240 engineers)',
          data: counts,
          backgroundColor: '#cbd5e1',
          borderColor: '#94a3b8',
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// Modal: Ingest New Candidate (Slide 4 Multi-Agent Pipeline)
function setupModal() {
  const modal = document.getElementById('ingestModal');
  const openBtn = document.getElementById('btnOpenIngestModal');
  const closeBtn = document.getElementById('btnCloseModal');
  const form = document.getElementById('ingestCandidateForm');
  const submitBtn = document.getElementById('btnSubmitIngest');
  const pipelineBox = document.getElementById('agentPipelineStatus');

  openBtn?.addEventListener('click', () => modal.classList.add('active'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    pipelineBox.style.display = 'flex';

    const steps = [
      document.getElementById('step-ingestion'),
      document.getElementById('step-repo'),
      document.getElementById('step-comp'),
      document.getElementById('step-interview'),
      document.getElementById('step-report')
    ];

    // Animate multi-agent progression
    for (let i = 0; i < steps.length; i++) {
      steps[i].className = 'agent-step-item active';
      await new Promise(r => setTimeout(r, 600));
      steps[i].className = 'agent-step-item done';
    }

    const payload = {
      name: document.getElementById('inputName').value,
      githubHandle: document.getElementById('inputGithub').value,
      leetcodeHandle: document.getElementById('inputLeetcode').value,
      linkedinHandle: document.getElementById('inputLinkedin').value,
      portfolioUrl: document.getElementById('inputPortfolio').value,
      targetRole: document.getElementById('inputTargetRole').value
    };

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        modal.classList.remove('active');
        form.reset();
        pipelineBox.style.display = 'none';
        steps.forEach(s => s.className = 'agent-step-item');
        await loadCandidates();
        await selectCandidate(data.candidate.id);
      }
    } catch (err) {
      alert('Error ingesting candidate: ' + err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
}
