import db from '../db';
import { hindsightEngine } from '../hindsight/memoryEngine';
import { llmAdapter } from './llmAdapter';
import { marketDataService } from '../services/marketDataService';

export interface AgentExecutionResult {
  reply: string;
  activityLogs: string[];
  retainedMemories?: any[];
  reviewCard?: any;
}

export class RecorderAgent {
  async process(userInput: string, _preferredLanguage?: string): Promise<AgentExecutionResult> {
    const activityLogs: string[] = [];
    const cleanInput = userInput.trim();

    // 1. Detect pure greetings & introductory queries
    const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|help|who\s*are\s*you|what\s*can\s*you\s*do|start|test)\b[!.?]*$/i.test(cleanInput);
    if (isGreeting) {
      activityLogs.push('● Recognizing introductory greeting...');
      activityLogs.push('✓ Initialized Recorder conversational context');

      const reply = `### Hello! I am the Recorder (Agent 1: Prospecting & Market Capture Engine)
I collect, structure, and verify ground-truth customer data and **NIFTY 50 Market Equity feeds** directly into the **Hindsight Memory System** using the \`RETAIN\` primitive.

#### What I do:
1. **Capture Ground Truth**: Record companies, decision-makers, deal sizes, target dates, and technical requirements.
2. **NIFTY 50 Market Capture**: Query verified quotes, OHLCV, VWAP, turnover, and volume for 50+ blue-chip equities (e.g. *RELIANCE*, *TCS*, *INFY*, *HDFCBANK*, *SBIN*).
3. **CRM & Memory Synchronization**: Automatically update relational state and pass memory downstream to the **Analyst** and **Planner**.

> 💡 **Try asking me**: *"Capture prospect Acme Corp: CTO Sarah Chen, $120,000 deal size"* or *"Get quote and market data for RELIANCE"*!`;

      return { reply, activityLogs };
    }

    // 2. Detect Gibberish / Unparseable Input
    if (cleanInput.length > 8 && !cleanInput.includes(' ') && /[^a-zA-Z0-9\s]/.test(cleanInput)) {
      activityLogs.push('● Evaluating input format...');
      activityLogs.push('⚠️ Unrecognized command structure detected');
      const reply = `> ⚠️ **Clarification Needed**: I couldn't understand that input. Please provide prospect or deal information (e.g., Company name, contact person, budget, or key requirements).`;
      return { reply, activityLogs };
    }

    // 3. Detect NIFTY 50 Stock Market Query / Ingestion
    const stockSymbol = marketDataService.findSymbol(userInput);
    if (stockSymbol) {
      activityLogs.push(`● Matching ticker symbol: ${stockSymbol} in verified NIFTY 50 database...`);
      const quote = marketDataService.getLatestQuote(stockSymbol);
      const summary = marketDataService.getStockSummary(stockSymbol);
      if (quote && summary) {
        activityLogs.push(`✓ Retrieved verified market feed for ${stockSymbol} (${summary.totalRecords.toLocaleString()} historical daily sessions)`);
        
        // Retain to Hindsight memory partition 'recorder'
        const mem = hindsightEngine.retain({
          partition: 'recorder',
          title: `Market Ground-Truth: ${stockSymbol} Verified Quote & Statistics`,
          content: `Symbol: ${stockSymbol}
As-Of Date: ${quote.date}
Close Price: ₹${quote.close.toLocaleString()}
VWAP: ₹${quote.vwap.toLocaleString()}
Day Range: ₹${quote.low.toLocaleString()} - ₹${quote.high.toLocaleString()}
Volume: ${quote.volume.toLocaleString()} shares
Turnover: ₹${(quote.turnover / 1e7).toFixed(2)} Cr
Deliverable Volume: ${quote.deliverable_volume ? quote.deliverable_volume.toLocaleString() : 'N/A'} (${quote.pct_deliverble ? (quote.pct_deliverble * 100).toFixed(1) + '%' : 'N/A'})
All-Time High: ₹${summary.allTimeHigh.toLocaleString()}
All-Time Low: ₹${summary.allTimeLow.toLocaleString()}
Historical Session Count: ${summary.totalRecords.toLocaleString()}
Dataset: National Stock Exchange (NSE) NIFTY 50 Dataset`,
          category: 'fact',
          entity_type: 'market_equity',
          entity_id: stockSymbol,
          tags: `stock,${stockSymbol.toLowerCase()},nifty50,market-data,equity,verified`,
          confidence: 1.0,
          source_ref: `NSE-${stockSymbol}-${quote.date}`,
        });

        activityLogs.push(`✓ RETAIN executed: stored market ground truth into Recorder partition (${mem.id})`);

        const reply = `### MarketLens AI: Ground-Truth Equity Capture (${stockSymbol})
*(Verified from NIFTY 50 National Stock Exchange Dataset • Retained in Recorder Partition)*

| Metric | Verified Value |
| :--- | :--- |
| **Ticker Symbol** | \`${stockSymbol}\` (NSE India) |
| **As-Of Date** | \`${quote.date}\` |
| **Latest Close** | **₹${quote.close.toLocaleString()}** |
| **Previous Close** | ₹${quote.prev_close.toLocaleString()} (${quote.change! >= 0 ? '+' : ''}${quote.change} / ${quote.changePct}%) |
| **Intraday High / Low** | ₹${quote.high.toLocaleString()} / ₹${quote.low.toLocaleString()} |
| **VWAP (Volume Weighted Avg)** | ₹${quote.vwap.toLocaleString()} |
| **Trading Volume** | ${quote.volume.toLocaleString()} shares |
| **Turnover** | ₹${((quote.close * quote.volume) / 1e7).toFixed(2)} Crores |
| **Institutional Delivery** | ${quote.deliverable_volume ? quote.deliverable_volume.toLocaleString() + ' shares' : 'N/A'} (${quote.pct_deliverble ? (quote.pct_deliverble * 100).toFixed(1) + '%' : 'N/A'}) |
| **All-Time High / Low** | ₹${summary.allTimeHigh.toLocaleString()} / ₹${summary.allTimeLow.toLocaleString()} |
| **Total Recorded Sessions** | ${summary.totalRecords.toLocaleString()} trading sessions |

> 💾 **Memory Unit Retained**: Stored \`${mem.id}\` under **Recorder** partition with \`confidence: 1.0\`.
> 💡 **Next Steps**: Ask **Agent 2 (Analyst)** for deep quantitative pattern synthesis (*"Analyze ${stockSymbol} trends"*) or **Agent 3 (Planner)** for capital allocation briefs.`;

        return { reply, activityLogs, retainedMemories: [mem] };
      }
    }

    activityLogs.push('● Parsing input for prospect entities & ground-truth data...');

    // Extract structured data from input
    const extracted = this.extractDetails(userInput);

    let missingCrucial: string[] = [];

    // Only flag missing data if user is attempting to log a commercial B2B deal without necessary fields
    const isCommercialDeal = userInput.toLowerCase().includes('prospect') || userInput.toLowerCase().includes('deal') || userInput.toLowerCase().includes('account') || userInput.toLowerCase().includes('client');
    if (isCommercialDeal) {
      if (!extracted.dealSize) {
        missingCrucial.push('deal size / estimated budget');
      }
      if (!extracted.stakeholder) {
        missingCrucial.push('primary stakeholder / decision-maker');
      }
      if (!extracted.expectedClose && !userInput.toLowerCase().includes('close')) {
        missingCrucial.push('expected close date');
      }
    }

    // Persist to relational CRM if company name detected
    let companyId = '';
    let dealId = '';
    if (extracted.companyName) {
      activityLogs.push(`✓ Identified company account: ${extracted.companyName}`);
      
      // Ensure company exists
      let company = db.prepare('SELECT * FROM companies WHERE LOWER(name) = LOWER(?)').get(extracted.companyName) as any;
      if (!company) {
        companyId = `COMP-${Date.now()}`;
        db.prepare(`
          INSERT INTO companies (id, org_id, name, industry, size, annual_revenue)
          VALUES (?, 'ORG-001', ?, ?, ?, ?)
        `).run(
          companyId,
          extracted.companyName,
          extracted.industry || 'Technology / Enterprise SaaS',
          '500-1000',
          extracted.dealSize || 100000
        );
      } else {
        companyId = company.id;
      }

      // Contact
      let contactId = '';
      if (extracted.stakeholder) {
        let contact = db.prepare('SELECT * FROM contacts WHERE company_id = ? AND LOWER(name) = LOWER(?)').get(companyId, extracted.stakeholder) as any;
        if (!contact) {
          contactId = `CONT-${Date.now()}`;
          db.prepare(`
            INSERT INTO contacts (id, company_id, name, role, email, decision_maker_level)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            contactId,
            companyId,
            extracted.stakeholder,
            extracted.stakeholderRole || 'Decision Maker',
            `${extracted.stakeholder.toLowerCase().replace(/[^a-z]/g, '.')}@${extracted.companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            'Decision Maker'
          );
        } else {
          contactId = contact.id;
        }
      }

      // Deal
      let deal = db.prepare('SELECT * FROM deals WHERE company_id = ?').get(companyId) as any;
      if (!deal) {
        dealId = `DEAL-${Date.now()}`;
        db.prepare(`
          INSERT INTO deals (id, company_id, contact_id, title, value, stage, win_probability, requirements, notes)
          VALUES (?, ?, ?, ?, ?, 'Discovery', 0.4, ?, ?)
        `).run(
          dealId,
          companyId,
          contactId || null,
          `${extracted.companyName} Commercial Pipeline`,
          extracted.dealSize || 100000,
          extracted.requirements.join(', ') || 'Commercial Requirements',
          userInput
        );
        activityLogs.push(`✓ Synchronized deal state in PostgreSQL relational store (${dealId})`);
      } else {
        dealId = deal.id;
      }
    }

    // Call RETAIN into Hindsight partition 'recorder'
    activityLogs.push('● Executing RETAIN primitive into Recorder memory partition...');
    const retainedMemories: any[] = [];

    const sourceRef = extracted.companyName ? `${extracted.companyName} Capture [REC-${Date.now().toString().slice(-4)}]` : `Interaction Log [REC-${Date.now().toString().slice(-4)}]`;

    // 1. Prospect Profile Memory
    const title = extracted.companyName 
      ? `${extracted.companyName} - Profile & Requirements` 
      : `${extracted.industry || 'Opportunity'} Record - ${new Date().toISOString().split('T')[0]}`;
    
    const content = `Captured Facts:
- Account / Entity: ${extracted.companyName || 'Individual Prospect'}
- Stakeholder: ${extracted.stakeholder ? `${extracted.stakeholder} (${extracted.stakeholderRole || 'Role not specified'})` : 'Not specified'}
- Deal Size / Capital: ${extracted.dealSize ? `$${extracted.dealSize.toLocaleString()}` : 'Not provided'}
- Industry / Domain: ${extracted.industry || 'Not specified'}
- Key Requirements: ${extracted.requirements.length > 0 ? extracted.requirements.join('; ') : 'General enquiry'}
- Preferences: ${extracted.preferences.length > 0 ? extracted.preferences.join('; ') : 'Standard'}
- Raw User Attribution: "${userInput.trim()}"`;

    const profileMem = hindsightEngine.retain({
      partition: 'recorder',
      title,
      content,
      category: 'fact',
      entity_type: 'company',
      entity_id: extracted.companyName || undefined,
      tags: `prospect,${extracted.companyName ? extracted.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'opportunity'},ground-truth`,
      confidence: 1.0,
      source_ref: sourceRef,
      metadata: { extracted, rawInput: userInput, date: new Date().toISOString() },
    });
    retainedMemories.push(profileMem);

    // If objections or competitors mentioned, retain specific memory unit
    if (extracted.competitors.length > 0 || extracted.objections.length > 0) {
      const compMem = hindsightEngine.retain({
        partition: 'recorder',
        title: `${extracted.companyName || 'Prospect'} - Competitors & Objections`,
        content: `Competitors: ${extracted.competitors.join(', ') || 'None stated'}
Objections / Concerns: ${extracted.objections.join(', ') || 'None stated'}`,
        category: extracted.objections.length > 0 ? 'objection' : 'competitor',
        entity_type: 'company',
        entity_id: extracted.companyName || undefined,
        tags: 'competitor,objection,evaluation',
        confidence: 1.0,
        source_ref: sourceRef,
      });
      retainedMemories.push(compMem);
    }

    activityLogs.push(`✓ Successfully retained ${retainedMemories.length} durable memory unit(s) [Hindsight: Recorder]`);

    // Build concise confirmation reply
    let reply = `### Ground-Truth Capture Confirmed
Captured strictly from user interaction and retained in Hindsight long-term storage under **Recorder Partition**:

* **Account / Entity**: ${extracted.companyName || (extracted.industry ? `${extracted.industry} Opportunity` : 'Individual Inquiry')}
* **Primary Stakeholder**: ${extracted.stakeholder ? `${extracted.stakeholder} (${extracted.stakeholderRole || 'Role unstated'})` : 'User / Prospect'}
* **Deal Size / Capital**: ${extracted.dealSize ? `$${extracted.dealSize.toLocaleString()}` : 'Not specified'}
* **Industry / Domain**: ${extracted.industry || 'General Business'}
* **Requirements**: ${extracted.requirements.length > 0 ? extracted.requirements.join(', ') : 'General inquiry'}
* **Source Reference**: \`${sourceRef}\`
* **Attribution Date**: ${new Date().toISOString().split('T')[0]}`;

    if (missingCrucial.length > 0) {
      reply += `\n\n> ⚠️ **Follow-up Query**: The following crucial data point(s) were omitted: **${missingCrucial.join(', ')}**. Could you clarify these to complete the deal file?`;
    }

    return {
      reply,
      activityLogs,
      retainedMemories,
    };
  }

  private extractDetails(text: string) {
    const res = {
      companyName: '',
      stakeholder: '',
      stakeholderRole: '',
      dealSize: 0,
      requirements: [] as string[],
      preferences: [] as string[],
      competitors: [] as string[],
      objections: [] as string[],
      expectedClose: '',
      industry: '',
    };

    // 1. Comprehensive Currency & Budget Extractor: $2000, 2000$, $120,000, 120k, 50k, 2000 dollars
    const currencyPrefix = text.match(/\$\s*([0-9,]+(?:\.[0-9]+)?(?:\s*[kmb])?)/i);
    const currencySuffix = text.match(/([0-9,]+(?:\.[0-9]+)?)\s*(\$|usd|dollars|bucks|k|thousand|million)/i);
    
    if (currencyPrefix) {
      let raw = currencyPrefix[1].toLowerCase().replace(/,/g, '');
      if (raw.endsWith('k')) res.dealSize = parseFloat(raw) * 1000;
      else if (raw.endsWith('m')) res.dealSize = parseFloat(raw) * 1000000;
      else res.dealSize = parseFloat(raw);
    } else if (currencySuffix) {
      let val = parseFloat(currencySuffix[1].replace(/,/g, ''));
      let unit = currencySuffix[2].toLowerCase();
      if (unit === 'k' || unit === 'thousand') val *= 1000;
      if (unit === 'million') val *= 1000000;
      res.dealSize = val;
    }

    // 2. Industry / Domain Detection (Real estate, SaaS, Healthcare, Logistics, etc.)
    if (/real\s*estate|realstate|property|properties|housing/i.test(text)) {
      res.industry = 'Real Estate / Property Investment';
      res.requirements.push('Real estate portfolio allocation');
      if (!res.companyName) res.companyName = 'Real Estate Investment Asset';
    } else if (/health|medical|clinic|hospital|doctor/i.test(text)) {
      res.industry = 'Healthcare Technology';
    } else if (/logistics|supply\s*chain|shipping|transport/i.test(text)) {
      res.industry = 'Logistics & Supply Chain';
    } else if (/cyber|security|defense|soc2/i.test(text)) {
      res.industry = 'Cybersecurity & Governance';
    } else if (/fintech|finance|wealth|banking/i.test(text)) {
      res.industry = 'Financial Technology';
    }

    // 3. Known Company Names & Direct Entity Matches
    const knownCompany = text.match(/\b(Acme Corp|Acme Corporation|CloudTech|FinGuard|OmniRetail|Apex Logistics|HealthPulse|DataStream|Vanguard Retail|CyberShield|Starlight Media|Beacon Financial|Titan Manufacturing)\b/i);
    if (knownCompany) {
      res.companyName = knownCompany[1].trim();
    } else {
      const companyMatch = text.match(/(?:for|with|prospect|company|account|client)\s+([A-Z][A-Za-z0-9\s&]+?)(?::|\s*,|\s+CTO|\s+CEO|\s+deal|\s+needs|\s+requirements|\.|$)/i);
      if (companyMatch) {
        res.companyName = companyMatch[1].trim();
      } else if (text.toLowerCase().includes('acme')) {
        res.companyName = 'Acme Corp';
      }
    }

    // 4. Stakeholder & Role
    const ctoMatch = text.match(/CTO\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) || text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*CTO/i);
    if (ctoMatch) {
      res.stakeholder = ctoMatch[1].trim();
      res.stakeholderRole = 'CTO';
    } else {
      const nameMatch = text.match(/(?:Sarah Chen|John Doe|Alex Miller|Priya Sharma|David Miller|Marcus Brody|Dr\. Aris Thorne|Karen Patel)/i);
      if (nameMatch) {
        res.stakeholder = nameMatch[0];
        res.stakeholderRole = 'Decision Maker';
      }
    }

    // 5. Requirements Detection
    if (/erp/i.test(text)) res.requirements.push('ERP integration');
    if (/sso|single\s*sign|saml|okta/i.test(text)) res.requirements.push('SSO (Single Sign-On)');
    if (/soc2|security|hipaa|compliance/i.test(text)) res.requirements.push('Security Compliance');
    if (/api|webhook/i.test(text)) res.requirements.push('Custom API Integration');
    if (/invest|allocation/i.test(text)) res.requirements.push('Capital Allocation');

    // 6. Preferences Detection
    if (/annual/i.test(text)) res.preferences.push('Annual billing cycle');
    if (/quarterly/i.test(text)) res.preferences.push('Quarterly billing');
    if (/net\s*30/i.test(text)) res.preferences.push('Net-30 payment terms');

    // 7. Competitors & Objections
    if (/competitor\s*x/i.test(text)) res.competitors.push('Competitor X');
    if (/expensive|budget|price|cost|discount/i.test(text)) {
      res.objections.push('Pricing sensitivity / Budget constraint');
    }
    if (/timeline|delay|rollout|fast/i.test(text)) {
      res.objections.push('Implementation timeline concerns');
    }

    return res;
  }
}

export const recorderAgent = new RecorderAgent();
