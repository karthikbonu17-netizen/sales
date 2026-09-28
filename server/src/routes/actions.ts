import { Router } from 'express';
import db from '../db';
import { hindsightEngine } from '../hindsight/memoryEngine';

const router = Router();

// List pending review actions
router.get('/pending', (req, res) => {
  try {
    const actions = db.prepare(`
      SELECT a.*, d.title as deal_title, d.stage as current_stage, c.name as company_name
      FROM audit_logs a
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
    `).all();

    const formatted = actions.map((a: any) => ({
      ...a,
      payload: a.payload ? JSON.parse(a.payload) : {},
    }));

    res.json({ actions: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Human-in-the-loop review validation endpoint (Approve, Edit, Reject)
router.post('/approve', (req, res) => {
  try {
    const { actionId, decision, reviewerName, reviewerComments, editedPayload } = req.body;

    if (!actionId || !decision) {
      return res.status(400).json({ error: 'actionId and decision (approved|rejected|edited) are required' });
    }

    const log = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(actionId) as any;
    if (!log) {
      return res.status(404).json({ error: 'Action not found in audit logs' });
    }

    const payload = log.payload ? JSON.parse(log.payload) : {};
    const reviewer = reviewerName || 'Human Operator (Sales Executive)';
    const status = decision; // 'approved', 'rejected', 'edited'

    // Update Audit Log
    db.prepare(`
      UPDATE audit_logs
      SET status = ?, reviewed_by = ?, reviewer_comments = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(status, reviewer, reviewerComments || null, actionId);

    let stageUpdatedTo = '';
    let retainedOutcomeMemId = '';

    if (decision === 'approved' || decision === 'edited') {
      const targetDealId = log.deal_id || payload.deal_id;
      const proposedStage = payload.proposedStage || 'Proposal';

      // 1. Advance deal stage in relational store
      if (targetDealId) {
        db.prepare(`
          UPDATE deals
          SET stage = ?, win_probability = 0.65, updated_at = datetime('now')
          WHERE id = ?
        `).run(proposedStage, targetDealId);
        stageUpdatedTo = proposedStage;
      }

      // 2. Mark proposal as approved
      if (log.proposal_id) {
        db.prepare(`
          UPDATE proposals
          SET status = 'approved', updated_at = datetime('now')
          WHERE id = ?
        `).run(log.proposal_id);
      }

      // 3. Store the Deal Outcome in Hindsight Memory System (Retain Outcome step)
      const outcomeMem = hindsightEngine.retain({
        partition: 'planner',
        title: `Approved Milestone: Proposal Authorized for ${payload.recipient || 'Prospect'}`,
        content: `Human Operator signed off on ${payload.title || 'Proposal Dispatch'}.
Deal stage updated to "${proposedStage}".
Audit Record: ${actionId}. Comments: "${reviewerComments || 'Standard authorization given'}".`,
        category: 'win_loss',
        entity_type: 'deal',
        entity_id: targetDealId,
        tags: 'governance,approval,deal-progression,human-in-the-loop',
        confidence: 1.0,
        source_ref: `Audit [${actionId}]`,
      });
      retainedOutcomeMemId = outcomeMem.id;
    } else if (decision === 'rejected') {
      // Mark proposal as rejected
      if (log.proposal_id) {
        db.prepare(`
          UPDATE proposals
          SET status = 'rejected', updated_at = datetime('now')
          WHERE id = ?
        `).run(log.proposal_id);
      }

      // Retain rejection rationale for future planning
      hindsightEngine.retain({
        partition: 'planner',
        title: `Rejected Action: ${payload.title || 'Proposal Dispatch'}`,
        content: `Proposal rejected by ${reviewer}. Reason: "${reviewerComments || 'Disapproved by operator'}".`,
        category: 'objection',
        entity_type: 'deal',
        entity_id: log.deal_id,
        tags: 'governance,rejection,human-in-the-loop',
        confidence: 1.0,
        source_ref: `Audit [${actionId}]`,
      });
    }

    res.json({
      success: true,
      actionId,
      status,
      reviewer,
      stageUpdatedTo,
      retainedOutcomeMemId,
      message: `Action successfully processed with status: ${status}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
