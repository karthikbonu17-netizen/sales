# SalesMind: AI Revenue Intelligence Platform (Tri-Agent System)

SalesMind is a production-grade, full-stack enterprise B2B revenue intelligence platform built around an orchestrated 3-agent pipeline supported by persistent memory handoffs, human-in-the-loop governance, and a dual-database design.

---

## 1. System Architecture

```text
                               SALESMIND
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │     PRESENTATION LAYER (WEB UI)   │
                 │ 3-Agent Dedicated Layout          │
                 │ Chat Interface + Collapsible RAM  │
                 │ Pipeline/Deal State & Action Logs │
                 └─────────────────┬─────────────────┘
                                   │ HTTPS / REST
                                   ▼
                 ┌───────────────────────────────────┐
                 │             API LAYER             │
                 │ Node.js / Express Backend         │
                 │ Auth, Rate Limits, Validation     │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │     CENTRAL AGENT ORCHESTRATOR    │
                 │ Context Assembly, Agent Routing,  │
                 │ Tool Invocation, Guardrails       │
                 └─────────────────┬─────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  1. RECORDER     │      │   2. ANALYST     │      │   3. PLANNER     │
│ Prospecting &    │─────▶│ Deal Intelligence│─────▶│ Proposals, Next  │
│ Data Capture     │      │ & Win/Loss Study │      │ Moves & Forecasts│
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
        ┌─────────────────────┐         ┌─────────────────────┐
        │     POSTGRESQL      │         │   HINDSIGHT MEMORY  │
        │ App State, Deals,   │         │ RETAIN, RECALL,     │
        │ Proposals, CRM data │         │ REFLECT Primitives  │
        └─────────────────────┘         └──────────┬──────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │ LLM PROVIDER (LLMs) │
                                        │ Backend API Key     │
                                        │ Isolated Service    │
                                        └──────────┬──────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │ HUMAN-IN-THE-LOOP   │
                                        │ Review & Approval   │
                                        └─────────────────────┘
```

---

## 2. The Three Specialized Agents & Rules

### Agent 1: Recorder (Prospecting & Capture Engine)
* **Role**: Collects and structures ground-truth information directly from user interactions. Captures prospects, leads, company profiles, buyer preferences, deal updates, call logs, customer objections, competitor footprints, proposal feedbacks, and outcome reasons.
* **Rules**:
  1. Record strictly what the user provides. Never invent or hallucinate missing data.
  2. If a crucial data point is omitted (deal size, primary stakeholder, expected close date), issue a concise follow-up query.
  3. Confirm briefly what was captured, preserving dates, sources, and attributions.
  4. Uses `RETAIN` to store durable memory units into the Recorder partition.

### Agent 2: Analyst (Deal Intelligence & Pattern Recognition)
* **Role**: Ingests ground-truth records from the Recorder's history to produce actionable deal and pipeline intelligence.
* **Rules**:
  1. Ingests memory records stored by the Recorder.
  2. Detects patterns across closed-won/closed-lost deals, objection categories, pricing sensitivities, competitor evaluations, and segment trends.
  3. Uses `RECALL` for targeted lookups and `REFLECT` for macro-level deal synthesis across multiple accounts.
  4. Every claim must cite the specific historical records used (e.g. `[REC-001]`, `[HIST-002]`).
  5. Clearly distinguishes between **Facts**, **Interpretations**, **Assumptions**, and **Missing Data**.
  6. Quantifies analyses (e.g., sample sizes, count of occurrences: `Sample size: N=3 accounts`). If data is scarce, states the low sample size explicitly rather than presenting correlations as causation.
  7. Saves all analytical findings into the Analyst memory partition.

### Agent 3: Planner (Proposals, Execution & Forecasts)
* **Role**: Reads the Recorder's records and the Analyst's syntheses to recommend next actions, draft tailored RFP/proposals, target outreach strategies, and compute pipeline forecasts.
* **Rules**:
  1. Reads data downstream from both the Recorder and the Analyst partitions.
  2. Every recommendation includes: **Evidence**, **Assumptions**, **Owner**, **Concrete Next Action**, and **Measurable Success Metric**.
  3. When forecasting revenue, requires target period, deal stages, and values. Never hallucinates pipeline figures; proposes controlled experiments if data is insufficient.
  4. **Human-in-the-Loop Constraint**: Never auto-dispatches emails, alters CRM records destructively, or issues final proposals to clients without explicit user review and sign-off in the UI.
  5. Holds execution in a **Human-in-the-Loop Review Card** featuring explicit "Approve", "Edit", and "Reject" controls.

---

## 3. Dual-Database Design & Hindsight Memory System

### Relational CRM Layer (PostgreSQL / SQLite)
Manages structured transactional application state:
* `Organizations`, `Users`
* `Companies`, `Contacts`, `Prospects`
* `Deals` (stages: `New`, `Qualified`, `Discovery`, `Proposal`, `Negotiation`, `Closed-Won`, `Closed-Lost`)
* `Proposals`, `Documents`, `AuditLogs`, `ChatMessages`

### Hindsight Contextual Memory Engine
Driven by explicit cognitive primitives:
* `RETAIN`: Persist durable facts, preferences, objections, competitor insights, and win/loss analyses into isolated partitions (`recorder`, `analyst`, `planner`).
* `RECALL`: Semantic and structured lookup of relevant historical interaction points.
* `REFLECT`: Synthesize patterns, cross-deal objections, and macro sales intelligence over accumulated data.

#### Isolation & Unidirectional Sharing:
* **Partition Isolation**: Clearing an agent's chat history does **not** purge long-term memory. Clearing an agent's memory purges only its partition without impacting other agents.
* **Unidirectional Context Sharing**:
  * **Recorder**: Writes raw customer & interaction memory (`RETAIN`).
  * **Analyst**: Reads Recorder memories; synthesizes and retains analytical insights (`RECALL`, `REFLECT`).
  * **Planner**: Reads both raw Recorder logs and Analyst conclusions to construct briefs and pipeline plans.

---

## 4. Interaction Engine & Communication

SalesMind operates with a standardized, enterprise-grade conversational format:
* **Standard Professional English (US)**
* Strict analytical and planning structures (Facts, Interpretations, Assumptions, Evidence, Next Actions) across all agent workflows.

---

## 5. End-to-End Demo Scenario (Acme Corp)

SalesMind ships pre-seeded with historical accounts (`FinGuard Systems`, `CloudTech Labs`, `OmniRetail Global`) and a ready-to-run Acme Corp scenario:

1. **Step 1 — Recorder**:
   * *Input*: `"Capture prospect Acme Corp: CTO Sarah Chen, $120,000 deal size, with requirements for ERP integration, SSO, and preferences for annual billing."`
   * *Output*: Recorder structures facts, creates CRM deal entry, and executes `RETAIN` in Recorder partition.
2. **Step 2 — Analyst**:
   * *Input*: `"Analyze Acme Corp's objections and our history with similar SaaS proposals."`
   * *Output*: Issues `RECALL` on Acme records and compares against historical benchmarks. Flags Competitor X win/loss ratio (2 Won / 1 Lost), identifies 4-week ERP deployment timeline as the key win driver, outputs sample size $N=3$, and cites specific records.
3. **Step 3 — Planner**:
   * *Input*: `"Prepare the meeting briefing and proposal draft for Acme Corp."`
   * *Output*: Formulates Evidence, Assumptions, Owner, Next Action, Metric, and generates a structured Proposal Draft. Emits an embedded **Human-in-the-Loop Review Card** held for user sign-off.
4. **Step 4 — Retain Outcome**:
   * User clicks **Approve** in the Review Card.
   * Deal stage advances from `Discovery` to `Proposal` in the relational store.
   * Outcome and operator approval are permanently retained in the Hindsight long-term memory engine.

---

## 6. Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18+ or v20+)
* **npm** (v9+)

### Installation

1. Clone or navigate to the repository:
   ```bash
   cd sales
   ```

2. Install dependencies for the root, server, and client:
   ```bash
   npm.cmd install --prefix server
   npm.cmd install --prefix client
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your `OPENAI_API_KEY` to `.env`. SalesMind includes a built-in deterministic Revenue Intelligence Engine so the full application runs immediately out of the box even before entering an API key.

4. Seed the database with historical benchmarks:
   ```bash
   npm.cmd run seed --prefix server
   ```

5. Start both Backend and Frontend concurrently:
   ```bash
   npm.cmd run dev
   ```
   * **Backend API**: `http://localhost:5000`
   * **Frontend Web Dashboard**: `http://localhost:5173`

---

## 7. API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/session` | `GET` | Session handling and operator token generation |
| `/api/agents/chat` | `POST` | Agent conversational endpoint routing to Orchestrator |
| `/api/agents/history/:agent` | `GET` / `DELETE` | Isolated chat history management |
| `/api/agents/memory` | `GET` / `POST` | Hindsight memory retrieval (`RECALL`) & retention (`RETAIN`) |
| `/api/agents/memory/:id` | `PUT` / `DELETE` | Edit or delete specific memory items |
| `/api/agents/memory/partition/:part` | `DELETE` | Clear specific isolated agent memory partition |
| `/api/agents/memory/stats` | `GET` | Memory item counts grouped by agent partition |
| `/api/deals` | `GET` / `POST` | Relational CRM deals and Kanban pipeline state |
| `/api/deals/:id` | `PUT` | Update deal stage or attributes |
| `/api/proposals` | `GET` / `POST` | Generated proposal drafts & versioning |
| `/api/proposals/rfp-upload` | `POST` | Ingest and retain technical RFP documents |
| `/api/actions/approve` | `POST` | Human-in-the-Loop authorization (`Approve`, `Edit`, `Reject`) |
| `/api/config/status` | `GET` | LLM configuration & security status |

---

## 8. Enterprise Security & Isolation Guarantee
* **Server-side secrets**: All API keys, database credentials, and Hindsight tokens remain strictly server-side in `server/src/config.ts` and never leak to the client bundle, local storage, or browser network responses.
* **Governance Guardrails**: No external emails or CRM updates are dispatched without explicit operator authorization in the Human-in-the-Loop review panel.
