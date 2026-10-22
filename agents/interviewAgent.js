/**
 * AI Multi-Agent Interview Panel (Slide 3, 4, 5, 6)
 * Multiple AI interviewers collaboratively evaluate technical skills,
 * communication, and problem-solving ability.
 */
class InterviewPlanningAgent {
  constructor() {
    this.name = 'AI Multi-Agent Interview Panel';
  }

  generateInterview({ candidateName, targetRole, topRepo, leetcodeSolved }) {
    const repoTitle = topRepo?.name || 'distributed-service';
    const lang = topRepo?.language || 'Go';

    const rounds = {
      'backend-engineer': [
        {
          agent: 'Elena',
          role: 'System Architect Agent',
          avatar: '🏛️',
          question: `In your '${repoTitle}' repository, how did you handle data replication consistency vs availability during network partition events?`,
          answer: `I leveraged a quorum-based consensus protocol where writes require majority ack before commit confirmation. During partial partitions, minority nodes immediately step down to read-only follower mode to prevent dirty split-brain states.`,
          score: 94,
          verdict: 'Exceptional Architectural Rigor',
          agentNotes: 'Candidate demonstrated immediate grasp of CAP trade-offs and linearizable read leases.'
        },
        {
          agent: 'Alex',
          role: 'Tech Lead Agent',
          avatar: '🤖',
          question: `Looking at your ${lang} implementation, what profiling techniques did you employ to prevent garbage collection pauses under heavy write loads?`,
          answer: `I utilized sync.Pool allocation pooling for byte buffers and pre-allocated slice capacities, keeping heap allocations to zero on the critical request pipeline. Continuous pprof profiling verified 99.9% of memory remained off the GC scan path.`,
          score: 93,
          verdict: 'Deep Language Mastery',
          agentNotes: 'Clear understanding of runtime internals, zero-allocation slicing, and memory barriers.'
        },
        {
          agent: 'Marcus',
          role: 'Behavioral & Culture Agent',
          avatar: '🤝',
          question: `Describe a situation where you strongly disagreed with a product manager's technical timeline. How did you resolve the trade-off?`,
          answer: `I translated our technical debt risk into concrete customer impact metrics—calculating that skipping integration tests would lead to an estimated 14% higher incident rate during flash sales. We agreed on an MVP phase-1 launch with automated canary rollouts, followed by full feature release.`,
          score: 91,
          verdict: 'High Empathy & Pragmatism',
          agentNotes: 'High maturity; converted engineering concerns into business value without adversarial confrontation.'
        }
      ],
      'aiml-engineer': [
        {
          agent: 'Elena',
          role: 'System Architect Agent',
          avatar: '🏛️',
          question: `How do you architect distributed vector indexing across billions of embeddings while maintaining sub-20ms search latency?`,
          answer: `We implement HNSW graph indexing sharded across worker nodes by semantic clusters, combined with product quantization (PQ) to fit indices in GPU VRAM and asynchronous delta sync.`,
          score: 95,
          verdict: 'High-Scale Vector Architecture',
          agentNotes: 'Deep comprehension of approximate nearest neighbor search and GPU memory hierarchies.'
        },
        {
          agent: 'Alex',
          role: 'Tech Lead Agent',
          avatar: '🤖',
          question: `When running model inference with PyTorch, how do you eliminate CUDA kernel launch overhead?`,
          answer: `We use TorchDynamo and TorchInductor with CUDA graphs to capture the computational graph into a single execution launch, avoiding host-to-device roundtrip latency.`,
          score: 94,
          verdict: 'Advanced GPU Optimization',
          agentNotes: 'Spot-on explanation of CUDA graph capture and compilation kernels.'
        },
        {
          agent: 'Marcus',
          role: 'Behavioral & Culture Agent',
          avatar: '🤝',
          question: `How do you navigate deploying an AI model when stakeholders demand 100% deterministic accuracy?`,
          answer: `I set upfront probabilistic expectations, introduce human-in-the-loop escalation thresholds for ambiguous queries, and present precision-recall curves to align on acceptable false-positive risk.`,
          score: 92,
          verdict: 'Clear Boundary Setting',
          agentNotes: 'Pragmatic and transparent communicator who sets healthy boundaries with business units.'
        }
      ]
    };

    const selectedRounds = rounds[targetRole] || rounds['backend-engineer'];
    const transcript = [];

    selectedRounds.forEach(r => {
      transcript.push({
        speaker: `${r.agent} (${r.role})`,
        avatar: r.avatar,
        message: r.question
      });
      transcript.push({
        speaker: candidateName,
        avatar: '👩‍💻',
        message: r.answer
      });
    });

    const agentScores = {
      alex_tech_lead: {
        name: 'Alex',
        role: 'Tech Lead Agent',
        focus: 'Clean Code, Runtime Internals, Algorithmic Execution',
        score: selectedRounds[1].score,
        verdict: selectedRounds[1].verdict,
        feedback: selectedRounds[1].agentNotes
      },
      elena_architect: {
        name: 'Elena',
        role: 'System Architect Agent',
        focus: 'Distributed Systems, High Availability, Scale',
        score: selectedRounds[0].score,
        verdict: selectedRounds[0].verdict,
        feedback: selectedRounds[0].agentNotes
      },
      marcus_behavioral: {
        name: 'Marcus',
        role: 'Behavioral & Culture Agent',
        focus: 'Ownership, Stakeholder Empathy, Conflict Resolution',
        score: selectedRounds[2].score,
        verdict: selectedRounds[2].verdict,
        feedback: selectedRounds[2].agentNotes
      }
    };

    const overallScore = Math.round((agentScores.alex_tech_lead.score + agentScores.elena_architect.score + agentScores.marcus_behavioral.score) / 3);

    return {
      completed: true,
      overallScore,
      timestamp: new Date().toISOString(),
      agents: agentScores,
      transcript
    };
  }
}

module.exports = new InterviewPlanningAgent();
