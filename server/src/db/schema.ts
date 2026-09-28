export const SCHEMA_SQL = `
-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'sales_rep',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- 3. Companies
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  domain TEXT,
  size TEXT,
  annual_revenue NUMERIC,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- 4. Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  decision_maker_level TEXT, -- e.g. 'CTO', 'VP', 'Director', 'Champion'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 5. Prospects / Leads
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  contact_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'qualified', 'converted', 'disqualified'
  source TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- 6. Deals
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  contact_id TEXT,
  title TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'New', -- 'New', 'Qualified', 'Discovery', 'Proposal', 'Negotiation', 'Closed-Won', 'Closed-Lost'
  expected_close TEXT,
  win_probability NUMERIC DEFAULT 0.2,
  requirements TEXT,
  objections TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- 7. Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected'
  total_amount NUMERIC NOT NULL DEFAULT 0,
  pricing_tier TEXT,
  assumptions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- 8. Documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  deal_id TEXT,
  filename TEXT NOT NULL,
  file_type TEXT,
  content TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- 9. Audit Logs & Human-in-the-Loop Actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL, -- 'proposal_dispatch', 'stage_progression', 'email_send', 'deal_update'
  deal_id TEXT,
  proposal_id TEXT,
  title TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON serialized details
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'edited'
  requested_by TEXT DEFAULT 'Planner',
  reviewed_by TEXT,
  reviewer_comments TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- 10. Hindsight Memory System
CREATE TABLE IF NOT EXISTS hindsight_memories (
  id TEXT PRIMARY KEY,
  partition TEXT NOT NULL, -- 'recorder', 'analyst', 'planner'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'preference', 'objection', 'competitor', 'pricing', 'win_loss', 'plan'
  entity_type TEXT, -- 'company', 'contact', 'deal', 'market'
  entity_id TEXT,
  tags TEXT, -- comma separated tags
  confidence NUMERIC DEFAULT 1.0,
  source_ref TEXT, -- e.g. 'REC-001', 'User Call 2026-09-28', 'CTO Sarah Chen'
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Chat History for each agent
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL, -- 'recorder', 'analyst', 'planner'
  sender TEXT NOT NULL, -- 'user', 'agent'
  text TEXT NOT NULL,
  activity_logs TEXT, -- JSON array of operational progress steps
  review_action TEXT, -- JSON optional review card data
  language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
