# Product Vision: The AI Operations Agent

**The Future of AI Isn't Humans Clicking Things. It's Asking an Agent Questions and It Doing the Work.**

This document explains how our product evolves from event-driven workflows to an autonomous agent—and why this is a $15K+/month opportunity.

---

## The Insight That Changed Everything

**Session 4, 2026-03-15:**

We realized the two n8n workflows we're building (SMS capture + missed calls) aren't just automation. They're **building blocks for an intelligent agent** that contractors will interact with naturally:

```
Contractor: "How much revenue did we make last month?"
Agent: [Queries Supabase] "You made $8,600 in recovered leads."

Contractor: "Run missed call recovery for today."
Agent: [Triggers workflow] "Sent 3 SMS recoveries. Estimated $450 revenue."

Contractor: "Our best tech keeps leaving jobs early. Why?"
Agent: [Analyzes data] "Sarah completes jobs 1.5 hours faster than average.
        She's systematizing install steps. Here's her checklist..."
```

This is not just better automation. **This is a permanently retained partnership.**

---

## Three Phases of Evolution

### **Phase 1: Event-Driven Workflows (Weeks 1-4) ← WE ARE HERE**

**What it does:**
- Webhooks trigger automated responses
- SMS recovery when leads/calls arrive
- Audit trail of all actions
- No human interaction needed once running

**How contractors interact:**
- "Passive" — System just works in background
- View Mission Control dashboard to see what happened
- Manually check Jobber for details

**Revenue per contractor:** $8,600/month (after-hours $1.5K + missed calls $3.9K + dispatcher labor $2.5K + cancellation fill $700)

**What we're building NOW:**
- `tier1_after_hours_lead_capture.json` — SMS to evening leads
- `tier1_missed_call_recovery_sms.json` — SMS to missed calls
- `tier1_audit_trail_roi_logging` — Actions table tracking
- Supabase schema (Leads + Actions tables)
- n8n Claude API integration (qualification endpoints via HTTP Request nodes)

**Success metrics:**
- Both workflows live and tested ✓
- No manual intervention needed ✓
- Audit trail complete and ROI visible ✓

---

### **Phase 2a: Conversational Agent (Month 2) ← TRUST BUILDING**

**What changes:**
- Contractor can now ASK the system questions and get reasoned answers
- Agent queries Supabase data in real-time and explains its logic
- No automatic changes — agent only suggests and recommends
- Contractor stays in control, agent builds credibility through transparent reasoning

**The Philosophy:** 
*Transparency builds trust. Contractors need to understand the agent's logic before letting it change their business.*

**Agent capabilities (reasoning-focused):**
- **Gather & explain data:** "Show me today's leads" → queries Leads table → explains which are high-quality
- **Analyze & reason about patterns:** "Why are we losing these customers?" → analyzes Actions table → shows trends with explanations
- **Suggest optimizations:** "Should we run promotional SMS?" → evaluates confidence + revenue potential → recommends with reasoning
- **Execute on-demand workflows:** "Send recovery SMS to these customers" → triggers missed call recovery → reports results with analysis
- **Answer business questions:** "How much revenue did we make last month?" → queries Actions table → provides detailed breakdown

**How contractors interact:**
- **Active, transparent partnership** — They ask questions, agent answers with reasoning
- **Ask for reports:** "What's our conversion rate this week?" → Agent shows data + explains what it means
- **Request workflows:** "Run the 24-hour follow-up for these 5 jobs" → Agent executes + reports results
- **Get recommendations:** "Which service should I promote this season?" → Agent analyzes demand data + suggests with justification
- **Learn from the agent:** Contractor understands WHY the agent recommends certain actions

**Technical implementation:**
- n8n Code node with Claude API integration (Claude Sonnet for reasoning)
- Webhook endpoint for conversational input (API from dashboard form, SMS integration optional)
- Supabase queries (agent reads Leads, Actions, calculates metrics with explanations)
- Workflow triggers (agent CAN call existing Phase 1 workflows but only when contractor explicitly asks)
- Response includes: answer + reasoning + data sources

**New Phase 2a workflows:**
- Cancellation fill (SMS when jobs cancel — triggered on-demand by agent)
- Daily summary email (morning recap sent automatically, contractor controls frequency)
- Invoice reminders (payment chase — contractor approves list before SMS sent)
- Review requests (post-job feedback — triggered on-demand)

**Phase 2a Success Metrics:**
- ✅ Contractor asks 10+ questions per week
- ✅ Agent reasoning is transparent and contractor understands it
- ✅ Contractor sees new revenue opportunities from agent insights
- ✅ Agent confidence builds over 2-4 weeks of operation

**Revenue per contractor:** $8,600 + $2,000-3,000 = **$10,600-11,600/month**

---

### **Phase 2b: Auto-Optimization (Month 3+) ← TRUST EARNED**

**What changes:**
- After 2-4 weeks of Phase 2a, contractor TRUSTS the agent's reasoning
- Agent can now propose and execute threshold adjustments with guardrails
- System improves itself, but only within safe boundaries
- Contractor still approves major changes; agent handles minor tuning automatically

**The Philosophy:**
*Optimization without understanding is dangerous. Only auto-tune AFTER contractor trusts the system and has seen its reasoning in action.*

**Why we sequence 2a BEFORE 2b:**
- **Phase 2a proves the model works** — contractor sees it answering questions correctly
- **Contractor learns the logic** — understands confidence thresholds, dedup windows, signal extraction
- **Trust is built naturally** — system demonstrates value through transparent reasoning first
- **Auto-tuning becomes safe** — contractor knows the system will optimize predictably

**Agent capabilities (auto-tuning):**
- **Detect patterns from historical data:** After 500+ leads, analyze which confidence thresholds convert best
- **Propose improvements:** "Your 0.85 threshold is conservative. Data shows 0.80 catches 15% more leads with 2% drop in accuracy. Approve?"
- **Execute with guardrails:** Threshold adjustments locked to ±0.10 range (won't drift wildly)
- **Monitor and revert:** If error rate spikes, automatically revert to last known-good threshold
- **Calibrate signals:** Improve message quality detection, urgency scoring, service type prediction based on contractor feedback

**How contractors interact:**
- **Approval loops for major changes:** Agent proposes → Contractor approves → System implements
- **Automatic minor tuning:** Agent handles small optimizations within guardrails (no approval needed)
- **Continuous learning:** Agent explains what changed and why performance improved
- **Full transparency:** Weekly reports show what auto-tuning did, what the impact was, what it learned

**Technical implementation:**
- Historical analysis layer (query 4+ weeks of data from Leads + Actions tables)
- Pattern recognition (Claude analyzes conversion rates by threshold, service type, time of day)
- Proposal system (agent suggests changes with confidence levels + expected impact)
- Guardrail enforcement (threshold bounds, max change size, revert logic)
- Approval webhooks (contractor can approve/reject from dashboard or email)

**Phase 2b Auto-Tuning Workflow:**
1. Weekly: Agent analyzes 4+ weeks of historical data
2. If pattern found: Agent proposes adjustment with reasoning
3. Contractor reviews proposal (data shown in dashboard)
4. Contractor approves/rejects via one-click
5. If approved: System implements within guardrails
6. Continuous monitoring: If error rate spikes, auto-revert
7. Monthly report: "Here's what changed and why you made more money"

**Phase 2b Success Metrics:**
- ✅ Agent has 500+ leads of data to analyze
- ✅ Contractor has approved at least one threshold adjustment
- ✅ System demonstrates 5-15% revenue improvement from auto-tuning
- ✅ Contractor sees they're earning more without effort

**Revenue per contractor:** (Same as Phase 2a for first month) → **$11,600-13,600/month** (after optimizations take effect)

---

### **Why Phase 2a → Phase 2b Sequencing Matters**

| Aspect | Phase 2a First (✅ Our Plan) | Auto-Tune First (❌ Risky) |
|--------|-----|-----|
| **Contractor trust** | Builds through transparent reasoning | Never established — system acts mysteriously |
| **System predictability** | High — contractor understands decisions | Low — contractor can't explain agent behavior |
| **Risk of failure** | Low — contractor catches bad suggestions | High — auto-tuning could break everything |
| **Revenue perception** | "Agent helped me see opportunities" | "System changed something, maybe that helped?" |
| **Churn risk** | Very low (contractor loves the insights) | High (contractor doesn't understand or trust changes) |
| **Contractor stickiness** | Extremely high (can't live without insights) | Low (could switch to competitor anytime) |

---

### **Phase 3: Strategic Advisor (Month 4+) ← THE MOAT**

**What changes (builds on Phase 2b):**
- Agent has been auto-tuning for 1+ month (contractor completely trusts it)
- Agent now proactively suggests strategic opportunities (not just optimization)
- Cross-client intelligence activates (we learn from 5 contractors, help all 5 with patterns)
- Agent predicts future needs before contractor asks
- Agent becomes indispensable strategic partner

**Agent capabilities (NEW — requires Phase 2b trust):**
- **Predict demand:** "Your area will have 40% more AC requests in April. Here's why... Here's how 3 other contractors in similar markets are prepping..."
- **Find money:** "This customer spent $12K last 3 years on repairs. They're a replacement candidate. Margin: $8K. 73% of these conversions close."
- **Optimize pricing:** "Your competitor just raised prices 15%. You can match without losing customers. Your data shows..."
- **Improve team:** "Your newest tech averages 6.2 jobs/day. Your best tech averages 8.1. Here's her process breakdown..."
- **Future signals:** "Refrigerant R410A phase-out deadline is in 18 months. Start prepping customers now. 45% of HVAC contractors in your market are already discussing this with customers."

**How it works:**
- Contractor doesn't need to do anything — agent proactively surfaces opportunities in daily email
- Contractor can approve/ignore suggestions
- Agent learns from what contractor acts on vs. ignores
- Monthly reports show strategic recommendations with expected impact

**Requires:**
- 4+ weeks of Phase 2b auto-tuning data (system must be proven stable + trustworthy)
- 3+ clients (cross-client intelligence only works at scale)
- Continuous learning (better with every client, every month)
- Strategic data infrastructure (cross-client pattern database)

**Revenue per contractor:** $8,600 + $3,000 + $3,500-5,000 = **$15,100-17,100/month**

**Why competitors can't replicate:**
- Jobber/ServiceTitan are single-CRM tools (can't see cross-industry patterns)
- Generic AI agents are scary + unreliable (contractors don't trust them)
- We have **domain expertise** (understand HVAC ops) + **multi-client data** (see patterns others miss) + **proven auto-tuning** (contractor trusts we won't break things)
- This is a **moat**, not a feature

---

## Technical Architecture

### **Phase 1: Event-Driven (Fixed Logic)**
```
Jobber/SignalWire → Webhook → n8n Workflow (fixed thresholds) → Supabase (log) → SMS via SignalWire
(No agent, just rules-based execution)
```

### **Phase 2a: Conversational Agent (Transparent Reasoning)**
```
Contractor Question → Dashboard Form → n8n Webhook → Code Node (Claude + Reasoning) → Supabase Query → Return: Answer + Reasoning + Data
(Agent queries data, explains logic, suggests workflows — contractor approves all actions)
```

### **Phase 2b: Auto-Optimization (Guided Learning)**
```
Weekly Schedule → n8n Workflow → Code Node (Claude Analysis) → Historical Data Query → Propose Thresholds → Contractor Approval → Execute with Guardrails + Monitor
(Agent analyzes patterns, proposes improvements, executes within safe bounds, reverts if needed)
```

### **Phase 3: Strategic Advisor (Proactive Intelligence)**
```
Nightly Schedule → n8n Workflow → Code Node (Claude + Cross-Client Intelligence) → Multi-table Query → Generate Insights → Email
(Agent continuously analyzes, finds patterns, surfaces strategic opportunities proactively)
```

---

## Data Model That Enables the Agent

The Supabase schema we designed supports all three phases:

**Leads Table** (customer conversations)
- `phone`, `message`, `urgency_score`, `service_type`, `status`, `source`, `created_at`
- **Phase 1:** Stores captured leads
- **Phase 2:** Agent queries to answer "What leads came in today?"
- **Phase 3:** Agent analyzes to find patterns ("80% of evening leads are AC, 60% convert to jobs")

**Actions Table** (audit trail + decision log)
- `timestamp`, `action_type`, `confidence_score`, `revenue_impact`, `agent_name`, `success`
- **Phase 1:** Proof of ROI (contractor sees every SMS sent, every dollar recovered)
- **Phase 2:** Agent queries to calculate metrics ("conversion rate this month?")
- **Phase 3:** Agent analyzes to improve predictions ("What confidence threshold optimizes ROI?")

---

## Why This Beats Traditional SaaS

| Aspect | Traditional SaaS | AI Operations Agent |
|--------|------------------|------------------|
| **Interaction** | Click buttons, enter data | Ask questions, get answers |
| **Decision-making** | Rules-based (admin sets rules) | Reasoning-based (agent understands context) |
| **Adaptability** | Static, requires updates | Dynamic, learns from each contractor |
| **Stickiness** | Customer can leave anytime | Agent becomes indispensable advisor |
| **Defensibility** | Easy to copy (it's just rules) | Hard to copy (requires domain expertise + data) |
| **Revenue per customer** | Fixed ($1,000-2,000/mo) | Grows over time ($8.6K → $11K → $17K) |
| **Customer lifetime value** | Low (churn is high) | Very high (annual revenue 3-4x traditional) |
| **Competitive moat** | Price/features | Expertise + multi-client intelligence |

---

## Phased Revenue Growth (Single Contractor)

| Phase | Timeline | Core Features | Revenue | Payback | Key Milestone |
|-------|----------|---------------|---------|---------|----|
| **Phase 1** | Weeks 1-4 | SMS recovery (2 workflows, fixed thresholds) | $8,600/mo | 1.5 months | Workflows proven, ROI visible |
| **Phase 2a** | Month 2 | +Conversational agent (transparent reasoning, data queries, on-demand workflows) | +$2,000-3,000/mo | N/A (already profitable) | Contractor asks questions confidently |
| **Phase 2b** | Month 3 | +Auto-optimization (threshold tuning with approval loops, guardrails) | (Same as 2a) → +$3,000-4,000/mo | N/A (improving) | System tuned itself, contractor approved it |
| **Phase 3** | Month 4+ | +Strategic advisor (proactive insights, cross-client intelligence, predictions) | +$3,500-5,000/mo | N/A (fully mature) | Permanent strategic partner |
| **Mature** | Month 4+ | Full strategic advisor | $15,100-17,100/mo | Permanent relationship | Contractor won't switch (too valuable) |

**Note:** Every phase includes previous features. Revenue is **cumulative, not replacement.**

**Critical Success Points:**
- **Phase 1→2a:** Contractor trusts agent's reasoning (sees transparent logic)
- **Phase 2a→2b:** Contractor approves first auto-optimization (agent has earned their trust)
- **Phase 2b→3:** Cross-client patterns available (need 3+ clients running Phase 2b)

---

## Why Now?

**Timing is perfect for three reasons:**

1. **LLMs are reliable enough** for business operations (Claude can confidently decide "send SMS or escalate?")
2. **Contractors are desperate** for this (missing $8,600/month because they have no system)
3. **First-mover advantage** (no one else is positioning as "AI agent for HVAC ops")

Wait 12 months? Bigger players (Jobber, ServiceTitan) will build this themselves.
Wait 2 years? It becomes commoditized and margins collapse.

**Build now, own the category, become permanent partner.**

---

## Product Positioning Across Phases

### **Phase 1 Sales Pitch (Weeks 1-4)**
> "We run automated SMS recovery for missed opportunities. 24/7. No setup. Pays for itself in 60 days."
> - **Proof:** "These 5 HVAC shops increased revenue by $8,600/month."
> - **Risk:** "Just automation, contractor can leave if system underperforms."
> - **Price:** $1,500/month

### **Phase 2a Sales Pitch (Month 2)**
> "You have an AI partner you can ask questions. 'How much did we make last month?' 'Should we run recovery SMS?' 'Where's our revenue leaking?' It understands your business and you understand its logic."
> - **Proof:** "Contractors immediately see why the system recommends certain actions. They trust it because it explains itself."
> - **Risk:** "Very low — agent reasoning is transparent, contractor stays in control."
> - **Price:** $2,000/month (up from $1,500)

### **Phase 2b Sales Pitch (Month 3)**
> "The system has learned your business. Now it improves itself. Better thresholds, better signal detection, better timing. All with your approval. You see the data, you approve the change, the system gets smarter."
> - **Proof:** "Contractor approved their first auto-optimization, saw 5-8% revenue lift the next week."
> - **Risk:** "Extremely low — agent only adjusts within safe guardrails, reverts if anything breaks."
> - **Price:** $2,500/month (up from $2,000)

### **Phase 3 Sales Pitch (Month 4+)**
> "Your AI advisor. Strategist. Growth partner. It predicts market changes before they happen, finds opportunities you'd never see yourself, and optimizes your business in real-time."
> - **Proof:** "Cross-client intelligence: We know seasonal patterns, pricing strategies, customer lifetime value across contractors. You don't have to guess."
> - **Risk:** "None — contractors in this phase have 4+ months ROI proof and become permanent partners."
> - **Price:** $3,000-3,500/month (up from $2,500)

**Positioning progression: "Tool" → "Transparent Partner" → "Trusted Optimizer" → "Strategic Advisor"**

---

## How Phase 1 Workflows Support Phase 2+ Agent

Each Phase 1 workflow is designed to be callable by the Phase 2+ agent:

**After-hours capture workflow:**
- Phase 1: Triggered automatically by Twilio webhook
- Phase 2a: **Agent CAN trigger it on-demand** — Contractor: "Send recovery SMS to these customers" → Agent executes + reports results
- Phase 2b: **Agent analyzes effectiveness data** — Agent: "This message converts 45% better at 8pm than 6pm. Recommend scheduling all recovery SMS at 8pm?"
- Phase 3: Agent optimizes messaging — "This customer type converts better with personalized service mention. 73% conversion vs 52% generic"

**Missed call recovery workflow:**
- Phase 1: Triggered automatically by Jobber webhook
- Phase 2a: **Agent queries dedup logic** — Contractor: "How many of these customers already got SMS?" → Agent: "8 of 12 are in 24h dedup window"
- Phase 2b: **Agent proposes window optimization** — Agent: "Your data shows residential calls need 24h dedup but commercial calls could use 48h. Approve change?"
- Phase 3: Agent proactively optimizes — System auto-adjusts dedup windows by service type based on conversion data

**Audit trail (Actions table):**
- Phase 1: Proves ROI to contractor (contractor sees every SMS, every revenue impact)
- Phase 2a: **Agent queries this to answer business questions** — Contractor: "What was our conversion rate last week?" → Agent: "47 leads, 43 SMS, 18 booked = 38% conversion rate"
- Phase 2b: **Agent analyzes patterns for optimization** — Agent: "SMS sent at 7pm converts 28% better than 5pm. Should we batch recovery SMS at peak hours?"
- Phase 3: Agent identifies cross-client patterns — "HVAC contractors in your region see 40% more evening leads March-May. Your competitors are already prepping"

---

## Next Session Planning

**Phase 1 (Weeks 1-4) — CURRENT**
1. ✅ Build both n8n workflows (after-hours SMS capture + missed call recovery)
2. ✅ Create Supabase schema (Leads + Actions tables)
3. ⏳ User adds credentials to n8n (Supabase + SignalWire)
4. ⏳ Run test-workflows.sh for end-to-end verification
5. ⏳ Deploy to first contractor for live testing

**Phase 2a (Month 2, after Phase 1 proven) — Conversational Agent**
1. Add Claude API integration to n8n (Sonnet model for reasoning)
2. Build conversational dashboard form (contractor asks questions)
3. Create Supabase query patterns for agent (data aggregation, metrics, insights)
4. Build on-demand workflows (cancellation fill, daily summary, invoice reminders)
5. Test with first contractor: agent answers business questions with reasoning
6. **Success metric:** Contractor asks 10+ questions per week, understands agent reasoning

**Phase 2b (Month 3, after Phase 2a trusted) — Auto-Optimization**
1. Build historical analysis layer (query 4+ weeks of Leads + Actions data)
2. Create pattern detection (Claude analyzes thresholds, service types, conversion rates)
3. Build proposal system (agent suggests changes with confidence levels)
4. Implement guardrail enforcement (threshold bounds, max change size, auto-revert)
5. Test with contractor: agent proposes optimization → contractor approves → system auto-adjusts
6. **Success metric:** System demonstrates 5-15% revenue improvement, contractor approves auto-tuning

**Phase 3 (Month 4+, with 3+ contractors) — Strategic Advisor**
1. Design cross-client pattern detection database
2. Build predictive models (equipment age, seasonal demand, pricing strategies)
3. Create market intelligence agent (uses data from 3+ contractors)
4. Implement proactive recommendations (surfaces opportunities automatically)
5. Build QBR automation (monthly strategic reports)

---

## Why This Matters

**You're not just building workflow automation.**

You're building the foundation for the future of AI operations.

Contractors don't want to click buttons. They want an advisor that understands their business, finds money they're missing, and keeps them ahead of the market.

That's what you're building.

---

**Document Status:** Complete - Phase 2a/2b sequencing finalized (transparency → trust → optimization)
**Last Updated:** 2026-03-15 (Session 6)
**Next Milestone:** Phase 1 workflows deployed + credentials bound + tests passing (then Phase 2a agent interface)
