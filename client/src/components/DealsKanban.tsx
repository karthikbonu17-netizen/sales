import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Building2, 
  User, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Deal, DealStage } from '../types';
import { api } from '../api';

const ALL_STAGES: DealStage[] = [
  'New',
  'Qualified',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Closed-Won',
  'Closed-Lost',
];

const STAGE_COLORS: Record<DealStage, string> = {
  New: '#94a3b8',
  Qualified: '#38bdf8',
  Discovery: '#0ea5e9',
  Proposal: '#8b5cf6',
  Negotiation: '#f59e0b',
  'Closed-Won': '#10b981',
  'Closed-Lost': '#ef4444',
};

export const DealsKanban: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterView, setFilterView] = useState<'all' | 'active' | 'closed'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.getDeals();
      setDeals(res.deals || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      await api.updateDealStage(dealId, newStage);
      fetchDeals();
    } catch (err: any) {
      alert('Error updating deal stage: ' + err.message);
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  // Pipeline metrics calculation
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.win_probability || 0)), 0);
  const closedWonValue = deals.filter(d => d.stage === 'Closed-Won').reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDealsCount = deals.filter(d => d.stage === 'Closed-Won').length;
  const lostDealsCount = deals.filter(d => d.stage === 'Closed-Lost').length;
  const winRate = (wonDealsCount + lostDealsCount) > 0 
    ? Math.round((wonDealsCount / (wonDealsCount + lostDealsCount)) * 100) 
    : 67;

  const visibleStages = ALL_STAGES.filter((stage) => {
    if (filterView === 'active') {
      return stage !== 'Closed-Won' && stage !== 'Closed-Lost';
    }
    if (filterView === 'closed') {
      return stage === 'Closed-Won' || stage === 'Closed-Lost';
    }
    return true;
  });

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      overflow: 'hidden'
    }}>
      {/* Top Metrics Row with Frosted Glass Styling */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 16, 29, 0.52)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 44, 0.48)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.14)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Pipeline Value</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>${totalValue.toLocaleString()}</div>
        </div>

        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 44, 0.48)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.14)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Weighted Revenue Forecast</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>${Math.round(weightedValue).toLocaleString()}</div>
        </div>

        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 44, 0.48)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.14)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Historical Win Rate</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a78bfa' }}>{winRate}%</div>
        </div>

        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 44, 0.48)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.14)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Closed-Won Booked</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>${closedWonValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and Navigation Strip with Frosted Glass */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 16, 29, 0.45)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Stage Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> View:
          </span>
          <button
            onClick={() => setFilterView('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              fontSize: '0.76rem',
              fontWeight: 600,
              background: filterView === 'all' ? 'rgba(37, 99, 235, 0.85)' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              color: filterView === 'all' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (filterView === 'all' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'),
              boxShadow: filterView === 'all' ? '0 2px 10px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            All 7 Stages ({deals.length} Deals)
          </button>
          <button
            onClick={() => setFilterView('active')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              fontSize: '0.76rem',
              fontWeight: 600,
              background: filterView === 'active' ? 'rgba(37, 99, 235, 0.85)' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              color: filterView === 'active' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (filterView === 'active' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'),
              boxShadow: filterView === 'active' ? '0 2px 10px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            Active Pipeline ({deals.filter(d => d.stage !== 'Closed-Won' && d.stage !== 'Closed-Lost').length})
          </button>
          <button
            onClick={() => setFilterView('closed')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              fontSize: '0.76rem',
              fontWeight: 600,
              background: filterView === 'closed' ? 'rgba(37, 99, 235, 0.85)' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              color: filterView === 'closed' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (filterView === 'closed' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'),
              boxShadow: filterView === 'closed' ? '0 2px 10px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            Closed Won & Lost ({wonDealsCount + lostDealsCount})
          </button>
        </div>

        {/* Scroll Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scroll Stages:</span>
          <button
            onClick={scrollLeft}
            style={{
              padding: '5px 8px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Scroll Left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            style={{
              padding: '5px 8px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Scroll Right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div 
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '20px',
          display: 'flex',
          gap: '14px',
          scrollBehavior: 'smooth'
        }}
      >
        {visibleStages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
          const stageColor = STAGE_COLORS[stage];

          return (
            <div
              key={stage}
              style={{
                width: '270px',
                minWidth: '270px',
                background: 'rgba(10, 16, 32, 0.50)',
                backdropFilter: 'blur(18px) saturate(180%)',
                WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.14)'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stageColor }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {stage}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {stageDeals.length}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stageColor }}>
                  ${stageTotal.toLocaleString()}
                </span>
              </div>

              {/* Column Cards */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {stageDeals.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px 10px',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    No deals in {stage}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      style={{
                        padding: '14px',
                        background: 'rgba(16, 25, 48, 0.55)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Deal Title & Company */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                          {deal.company_name || 'Prospect'}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                          ${deal.value.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.3' }}>
                        {deal.title}
                      </div>

                      {/* Contact & Probability */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '6px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} color="#94a3b8" />
                          {deal.contact_name || 'Lead'}
                        </span>
                        <span style={{ fontWeight: 600, color: stageColor }}>
                          {Math.round((deal.win_probability || 0.3) * 100)}% Win Prob
                        </span>
                      </div>

                      {/* Tags / Requirements */}
                      {deal.requirements && (
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {deal.requirements.split(',').slice(0, 2).map((req, idx) => (
                            <span key={idx} style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#93c5fd',
                              padding: '2px 5px',
                              borderRadius: '4px'
                            }}>
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stage Progression Action Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '6px'
                      }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Move Stage:</span>
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            background: 'var(--bg-app)',
                            borderColor: 'var(--border-color)'
                          }}
                        >
                          {ALL_STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
