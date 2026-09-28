import { Router } from 'express';
import db from '../db';

const router = Router();

// List all deals
router.get('/', (req, res) => {
  try {
    const deals = db.prepare(`
      SELECT 
        d.*,
        c.name as company_name,
        c.industry as company_industry,
        ct.name as contact_name,
        ct.email as contact_email,
        ct.role as contact_role
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      ORDER BY d.updated_at DESC
    `).all();

    res.json({ deals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single deal
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deal = db.prepare(`
      SELECT 
        d.*,
        c.name as company_name,
        c.industry as company_industry,
        ct.name as contact_name,
        ct.email as contact_email,
        ct.role as contact_role
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      WHERE d.id = ?
    `).get(id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const proposals = db.prepare('SELECT * FROM proposals WHERE deal_id = ?').all(id);
    const documents = db.prepare('SELECT * FROM documents WHERE deal_id = ?').all(id);
    const auditLogs = db.prepare('SELECT * FROM audit_logs WHERE deal_id = ? ORDER BY created_at DESC').all(id);

    res.json({ deal, proposals, documents, auditLogs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new deal
router.post('/', (req, res) => {
  try {
    const { company_id, contact_id, title, value, stage, win_probability, requirements, notes } = req.body;
    const id = `DEAL-${Date.now()}`;

    db.prepare(`
      INSERT INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      company_id,
      contact_id || null,
      title,
      value || 0,
      stage || 'New',
      win_probability || 0.2,
      requirements || null,
      notes || null
    );

    const created = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
    res.status(201).json({ deal: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update deal stage or attributes
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { stage, value, win_probability, notes, title } = req.body;

    const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const newStage = stage !== undefined ? stage : existing.stage;
    const newValue = value !== undefined ? value : existing.value;
    const newProb = win_probability !== undefined ? win_probability : existing.win_probability;
    const newNotes = notes !== undefined ? notes : existing.notes;
    const newTitle = title !== undefined ? title : existing.title;

    db.prepare(`
      UPDATE deals
      SET stage = ?, value = ?, win_probability = ?, notes = ?, title = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newStage, newValue, newProb, newNotes, newTitle, id);

    const updated = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
    res.json({ deal: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete deal
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM deals WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
