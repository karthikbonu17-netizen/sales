import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { MemoryPartition, MemoryRecord, RecallQuery, ReflectResult } from './types';

export class HindsightMemoryEngine {
  /**
   * RETAIN: Persist durable facts, preferences, objections, competitor insights, and win/loss analyses.
   */
  retain(record: {
    partition: MemoryPartition;
    title: string;
    content: string;
    category?: string;
    entity_type?: string;
    entity_id?: string;
    tags?: string;
    confidence?: number;
    source_ref?: string;
    metadata?: Record<string, any>;
  }): MemoryRecord {
    const id = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const metadataStr = record.metadata ? JSON.stringify(record.metadata) : null;
    const confidence = record.confidence ?? 1.0;

    const stmt = db.prepare(`
      INSERT INTO hindsight_memories (
        id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      record.partition,
      record.title,
      record.content,
      record.category || 'fact',
      record.entity_type || null,
      record.entity_id || null,
      record.tags || null,
      confidence,
      record.source_ref || null,
      metadataStr
    );

    return this.getById(id)!;
  }

  /**
   * RECALL: Semantic & structured lookup of relevant historical interaction points.
   */
  recall(params: RecallQuery = {}): MemoryRecord[] {
    const { query, partition, entity_type, entity_id, category, limit = 50 } = params;

    let sql = 'SELECT * FROM hindsight_memories WHERE 1=1';
    const bindings: any[] = [];

    if (partition) {
      if (Array.isArray(partition)) {
        sql += ` AND partition IN (${partition.map(() => '?').join(', ')})`;
        bindings.push(...partition);
      } else {
        sql += ' AND partition = ?';
        bindings.push(partition);
      }
    }

    if (entity_type) {
      sql += ' AND entity_type = ?';
      bindings.push(entity_type);
    }

    if (entity_id) {
      sql += ' AND (entity_id = ? OR content LIKE ? OR title LIKE ?)';
      bindings.push(entity_id, `%${entity_id}%`, `%${entity_id}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      bindings.push(category);
    }

    if (query && query.trim().length > 0) {
      const terms = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (terms.length > 0) {
        const queryConditions = terms
          .map(() => '(LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(source_ref) LIKE ?)')
          .join(' OR ');
        sql += ` AND (${queryConditions})`;
        terms.forEach((t) => {
          const pattern = `%${t}%`;
          bindings.push(pattern, pattern, pattern, pattern);
        });
      }
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    bindings.push(limit);

    const rows = db.prepare(sql).all(...bindings) as MemoryRecord[];
    return rows;
  }

  /**
   * REFLECT: Synthesize patterns, cross-deal objections, and macro sales intelligence over accumulated data.
   */
  reflect(scope?: { entity_id?: string; category?: string; query?: string }): ReflectResult {
    // Ingest all records from recorder and analyst for cross-deal synthesis
    const memories = this.recall({
      partition: ['recorder', 'analyst'],
      limit: 100,
      query: scope?.query,
      entity_id: scope?.entity_id,
      category: scope?.category,
    });

    const sampleSize = memories.length;

    // Pattern recognition over historical memories
    const objectionsMap: Record<string, { count: number; examples: string[] }> = {};
    const competitorMap: Record<string, { winCount: number; lossCount: number; notes: string[] }> = {};
    const pricingSensitivities: string[] = [];
    const winDrivers: string[] = [];
    const lossDrivers: string[] = [];

    for (const mem of memories) {
      const text = `${mem.title} ${mem.content}`.toLowerCase();

      // Check objections
      if (mem.category === 'objection' || text.includes('objection') || text.includes('concern')) {
        let patternKey = 'Implementation Timeline & Integration';
        if (text.includes('price') || text.includes('budget') || text.includes('expensive') || text.includes('cost')) {
          patternKey = 'Pricing & Annual Commitment Friction';
          pricingSensitivities.push(`[${mem.source_ref || mem.id}] ${mem.title}: ${mem.content}`);
        } else if (text.includes('competitor x') || text.includes('competitor') || text.includes('alternative')) {
          patternKey = 'Competitor Feature Parity / Displace Risk';
        } else if (text.includes('security') || text.includes('sso') || text.includes('compliance')) {
          patternKey = 'Enterprise Security & SSO Requirements';
        }

        if (!objectionsMap[patternKey]) {
          objectionsMap[patternKey] = { count: 0, examples: [] };
        }
        objectionsMap[patternKey].count += 1;
        objectionsMap[patternKey].examples.push(`[${mem.source_ref || mem.id}] ${mem.title}`);
      }

      // Check competitors
      if (text.includes('competitor x') || text.includes('competitor')) {
        const comp = 'Competitor X';
        if (!competitorMap[comp]) {
          competitorMap[comp] = { winCount: 0, lossCount: 0, notes: [] };
        }
        if (text.includes('won') || text.includes('win') || text.includes('closed-won')) {
          competitorMap[comp].winCount += 1;
        } else if (text.includes('lost') || text.includes('loss') || text.includes('closed-lost')) {
          competitorMap[comp].lossCount += 1;
        }
        competitorMap[comp].notes.push(`[${mem.source_ref || mem.id}] ${mem.content}`);
      }

      // Check win/loss drivers
      if (mem.category === 'win_loss' || text.includes('closed-won') || text.includes('won')) {
        winDrivers.push(`[${mem.source_ref || mem.id}] ${mem.title}`);
      } else if (text.includes('closed-lost') || text.includes('lost')) {
        lossDrivers.push(`[${mem.source_ref || mem.id}] ${mem.title}`);
      }
    }

    const objectionList = Object.entries(objectionsMap).map(([pattern, data]) => ({
      pattern,
      count: data.count,
      examples: data.examples.slice(0, 3),
    }));

    const competitorList = Object.entries(competitorMap).map(([competitor, data]) => ({
      competitor,
      winCount: data.winCount,
      lossCount: data.lossCount,
      notes: data.notes.slice(0, 2).join(' | '),
    }));

    const summary = `Synthesized ${sampleSize} historical memory items across accounts. Found ${objectionList.length} primary objection patterns and identified Competitor X evaluations.`;

    return {
      summary,
      sampleSize,
      evidenceItems: memories.slice(0, 8),
      patterns: {
        objections: objectionList,
        competitors: competitorList,
        pricingSensitivities: pricingSensitivities.slice(0, 5),
        winDrivers: winDrivers.slice(0, 5),
        lossDrivers: lossDrivers.slice(0, 5),
      },
    };
  }

  getById(id: string): MemoryRecord | null {
    const row = db.prepare('SELECT * FROM hindsight_memories WHERE id = ?').get(id) as MemoryRecord | undefined;
    return row || null;
  }

  update(id: string, updates: Partial<MemoryRecord>): MemoryRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(updates.tags);
    }
    if (updates.confidence !== undefined) {
      fields.push('confidence = ?');
      values.push(updates.confidence);
    }

    fields.push("updated_at = datetime('now')");

    values.push(id);
    const sql = `UPDATE hindsight_memories SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return this.getById(id);
  }

  delete(id: string): boolean {
    const info = db.prepare('DELETE FROM hindsight_memories WHERE id = ?').run(id);
    return info.changes > 0;
  }

  clearPartition(partition: MemoryPartition): number {
    const info = db.prepare('DELETE FROM hindsight_memories WHERE partition = ?').run(partition);
    return info.changes;
  }

  getStats(): Record<MemoryPartition, number> {
    const rows = db
      .prepare('SELECT partition, COUNT(*) as count FROM hindsight_memories GROUP BY partition')
      .all() as { partition: MemoryPartition; count: number }[];

    const stats: Record<MemoryPartition, number> = {
      recorder: 0,
      analyst: 0,
      planner: 0,
    };

    rows.forEach((r) => {
      if (stats[r.partition] !== undefined) {
        stats[r.partition] = r.count;
      }
    });

    return stats;
  }
}

export const hindsightEngine = new HindsightMemoryEngine();
