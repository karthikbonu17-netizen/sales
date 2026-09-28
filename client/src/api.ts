import { AgentType, AuthUser, Deal, DealStage, MemoryRecord, Proposal, ReviewActionPayload, ServerConfigStatus } from './types';

const BASE_URL = '/api';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async getCurrentSession(): Promise<{ success: boolean; token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/session`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to get session');
    }
    return res.json();
  },

  // Config
  async getConfigStatus(): Promise<ServerConfigStatus> {
    const res = await fetch(`${BASE_URL}/config/status`);
    return res.json();
  },

  // Agents Chat
  async sendChatMessage(agentType: AgentType, message: string, language?: string) {
    const res = await fetch(`${BASE_URL}/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentType, message, language }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async getChatHistory(agentType: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/history/${agentType}`);
    return res.json();
  },

  async clearChatHistory(agentType: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/history/${agentType}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Hindsight Memory
  async getMemories(partition?: AgentType, query?: string): Promise<{ memories: MemoryRecord[] }> {
    const params = new URLSearchParams();
    if (partition) params.append('partition', partition);
    if (query) params.append('query', query);
    const res = await fetch(`${BASE_URL}/agents/memory?${params.toString()}`);
    return res.json();
  },

  async retainMemory(record: Partial<MemoryRecord>) {
    const res = await fetch(`${BASE_URL}/agents/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },

  async updateMemory(id: string, updates: Partial<MemoryRecord>) {
    const res = await fetch(`${BASE_URL}/agents/memory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteMemory(id: string) {
    const res = await fetch(`${BASE_URL}/agents/memory/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async clearMemoryPartition(partition: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/memory/partition/${partition}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getMemoryStats(): Promise<{ stats: Record<AgentType, number> }> {
    const res = await fetch(`${BASE_URL}/agents/memory/stats`);
    return res.json();
  },

  // CRM Deals
  async getDeals(): Promise<{ deals: Deal[] }> {
    const res = await fetch(`${BASE_URL}/deals`);
    return res.json();
  },

  async updateDealStage(id: string, stage: DealStage) {
    const res = await fetch(`${BASE_URL}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    return res.json();
  },

  // Proposals
  async getProposals(): Promise<{ proposals: Proposal[] }> {
    const res = await fetch(`${BASE_URL}/proposals`);
    return res.json();
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<{ proposal: Proposal }> {
    const res = await fetch(`${BASE_URL}/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async uploadRfp(deal_id: string, filename: string, content: string) {
    const res = await fetch(`${BASE_URL}/proposals/rfp-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id, filename, content }),
    });
    return res.json();
  },

  // Human-in-the-Loop Actions
  async getPendingActions(): Promise<{ actions: any[] }> {
    const res = await fetch(`${BASE_URL}/actions/pending`);
    return res.json();
  },

  async reviewAction(params: {
    actionId: string;
    decision: 'approved' | 'rejected' | 'edited';
    reviewerName?: string;
    reviewerComments?: string;
    editedPayload?: any;
  }) {
    const res = await fetch(`${BASE_URL}/actions/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },
};
