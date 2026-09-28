import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Send, 
  FileText, 
  ArrowRight,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import { ReviewActionPayload } from '../types';
import { api } from '../api';

interface ReviewCardProps {
  reviewCard: ReviewActionPayload;
  onActionComplete?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ reviewCard, onActionComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSnippet, setEditedSnippet] = useState(reviewCard.proposalSnippet || '');
  const [reviewerComments, setReviewerComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'edited'>(reviewCard.status);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleDecision = async (decision: 'approved' | 'rejected' | 'edited') => {
    try {
      setLoading(true);
      const res = await api.reviewAction({
        actionId: reviewCard.id,
        decision,
        reviewerName: 'Alex Morgan (VP of Revenue)',
        reviewerComments: reviewerComments || (decision === 'approved' ? 'Approved proposal dispatch & stage advancement' : 'Rejected proposal dispatch'),
        editedPayload: decision === 'edited' ? { ...reviewCard, proposalSnippet: editedSnippet } : undefined,
      });

      setStatus(decision);
      setIsEditing(false);
      setFeedbackMsg(
        decision === 'approved' 
          ? `✓ Proposal authorized! Deal stage advanced to "${res.stageUpdatedTo || 'Proposal'}" & persisted to Hindsight.`
          : decision === 'edited'
          ? `✓ Proposal edits approved! Stage updated to "${res.stageUpdatedTo}".`
          : `✕ Proposal rejected. Outcome logged in Hindsight governance log.`
      );

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err: any) {
      alert('Error updating action: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: '14px',
      marginBottom: '10px',
      padding: '18px',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: `1.5px solid ${status === 'approved' ? 'rgba(16, 185, 129, 0.5)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)'}`,
      borderRadius: '12px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
      position: 'relative'
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: status === 'approved' ? '#34d399' : status === 'rejected' ? '#f87171' : '#60a5fa'
          }}>
            <ShieldAlert size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
              Human-in-the-Loop Review Card
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Execution held for mandatory operator sign-off
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '12px',
          background: status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: status === 'approved' ? '#34d399' : status === 'rejected' ? '#f87171' : '#fbbf24',
          border: `1px solid ${status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b'}`
        }}>
          {status}
        </div>
      </div>

      {/* Target Details Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '8px',
        padding: '10px 12px',
        background: 'var(--bg-app)',
        border: '1px solid var(--border-color)',
        borderRadius: '7px',
        fontSize: '0.78rem',
        marginBottom: '12px'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>TARGET ACCOUNT</span>
          <strong style={{ color: '#fff' }}>{reviewCard.dealTitle || 'Acme Corp'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>PRIMARY RECIPIENT</span>
          <span style={{ color: '#38bdf8' }}>{reviewCard.recipient || 'Sarah Chen (CTO)'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>CONTRACT SCOPE</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>${(reviewCard.amount || 120000).toLocaleString()} ARR</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>PIPELINE STAGE PROGRESSION</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 600 }}>
            {reviewCard.currentStage || 'Discovery'} <ArrowRight size={11} /> {reviewCard.proposedStage || 'Proposal'}
          </span>
        </div>
      </div>

      {/* Proposal / Draft Preview */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Draft Document Preview:
          </span>
          {status === 'pending' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                color: '#38bdf8'
              }}
            >
              <Edit3 size={12} />
              {isEditing ? 'Cancel Edit' : 'Edit Draft'}
            </button>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editedSnippet}
            onChange={(e) => setEditedSnippet(e.target.value)}
            style={{
              width: '100%',
              minHeight: '120px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.4,
              padding: '10px',
              borderRadius: '6px'
            }}
          />
        ) : (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            maxHeight: '140px',
            overflowY: 'auto'
          }}>
            {editedSnippet}
          </div>
        )}
      </div>

      {/* Reviewer Comments (if in editing or pending) */}
      {status === 'pending' && (
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Reviewer notes or approval conditions (e.g. Authorized 4-week ERP SLA guarantee)..."
            value={reviewerComments}
            onChange={(e) => setReviewerComments(e.target.value)}
            style={{ width: '100%', fontSize: '0.78rem' }}
          />
        </div>
      )}

      {/* Feedback Alert if completed */}
      {feedbackMsg && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '6px',
          background: status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: status === 'approved' ? '#34d399' : '#f87171',
          fontSize: '0.78rem',
          fontWeight: 600,
          marginBottom: '10px'
        }}>
          {feedbackMsg}
        </div>
      )}

      {/* Action Buttons (Approve / Edit / Reject) */}
      {status === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => handleDecision('rejected')}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <XCircle size={15} />
            Reject
          </button>

          {isEditing ? (
            <button
              onClick={() => handleDecision('edited')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <Check size={15} />
              Save Edits & Approve
            </button>
          ) : (
            <button
              onClick={() => handleDecision('approved')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                borderRadius: '6px',
                background: '#10b981',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle size={15} />
              Approve & Advance Deal Stage
            </button>
          )}
        </div>
      )}
    </div>
  );
};
