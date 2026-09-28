export type MemoryPartition = 'recorder' | 'analyst' | 'planner';

export type MemoryCategory =
  | 'fact'
  | 'preference'
  | 'objection'
  | 'competitor'
  | 'pricing'
  | 'win_loss'
  | 'requirement'
  | 'plan'
  | 'synthesis';

export interface MemoryRecord {
  id: string;
  partition: MemoryPartition;
  title: string;
  content: string;
  category?: MemoryCategory | string;
  entity_type?: 'company' | 'contact' | 'deal' | 'market' | string;
  entity_id?: string;
  tags?: string;
  confidence?: number;
  source_ref?: string;
  metadata?: string; // JSON string
  created_at?: string;
  updated_at?: string;
}

export interface RecallQuery {
  query?: string;
  partition?: MemoryPartition | MemoryPartition[];
  entity_type?: string;
  entity_id?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface ReflectResult {
  summary: string;
  sampleSize: number;
  evidenceItems: MemoryRecord[];
  patterns: {
    objections: { pattern: string; count: number; examples: string[] }[];
    competitors: { competitor: string; winCount: number; lossCount: number; notes: string }[];
    pricingSensitivities: string[];
    winDrivers: string[];
    lossDrivers: string[];
  };
}
