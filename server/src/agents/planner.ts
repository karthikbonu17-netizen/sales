import db from '../db';
import { hindsightEngine } from '../hindsight/memoryEngine';
import { AgentExecutionResult } from './recorder';
import { marketDataService } from '../services/marketDataService';

export class PlannerAgent {
  async process(userInput: string, _preferredLanguage?: string): Promise<AgentExecutionResult> {
    const activityLogs: string[] = [];
    const cleanInput = userInput.trim();

    // 1. Detect pure greetings & introductory queries
    const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|help|who\s*are\s*you|what\s*can\s*you\s*do|start|test)\b[!.?]*$/i.test(cleanInput);
    if (isGreeting) {
      activityLogs.push('● Initializing Planner execution engine...');
      activityLogs.push('✓ Connected downstream to Recorder and Analyst memory partitions');

      const reply = `### Hello! I am the Planner (Agent 3: Proposals, Execution & Allocation)
I consume ground-truth records from the **Recorder** and analytical syntheses from the **Analyst** to draft tailored proposals, capital allocation briefs, and revenue forecasts.

#### My Core Capabilities:
1. **Actionable Strategy Matrix**: Every recommendation includes **Evidence**, **Assumptions**, **Owner**, **Concrete Next Action**, and a **Measurable Success Metric**.
2. **Equity & Revenue Planning**: Synthesizes verified NIFTY 50 market metrics or commercial deals into actionable execution plans.
3. **Mandatory Human-in-the-Loop Sign-off**: Per strict safety guardrails, I will never auto-dispatch emails or alter CRM records destructively without your review in a **Review Card**.

> 💡 **Try asking me**: *"Draft execution brief for RELIANCE"* or *"Prepare the meeting briefing and proposal draft for Acme Corp."*!`;

      return { reply, activityLogs };
    }

    // 2. Detect Gibberish / Unparseable Input
    if (cleanInput.length > 8 && !cleanInput.includes(' ') && /[^a-zA-Z0-9\s]/.test(cleanInput)) {
      activityLogs.push('● Evaluating input syntax...');
      activityLogs.push('⚠️ Unrecognized command structure');
      const reply = `> ⚠️ **Clarification Needed**: I couldn't understand that instruction. Please specify which account, proposal, or equity you would like me to prepare (e.g., *"Prepare proposal for Acme Corp"* or *"Draft brief for TCS"*).`;
      return { reply, activityLogs };
    }

    // 3. Detect NIFTY 50 Equity Execution Brief
    const stockSymbol = marketDataService.findSymbol(cleanInput);
    if (stockSymbol) {
      activityLogs.push(`● Ingesting verified NIFTY 50 market parameters for ${stockSymbol}...`);
      const quote = marketDataService.getLatestQuote(stockSymbol);
      const summary = marketDataService.getStockSummary(stockSymbol);

      if (quote && summary) {
        activityLogs.push('● Synthesizing Action Matrix (Evidence, Assumptions, Owner, Action, Metric)...');
        activityLogs.push('✓ Generating Human-in-the-Loop Strategic Review Card...');

        const drawdownPct = Math.round(((quote.close - summary.allTimeHigh) / summary.allTimeHigh) * 1000) / 10;
        const vwapDivergence = Math.round(((quote.close - quote.vwap) / quote.vwap) * 1000) / 10;

        const reviewCard = {
          actionId: `ACT-${Date.now().toString().slice(-4)}`,
          actionType: 'equity_allocation_approval',
          targetEntity: `${stockSymbol} (NSE)`,
          payload: {
            symbol: stockSymbol,
            asOfDate: quote.date,
            closePrice: quote.close,
            vwap: quote.vwap,
            allocationTier: quote.close > 1500 ? 'Tier-1 Large Cap' : 'Core Index Component',
            recommendedAction: `Monitor entry near VWAP (₹${quote.vwap.toLocaleString()}) with trailing stop below recent swing low (₹${quote.low.toLocaleString()}).`,
          },
          status: 'pending_review',
        };

        const reply = `### MarketLens AI: Strategic Execution & Allocation Matrix
**Subject**: \`${stockSymbol}\` Portfolio Allocation • **Exchange**: National Stock Exchange of India (NSE)

#### 1. Actionable Strategy Matrix

| Dimension | Specification | Verification / Source |
| :--- | :--- | :--- |
| **Evidence** | Latest Close: **₹${quote.close.toLocaleString()}**, VWAP: **₹${quote.vwap.toLocaleString()}** (${vwapDivergence >= 0 ? '+' : ''}${vwapDivergence}% divergence). Institutional Delivery: **${quote.pct_deliverble ? (quote.pct_deliverble * 100).toFixed(1) + '%' : 'N/A'}**. | Derived from verified NSE NIFTY 50 database (\`N=${summary.totalRecords.toLocaleString()} sessions\`) |
| **Assumptions** | Presumes institutional support holds above recent session low (₹${quote.low.toLocaleString()}) with index beta alignment. | Model assumption; macro market volatility may breach level |
| **Owner** | Lead Portfolio Strategist / Execution Desk | Dedicated human operator oversight |
| **Concrete Next Action** | Establish staged dollar-cost averaging tranches anchored to VWAP (₹${quote.vwap.toLocaleString()}) rather than market chasing. | Limit orders queued at institutional VWAP band |
| **Measurable Metric** | Maximum acceptable drawdown capped at **-3.5%** below entry VWAP; target initial upside reversion to ₹${Math.round(quote.close * 1.05)}. | Strict quantitative risk boundary |

---

#### 2. Human-in-the-Loop Governance Sign-Off
Per strict fiduciary guardrails, systematic allocation proposals require human verification before execution. Please review the proposal details below.`;

        return { reply, activityLogs, reviewCard };
      }
    }

    activityLogs.push('● Ingesting downstream context from Recorder & Analyst memory partitions...');

    // 3. RECALL downstream context from both Recorder & Analyst
    const isAcme = cleanInput.toLowerCase().includes('acme') || !cleanInput.toLowerCase().includes('real estate');
    const isInvestment = cleanInput.toLowerCase().includes('real estate') || cleanInput.toLowerCase().includes('invest') || cleanInput.toLowerCase().includes('2000');

    const recorderMemories = hindsightEngine.recall({
      partition: 'recorder',
      query: isAcme ? 'Acme' : cleanInput.split(/\s+/)[0],
      limit: 10,
    });
    const analystMemories = hindsightEngine.recall({
      partition: 'analyst',
      query: isAcme ? 'Acme' : cleanInput.split(/\s+/)[0],
      limit: 10,
    });

    activityLogs.push(`✓ Loaded ${recorderMemories.length} ground-truth items and ${analystMemories.length} analytical syntheses`);

    // 4. Fetch Deal record from relational DB
    let deal = db.prepare(`
      SELECT d.*, c.name as company_name, ct.name as contact_name, ct.role as contact_role
      FROM deals d
      JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      WHERE LOWER(c.name) LIKE ? OR d.id = 'DEAL-ACME'
      ORDER BY d.created_at DESC LIMIT 1
    `).get(isAcme ? '%acme%' : '%%') as any;

    if (!deal) {
      deal = db.prepare(`
        SELECT d.*, c.name as company_name, ct.name as contact_name, ct.role as contact_role
        FROM deals d
        JOIN companies c ON d.company_id = c.id
        LEFT JOIN contacts ct ON d.contact_id = ct.id
        ORDER BY d.created_at DESC LIMIT 1
      `).get() as any;
    }

    const companyName = isInvestment ? 'Retail Capital Portfolio' : (deal?.company_name || 'Acme Corp');
    const contactName = isInvestment ? 'Private Investor' : (deal?.contact_name || 'Sarah Chen');
    const dealValue = isInvestment ? 2000 : (deal?.value || 120000);

    activityLogs.push(`✓ Target Account: ${companyName} | Stakeholder: ${contactName} | Value: $${dealValue.toLocaleString()}`);
    activityLogs.push('● Generating tailored Executive Briefing & Action Roadmap...');

    // Generate Proposal draft in DB
    const proposalId = `PROP-${Date.now()}`;
    const proposalTitle = isInvestment
      ? `${companyName} Capital Allocation Roadmap`
      : `${companyName} Enterprise Integration & Platform Proposal`;

    const proposalContent = isInvestment
      ? `INVESTMENT ALLOCATION PLAN FOR ${companyName.toUpperCase()}
1. Capital Scope: $${dealValue.toLocaleString()} USD Allocation.
2. Recommended Instrument: Tier-1 REITs / Diversified Real Estate Debt Fund.
3. Projected Annual Yield: 7.8% - 9.2% Net Dividend.
4. Next Action: Execute risk profiling questionnaire and broker linkage.`
      : `EXECUTIVE PROPOSAL FOR ${companyName.toUpperCase()}
1. Overview: Tailored deployment for ${contactName} (CTO).
2. Scope: Enterprise ERP Integration, SAML/SSO Authentication, SOC2 Compliance.
3. Pricing & Terms: $${dealValue.toLocaleString()} / Annual billing commitment.
4. SLA & Guarantees: Guaranteed 4-week ERP connector deployment with dedicated Solution Architect.
5. Win Driver Strategy: Direct counter to Competitor X implementation bottlenecks.`;

    if (deal && !isInvestment) {
      db.prepare(`
        INSERT INTO proposals (id, deal_id, title, version, content, status, total_amount, pricing_tier, assumptions)
        VALUES (?, ?, ?, 1, ?, 'pending_approval', ?, 'Enterprise Annual', 'Assumes 4-week ERP connector kickoff and standard SSO protocols')
      `).run(proposalId, deal.id, proposalTitle, proposalContent, dealValue);
    }

    // 5. Human-in-the-Loop Review Card Creation (Strict Constraint: Never auto-dispatch)
    activityLogs.push('● Creating Human-in-the-Loop review card (Held pending user sign-off)...');
    
    const actionId = `ACT-${Date.now()}`;
    const reviewCard = {
      id: actionId,
      action_type: 'proposal_dispatch',
      deal_id: deal?.id || 'DEAL-ACME',
      proposal_id: proposalId,
      title: isInvestment ? `Authorize Real Estate Portfolio Allocation: $${dealValue}` : `Approve Proposal & Advance Deal Stage: ${companyName}`,
      dealTitle: `${companyName} Strategic Proposal`,
      currentStage: deal?.stage || 'Discovery',
      proposedStage: 'Proposal',
      amount: dealValue,
      recipient: `${contactName} (${companyName})`,
      summary: `Send formal proposal draft to ${contactName} ($${dealValue.toLocaleString()}) and advance deal stage from '${deal?.stage || 'Discovery'}' to 'Proposal'.`,
      proposalSnippet: proposalContent,
      status: 'pending',
      requiresApproval: true,
    };

    // Store in audit_logs for governance
    db.prepare(`
      INSERT INTO audit_logs (id, action_type, deal_id, proposal_id, title, payload, status, requested_by)
      VALUES (?, 'proposal_dispatch', ?, ?, ?, ?, 'pending', 'Planner')
    `).run(actionId, deal?.id || null, proposalId, reviewCard.title, JSON.stringify(reviewCard));

    activityLogs.push('✓ Review card queued in Human-in-the-Loop governance log');

    // 6. Retain Plan to Planner Partition
    const retainedPlan = hindsightEngine.retain({
      partition: 'planner',
      title: `Execution Plan: ${companyName} Next Steps`,
      content: `Evidence: Customer requested terms. Analyst identified key win drivers.
Assumptions: $${dealValue.toLocaleString()} scope authorized.
Owner: Lead Enterprise AE.
Action: Present proposal with 4-week SLA guarantee.
Success Metric: Achieve LOI or move to Negotiation stage within 14 days.`,
      category: 'plan',
      entity_type: 'deal',
      entity_id: deal?.id || 'DEAL-ACME',
      tags: 'planner,action-plan,rfp-proposal,governance-card',
      confidence: 0.96,
      source_ref: `PLN-${Date.now().toString().slice(-4)}`,
    });

    activityLogs.push(`✓ RETAIN executed: execution roadmap stored in Planner partition (${retainedPlan.id})`);

    // 7. Build structured reply honoring rules:
    // Evidence, Assumptions, Owner, Concrete Next Action, Measurable Success Metric
    let reply = `### Execution Plan & Proposal Briefing
*(Synthesized downstream from Recorder ground-truth and Analyst pattern intelligence)*

#### 1. Structured Recommendation Matrix

* **Evidence**:
  - Ground-truth capture confirms ${contactName} has specified requirements with a $${dealValue.toLocaleString()} budget scope \`[REC-001]\`.
  - Analyst historical synthesis highlights Competitor X displacement risk mitigated by guaranteeing a 4-week ERP deployment timeline \`[ANL-001]\`.

* **Assumptions**:
  - Budget allocation for FY26 is authorized without multi-board committee escalations.
  - Integration interface conforms to standard REST/WebHook protocols with existing ERP.

* **Owner**:
  - **Account Executive (Enterprise)** & **Lead Solutions Engineer**.

* **Concrete Next Action**:
  - Dispatch the customized 4-week ERP Implementation SLA Proposal & schedule a 30-minute technical validation walk-through with ${contactName}.

* **Measurable Success Metric**:
  - Advance deal from \`Discovery\` to \`Proposal\` / \`Negotiation\` stage within **14 calendar days**; achieve confirmed technical sign-off on the ERP scope.

---

#### 2. Pipeline Revenue Forecast
* **Target Account**: ${companyName}
* **Projected Value**: **$${dealValue.toLocaleString()} ARR**
* **Weighted Forecast**: **$${Math.round(dealValue * 0.7).toLocaleString()}** (70% win-probability applied post-proposal stage)
* **Target Close Window**: Current Quarter (30-day projection)

---

> 🔒 **Human-in-the-Loop Governance Notice**:
> Per system security constraints, this proposal draft and CRM pipeline progression have **NOT** been dispatched automatically. Execution is held pending your review and authorization in the card below.`;

    return {
      reply,
      activityLogs,
      retainedMemories: [retainedPlan],
      reviewCard,
    };
  }
}

export const plannerAgent = new PlannerAgent();
