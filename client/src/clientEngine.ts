import { AgentType, AuthUser, Deal, DealStage, MemoryRecord, Proposal, ReviewActionPayload, ServerConfigStatus } from './types';

// Default initial seeded deals across all 7 Kanban stages
const INITIAL_DEALS: Deal[] = [
  // Stage: New
  {
    id: 'DEAL-NEW-1',
    company_id: 'COMP-NEW-1',
    company_name: 'Apex Logistics Corp',
    company_industry: 'Logistics & Supply Chain',
    contact_name: 'Marcus Brody',
    contact_email: 'marcus.brody@apexlogistics.com',
    contact_role: 'VP Supply Chain',
    title: 'Apex Global Fleet Telemetry Integration',
    value: 85000,
    stage: 'New',
    win_probability: 0.20,
    requirements: 'Fleet tracking API, ERP sync, Real-time telemetry ingestion',
    objections: 'Legacy on-premise hardware compatibility concerns',
    notes: 'Inbound enterprise inquiry; looking to replace outdated dispatch system',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'DEAL-NEW-2',
    company_id: 'COMP-NEW-2',
    company_name: 'HealthPulse Diagnostics',
    company_industry: 'Healthcare Technology',
    contact_name: 'Dr. Aris Thorne',
    contact_email: 'aris.thorne@healthpulse.io',
    contact_role: 'Chief Medical Information Officer',
    title: 'HealthPulse Clinical Analytics Suite',
    value: 110000,
    stage: 'New',
    win_probability: 0.25,
    requirements: 'HIPAA Compliance, EHR integration, HL7/FHIR compliance',
    objections: 'Security audit lead times',
    notes: 'Requested technical architecture overview and compliance attestation',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Qualified
  {
    id: 'DEAL-QUAL-1',
    company_id: 'COMP-QUAL-1',
    company_name: 'DataStream Analytics',
    company_industry: 'Big Data / SaaS',
    contact_name: 'Nathan Vance',
    contact_email: 'nathan@datastream.io',
    contact_role: 'Head of Data Platforms',
    title: 'DataStream Enterprise Pipeline Ingestion',
    value: 150000,
    stage: 'Qualified',
    win_probability: 0.35,
    requirements: 'Snowflake connector, SOC2 Type II, 99.99% uptime SLA',
    objections: 'Budget allocation timing across quarters',
    notes: 'BANT criteria verified; budget approved for Q4 enterprise rollout',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'DEAL-QUAL-2',
    company_id: 'COMP-QUAL-2',
    company_name: 'Vanguard Retail Systems',
    company_industry: 'Retail Tech',
    contact_name: 'Lisa Ray',
    contact_email: 'lisa.ray@vanguardretail.com',
    contact_role: 'Director of Enterprise IT',
    title: 'Vanguard Omni-Channel Sales Platform',
    value: 90000,
    stage: 'Qualified',
    win_probability: 0.30,
    requirements: 'POS sync, Annual upfront billing, Custom reports',
    notes: 'Discovery workshop scheduled; high interest in autonomous pipeline analysis',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Discovery
  {
    id: 'DEAL-ACME',
    company_id: 'COMP-ACME',
    company_name: 'Acme Corp',
    company_industry: 'Enterprise Technology',
    contact_name: 'Sarah Chen',
    contact_email: 'sarah.chen@acme.com',
    contact_role: 'Chief Technology Officer (CTO)',
    title: 'Acme Corp Revenue Intelligence Expansion',
    value: 120000,
    stage: 'Discovery',
    win_probability: 0.45,
    requirements: 'ERP integration, SSO authentication, Annual billing preference',
    objections: 'Evaluating Competitor X; sensitive to implementation rollout time',
    notes: 'Sarah Chen emphasized annual terms, SAML SSO, and priority implementation support',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'DEAL-DISC-2',
    company_id: 'COMP-DISC-2',
    company_name: 'BlueHorizon Telecom',
    company_industry: 'Telecommunications',
    contact_name: 'David Keller',
    contact_email: 'd.keller@bluehorizon.net',
    contact_role: 'VP Infrastructure',
    title: 'BlueHorizon Billing Mediation Engine',
    value: 175000,
    stage: 'Discovery',
    win_probability: 0.50,
    requirements: 'High throughput event processing, 24/7 dedicated support',
    objections: 'Implementation lead time must be under 6 weeks',
    notes: 'Technical discovery completed; preparing customized architecture proposal',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Proposal
  {
    id: 'DEAL-PROP-1',
    company_id: 'COMP-PROP-1',
    company_name: 'Sterling BioPharma',
    company_industry: 'Pharmaceuticals',
    contact_name: 'Dr. Evelyn Cross',
    contact_email: 'e.cross@sterlingbio.com',
    contact_role: 'VP Clinical Systems',
    title: 'Sterling Clinical Trial Data Lake',
    value: 210000,
    stage: 'Proposal',
    win_probability: 0.65,
    requirements: 'FDA 21 CFR Part 11 compliance, Audit trail export, SAML SSO',
    notes: 'Formal RFP response delivered; awaiting committee evaluation',
    created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Negotiation
  {
    id: 'DEAL-NEG-1',
    company_id: 'COMP-NEG-1',
    company_name: 'Apex Financial Holdings',
    company_industry: 'Financial Services',
    contact_name: 'Julian Sterling',
    contact_email: 'j.sterling@apexfin.com',
    contact_role: 'Chief Risk Officer',
    title: 'Apex Institutional Risk & Hindsight Engine',
    value: 340000,
    stage: 'Negotiation',
    win_probability: 0.80,
    requirements: 'SOC2 Type II, On-premise air-gapped deployment, Custom SLA',
    objections: 'Indemnity clause language under review by legal counsel',
    notes: 'Commercial terms agreed; redline review in final phase with legal team',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Closed-Won
  {
    id: 'DEAL-WON-1',
    company_id: 'COMP-WON-1',
    company_name: 'Aether Cloud Networks',
    company_industry: 'Cloud Infrastructure',
    contact_name: 'Sophia Martinez',
    contact_email: 'sophia@aethercloud.com',
    contact_role: 'Head of Global Revenue Operations',
    title: 'Aether Tri-Agent Autonomous Revenue Ops',
    value: 180000,
    stage: 'Closed-Won',
    win_probability: 1.0,
    requirements: 'Multi-region deployment, Custom webhooks, 100 enterprise seats',
    notes: 'Master Services Agreement executed; onboarding kickoff scheduled',
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
    updated_at: new Date().toISOString()
  },
  // Stage: Closed-Lost
  {
    id: 'DEAL-LOST-1',
    company_id: 'COMP-LOST-1',
    company_name: 'Legacy Rail Corp',
    company_industry: 'Transportation',
    contact_name: 'Robert Hastings',
    contact_email: 'rhastings@legacyrail.com',
    contact_role: 'CIO',
    title: 'Legacy Rail Asset Analytics Pilot',
    value: 75000,
    stage: 'Closed-Lost',
    win_probability: 0.0,
    requirements: 'Mainframe COBOL connectors',
    objections: 'Postponed internal digital transformation to next fiscal year',
    notes: 'Opportunity lost to internal project postponement; re-engage in Q3',
    created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'PROP-001',
    deal_id: 'DEAL-ACME',
    deal_title: 'Acme Corp Revenue Intelligence Expansion',
    company_name: 'Acme Corp',
    title: 'Acme Corp Autonomous Tri-Agent Architecture & Revenue Intelligence Proposal',
    version: 1,
    status: 'draft',
    total_amount: 120000,
    pricing_tier: 'Enterprise Annual Tier',
    assumptions: 'Annual billing upfront; includes ERP sync connector and dedicated customer engineer',
    content: `# Enterprise Architecture & Proposal: Acme Corp

## Executive Overview
Prepared specifically for Sarah Chen, CTO at Acme Corp. This proposal establishes the deployment of Capital Revenue Intelligence Platform, incorporating autonomous Tri-Agent orchestration (Recorder, Analyst, and Planner) with partition-isolated Hindsight long-term memory.

## Key Deliverables & Scopes
1. **Recorder Agent Ingestion**: Real-time sales conversation synthesis, CRM bi-directional sync, and structured requirement extraction.
2. **Analyst Agent Core**: Continuous deal velocity tracking, objection counter-positioning, and predictive win scoring.
3. **Planner Agent Automation**: Automated RFP ingestion, commercial contract generation, and executive quote generation with human-in-the-loop review.
4. **Hindsight Long-Term Memory**: Secure partition isolation ensuring enterprise data privacy and persistent context across pipeline cycles.

## Commercial Terms & Investment
- **Base Enterprise License**: $100,000 / year (Annual Billing)
- **ERP Integration Suite**: $20,000 one-time onboarding
- **Total Annual Commitment**: $120,000
- **Implementation Timeline**: 4 Weeks with guaranteed production readiness.`,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'PROP-002',
    deal_id: 'DEAL-PROP-1',
    deal_title: 'Sterling Clinical Trial Data Lake',
    company_name: 'Sterling BioPharma',
    title: 'Sterling BioPharma 21 CFR Part 11 Compliant Intelligence Platform',
    version: 2,
    status: 'pending_approval',
    total_amount: 210000,
    pricing_tier: 'Life Sciences Regulatory Tier',
    assumptions: 'Includes validated audit trail export, SSO, and 99.99% high-availability SLA',
    content: `# Life Sciences Enterprise Architecture: Sterling BioPharma

## Solution Architecture
Capital Tri-Agent orchestration configured to meet FDA 21 CFR Part 11 compliance standards. Features tamper-evident cryptographic audit logs, immutable Hindsight memory partitions, and automated executive governance.

## Financial Summary
- **Validated Platform Deployment**: $180,000 / year
- **Compliance Certification & Validation Pack**: $30,000
- **Total Investment**: $210,000`,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_MEMORIES: MemoryRecord[] = [
  {
    id: 'MEM-REC-1',
    partition: 'recorder',
    title: 'Acme Corp Implementation Constraints',
    content: 'Sarah Chen (CTO) requested SAML SSO authentication, ERP sync compatibility, and expressed strong preference for annual billing terms.',
    category: 'requirements',
    entity_type: 'deal',
    entity_id: 'DEAL-ACME',
    tags: 'sso, erp, billing-annual, sarah-chen',
    confidence: 0.95,
    source_ref: 'Sarah Chen Discovery Meeting',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'MEM-ANA-1',
    partition: 'analyst',
    title: 'Competitor X Evaluation & Price Objection Risk',
    content: 'Acme Corp is concurrently evaluating Competitor X. Counter-position with autonomous Tri-Agent orchestration and superior 4-week onboarding timeline vs Competitor X 14-week timeline.',
    category: 'competitive_intel',
    entity_type: 'deal',
    entity_id: 'DEAL-ACME',
    tags: 'competitor-x, differentiation, velocity',
    confidence: 0.92,
    source_ref: 'Analyst Evaluation Matrix',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'MEM-PLAN-1',
    partition: 'planner',
    title: 'Acme Corp Proposal Recommendation',
    content: 'Structured proposal around $120k annual commitment with bundled ERP sync connector to offset Competitor X discounting.',
    category: 'pricing_strategy',
    entity_type: 'deal',
    entity_id: 'DEAL-ACME',
    tags: 'pricing, annual-discount, proposal-v1',
    confidence: 0.94,
    source_ref: 'Planner Deal Strategy Model',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Local state helpers with LocalStorage persistence
function loadStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`capital_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`capital_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

class ClientEngineService {
  private deals: Deal[] = loadStorage('deals', INITIAL_DEALS);
  private proposals: Proposal[] = loadStorage('proposals', INITIAL_PROPOSALS);
  private memories: MemoryRecord[] = loadStorage('memories', INITIAL_MEMORIES);
  private chatHistory: Record<AgentType, any[]> = loadStorage('chats', {
    recorder: [],
    analyst: [],
    planner: []
  });
  private pendingActions: ReviewActionPayload[] = loadStorage('actions', [
    {
      id: 'ACT-001',
      action_type: 'stage_progression',
      deal_id: 'DEAL-ACME',
      dealTitle: 'Acme Corp Revenue Intelligence Expansion',
      currentStage: 'Discovery',
      proposedStage: 'Proposal',
      amount: 120000,
      title: 'Advance Acme Corp to Proposal Stage',
      summary: 'Analyst Agent identified all discovery requirements satisfied (ERP compatibility confirmed, CTO buy-in secured). Recommends advancing deal to Proposal stage.',
      status: 'pending',
      requiresApproval: true
    }
  ]);

  login(email: string): { success: boolean; token: string; user: AuthUser } {
    const cleanEmail = email.trim();
    const namePart = cleanEmail.split('@')[0] || 'User';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[\._]/g, ' ');
    const user: AuthUser = {
      id: 'USR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: cleanEmail === 'alex.morgan@apexsystems.io' ? 'Alex Morgan' : formattedName,
      email: cleanEmail,
      role: 'VP of Revenue',
      orgId: 'ORG-001'
    };
    const token = 'demo_capital_jwt_' + btoa(cleanEmail) + '_' + Date.now();
    return { success: true, token, user };
  }

  getConfigStatus(): ServerConfigStatus {
    return {
      llmConfigured: false,
      model: 'Built-in Capital Intelligence Engine',
      databaseType: 'Active In-Browser Engine',
      serverPort: 5001
    };
  }

  getDeals(): { deals: Deal[] } {
    return { deals: [...this.deals] };
  }

  updateDealStage(id: string, stage: DealStage): { success: boolean; deal?: Deal } {
    const deal = this.deals.find(d => d.id === id);
    if (deal) {
      deal.stage = stage;
      deal.updated_at = new Date().toISOString();
      saveStorage('deals', this.deals);
      return { success: true, deal };
    }
    return { success: false };
  }

  getProposals(): { proposals: Proposal[] } {
    return { proposals: [...this.proposals] };
  }

  updateProposal(id: string, updates: Partial<Proposal>): { proposal: Proposal } {
    let prop = this.proposals.find(p => p.id === id);
    if (!prop) {
      throw new Error('Proposal not found');
    }
    Object.assign(prop, updates, { updated_at: new Date().toISOString() });
    saveStorage('proposals', this.proposals);
    return { proposal: prop };
  }

  uploadRfp(deal_id: string, filename: string, content: string): { success: boolean; proposal: Proposal; message: string; retainedMemoryId: string } {
    const deal = this.deals.find(d => d.id === deal_id);
    const newProp: Proposal = {
      id: 'PROP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      deal_id,
      deal_title: deal ? deal.title : 'Enterprise Deal',
      company_name: deal ? deal.company_name : 'Enterprise Client',
      title: `Generated Response for ${filename}`,
      version: 1,
      status: 'draft',
      total_amount: deal ? deal.value : 100000,
      pricing_tier: 'Enterprise Custom Tier',
      assumptions: 'Automated synthesis from uploaded RFP requirements document',
      content: `# Autonomous RFP Response: ${filename}

## Client Specifications Extracted
${content.slice(0, 400)}...

## Capital Technical Architecture Response
1. **Tri-Agent Orchestration**: Seamless deployment of Recorder, Analyst, and Planner engines.
2. **Long-Term Hindsight RAM**: Partition-isolated memory keeping historical decision vectors intact.
3. **Security Standards**: SOC2 Type II, enterprise TLS encryption, and RBAC governance.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.proposals.unshift(newProp);
    saveStorage('proposals', this.proposals);
    return { 
      success: true, 
      proposal: newProp,
      message: 'RFP specifications ingested and proposal drafted',
      retainedMemoryId: 'MEM-RFP-' + Date.now().toString().slice(-4)
    };
  }

  getMemories(partition?: AgentType, query?: string): { memories: MemoryRecord[] } {
    let filtered = [...this.memories];
    if (partition) {
      filtered = filtered.filter(m => m.partition === partition);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(m => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || (m.tags && m.tags.toLowerCase().includes(q)));
    }
    return { memories: filtered };
  }

  retainMemory(record: Partial<MemoryRecord>): { success: boolean; memory: MemoryRecord } {
    const newMem: MemoryRecord = {
      id: 'MEM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      partition: record.partition || 'recorder',
      title: record.title || 'Untitled Memory',
      content: record.content || '',
      category: record.category || 'general',
      entity_type: record.entity_type || 'deal',
      entity_id: record.entity_id || 'DEAL-ACME',
      tags: record.tags || '',
      confidence: record.confidence || 0.9,
      source_ref: record.source_ref || 'Agent Ingestion',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.memories.unshift(newMem);
    saveStorage('memories', this.memories);
    return { success: true, memory: newMem };
  }

  updateMemory(id: string, updates: Partial<MemoryRecord>): { success: boolean; memory: MemoryRecord } {
    const mem = this.memories.find(m => m.id === id);
    if (!mem) throw new Error('Memory not found');
    Object.assign(mem, updates, { updated_at: new Date().toISOString() });
    saveStorage('memories', this.memories);
    return { success: true, memory: mem };
  }

  deleteMemory(id: string): { success: boolean } {
    this.memories = this.memories.filter(m => m.id !== id);
    saveStorage('memories', this.memories);
    return { success: true };
  }

  clearMemoryPartition(partition: AgentType): { success: boolean } {
    this.memories = this.memories.filter(m => m.partition !== partition);
    saveStorage('memories', this.memories);
    return { success: true };
  }

  getMemoryStats(): { stats: Record<AgentType, number> } {
    return {
      stats: {
        recorder: this.memories.filter(m => m.partition === 'recorder').length,
        analyst: this.memories.filter(m => m.partition === 'analyst').length,
        planner: this.memories.filter(m => m.partition === 'planner').length
      }
    };
  }

  getPendingActions(): { actions: ReviewActionPayload[] } {
    return { actions: this.pendingActions.filter(a => a.status === 'pending') };
  }

  reviewAction(params: { actionId: string; decision: 'approved' | 'rejected' | 'edited'; reviewerComments?: string; editedPayload?: any }): { success: boolean; stageUpdatedTo?: string } {
    const act = this.pendingActions.find(a => a.id === params.actionId);
    if (act) {
      act.status = params.decision;
      if (params.decision === 'approved' && act.deal_id && act.proposedStage) {
        this.updateDealStage(act.deal_id, act.proposedStage as DealStage);
      }
      saveStorage('actions', this.pendingActions);
      return { success: true, stageUpdatedTo: act.proposedStage || 'Proposal' };
    }
    return { success: true, stageUpdatedTo: 'Proposal' };
  }

  getChatHistory(agentType: AgentType): { history: any[] } {
    return { history: this.chatHistory[agentType] || [] };
  }

  clearChatHistory(agentType: AgentType): { success: boolean } {
    this.chatHistory[agentType] = [];
    saveStorage('chats', this.chatHistory);
    return { success: true };
  }

  sendChatMessage(agentType: AgentType, message: string): {
    message: string;
    activityLogs: string[];
    reviewCard?: ReviewActionPayload | null;
    retainedMemories?: any[];
  } {
    const logs: string[] = [
      `[${agentType.toUpperCase()}] Request received: "${message.slice(0, 35)}..."`,
      `[HINDSIGHT] Queried partition "${agentType}" (${this.memories.filter(m => m.partition === agentType).length} records inspected)`
    ];

    let reply = '';
    let reviewCard: ReviewActionPayload | null = null;

    if (agentType === 'recorder') {
      logs.push(`[RECORDER] Extracted requirement entities and verified against active CRM deals`);
      logs.push(`[HINDSIGHT] Committed new contextual knowledge graph node`);
      reply = `I have analyzed and recorded the details into the CRM and Hindsight Memory. 

**Extracted Context:**
- Identified enterprise requirement parameters.
- Synced deal state across active revenue pipelines.
- Updated long-term memory partition \`recorder\` with high confidence.

Would you like me to hand this off to the **Analyst Agent** for competitive risk analysis, or to the **Planner Agent** for proposal drafting?`;
    } else if (agentType === 'analyst') {
      logs.push(`[ANALYST] Evaluating win probability vector for Acme Corp & active pipeline`);
      logs.push(`[ANALYST] Competitor counter-positioning matrix computed`);
      reply = `**Pipeline & Deal Health Analysis:**
- **Acme Corp ($120k)**: Win probability is currently evaluated at **45%**.
- **Key Driver**: CTO Sarah Chen has prioritized annual billing and ERP integration.
- **Competitor Risk**: Competitor X is actively pitching. Recommended counter-position: highlight Capital's autonomous Tri-Agent orchestration and 4-week deployment SLA.

I have updated the deal telemetry and generated an action card to advance the deal to the **Proposal** stage.`;
      
      reviewCard = {
        id: 'ACT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        action_type: 'stage_progression',
        deal_id: 'DEAL-ACME',
        dealTitle: 'Acme Corp Revenue Intelligence Expansion',
        currentStage: 'Discovery',
        proposedStage: 'Proposal',
        amount: 120000,
        title: 'Advance Acme Corp to Proposal Stage',
        summary: 'Discovery objectives met. Transition deal from Discovery to Proposal stage with $120,000 annual commitment.',
        status: 'pending',
        requiresApproval: true
      };
      this.pendingActions.push(reviewCard);
      saveStorage('actions', this.pendingActions);
    } else {
      logs.push(`[PLANNER] Synthesized commercial structure and proposal artifacts`);
      logs.push(`[PLANNER] Applied pricing model based on Hindsight memory benchmarks`);
      reply = `I have drafted the commercial proposal for **Acme Corp**:
- **Title**: Acme Corp Autonomous Tri-Agent Architecture & Revenue Intelligence Proposal
- **Annual Commitment**: $120,000 (Annual Upfront Terms)
- **Included Modules**: Recorder Agent, Analyst Intelligence Core, Planner Automation & Hindsight Isolated RAM.

You can inspect and edit the complete draft directly in the **Proposals Tab**!`;
    }

    const newHistoryItem = {
      id: 'MSG-' + Math.random().toString(36).substring(2, 9),
      agentType,
      sender: 'agent',
      text: reply,
      activityLogs: logs,
      reviewCard,
      createdAt: new Date().toISOString()
    };
    if (!this.chatHistory[agentType]) this.chatHistory[agentType] = [];
    this.chatHistory[agentType].push(newHistoryItem);
    saveStorage('chats', this.chatHistory);

    return { 
      message: reply, 
      activityLogs: logs, 
      reviewCard,
      retainedMemories: [newHistoryItem]
    };
  }
}

export const clientEngine = new ClientEngineService();
