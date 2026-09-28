import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { MemoryPartition } from '../hindsight/types';
import { hindsightEngine } from '../hindsight/memoryEngine';
import { recorderAgent, AgentExecutionResult } from './recorder';
import { analystAgent } from './analyst';
import { plannerAgent } from './planner';

export class CentralAgentOrchestrator {
  async handleChat(
    agentType: MemoryPartition,
    userInput: string,
    language?: string
  ): Promise<{
    messageId: string;
    agentType: MemoryPartition;
    reply: string;
    activityLogs: string[];
    retainedMemories?: any[];
    reviewCard?: any;
    language: string;
  }> {
    const userMessageId = `MSG-U-${Date.now()}`;
    const agentMessageId = `MSG-A-${Date.now()}`;

    // Store user message in DB
    db.prepare(`
      INSERT INTO chat_messages (id, agent_type, sender, text, language)
      VALUES (?, ?, 'user', ?, ?)
    `).run(userMessageId, agentType, userInput, language || 'en');

    let result: AgentExecutionResult;

    switch (agentType) {
      case 'recorder':
        result = await recorderAgent.process(userInput, language);
        break;
      case 'analyst':
        result = await analystAgent.process(userInput, language);
        break;
      case 'planner':
        result = await plannerAgent.process(userInput, language);
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Store agent message in DB
    db.prepare(`
      INSERT INTO chat_messages (id, agent_type, sender, text, activity_logs, review_action, language)
      VALUES (?, ?, 'agent', ?, ?, ?, ?)
    `).run(
      agentMessageId,
      agentType,
      result.reply,
      JSON.stringify(result.activityLogs),
      result.reviewCard ? JSON.stringify(result.reviewCard) : null,
      language || 'en'
    );

    return {
      messageId: agentMessageId,
      agentType,
      reply: result.reply,
      activityLogs: result.activityLogs,
      retainedMemories: result.retainedMemories,
      reviewCard: result.reviewCard,
      language: language || 'en',
    };
  }

  getChatHistory(agentType: MemoryPartition) {
    const rows = db.prepare(`
      SELECT * FROM chat_messages
      WHERE agent_type = ?
      ORDER BY created_at ASC
    `).all(agentType) as any[];

    return rows.map((r) => ({
      id: r.id,
      agentType: r.agent_type,
      sender: r.sender,
      text: r.text,
      activityLogs: r.activity_logs ? JSON.parse(r.activity_logs) : [],
      reviewCard: r.review_action ? JSON.parse(r.review_action) : null,
      language: r.language,
      createdAt: r.created_at,
    }));
  }

  clearChatHistory(agentType: MemoryPartition) {
    // Isolated chat clear - does NOT affect long-term Hindsight memory
    const info = db.prepare('DELETE FROM chat_messages WHERE agent_type = ?').run(agentType);
    return info.changes;
  }

  clearAgentMemory(agentType: MemoryPartition) {
    // Isolated memory clear - purges only its partition without impacting other agents
    return hindsightEngine.clearPartition(agentType);
  }
}

export const orchestrator = new CentralAgentOrchestrator();
