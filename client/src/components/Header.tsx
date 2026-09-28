import React from 'react';
import { 
  Layers, 
  Cpu, 
  Globe, 
  PlayCircle, 
  Key, 
  FileText, 
  BarChart3,
  ShieldCheck,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { ServerConfigStatus, AuthUser } from '../types';

interface HeaderProps {
  currentView: 'chat' | 'kanban' | 'proposals';
  setCurrentView: (view: 'chat' | 'kanban' | 'proposals') => void;
  onOpenDemo: () => void;
  onOpenApiKeyModal: () => void;
  configStatus: ServerConfigStatus | null;
  toggleMemoryPanel: () => void;
  isMemoryPanelOpen: boolean;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenDemo,
  onOpenApiKeyModal,
  configStatus,
  toggleMemoryPanel,
  isMemoryPanelOpen,
  user,
  onLogout,
}) => {
  return (
    <header style={{
      background: 'var(--bg-header)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      padding: '0 20px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 20
    }}>
      {/* Brand & Platform Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          padding: '2px',
          background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245, 158, 11, 0.55), inset 0 1px 1px #ffffff',
          flexShrink: 0
        }}>
          <img 
            src="/bitcoin-gold.jpg" 
            alt="Capital Bitcoin Logo" 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              letterSpacing: '-0.025em', 
              background: 'linear-gradient(180deg, #ffffff 40%, #fef08a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.3))'
            }}>
              Capital
            </span>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
            }}>
              Tri-Agent System
            </span>
          </div>
          <div style={{ 
            fontSize: '0.70rem', 
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#fbbf24',
            opacity: 0.88,
            marginTop: '1px'
          }}>
            Revenue Intelligence
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Frosted Glass */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '3px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={() => setCurrentView('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: currentView === 'chat' ? '#fff' : 'var(--text-secondary)',
            background: currentView === 'chat' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
            border: currentView === 'chat' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
            boxShadow: currentView === 'chat' ? '0 2px 10px rgba(56, 189, 248, 0.2)' : 'none'
          }}
        >
          <Cpu size={16} color={currentView === 'chat' ? '#38bdf8' : 'var(--text-muted)'} />
          Agent Workspace
        </button>

        <button
          onClick={() => setCurrentView('kanban')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: currentView === 'kanban' ? '#fff' : 'var(--text-secondary)',
            background: currentView === 'kanban' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
            border: currentView === 'kanban' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
            boxShadow: currentView === 'kanban' ? '0 2px 10px rgba(16, 185, 129, 0.2)' : 'none'
          }}
        >
          <BarChart3 size={16} color={currentView === 'kanban' ? '#10b981' : 'var(--text-muted)'} />
          CRM Deals Pipeline
        </button>

        <button
          onClick={() => setCurrentView('proposals')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: currentView === 'proposals' ? '#fff' : 'var(--text-secondary)',
            background: currentView === 'proposals' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
            border: currentView === 'proposals' ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid transparent',
            boxShadow: currentView === 'proposals' ? '0 2px 10px rgba(139, 92, 246, 0.2)' : 'none'
          }}
        >
          <FileText size={16} color={currentView === 'proposals' ? '#8b5cf6' : 'var(--text-muted)'} />
          Proposals & RFPs
        </button>
      </div>

      {/* Right Controls: Demo Walkthrough, Language Selector, Config, Memory Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* End-to-End Demo Scenario Action */}
        <button
          onClick={onOpenDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 13px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(124, 58, 237, 0.25))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            color: '#c084fc',
            fontSize: '0.82rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
          }}
          title="Run Acme Corp Guided Walkthrough"
        >
          <PlayCircle size={15} color="#c084fc" />
          Acme Corp Scenario
        </button>

        {/* LLM Status Indicator */}
        <button
          onClick={onOpenApiKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: configStatus?.llmConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${configStatus?.llmConfigured ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            color: configStatus?.llmConfigured ? '#34d399' : '#fbbf24',
            fontSize: '0.78rem',
            fontWeight: 500,
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}
          title="LLM Provider Configuration"
        >
          <Key size={13} />
          {configStatus?.llmConfigured ? 'OpenAI Active' : 'Capital Engine'}
        </button>

        {/* Toggle RAM / Memory Drawer */}
        <button
          onClick={toggleMemoryPanel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 11px',
            borderRadius: '8px',
            background: isMemoryPanelOpen ? 'rgba(14, 165, 233, 0.22)' : 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isMemoryPanelOpen ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isMemoryPanelOpen ? '#38bdf8' : 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            boxShadow: isMemoryPanelOpen ? '0 0 14px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)' : 'none'
          }}
          title="Toggle Hindsight Long-Term Memory Panel"
        >
          <Layers size={15} />
          Hindsight RAM
        </button>

        {/* User Profile & Sign Out */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '6px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.1 }}>
                  {user.role}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 11px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  color: '#f87171',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                title="Sign out of Capital"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.28)';
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
