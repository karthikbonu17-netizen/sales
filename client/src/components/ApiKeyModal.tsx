import React from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { ServerConfigStatus } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  configStatus: ServerConfigStatus | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  configStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              LLM Provider Configuration & Security
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Current Status Badge */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: configStatus?.llmConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${configStatus?.llmConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {configStatus?.llmConfigured ? (
              <CheckCircle2 size={18} color="#34d399" />
            ) : (
              <AlertCircle size={18} color="#fbbf24" />
            )}
            <strong style={{ color: configStatus?.llmConfigured ? '#34d399' : '#fbbf24', fontSize: '0.88rem' }}>
              {configStatus?.llmConfigured ? 'Live OpenAI API Key Configured' : 'Running on Built-in Capital Intelligence Engine'}
            </strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {configStatus?.llmConfigured
              ? `Connected to model "${configStatus.model}" via server-side isolated adapter.`
              : 'Deterministic revenue intelligence rules, deep pattern synthesis, and citations are fully operational.'}
          </div>
        </div>

        {/* Setup Instructions */}
        <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '8px' }}>
            To connect a custom OpenAI API Key for dynamic multi-turn LLM generation:
          </p>
          <ol style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>
              Open the root <code>.env</code> file in your project directory.
            </li>
            <li>
              Add or update your key:
              <pre style={{
                margin: '6px 0',
                padding: '8px 10px',
                background: '#0b0f17',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}>
                OPENAI_API_KEY=sk-proj-your-api-key-here
              </pre>
            </li>
            <li>Restart the backend server (<code>npm run dev</code>).</li>
          </ol>
        </div>

        {/* Strict Security Guardrail Banner */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#93c5fd'
        }}>
          <ShieldCheck size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Strict Enterprise Security Separation:</strong> All keys and credentials remain server-side in <code>server/src/config.ts</code> and are never leaked to client bundles, local storage, or browser network payloads.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: '#2563eb',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
