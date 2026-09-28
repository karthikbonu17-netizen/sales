export type AgentType = 'recorder' | 'analyst' | 'planner';

export interface ChatMessage {
  id: string;
  agentType: AgentType;
  sender: 'user' | 'agent';
  text: string;
  activityLogs?: string[];
  reviewCard?: ReviewActionPayload | null;
  language?: string;
  createdAt?: string;
}

export interface ReviewActionPayload {
  id: string;
  action_type: string;
  deal_id?: string;
  proposal_id?: string;
  title: string;
  dealTitle?: string;
  currentStage?: string;
  proposedStage?: string;
  amount?: number;
  recipient?: string;
  summary: string;
  proposalSnippet?: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  requiresApproval?: boolean;
}

export interface MemoryRecord {
  id: string;
  partition: AgentType;
  title: string;
  content: string;
  category?: string;
  entity_type?: string;
  entity_id?: string;
  tags?: string;
  confidence?: number;
  source_ref?: string;
  created_at?: string;
  updated_at?: string;
}

export type DealStage =
  | 'New'
  | 'Qualified'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed-Won'
  | 'Closed-Lost';

export interface Deal {
  id: string;
  company_id: string;
  contact_id?: string;
  company_name?: string;
  company_industry?: string;
  contact_name?: string;
  contact_email?: string;
  contact_role?: string;
  title: string;
  value: number;
  stage: DealStage;
  win_probability: number;
  requirements?: string;
  objections?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  deal_id: string;
  deal_title?: string;
  company_name?: string;
  title: string;
  version: number;
  content: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  total_amount: number;
  pricing_tier?: string;
  assumptions?: string;
  created_at: string;
  updated_at: string;
}

export interface ServerConfigStatus {
  llmConfigured: boolean;
  model: string;
  databaseType: string;
  serverPort: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string;
}
