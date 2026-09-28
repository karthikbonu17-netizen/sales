import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ShieldCheck,
  Send,
  Eye,
  FileCheck,
  Edit2,
  Check,
  X,
  DollarSign
} from 'lucide-react';
import { Proposal } from '../types';
import { api } from '../api';

export const ProposalsView: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Edit Amount State
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmount, setEditedAmount] = useState<number>(120000);
  const [editedTier, setEditedTier] = useState<string>('Enterprise Annual');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // RFP Upload Form State
  const [rfpTitle, setRfpTitle] = useState('Acme_Corp_RFP_Technical_Specs.pdf');
  const [rfpContent, setRfpContent] = useState(
`ACME CORP RFP - ENTERPRISE REVENUE INTELLIGENCE SYSTEM
Stakeholder: Sarah Chen (CTO)
Scope of Work:
1. Native ERP Integration with automated data pipeline.
2. SAML 2.0 / Okta SSO authentication with role-based governance.
3. SOC2 Type II compliance audit report required before contract execution.
4. Annual subscription billing structure with net-30 payment terms.`
  );
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.getProposals();
      setProposals(res.proposals || []);
      if (res.proposals && res.proposals.length > 0) {
        if (!selectedProposal) {
          setSelectedProposal(res.proposals[0]);
          setEditedAmount(res.proposals[0].total_amount);
          setEditedTier(res.proposals[0].pricing_tier || 'Enterprise Annual');
        } else {
          const updatedSelected = res.proposals.find(p => p.id === selectedProposal.id);
          if (updatedSelected) {
            setSelectedProposal(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleSelectProposal = (prop: Proposal) => {
    setSelectedProposal(prop);
    setEditedAmount(prop.total_amount);
    setEditedTier(prop.pricing_tier || 'Enterprise');
    setIsEditingAmount(false);
    setSaveSuccessMsg('');
  };

  const handleSaveAmount = async () => {
    if (!selectedProposal) return;
    try {
      const res = await api.updateProposal(selectedProposal.id, {
        total_amount: Number(editedAmount),
        pricing_tier: editedTier,
      });
      setIsEditingAmount(false);
      setSaveSuccessMsg(`✓ Updated amount to $${Number(editedAmount).toLocaleString()} ARR!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      fetchProposals();
    } catch (err: any) {
      alert('Error updating amount: ' + err.message);
    }
  };

  const handleRfpUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfpContent.trim()) return;

    try {
      setUploadStatus('Uploading and parsing document into Hindsight Memory Engine...');
      const res = await api.uploadRfp('DEAL-ACME', rfpTitle, rfpContent);
      setUploadStatus(`✓ ${res.message} (Memory ID: ${res.retainedMemoryId})`);
      fetchProposals();
    } catch (err: any) {
      setUploadStatus('Error: ' + err.message);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      background: 'transparent',
      overflow: 'hidden'
    }}>
      {/* Left List of Proposals with Frosted Glass */}
      <div style={{
        width: '380px',
        minWidth: '380px',
        borderRight: '1px solid var(--border-color)',
        background: 'rgba(10, 16, 32, 0.55)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              Generated Proposals & RFPs
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Distinct Amounts & Tiers per Account
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            fontWeight: 700
          }}>
            {proposals.length} Docs
          </span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {proposals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              No proposals generated yet. Ask Agent 3 (Planner) to draft one.
            </div>
          ) : (
            proposals.map((prop) => {
              const isSelected = selectedProposal?.id === prop.id;
              const statusColor =
                prop.status === 'approved' ? '#34d399' :
                prop.status === 'rejected' ? '#f87171' : '#fbbf24';

              return (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProposal(prop)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 44, 0.48)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 20px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                      {prop.title}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: statusColor,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${statusColor}`
                    }}>
                      {prop.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>Amount: <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>${(prop.total_amount || 0).toLocaleString()}</strong></span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>{prop.pricing_tier || 'Tier'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content: Selected Proposal Details + Edit Controls + RFP Ingestion */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px', gap: '20px' }}>
        {/* Proposal Document Preview with Editable Amount */}
        {selectedProposal ? (
          <div style={{
            background: 'rgba(15, 23, 44, 0.55)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.14)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedProposal.title}</h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Tier: <strong style={{ color: '#cbd5e1' }}>{selectedProposal.pricing_tier || 'Enterprise'}</strong> | Status: <strong style={{ color: '#fbbf24' }}>{selectedProposal.status.toUpperCase()}</strong>
                </div>
              </div>

              {/* Amount Display & Edit Trigger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                  ${(selectedProposal.total_amount || 0).toLocaleString()} ARR
                </div>
                <button
                  onClick={() => setIsEditingAmount(!isEditingAmount)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: isEditingAmount ? 'var(--bg-sidebar)' : 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  <Edit2 size={13} />
                  {isEditingAmount ? 'Close' : 'Set Different Amount'}
                </button>
              </div>
            </div>

            {/* Inline Amount Customization Box */}
            {isEditingAmount && (
              <div style={{
                marginBottom: '16px',
                padding: '14px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1.5px solid #3b82f6',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={15} color="#34d399" />
                  Customize Proposal Amount & Pricing Tier:
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Custom Total Amount ($)</label>
                    <input
                      type="number"
                      value={editedAmount}
                      onChange={(e) => setEditedAmount(Number(e.target.value))}
                      style={{ width: '180px', fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pricing Tier</label>
                    <input
                      type="text"
                      value={editedTier}
                      onChange={(e) => setEditedTier(e.target.value)}
                      style={{ width: '220px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <button
                    onClick={handleSaveAmount}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Check size={15} /> Save Amount
                  </button>
                </div>

                {/* Preset Amount Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                  {[85000, 110000, 120000, 140000, 150000, 160000, 195000, 240000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setEditedAmount(preset)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: editedAmount === preset ? '#2563eb' : 'rgba(255,255,255,0.06)',
                        color: editedAmount === preset ? '#fff' : '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {saveSuccessMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
                {saveSuccessMsg}
              </div>
            )}

            {/* Document Content */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#e2e8f0',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {selectedProposal.content}
            </div>

            {selectedProposal.assumptions && (
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Governance Assumptions:</strong> {selectedProposal.assumptions}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a proposal to view structured content.
          </div>
        )}

        {/* RFP Upload & Document Processing Engine */}
        <div style={{
          background: 'rgba(15, 23, 44, 0.55)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.14)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <UploadCloud size={20} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                RFP Ingestion & Document Processing Engine
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Upload customer RFP specs to automatically populate Relational Docs and Hindsight Recorder Memory.
              </div>
            </div>
          </div>

          <form onSubmit={handleRfpUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Document Filename</label>
              <input
                type="text"
                value={rfpTitle}
                onChange={(e) => setRfpTitle(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>RFP Requirements Text</label>
              <textarea
                rows={5}
                value={rfpContent}
                onChange={(e) => setRfpContent(e.target.value)}
                style={{ width: '100%', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '0.78rem', color: uploadStatus.startsWith('✓') ? '#34d399' : '#f59e0b', fontWeight: 500 }}>
                {uploadStatus}
              </div>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <FileCheck size={15} />
                Ingest & Retain Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
