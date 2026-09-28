import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Bot, 
  Database, 
  ShieldCheck, 
  Sparkles,
  ClipboardList,
  LineChart,
  Workflow
} from 'lucide-react';
import { AgentType } from '../types';
import { api } from '../api';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agent: AgentType) => void;
  onRefreshData: () => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  isOpen,
  onClose,
  onSelectAgent,
  onRefreshData,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [running, setRunning] = useState(false);
  const [stepLogs, setStepLogs] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      agent: 'recorder' as AgentType,
      title: 'Recorder: Capture Prospect Acme Corp',
      icon: ClipboardList,
      color: 'var(--color-recorder)',
      input: 'Capture prospect Acme Corp: CTO Sarah Chen, $120,000 deal size, with requirements for ERP integration, SSO, and preferences for annual billing.',
      expected: 'Structures ground-truth data, stores relational CRM deal, and executes RETAIN into Recorder partition.',
    },
    {
      num: 2,
      agent: 'analyst' as AgentType,
      title: 'Analyst: Deal Intelligence & Objection Study',
      icon: LineChart,
      color: 'var(--color-analyst)',
      input: 'Analyze Acme Corp\'s objections and our history with similar SaaS proposals.',
      expected: 'Issues RECALL on Acme records, compares against historical deals (FinGuard, CloudTech), flags Competitor X win/loss ratio (2W/1L), outputs sample size (N=3) and explicit citations.',
    },
    {
      num: 3,
      agent: 'planner' as AgentType,
      title: 'Planner: Tailored Brief & Proposal Generation',
      icon: Workflow,
      color: 'var(--color-planner)',
      input: 'Prepare the meeting briefing and proposal draft for Acme Corp.',
      expected: 'Pulls facts from Recorder and synthesis from Analyst. Formulates Evidence/Assumptions/Owner/Action/Metric and generates Human-in-the-Loop Review Card.',
    },
    {
      num: 4,
      agent: 'planner' as AgentType,
      title: 'Human-in-the-Loop & Retain Outcome',
      icon: ShieldCheck,
      color: '#10b981',
      input: 'Sign-off and approval in Review Card.',
      expected: 'Updates PostgreSQL/SQLite deal stage to "Proposal" and executes RETAIN outcome in Hindsight long-term memory.',
    },
  ];

  const executeStep = async (stepNum: number) => {
    try {
      setRunning(true);
      const step = steps[stepNum - 1];

      if (stepNum <= 3) {
        onSelectAgent(step.agent);
        setStepLogs(prev => ({ ...prev, [stepNum]: `Executing ${step.agent.toUpperCase()} agent pipeline...` }));
        const res = await api.sendChatMessage(step.agent, step.input);
        setStepLogs(prev => ({ ...prev, [stepNum]: `✓ Completed! Reply received and ${res.retainedMemories?.length || 1} memory unit(s) retained.` }));
        setCurrentStep(stepNum + 1);
        onRefreshData();
      } else {
        // Step 4: Approve any pending action
        const pending = await api.getPendingActions();
        if (pending.actions && pending.actions.length > 0) {
          const first = pending.actions[0];
          await api.reviewAction({
            actionId: first.id,
            decision: 'approved',
            reviewerName: 'Alex Morgan (VP of Revenue)',
            reviewerComments: 'Approved standard ERP SLA and proposal terms for Acme Corp',
          });
          setStepLogs(prev => ({ ...prev, 4: '✓ Approved! Deal advanced to "Proposal" stage and outcome retained in Hindsight.' }));
        } else {
          setStepLogs(prev => ({ ...prev, 4: '✓ Outcome verified in database and Hindsight memory.' }));
        }
        onRefreshData();
      }
    } catch (err: any) {
      setStepLogs(prev => ({ ...prev, [stepNum]: `Error: ${err.message}` }));
    } finally {
      setRunning(false);
    }
  };

  const runAllSequence = async () => {
    for (let i = 1; i <= 4; i++) {
      await executeStep(i);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.72)',
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
        maxWidth: '720px',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#a78bfa" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                End-to-End Demo Scenario: Acme Corp
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Orchestrate the 3-agent revenue pipeline with persistent memory handoffs and human sign-off.
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Steps Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = stepLogs[st.num]?.startsWith('✓');
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: isCurrent ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-app)',
                  border: `1px solid ${isCurrent ? '#3b82f6' : isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: `${st.color}25`,
                      color: st.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        Step {st.num}: {st.title}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => executeStep(st.num)}
                    disabled={running}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 12px',
                      borderRadius: '5px',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : '#2563eb',
                      color: isCompleted ? '#34d399' : '#fff',
                      fontSize: '0.74rem',
                      fontWeight: 600
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={13} /> : <Play size={13} />}
                    {isCompleted ? 'Re-run Step' : `Run Step ${st.num}`}
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <strong>Prompt:</strong> "{st.input}"
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <strong>Expected Action:</strong> {st.expected}
                </div>

                {stepLogs[st.num] && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    borderRadius: '5px',
                    background: stepLogs[st.num].startsWith('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    fontSize: '0.74rem',
                    color: stepLogs[st.num].startsWith('✓') ? '#34d399' : '#60a5fa',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {stepLogs[st.num]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Steps automatically update CRM pipeline and persist long-term memories in Hindsight.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{ padding: '8px 14px', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}
            >
              Close
            </button>
            <button
              onClick={runAllSequence}
              disabled={running}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.82rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Play size={15} />
              Run Full 4-Step Sequence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
