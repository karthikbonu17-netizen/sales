import { Router } from 'express';
import db from '../db';
import { hindsightEngine } from '../hindsight/memoryEngine';

const router = Router();

// List all proposals
router.get('/', (req, res) => {
  try {
    const proposals = db.prepare(`
      SELECT p.*, d.title as deal_title, c.name as company_name
      FROM proposals p
      LEFT JOIN deals d ON p.deal_id = d.id
      LEFT JOIN companies c ON d.company_id = c.id
      ORDER BY p.updated_at DESC
    `).all();

    res.json({ proposals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new proposal
router.post('/', (req, res) => {
  try {
    const { deal_id, title, content, total_amount, pricing_tier, assumptions } = req.body;
    const id = `PROP-${Date.now()}`;

    db.prepare(`
      INSERT INTO proposals (id, deal_id, title, content, status, total_amount, pricing_tier, assumptions)
      VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)
    `).run(id, deal_id, title, content, total_amount || 0, pricing_tier || 'Enterprise', assumptions || '');

    const created = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id);
    res.status(201).json({ proposal: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update proposal
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, total_amount, pricing_tier, assumptions } = req.body;

    const existing = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    db.prepare(`
      UPDATE proposals
      SET title = ?, content = ?, status = ?, total_amount = ?, pricing_tier = ?, assumptions = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title ?? existing.title,
      content ?? existing.content,
      status ?? existing.status,
      total_amount ?? existing.total_amount,
      pricing_tier ?? existing.pricing_tier,
      assumptions ?? existing.assumptions,
      id
    );

    const updated = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id);
    res.json({ proposal: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RFP upload & document processing
router.post('/rfp-upload', (req, res) => {
  try {
    const { deal_id, filename, content } = req.body;
    const docId = `DOC-${Date.now()}`;

    db.prepare(`
      INSERT INTO documents (id, deal_id, filename, file_type, content)
      VALUES (?, ?, ?, 'rfp_document', ?)
    `).run(docId, deal_id || null, filename || 'RFP_Requirements.txt', content || '');

    // Ingest into Hindsight Recorder partition as durable customer ground-truth
    const retained = hindsightEngine.retain({
      partition: 'recorder',
      title: `RFP Upload: ${filename || 'Customer RFP Document'}`,
      content: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
      category: 'requirement',
      entity_type: 'deal',
      entity_id: deal_id,
      tags: 'rfp,document,prospect-requirements',
      confidence: 1.0,
      source_ref: `Doc [${docId}]`,
    });

    res.json({
      success: true,
      documentId: docId,
      retainedMemoryId: retained.id,
      message: 'RFP successfully ingested into Document Store and Hindsight Recorder Memory',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
