import db, { initDatabase } from './index';

export function seedDatabase() {
  initDatabase();

  console.log('Seeding SalesMind database with comprehensive deals across all Kanban stages...');

  // Temporarily disable foreign keys for clean reset
  db.pragma('foreign_keys = OFF');
  db.prepare(`DELETE FROM proposals WHERE deal_id IN (SELECT id FROM deals WHERE title LIKE '%requirements for ERP%')`).run();
  db.prepare(`DELETE FROM audit_logs WHERE deal_id IN (SELECT id FROM deals WHERE title LIKE '%requirements for ERP%')`).run();
  db.prepare(`DELETE FROM deals WHERE title LIKE '%requirements for ERP%' OR company_id NOT IN (SELECT id FROM companies)`).run();
  db.prepare(`DELETE FROM companies WHERE name LIKE '%requirements for ERP%'`).run();
  db.pragma('foreign_keys = ON');

  // 1. Organization
  db.prepare(`
    INSERT OR REPLACE INTO organizations (id, name, domain)
    VALUES ('ORG-001', 'Apex Enterprise Systems', 'apexsystems.io')
  `).run();

  // 2. Users
  db.prepare(`
    INSERT OR REPLACE INTO users (id, org_id, name, email, role)
    VALUES ('USR-001', 'ORG-001', 'Alex Morgan', 'alex.morgan@apexsystems.io', 'VP of Revenue')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO users (id, org_id, name, email, role)
    VALUES ('USR-002', 'ORG-001', 'Elena Rostova', 'elena.rostova@apexsystems.io', 'Senior Account Executive')
  `).run();

  // 3. SEED RICH COMPANIES & CONTACTS ACROSS ALL 7 STAGES

  // Stage 1: NEW
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-NEW-1', 'ORG-001', 'Apex Logistics Corp', 'Logistics & Supply Chain', 'apexlogistics.com', '1000+', 85000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-NEW-1', 'COMP-NEW-1', 'Marcus Brody', 'VP Supply Chain', 'marcus.brody@apexlogistics.com', 'VP / Decision Maker')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-NEW-1', 'COMP-NEW-1', 'CONT-NEW-1', 'Apex Global Fleet Telemetry Integration', 85000, 'New', 0.2, 'Fleet tracking API, ERP sync', 'Initial inbound inquiry; evaluating modern revenue pipelines')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-NEW-2', 'ORG-001', 'HealthPulse Diagnostics', 'Healthcare Technology', 'healthpulse.io', '500-1000', 110000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-NEW-2', 'COMP-NEW-2', 'Dr. Aris Thorne', 'Chief Medical Information Officer', 'aris.thorne@healthpulse.io', 'Executive Sign-off')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-NEW-2', 'COMP-NEW-2', 'CONT-NEW-2', 'HealthPulse Clinical Analytics Suite', 110000, 'New', 0.25, 'HIPAA Compliance, EHR integration', 'Received prospect form; request for technical architecture overview')
  `).run();

  // Stage 2: QUALIFIED
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-QUAL-1', 'ORG-001', 'DataStream Analytics', 'Big Data / SaaS', 'datastream.io', '250-500', 150000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-QUAL-1', 'COMP-QUAL-1', 'Nathan Vance', 'Head of Data Platforms', 'nathan@datastream.io', 'Director / Technical Buyer')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-QUAL-1', 'COMP-QUAL-1', 'CONT-QUAL-1', 'DataStream Enterprise Pipeline Ingestion', 150000, 'Qualified', 0.35, 'Snowflake connector, SOC2 Type II', 'BANT criteria verified; budget authorized for Q4 rollout')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-QUAL-2', 'ORG-001', 'Vanguard Retail Systems', 'Retail Tech', 'vanguardretail.com', '1000+', 90000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-QUAL-2', 'COMP-QUAL-2', 'Lisa Ray', 'Director of Enterprise IT', 'lisa.ray@vanguardretail.com', 'Director / Champion')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-QUAL-2', 'COMP-QUAL-2', 'CONT-QUAL-2', 'Vanguard Omni-Channel Sales Platform', 90000, 'Qualified', 0.30, 'POS sync, Annual billing', 'Discovery session scheduled for next Tuesday')
  `).run();

  // Stage 3: DISCOVERY
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-ACME', 'ORG-001', 'Acme Corp', 'Enterprise Technology', 'acme.com', '500-1000', 120000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-ACME', 'COMP-ACME', 'Sarah Chen', 'Chief Technology Officer (CTO)', 'sarah.chen@acme.com', 'CTO / Primary Decision Maker')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-ACME', 'COMP-ACME', 'CONT-ACME', 'Acme Corp Revenue Intelligence Expansion', 120000, 'Discovery', 0.45, 'ERP integration, SSO authentication, Annual billing preference', 'Evaluating Competitor X; sensitive to implementation rollout time', 'Captured by Recorder: Sarah Chen prioritized annual terms and ERP compatibility')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-DISC-2', 'ORG-001', 'Nordic Energy Group', 'Energy & Utilities', 'nordicenergy.se', '2000+', 175000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-DISC-2', 'COMP-DISC-2', 'Henrik Lindqvist', 'VP Operations', 'h.lindqvist@nordicenergy.se', 'VP / Technical Sponsor')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-DISC-2', 'COMP-DISC-2', 'CONT-DISC-2', 'Nordic Telemetry Pipeline Modernization', 175000, 'Discovery', 0.50, 'SCADA telemetry, Custom Webhook API', 'Technical alignment meeting completed; RFP draft requested')
  `).run();

  // Stage 4: PROPOSAL
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-PROP-1', 'ORG-001', 'CyberShield Defense', 'Cybersecurity', 'cybershield.io', '500-1000', 160000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-PROP-1', 'COMP-PROP-1', 'Karen Patel', 'Chief Information Security Officer', 'karen.patel@cybershield.io', 'CISO / Decision Maker')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-PROP-1', 'COMP-PROP-1', 'CONT-PROP-1', 'CyberShield Zero-Trust Intelligence Hub', 160000, 'Proposal', 0.65, 'Zero-Trust Okta SSO, Dedicated TAM, 4-week deployment SLA', 'Requested pricing discounts against Competitor X', 'Formal proposal v2 submitted with 4-week SLA guarantee')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-PROP-2', 'ORG-001', 'Starlight Media Global', 'Digital Media', 'starlightmedia.com', '1000+', 135000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-PROP-2', 'COMP-PROP-2', 'Jordan Reed', 'VP of Technology', 'jordan.reed@starlightmedia.com', 'VP / Buyer')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-PROP-2', 'COMP-PROP-2', 'CONT-PROP-2', 'Starlight Ad Revenue Forecast Platform', 135000, 'Proposal', 0.60, 'High-throughput API, Net-30 annual terms', 'Reviewing RFP terms with procurement')
  `).run();

  // Stage 5: NEGOTIATION
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-NEG-1', 'ORG-001', 'Beacon Financial Partners', 'Financial Services', 'beaconfp.com', '500-1000', 195000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-NEG-1', 'COMP-NEG-1', 'Rachel Sterling', 'Managing Director', 'r.sterling@beaconfp.com', 'Executive / Sign-off')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-NEG-1', 'COMP-NEG-1', 'CONT-NEG-1', 'Beacon Wealth Management Sales Suite', 195000, 'Negotiation', 0.85, 'Custom audit logging, Executive escalation path', 'Legal redlines exchanged; final signature expected by end of month')
  `).run();

  // Stage 6: CLOSED-WON
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-001', 'ORG-001', 'FinGuard Systems', 'Financial Technology', 'finguard.io', '1000+', 140000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-001', 'COMP-001', 'David Miller', 'Head of Enterprise Architecture', 'david.miller@finguard.io', 'VP / Technical Sign-off')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-HIST-01', 'COMP-001', 'CONT-001', 'FinGuard Financial ERP Expansion', 140000, 'Closed-Won', 1.0, 'SAP ERP integration, Okta SSO, SOC2 Type II', 'Competitor X offered 15% discount but lacked dedicated engineering support', 'Won primarily on 4-week guaranteed deployment SLA')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-003', 'ORG-001', 'OmniRetail Global', 'E-Commerce / Retail', 'omniretail.com', '5000+', 210000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-003', 'COMP-003', 'Marcus Vance', 'CIO', 'm.vance@omniretail.com', 'C-Suite')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-HIST-03', 'COMP-003', 'CONT-003', 'OmniRetail Unified Sales Pipeline', 210000, 'Closed-Won', 1.0, 'Global SSO, Multi-currency, Annual prepayment', 'Required strict SOC2 and dedicated TAM', 'Won on security compliance excellence')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-WON-2', 'ORG-001', 'Titan Manufacturing Group', 'Industrial & Manufacturing', 'titanmfg.com', '2500+', 240000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-WON-2', 'COMP-WON-2', 'Robert Chang', 'VP Digital Transformation', 'rchang@titanmfg.com', 'VP / Executive')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
    VALUES ('DEAL-WON-2', 'COMP-WON-2', 'CONT-WON-2', 'Titan Smart Factory Revenue Platform', 240000, 'Closed-Won', 1.0, 'On-prem gateway, ERP direct pipeline', '3-year master services agreement executed')
  `).run();

  // Stage 7: CLOSED-LOST
  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-002', 'ORG-001', 'CloudTech Labs', 'Cloud Infrastructure', 'cloudtechlabs.com', '250-500', 95000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-002', 'COMP-002', 'Priya Sharma', 'VP of Engineering', 'priya@cloudtechlabs.com', 'VP / Decision Maker')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-HIST-02', 'COMP-002', 'CONT-002', 'CloudTech Platform Modernization', 95000, 'Closed-Lost', 0.0, 'ERP sync, Webhooks, Annual billing', 'Chose Competitor X because of perceived 12-week deployment risk on our side', 'Lost to Competitor X due to delayed implementation guarantee')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO companies (id, org_id, name, industry, domain, size, annual_revenue)
    VALUES ('COMP-LOST-2', 'ORG-001', 'Nexus Telecommunications', 'Telecom', 'nexustelecom.net', '1500+', 80000)
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO contacts (id, company_id, name, role, email, decision_maker_level)
    VALUES ('CONT-LOST-2', 'COMP-LOST-2', 'Derek Shaw', 'IT Director', 'd.shaw@nexustelecom.net', 'Director')
  `).run();
  db.prepare(`
    INSERT OR REPLACE INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, objections, notes)
    VALUES ('DEAL-LOST-2', 'COMP-LOST-2', 'CONT-LOST-2', 'Nexus Legacy CRM Migration', 80000, 'Closed-Lost', 0.0, 'Legacy migration, API gateway', 'Budget freeze in Q2; postponed all CRM upgrades', 'Lost to status quo / budget deferral')
  `).run();

  // 4. Seed Hindsight Memories with Unidirectional Isolation:
  // RECORDER PARTITION
  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-REC-001',
      'recorder',
      'Acme Corp - Ground Truth Prospect Profile & Technical Stack',
      'Ground-truth captured from CTO Sarah Chen: Deal size $120,000 scope. Architecture requires ERP integration, SAML/Okta SSO, and annual billing terms. Notes direct evaluation of Competitor X.',
      'fact',
      'company',
      'Acme Corp',
      'acme,cto,erp,sso,annual-billing,ground-truth',
      1.0,
      'REC-001'
    )
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-REC-002',
      'recorder',
      'FinGuard Systems - Won Deal Interaction Log',
      'David Miller (Head of Architecture) confirmed $140k contract closed-won. Competitor X was dismissed after our team guaranteed 4-week dedicated ERP connector deployment.',
      'win_loss',
      'company',
      'FinGuard Systems',
      'finguard,won,competitor-x,erp-connector',
      1.0,
      'HIST-002'
    )
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-REC-003',
      'recorder',
      'CloudTech Labs - Lost Deal Post-Mortem',
      'Priya Sharma reported selecting Competitor X over us for $95k deal. Deciding factor was perceived rollout risk: Competitor X promised a 3-week sandbox, while our team quoted standard 12-week schedule without SLA.',
      'win_loss',
      'company',
      'CloudTech Labs',
      'cloudtech,lost,competitor-x,implementation-timeline',
      1.0,
      'HIST-003'
    )
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-REC-004',
      'recorder',
      'OmniRetail Global - Enterprise Contract Terms',
      'Closed-Won $210k annual prepayment. Buyer required SOC2 Type II compliance and SSO. Competitor pricing discounts could not overcome our security governance.',
      'win_loss',
      'company',
      'OmniRetail Global',
      'omniretail,won,sso,security,annual-commit',
      1.0,
      'HIST-004'
    )
  `).run();

  // ANALYST PARTITION
  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-ANL-001',
      'analyst',
      'Cross-Deal Win/Loss Analysis: Competitor X Displacement Vectors',
      'Synthesis over N=3 historical accounts: When competing against Competitor X, our win rate is 67% (2 Won, 1 Lost). Deciding factor is consistently deployment timeline rather than software cost. Mitigation: Offer 4-week guaranteed deployment SLA upfront.',
      'synthesis',
      'market',
      'Competitor X',
      'analyst,synthesis,win-loss,competitor-x,sample-size-3',
      0.95,
      'ANL-001 [Derived from REC-001, HIST-002, HIST-003]'
    )
  `).run();

  // PLANNER PARTITION
  db.prepare(`
    INSERT OR REPLACE INTO hindsight_memories (id, partition, title, content, category, entity_type, entity_id, tags, confidence, source_ref)
    VALUES (
      'MEM-PLN-001',
      'planner',
      'Standard Operating Playbook: Enterprise Technical Proposal Acceleration',
      'Requirement: Proposals must bundle dedicated Solution Architect hours with SLA commitment to counter Competitor X early in Discovery-to-Proposal transitions.',
      'plan',
      'market',
      'Enterprise Strategy',
      'planner,playbook,proposals,governance',
      0.98,
      'PLN-001'
    )
  `).run();

  // 5. Seed Distinct Proposals with Different Amounts across Accounts
  db.prepare('DELETE FROM proposals').run();

  db.prepare(`
    INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
    VALUES (
      'PROP-ACME-01',
      'DEAL-ACME',
      'Acme Corp Enterprise Integration & Platform Proposal',
      1,
      'EXECUTIVE PROPOSAL FOR ACME CORP\n1. Overview: Tailored deployment for Sarah Chen (CTO).\n2. Scope: Enterprise ERP Integration, SAML/SSO Authentication, SOC2 Compliance.\n3. Pricing & Terms: $120,000 / Annual billing commitment.\n4. SLA & Guarantees: Guaranteed 4-week ERP connector deployment with dedicated Solution Architect.\n5. Win Driver Strategy: Direct counter to Competitor X implementation bottlenecks.',
      'pending_approval',
      120000,
      'Enterprise Annual',
      'Assumes 4-week ERP connector kickoff and standard SSO protocols'
    )
  `).run();

  db.prepare(`
    INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
    VALUES (
      'PROP-CYBER-01',
      'DEAL-PROP-1',
      'CyberShield Zero-Trust Intelligence Hub Proposal',
      2,
      'EXECUTIVE PROPOSAL FOR CYBERSHIELD DEFENSE\n1. Target Stakeholder: Karen Patel (CISO).\n2. Scope: Zero-Trust Okta SSO Integration, Dedicated Technical Account Manager (TAM), Real-time Threat Intelligence Feed.\n3. Pricing & Terms: $160,000 / Multi-year Enterprise License.\n4. Deployment SLA: 4-week production deployment guarantee with dedicated Security Engineer.\n5. Competitive Vector: Pre-empts Competitor X pricing discounts through superior compliance architecture.',
      'pending_approval',
      160000,
      'Enterprise Security Tier',
      'Requires standard SAML 2.0 gateway and mutual NDA execution'
    )
  `).run();

  db.prepare(`
    INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
    VALUES (
      'PROP-BEACON-01',
      'DEAL-NEG-1',
      'Beacon Wealth Management Advisory Suite Proposal',
      1,
      'EXECUTIVE PROPOSAL FOR BEACON FINANCIAL PARTNERS\n1. Client Sponsor: Rachel Sterling (Managing Director).\n2. Scope: Custom Audit Logging, SEC Compliance Vault, High-Net-Worth Advisory Workflow Automation.\n3. Pricing & Terms: $195,000 / Annual billing terms.\n4. Security Standards: SOC2 Type II, ISO 27001 certified on dedicated tenant.\n5. Success Metric: 100% data auditability and executive escalation path.',
      'approved',
      195000,
      'Financial Premium Tier',
      'Assumes legal approval by end of fiscal month'
    )
  `).run();

  db.prepare(`
    INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
    VALUES (
      'PROP-DATA-01',
      'DEAL-QUAL-1',
      'DataStream High-Throughput Pipeline Proposal',
      1,
      'EXECUTIVE PROPOSAL FOR DATASTREAM ANALYTICS\n1. Technical Buyer: Nathan Vance (Head of Data Platforms).\n2. Scope: Snowflake Native Connector, Streaming Analytics Pipeline, Custom Webhook Listeners.\n3. Pricing & Terms: $150,000 / Annual SaaS commitment.\n4. Availability SLA: 99.95% uptime with sub-second API latency guarantee.',
      'draft',
      150000,
      'Data Platform Tier',
      'Subject to final sandbox evaluation'
    )
  `).run();

  db.prepare(`
    INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
    VALUES (
      'PROP-APEX-01',
      'DEAL-NEW-1',
      'Apex Global Fleet Telemetry Integration Proposal',
      1,
      'EXECUTIVE PROPOSAL FOR APEX LOGISTICS CORP\n1. Stakeholder: Marcus Brody (VP Supply Chain).\n2. Scope: Global Telemetry Tracking, Freight ERP Ingestion, Real-Time Geo-Routing.\n3. Pricing & Terms: $85,000 / Annual contract.\n4. Implementation: 6-week phased onboarding with remote engineering support.',
      'draft',
      85000,
      'Logistics Growth Tier',
      'Pre-requisite: API gateway credentials provided by client'
    )
  `).run();

  console.log('✓ Database seeded successfully with all 7 Kanban stages and varied proposals!');
}

if (require.main === module) {
  seedDatabase();
}
