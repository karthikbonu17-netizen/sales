import { AgentType, AuthUser, Deal, DealStage, MemoryRecord, Proposal, ReviewActionPayload, ServerConfigStatus } from './types';

const BASE_URL = '/api';

async function parseJsonResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || text.trim().startsWith('<')) {
    throw new Error('The server is not responding with JSON. Check that the backend is running and reachable.');
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    const preview = text.slice(0, 180).replace(/\s+/g, ' ');
    throw new Error(`Invalid server response: ${preview || 'empty response'}`);
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await parseJsonResponse<{ error?: string }>(res);
      throw new Error(err.error || 'Authentication failed');
    }
    return parseJsonResponse(res);
  },

  async getCurrentSession(): Promise<{ success: boolean; token: string; user: AuthUser }> {
    const res = await fetch(`${BASE_URL}/auth/session`);
    if (!res.ok) {
      const err = await parseJsonResponse<{ error?: string }>(res);
      throw new Error(err.error || 'Failed to get session');
    }
    return parseJsonResponse(res);
  },

  // Config
  async getConfigStatus(): Promise<ServerConfigStatus> {
    const res = await fetch(`${BASE_URL}/config/status`);
    return parseJsonResponse<ServerConfigStatus>(res);
  },

  // Agents Chat
  async sendChatMessage(agentType: AgentType, message: string, language?: string) {
    const res = await fetch(`${BASE_URL}/agents/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentType, message, language }),
    });
    if (!res.ok) {
      const err = await parseJsonResponse<{ error?: string }>(res);
      throw new Error(err.error || 'Failed to send message');
    }
    return parseJsonResponse(res);
  },

  async getChatHistory(agentType: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/history/${agentType}`);
    return parseJsonResponse(res);
  },

  async clearChatHistory(agentType: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/history/${agentType}`, {
      method: 'DELETE',
    });
    return parseJsonResponse(res);
  },

  // Hindsight Memory
  async getMemories(partition?: AgentType, query?: string): Promise<{ memories: MemoryRecord[] }> {
    const params = new URLSearchParams();
    if (partition) params.append('partition', partition);
    if (query) params.append('query', query);
    const res = await fetch(`${BASE_URL}/agents/memory?${params.toString()}`);
    return parseJsonResponse(res);
  },

  async retainMemory(record: Partial<MemoryRecord>) {
    const res = await fetch(`${BASE_URL}/agents/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return parseJsonResponse(res);
  },

  async updateMemory(id: string, updates: Partial<MemoryRecord>) {
    const res = await fetch(`${BASE_URL}/agents/memory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return parseJsonResponse(res);
  },

  async deleteMemory(id: string) {
    const res = await fetch(`${BASE_URL}/agents/memory/${id}`, {
      method: 'DELETE',
    });
    return parseJsonResponse(res);
  },

  async clearMemoryPartition(partition: AgentType) {
    const res = await fetch(`${BASE_URL}/agents/memory/partition/${partition}`, {
      method: 'DELETE',
    });
    return parseJsonResponse(res);
  },

  async getMemoryStats(): Promise<{ stats: Record<AgentType, number> }> {
    const res = await fetch(`${BASE_URL}/agents/memory/stats`);
    return parseJsonResponse(res);
  },

  // CRM Deals
  async getDeals(): Promise<{ deals: Deal[] }> {
    const res = await fetch(`${BASE_URL}/deals`);
    return parseJsonResponse(res);
  },

  async updateDealStage(id: string, stage: DealStage) {
    const res = await fetch(`${BASE_URL}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    return parseJsonResponse(res);
  },

  // Proposals
  async getProposals(): Promise<{ proposals: Proposal[] }> {
    const res = await fetch(`${BASE_URL}/proposals`);
    return parseJsonResponse(res);
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<{ proposal: Proposal }> {
    const res = await fetch(`${BASE_URL}/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return parseJsonResponse(res);
  },

  async uploadRfp(deal_id: string, filename: string, content: string) {
    const res = await fetch(`${BASE_URL}/proposals/rfp-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id, filename, content }),
    });
    return parseJsonResponse(res);
  },

  // Human-in-the-Loop Actions
  async getPendingActions(): Promise<{ actions: any[] }> {
    const res = await fetch(`${BASE_URL}/actions/pending`);
    return parseJsonResponse(res);
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
    return parseJsonResponse(res);
  },
};
