# HireGraph-AI: Evidence-Based AI Talent Intelligence Platform
> **‘From resumes to real capability.’**  
> **Team Name:** Team Laapata Ladies (Prachi Aggarwal, Sanchika Rao, Samragyi Singh)  
> **Category:** AI Solutions for Automation • CSE-2nd Year  
> **Theme:** Clean Light Theme with Solid Vibrant Colors (No dark theme)

---

## 🚀 Overview

**HireGraph-AI** replaces subjective keyword-based resume screening with verified, multi-platform proof of real engineering capability. It aggregates and cross-validates technical evidence across:
- **GitHub** (commit velocity, code complexity, test coverage, AST and architecture patterns)
- **LeetCode** (algorithmic problem counts, contest ratings, difficulty percentiles)
- **LinkedIn** (career tenure, peer endorsements, recommendations)
- **Kaggle / Behance / Portfolios** (models, competitions, design systems)
- **AI Multi-Agent Interview Panel** (cross-examination by specialized AI agents)

---

## 🌟 Key Features

1. **Cross-Platform Evidence Knowledge Graph (Interactive Canvas)**:
   - High-performance, physics-based force simulation visualizer.
   - Interactive nodes with solid colors connecting Candidates ➔ Platforms ➔ Repositories ➔ Skills ➔ Interview Consensus.
   - Click any node to open the **Evidence Inspector** showing verified commit proofs, test coverage, and benchmark stats.

2. **Developer Intelligence Dashboard**:
   - Repository Quality Score, Architecture Index, Testing Coverage %, and Commit Cadence.
   - GitHub Language Distribution Donut Chart.
   - Production-grade repository cards with direct verified proof quotes.

3. **Role-Adaptive Evaluation Engine**:
   - Instantly switch target roles (*Backend / Distributed Systems*, *AI / Machine Learning*, *Full-Stack*, *Frontend & UI/UX*, *Product & Tech Lead*).
   - Dynamic weight recalibration, score calculation, and Chart.js radar chart comparison against applicant pool medians.

4. **AI Multi-Agent Interview Panel**:
   - 🤖 **Alex (Tech Lead Agent)**: Code quality, concurrency, language runtime internals.
   - 🏛️ **Elena (System Architect Agent)**: Scalability, fault tolerance, distributed state, partitioning.
   - 🤝 **Marcus (Behavioral & Culture Agent)**: Incident ownership, stakeholder empathy, conflict resolution.
   - Interactive live simulation button to stage dynamic technical rounds.

5. **Explainable AI Hiring Reports**:
   - Executive summary with transparent justifications.
   - Verdict badges (`STRONG HIRE`, `HIRE`, `LEANING HIRE`, `NEEDS REVIEW`).
   - Project-verified strengths, potential risks/red flags, and tailored follow-up interview questions.
   - One-click Print / PDF Dossier export.

6. **Applicant Pool Benchmarking**:
   - Bell curve distribution comparing candidates across 1,240 evaluated applicants.
   - Comparative ranking table with percentile rankings and verified metrics.

7. **Multi-Agent Ingestion Pipeline**:
   - Ingest new candidates by entering their GitHub, LeetCode, and LinkedIn handles.
   - Watch all 5 agents execute in real-time.

---

## 🛠️ Tech Stack

- **Frontend**: Semantic HTML5, Modular CSS3 (Solid Light Theme), Vanilla JavaScript ES6+, HTML5 Canvas Force Graph, Chart.js.
- **Backend**: Node.js, Express.js REST APIs.
- **Data & Storage**: Auto JSON Fallback persistence layer (`database.js`).
- **AI Multi-Agent System**:
  - `agents/ingestionAgent.js`
  - `agents/repoIntelligenceAgent.js`
  - `agents/competencyAgent.js`
  - `agents/interviewAgent.js`
  - `agents/recommendationAgent.js`

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+ or v24+)

### 2. Run the Application
Open a terminal in `C:\Users\HP\Desktop\hiregraph`:
```bash
# If running for the first time
npm install

# Start the server
node server.js
```

### 3. Open in Browser
Visit:
```
http://localhost:3001
```
*(If port 3000 is occupied, HireGraph-AI automatically binds to port 3001 or next available).*

---

## 📂 Directory Structure

```
hiregraph/
├── package.json               # Dependencies and scripts
├── server.js                  # Express backend & REST API endpoints
├── database.js                # Data layer & Evidence Graph generation
├── data/
│   ├── candidates.json        # Rich candidate dataset with verified evidence
│   └── roles.json             # Role definitions & competency weight models
├── agents/
│   ├── ingestionAgent.js      # Multi-platform ingestion agent
│   ├── repoIntelligenceAgent.js # Code quality & AST analyzer
│   ├── competencyAgent.js    # Normalized competency mapper
│   ├── interviewAgent.js     # AI Multi-Agent interview panel
│   └── recommendationAgent.js# Explainable hiring report generator
└── public/
    ├── index.html             # Single-page application shell
    ├── css/
    │   └── styles.css         # Solid-color light theme styling
    └── js/
        ├── graph.js           # Interactive Canvas Evidence Graph engine
        └── app.js             # Client-side state & UI controller
```
