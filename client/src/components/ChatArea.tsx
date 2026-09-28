import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  Database, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  User, 
  AlertTriangle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { AgentType, ChatMessage } from '../types';
import { api } from '../api';
import { ActivityFeed } from './ActivityFeed';
import { ReviewCard } from './ReviewCard';
import { Card } from './Card';

interface ChatAreaProps {
  activeAgent: AgentType;
  onStateChange: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeAgent,
  onStateChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStreamingLogs, setCurrentStreamingLogs] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentMeta = {
    recorder: {
      name: 'Agent 1: Recorder',
      role: 'Prospecting & Capture Engine',
      accentColor: 'var(--color-recorder)',
      description: 'Records ground-truth customer facts strictly as provided. Queries missing data and executes RETAIN.',
      prompts: [
        'Capture prospect Acme Corp: CTO Sarah Chen, $120,000 deal size, requires ERP integration, SSO, and prefers annual billing.',
        'Get verified NIFTY 50 quote & volume for RELIANCE',
        'Log deal update for CloudTech: Priya Sharma indicated $95k budget with ERP sync.',
      ],
    },
    analyst: {
      name: 'Agent 2: Analyst',
      role: 'Deal Intelligence & Pattern Recognition',
      accentColor: 'var(--color-analyst)',
      description: 'Ingests records from Recorder. Issues RECALL & REFLECT to identify objection patterns, Competitor X win/loss ratio, and cites evidence.',
      prompts: [
        'Analyze Acme Corp objections and our history with similar SaaS proposals.',
        'Analyze TCS: Institutional delivery ratio, VWAP, and all-time drawdown',
        'Reflect on Competitor X win/loss patterns across past deals.',
      ],
    },
    planner: {
      name: 'Agent 3: Planner',
      role: 'Proposals, Execution & Forecasts',
      accentColor: 'var(--color-planner)',
      description: 'Downstream synthesis from Recorder & Analyst. Outlines Evidence, Assumptions, Owner, Next Action, Metric, and holds proposal in Review Card.',
      prompts: [
        'Prepare the meeting briefing and proposal draft for Acme Corp.',
        'Draft equity allocation brief & risk boundary for HDFCBANK',
        'Generate revenue forecast and next actions for Q3 enterprise pipeline.',
      ],
    },
  };

  const currentMeta = agentMeta[activeAgent];

  const fetchHistory = async () => {
    try {
      const res = await api.getChatHistory(activeAgent);
      setMessages(res.history || []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingLogs, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    setInputText('');
    setLoading(true);

    // Stream optimistic operational indicator
    setCurrentStreamingLogs([
      `● Dispatching request to ${currentMeta.name}...`,
      '● Routing through Central Agent Orchestrator...',
    ]);

    try {
      const res = await api.sendChatMessage(activeAgent, text);
      setCurrentStreamingLogs([]);
      await fetchHistory();
      onStateChange();
    } catch (err: any) {
      alert('Error from agent: ' + err.message);
      setCurrentStreamingLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm(`Clear chat conversation for ${currentMeta.name}? Note: Long-term Hindsight memory will remain intact.`)) {
      return;
    }
    try {
      await api.clearChatHistory(activeAgent);
      setMessages([]);
    } catch (err: any) {
      alert('Error clearing chat: ' + err.message);
    }
  };

  const handleClearMemory = async () => {
    if (!window.confirm(`PURGE MEMORY: Are you sure you want to clear the [${activeAgent}] partition in Hindsight? This only purges this agent's partition without impacting other agents.`)) {
      return;
    }
    try {
      await api.clearMemoryPartition(activeAgent);
      alert(`Successfully purged [${activeAgent}] memory partition.`);
      onStateChange();
    } catch (err: any) {
      alert('Error clearing memory: ' + err.message);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Agent Workspace Sub-Header with Glass Theme */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 16, 29, 0.55)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: currentMeta.accentColor,
            boxShadow: `0 0 12px ${currentMeta.accentColor}`
          }} />
          <div>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
              {currentMeta.name}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
              — {currentMeta.role}
            </span>
          </div>
        </div>

        {/* Action Controls: Clear Chat & Clear Memory (Isolated) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleClearChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
            title="Clear active conversation history (Preserves Hindsight RAM)"
          >
            <RotateCcw size={12} />
            Clear Chat
          </button>

          <button
            onClick={handleClearMemory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
            title={`Purge isolated [${activeAgent}] partition memory`}
          >
            <Trash2 size={12} />
            Clear Partition RAM
          </button>
        </div>
      </div>

      {/* Message Feed Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Intro Banner if empty with Clean Glass Card */}
        {messages.length === 0 && (
          <div style={{ maxWidth: '680px', margin: '20px auto', width: '100%' }}>
            <Card style={{
              padding: '28px',
              textAlign: 'center',
              background: 'rgba(10, 16, 32, 0.22)',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${currentMeta.accentColor}30`,
                color: currentMeta.accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: `0 0 24px ${currentMeta.accentColor}50, inset 0 1px 1px rgba(255,255,255,0.2)`
              }}>
                <Bot size={28} />
              </div>
              <h2 style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)'
              }}>
                {currentMeta.name} Workspace Active
              </h2>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#f8fafc',
                  fontWeight: 500,
                  lineHeight: '1.6',
                  marginBottom: '18px',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)'
                }}>
                  {currentMeta.description}
                </p>

                {/* Quick Demo Prompts with Transparent Glass & Opaque Text */}
                <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px' }}>
                  <div style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#93c5fd',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)'
                  }}>
                    <Sparkles size={14} color="#f59e0b" />
                    Suggested Prompts:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentMeta.prompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="ai-bot-prompt-link"
                        style={{
                          textAlign: 'left',
                          padding: '10px 4px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#f8fafc',
                          fontWeight: 500,
                          fontSize: '0.84rem',
                          lineHeight: '1.45',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: 'none',
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ color: '#ffffff', fontWeight: 500 }}>{prompt}</span>
                        <Send size={13} color="#38bdf8" style={{ flexShrink: 0, marginLeft: '10px' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                maxWidth: isUser ? '85%' : '92%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${currentMeta.accentColor}25`,
                  color: currentMeta.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{ flex: 1 }}>
                {/* Agent Activity Progress Stream */}
                {!isUser && msg.activityLogs && msg.activityLogs.length > 0 && (
                  <ActivityFeed logs={msg.activityLogs} />
                )}

                {/* Message Bubble with Transparent Glass Theme & Opaque Text */}
                {!isUser ? (
                  <Card style={{
                    padding: '16px 20px',
                    borderRadius: '14px 14px 14px 2px',
                    background: 'transparent',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    border: 'none',
                    color: '#ffffff',
                    boxShadow: 'none'
                  }}>
                    <div className="markdown-body" style={{ color: '#ffffff' }} dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.text)
                    }} />
                  </Card>
                ) : (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '14px 14px 2px 14px',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(59, 130, 246, 0.95))',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                  }}>
                    <div className="markdown-body" dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.text)
                    }} />
                  </div>
                )}

                {/* Embedded Human-in-the-Loop Review Card if planner generated one */}
                {!isUser && msg.reviewCard && (
                  <ReviewCard reviewCard={msg.reviewCard} onActionComplete={onStateChange} />
                )}

                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  textAlign: isUser ? 'right' : 'left'
                }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>

              {isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}

        {/* Active Streaming Activity Indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', maxWidth: '90%' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `${currentMeta.accentColor}25`,
              color: currentMeta.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <ActivityFeed logs={currentStreamingLogs} isStreaming />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Glass Theme */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(10, 16, 29, 0.58)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
      }}>
        {/* Quick prompt strip */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '2px' }}>
          {currentMeta.prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '5px 12px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
              }}
            >
              <Sparkles size={11} color="#f59e0b" />
              {prompt.slice(0, 48)}...
            </button>
          ))}
        </div>

        {/* Text Input Row with Glass Theme */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(15, 23, 44, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '12px',
          padding: '4px 6px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
        }}>
          <input
            type="text"
            placeholder={`Message ${currentMeta.name} (e.g. Acme Corp updates, NIFTY 50 quotes, proposals)...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '0.88rem',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !inputText.trim()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading || !inputText.trim() ? 0.45 : 1,
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
              cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer',
              border: 'none',
              outline: 'none',
            }}
          >
            <Send size={18} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <span>
            Engine Status: <strong style={{ color: '#34d399' }}>Online</strong> • Partition: <code>{activeAgent}</code>
          </span>
          <span>
            Human-in-the-Loop Guardrails Active
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple Markdown Formatter
function formatMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');

  // Line breaks
  html = html.replace(/\n\n/gim, '<br/><br/>');
  html = html.replace(/\n/gim, '<br/>');

  return html;
}
