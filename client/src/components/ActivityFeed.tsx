import React from 'react';
import { Activity, CheckCircle2, Loader2 } from 'lucide-react';

interface ActivityFeedProps {
  logs: string[];
  isStreaming?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs, isStreaming }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div style={{
      marginBottom: '10px',
      padding: '10px 14px',
      background: 'rgba(10, 16, 32, 0.28)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      borderRadius: '10px',
      fontSize: '0.75rem',
      fontFamily: 'var(--font-mono)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#60a5fa',
        fontWeight: 600,
        marginBottom: '6px',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        <Activity size={12} />
        Agent Execution Pipeline Activity
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {logs.map((log, index) => {
          const isDone = log.startsWith('✓');
          const isPending = log.startsWith('●');
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isDone ? '#34d399' : isPending ? '#fbbf24' : '#cbd5e1'
              }}
            >
              {isDone ? (
                <CheckCircle2 size={12} color="#34d399" />
              ) : isPending ? (
                <Loader2 size={12} color="#fbbf24" style={{ animation: 'spin 1.5s linear infinite' }} />
              ) : (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b' }} />
              )}
              <span>{log.replace(/^[✓●]\s*/, '')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
