import { AgentType, AuthUser, Deal, DealStage, MemoryRecord, Proposal, ReviewActionPayload, ServerConfigStatus } from './types';
import { clientEngine } from './clientEngine';

const envApiUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : '';
const API_ROOT = envApiUrl ? String(envApiUrl).replace(/\/$/, '') : '';
const BASE_URL = `${API_ROOT}/api`;

async function safeFetch<T>(
  url: string, 
  options?: RequestInit, 
  fallback?: () => Promise<T> | T
): Promise<T> {
  try {
    const res = await fetch(url, options);

    // If server returned 404 NOT_FOUND (like on static Vercel deployment), use client fallback
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      if (fallback) return await fallback();
    }

    const text = await res.text();
    if (!text) {
      if (fallback) return await fallback();
      return {} as T;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html') || text.trim().startsWith('<')) {
      // Vercel or edge HTML error page returned
      if (fallback) return await fallback();
      throw new Error('Server returned HTML instead of JSON');
    }

    const data = JSON.parse(text);
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data as T;
  } catch (err: any) {
    // If backend is not running or unreachable, seamlessly use built-in engine
    if (fallback) {
      return await fallback();
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AuthUser }> {
    return safeFetch(
      `${BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      () => clientEngine.login(email)
    );
  },

  async getCurrentSession(): Promise<{ success: boolean; token: string; user: AuthUser }> {
    return safeFetch(
      `${BASE_URL}/auth/session`,
      undefined,
      () => {
        const saved = localStorage.getItem('salesmind_user');
        const token = localStorage.getItem('salesmind_token') || 'demo_token';
        if (saved) {
          return { success: true, token, user: JSON.parse(saved) };
        }
        return clientEngine.login('alex.morgan@apexsystems.io');
      }
    );
  },

  // Config
  async getConfigStatus(): Promise<ServerConfigStatus> {
    return safeFetch(
      `${BASE_URL}/config/status`,
      undefined,
      () => clientEngine.getConfigStatus()
    );
  },

  // Agents Chat
  async sendChatMessage(agentType: AgentType, message: string, language?: string): Promise<{
    message: string;
    activityLogs: string[];
    reviewCard?: ReviewActionPayload | null;
    retainedMemories?: any[];
  }> {
    return safeFetch(
      `${BASE_URL}/agents/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, message, language }),
      },
      () => clientEngine.sendChatMessage(agentType, message)
    );
  },

  async getChatHistory(agentType: AgentType) {
    return safeFetch(
      `${BASE_URL}/agents/history/${agentType}`,
      undefined,
      () => clientEngine.getChatHistory(agentType)
    );
  },

  async clearChatHistory(agentType: AgentType) {
    return safeFetch(
      `${BASE_URL}/agents/history/${agentType}`,
      { method: 'DELETE' },
      () => clientEngine.clearChatHistory(agentType)
    );
  },

  // Hindsight Memory
  async getMemories(partition?: AgentType, query?: string): Promise<{ memories: MemoryRecord[] }> {
    const params = new URLSearchParams();
    if (partition) params.append('partition', partition);
    if (query) params.append('query', query);
    return safeFetch(
      `${BASE_URL}/agents/memory?${params.toString()}`,
      undefined,
      () => clientEngine.getMemories(partition, query)
    );
  },

  async retainMemory(record: Partial<MemoryRecord>) {
    return safeFetch(
      `${BASE_URL}/agents/memory`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      },
      () => clientEngine.retainMemory(record)
    );
  },

  async updateMemory(id: string, updates: Partial<MemoryRecord>) {
    return safeFetch(
      `${BASE_URL}/agents/memory/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => clientEngine.updateMemory(id, updates)
    );
  },

  async deleteMemory(id: string) {
    return safeFetch(
      `${BASE_URL}/agents/memory/${id}`,
      { method: 'DELETE' },
      () => clientEngine.deleteMemory(id)
    );
  },

  async clearMemoryPartition(partition: AgentType) {
    return safeFetch(
      `${BASE_URL}/agents/memory/partition/${partition}`,
      { method: 'DELETE' },
      () => clientEngine.clearMemoryPartition(partition)
    );
  },

  async getMemoryStats(): Promise<{ stats: Record<AgentType, number> }> {
    return safeFetch(
      `${BASE_URL}/agents/memory/stats`,
      undefined,
      () => clientEngine.getMemoryStats()
    );
  },

  // CRM Deals
  async getDeals(): Promise<{ deals: Deal[] }> {
    return safeFetch(
      `${BASE_URL}/deals`,
      undefined,
      () => clientEngine.getDeals()
    );
  },

  async updateDealStage(id: string, stage: DealStage) {
    return safeFetch(
      `${BASE_URL}/deals/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      },
      () => clientEngine.updateDealStage(id, stage)
    );
  },

  // Proposals
  async getProposals(): Promise<{ proposals: Proposal[] }> {
    return safeFetch(
      `${BASE_URL}/proposals`,
      undefined,
      () => clientEngine.getProposals()
    );
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<{ proposal: Proposal }> {
    return safeFetch(
      `${BASE_URL}/proposals/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => clientEngine.updateProposal(id, updates)
    );
  },

  async uploadRfp(deal_id: string, filename: string, content: string): Promise<{
    success: boolean;
    proposal: Proposal;
    message?: string;
    retainedMemoryId?: string;
  }> {
    return safeFetch(
      `${BASE_URL}/proposals/rfp-upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id, filename, content }),
      },
      () => clientEngine.uploadRfp(deal_id, filename, content)
    );
  },

  // Human-in-the-Loop Actions
  async getPendingActions(): Promise<{ actions: any[] }> {
    return safeFetch(
      `${BASE_URL}/actions/pending`,
      undefined,
      () => clientEngine.getPendingActions()
    );
  },

  async reviewAction(params: {
    actionId: string;
    decision: 'approved' | 'rejected' | 'edited';
    reviewerName?: string;
    reviewerComments?: string;
    editedPayload?: any;
  }): Promise<{ success: boolean; stageUpdatedTo?: string }> {
    return safeFetch(
      `${BASE_URL}/actions/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
      () => clientEngine.reviewAction(params)
    );
  },
};
