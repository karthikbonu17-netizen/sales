import { Router } from 'express';
import { orchestrator } from '../agents/orchestrator';
import { hindsightEngine } from '../hindsight/memoryEngine';
import { MemoryPartition } from '../hindsight/types';

const router = Router();

// 1. Streaming / Unified Chat Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { agentType, message, language } = req.body;
    if (!agentType || !message) {
      return res.status(400).json({ error: 'agentType and message are required' });
    }

    if (!['recorder', 'analyst', 'planner'].includes(agentType)) {
      return res.status(400).json({ error: 'Invalid agentType. Must be recorder, analyst, or planner.' });
    }

    const result = await orchestrator.handleChat(agentType as MemoryPartition, message, language);
    res.json(result);
  } catch (err: any) {
    console.error('Agent chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Chat history per agent
router.get('/history/:agentType', (req, res) => {
  try {
    const { agentType } = req.params;
    const history = orchestrator.getChatHistory(agentType as MemoryPartition);
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Clear Chat history (Isolated to that agent, does not affect long-term memory)
router.delete('/history/:agentType', (req, res) => {
  try {
    const { agentType } = req.params;
    const count = orchestrator.clearChatHistory(agentType as MemoryPartition);
    res.json({ success: true, clearedMessages: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Memory CRUD & Query endpoints
router.get('/memory', (req, res) => {
  try {
    const { partition, query, category, entity_id, limit } = req.query;
    const memories = hindsightEngine.recall({
      partition: partition ? (partition as MemoryPartition) : undefined,
      query: query ? String(query) : undefined,
      category: category ? String(category) : undefined,
      entity_id: entity_id ? String(entity_id) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 100,
    });
    res.json({ memories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Retain single memory manually
router.post('/memory', (req, res) => {
  try {
    const { partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref } = req.body;
    if (!partition || !title || !content) {
      return res.status(400).json({ error: 'partition, title, and content are required' });
    }

    const mem = hindsightEngine.retain({
      partition,
      title,
      content,
      category,
      entity_type,
      entity_id,
      tags,
      confidence,
      source_ref: source_ref || `Manual Entry [${new Date().toLocaleDateString()}]`,
    });

    res.status(201).json({ memory: mem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update single memory
router.put('/memory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = hindsightEngine.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Memory item not found' });
    }
    res.json({ memory: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete single memory
router.delete('/memory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = hindsightEngine.delete(id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Clear entire agent memory partition (Isolated)
router.delete('/memory/partition/:partition', (req, res) => {
  try {
    const { partition } = req.params;
    const count = orchestrator.clearAgentMemory(partition as MemoryPartition);
    res.json({ success: true, clearedMemories: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Memory partition statistics
router.get('/memory/stats', (req, res) => {
  try {
    const stats = hindsightEngine.getStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
