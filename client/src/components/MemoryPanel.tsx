import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Trash2, 
  Edit2, 
  Plus, 
  Tag, 
  ShieldAlert, 
  X, 
  RefreshCw,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AgentType, MemoryRecord } from '../types';
import { api } from '../api';

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgent: AgentType;
  onMemoryChange: () => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  isOpen,
  onClose,
  activeAgent,
  onMemoryChange,
}) => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [filterPartition, setFilterPartition] = useState<AgentType | 'all'>(activeAgent);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('fact');
  const [newTags, setNewTags] = useState('');
  const [newPartition, setNewPartition] = useState<AgentType>(activeAgent);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const partitionParam = filterPartition === 'all' ? undefined : filterPartition;
      const res = await api.getMemories(partitionParam, searchQuery);
      setMemories(res.memories || []);
    } catch (err: any) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFilterPartition(activeAgent);
    }
  }, [activeAgent, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [filterPartition, searchQuery, isOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete memory item "${id}"? This action cannot be undone.`)) return;
    try {
      await api.deleteMemory(id);
      fetchMemories();
      onMemoryChange();
    } catch (err: any) {
      alert('Error deleting memory: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingMemory) return;
    try {
      await api.updateMemory(editingMemory.id, {
        title: editingMemory.title,
        content: editingMemory.content,
        category: editingMemory.category,
        tags: editingMemory.tags,
      });
      setEditingMemory(null);
      fetchMemories();
      onMemoryChange();
    } catch (err: any) {
      alert('Error updating memory: ' + err.message);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await api.retainMemory({
        partition: newPartition,
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      fetchMemories();
      onMemoryChange();
    } catch (err: any) {
      alert('Error creating memory: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      width: '380px',
      minWidth: '380px',
      background: 'rgba(10, 16, 29, 0.58)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 15,
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              Hindsight Memory
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Long-Term Context Engine (RAM)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              fontSize: '0.74rem',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)'
            }}
            title="Retain new memory manually"
          >
            <Plus size={13} /> Retain
          </button>
          <button
            onClick={fetchMemories}
            style={{ padding: '5px', color: 'var(--text-muted)' }}
            title="Refresh memory records"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            style={{ padding: '5px', color: 'var(--text-muted)' }}
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Partition Filter Tabs with Frosted Glass */}
      <div style={{
        display: 'flex',
        margin: '10px 14px 6px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '3px',
        borderRadius: '9px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08)'
      }}>
        {(['all', 'recorder', 'analyst', 'planner'] as const).map((part) => (
          <button
            key={part}
            onClick={() => setFilterPartition(part)}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              borderRadius: '6px',
              color: filterPartition === part ? '#fff' : 'var(--text-muted)',
              background: filterPartition === part ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              border: filterPartition === part ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
              boxShadow: filterPartition === part ? '0 2px 8px rgba(56, 189, 248, 0.15)' : 'none'
            }}
          >
            {part}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search recalled memories, tags, or citations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '30px', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      {/* Memories List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Recalling memory partition records...
          </div>
        ) : memories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No memories found in the {filterPartition === 'all' ? 'Hindsight system' : `[${filterPartition}] partition`}.
          </div>
        ) : (
          memories.map((mem) => {
            const partitionColor =
              mem.partition === 'recorder' ? 'var(--color-recorder)' :
              mem.partition === 'analyst' ? 'var(--color-analyst)' : 'var(--color-planner)';

            return (
              <div
                key={mem.id}
                style={{
                  padding: '13px',
                  background: 'rgba(15, 23, 44, 0.52)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
                }}
              >
                {/* Top Row: Partition & Category Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: partitionColor,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${partitionColor}`
                    }}>
                      {mem.partition}
                    </span>
                    {mem.category && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-muted)'
                      }}>
                        {mem.category}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => setEditingMemory(mem)}
                      style={{ padding: '3px', color: 'var(--text-muted)' }}
                      title="Edit memory item"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      style={{ padding: '3px', color: '#f87171' }}
                      title="Delete memory item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {mem.title}
                </div>

                {/* Content */}
                <div style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.45',
                  marginBottom: '8px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {mem.content}
                </div>

                {/* Footer: Source Ref & Tags */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  {mem.source_ref && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: '#38bdf8'
                    }}>
                      {mem.source_ref}
                    </span>
                  )}
                  {mem.tags && (
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {mem.tags.split(',').map((t, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.62rem',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-muted)',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: '#fff' }}>Edit Hindsight Memory Record</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Title</label>
                <input
                  type="text"
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Content / Durable Facts</label>
                <textarea
                  rows={4}
                  value={editingMemory.content}
                  onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingMemory.tags || ''}
                  onChange={(e) => setEditingMemory({ ...editingMemory, tags: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingMemory(null)}
                  style={{ padding: '6px 12px', borderRadius: '6px', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 600 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Memory Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <form onSubmit={handleCreateNew} style={{
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: '#fff' }}>Retain Long-Term Memory</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Partition</label>
                <select
                  value={newPartition}
                  onChange={(e) => setNewPartition(e.target.value as AgentType)}
                  style={{ width: '100%' }}
                >
                  <option value="recorder">Recorder (Prospecting & Capture)</option>
                  <option value="analyst">Analyst (Deal Intelligence)</option>
                  <option value="planner">Planner (Proposals & Forecasts)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="fact">Fact / Profile</option>
                  <option value="preference">Buyer Preference</option>
                  <option value="objection">Objection / Friction</option>
                  <option value="competitor">Competitor Footprint</option>
                  <option value="win_loss">Win / Loss Reason</option>
                  <option value="plan">Strategic Plan</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp - Executive SSO Requirement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter durable facts, customer statements, or benchmark data..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tags</label>
                <input
                  type="text"
                  placeholder="e.g. acme, sso, security, compliance"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '6px', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: 600 }}
                >
                  Retain to Hindsight
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
