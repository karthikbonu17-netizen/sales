import React from 'react';
import { 
  ClipboardList, 
  LineChart, 
  Workflow, 
  ChevronRight, 
  Database,
  ArrowDown,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AgentType } from '../types';

interface AgentNavigationProps {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  memoryStats: Record<AgentType, number>;
}

export const AgentNavigation: React.FC<AgentNavigationProps> = ({
  activeAgent,
  setActiveAgent,
  memoryStats,
}) => {
  const agents = [
    {
      id: 'recorder' as AgentType,
      number: '1',
      name: 'Recorder',
      role: 'Prospecting & Capture Engine',
      primitive: 'RETAIN',
      color: 'var(--color-recorder)',
      bgColor: 'var(--color-recorder-bg)',
      icon: ClipboardList,
      description: 'Captures and structures ground-truth information directly from user interactions.',
      handoff: 'Feeds ground-truth records into Analyst partition',
    },
    {
      id: 'analyst' as AgentType,
      number: '2',
      name: 'Analyst',
      role: 'Deal Intelligence & Pattern Recognition',
      primitive: 'RECALL + REFLECT',
      color: 'var(--color-analyst)',
      bgColor: 'var(--color-analyst-bg)',
      icon: LineChart,
      description: 'Ingests records from Recorder; detects cross-deal win/loss patterns & competitor friction.',
      handoff: 'Feeds synthesized findings into Planner partition',
    },
    {
      id: 'planner' as AgentType,
      number: '3',
      name: 'Planner',
      role: 'Proposals, Execution & Forecasts',
      primitive: 'ACTION + GOVERNANCE',
      color: 'var(--color-planner)',
      bgColor: 'var(--color-planner-bg)',
      icon: Workflow,
      description: 'Synthesizes recommendations, drafts tailored RFP proposals, holds execution for Human-in-the-Loop review.',
      handoff: 'Produces Human-in-the-Loop Review Cards',
    },
  ];

  return (
    <div style={{
      width: '320px',
      minWidth: '320px',
      background: 'var(--bg-sidebar)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--border-color)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 14px',
      overflowY: 'auto'
    }}>
      <div>
        {/* Navigation Section Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          padding: '0 4px'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Pipeline Agents
          </span>
          <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Orchestrator Ready
          </span>
        </div>

        {/* 3 Specialized Agents Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const isSelected = activeAgent === agent.id;
            const count = memoryStats[agent.id] || 0;

            return (
              <React.Fragment key={agent.id}>
                <div
                  onClick={() => setActiveAgent(agent.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: isSelected ? agent.bgColor : 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1.5px solid ${isSelected ? agent.color : 'rgba(255, 255, 255, 0.12)'}`,
                    boxShadow: isSelected 
                      ? `0 8px 24px ${agent.color}30, inset 0 1px 1px rgba(255, 255, 255, 0.2)` 
                      : '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar: Icon + Name + Number + Memory Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? agent.color : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#fff' : agent.color,
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                            {agent.name}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-muted)'
                          }}>
                            Agent {agent.number}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? agent.color : 'var(--text-secondary)' }}>
                          {agent.role}
                        </div>
                      </div>
                    </div>

                    {/* Memory Count Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '3px 7px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#fff' : 'var(--text-muted)'
                    }} title={`Hindsight RAM partition contains ${count} items`}>
                      <Database size={11} color={agent.color} />
                      {count}
                    </div>
                  </div>

                  {/* Description & Operational Role */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                    {agent.description}
                  </div>

                  {/* Memory Primitive Tag */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.68rem',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      color: agent.color,
                      fontWeight: 600,
                      background: 'rgba(0,0,0,0.2)',
                      padding: '2px 5px',
                      borderRadius: '4px'
                    }}>
                      {agent.primitive}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Partition Isolated
                    </span>
                  </div>
                </div>

                {/* Handoff Arrow Indicator */}
                {index < 2 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    margin: '-4px 0',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)'
                  }}>
                    <ArrowDown size={13} color="var(--border-color)" />
                    <span>Handoff</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Shared Memory & Handoff Protocol Card */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <Lock size={13} color="#38bdf8" />
          Unidirectional Context Protocol
        </div>
        <div>
          • <strong>Recorder</strong>: writes raw interaction memory.<br />
          • <strong>Analyst</strong>: ingests Recorder logs, synthesizes macro patterns.<br />
          • <strong>Planner</strong>: ingests both, executes briefs under Human Approval.
        </div>
      </div>
    </div>
  );
};
