# AI Operations Partnership — Product Roadmap

This document maps the autonomous AI agent system across 4 phases for service business verticals. The roadmap is driven by the retained partnership model, not a fixed feature roadmap.

---

## LAYER 1 — CORE MVP (WEEKS 1-4, ALL 11 AGENTS)

**Goal:** Full autonomous operations. Client never configures anything. System runs 24/7, recovers measurable revenue from day one.

### Emergency Ops (5 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Emergency lead capture** | Inbound SMS/call | Qualifies urgency (Claude) → responds with availability | Fast SMS → customer stays (vs voicemail) |
| **Cancellation fill** | job_canceled webhook | Finds best customer from waitlist → offers availability | $175/slot filled (direct revenue) |
| **Dispatch router** | Post-qualification | Assigns tech based on location/skills → notifies customer + tech | Prevents no-shows (100% show rate) |
| **Inbound SMS handler** | Customer reply/question | Routes to correct agent (booking/cancel/complaint/feedback) | No miscommunication |
| **ETA monitor** | Every 15 min (hours) | Checks Jobber status → sends customer real-time ETA | Reduces call-back volume |

### Admin Ops (6 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Invoice chaser** | Daily 8 AM | Finds unpaid invoices → sends friendly payment reminder | +15-20% payment collection |
| **Review request** | job_completed + 30 min | Sends automated review request → incentivizes Google reviews | Higher star rating (organic lead gen) |
| **Review monitor** | New review arrives | Flags low ratings → escalates to human for response | Damages controlled within 24h |
| **Daily summary** | 7 AM | Sends contractor plain-English summary of yesterday's work | Contractor sees value in real time |
| **Seasonal outreach** | April & Oct | Sends seasonal service offers (AC prep, furnace prep) | +$500-1000/month seasonal revenue |
| **Waitlist manager** | Continuously | Maintains/prioritizes customer waitlist → tracks service type + urgency | Faster dispatch (cancellation fill source) |

---

## LAYER 2 — DIFFERENTIATORS (MONTH 2-3, 9 AGENTS)

**Goal:** Unlock revenue opportunities competitors can't see. Requires 30+ days of client data. This is where the partnership model justifies itself—we find what the client didn't even know they were missing.

### Revenue Pipeline (3 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Maintenance agreement converter** | Every job completed | Flags aging equipment (>15 years) → runs 30/60/90 day follow-up → converts to maintenance agreements | $200-500/customer/year (recurring) |
| **Repair-then-replace tracker** | Invoice created | When repair cost >50% replacement → proposes system replacement instead | $3000-5000 per conversion |
| **Upsell agent** | After service completion | Suggests add-on services (duct cleaning, air purification, zoning, humidifiers) | +$500-1500 per job avg |

### Labor Multiplier (3 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Tech performance monitor** | Job completed | Tracks conversion rates per tech → identifies top upsellers → recommends coaching | 20-30% variance between techs |
| **Job prep briefer** | Before tech arrival | Sends tech job brief (customer history, equipment age, prior issues, upsell opportunities) | Tech closes better (prepared) |
| **Post-job debrief capture** | After job completion | Captures tech notes → tracks upsell success per tech → builds individual performance dashboard | Individual accountability |

### Market Intel (3 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Tariff price alert** | Daily monitoring | Watches equipment cost news → flags price increases → alerts contractor before hitting jobs | Contractor locks in pricing |
| **Refrigerant compliance watcher** | Regulatory monitoring | Monitors EPA phase-outs (R410A, R22) → alerts contractor of deadlines | Contractor prepared for compliance |
| **Competitor signal monitor** | Daily/weekly monitoring | Monitors competitor pricing/offers in contractor's territory → alerts contractor | Contractor stays competitive |

---

## LAYER 3 — LONG GAME (MONTH 4+, 7 AGENTS)

**Goal:** Build the moat. Cross-client intelligence and strategic partnership that only works at scale (3+ clients). This is what makes us the permanent AI operations partner vs. a SaaS product.

### Cross-Client Intelligence (3 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Seasonal conversion patterns** | Monthly aggregation | Analyzes data across all clients → identifies which seasonal service converts best + when + where → shares insights | Contractor optimizes seasonal campaigns |
| **Neighborhood equipment profiler** | Monthly aggregation | Maps equipment age/type/brand by neighborhood across all clients → predicts next 12 months demand by area | Contractor targets territories early |
| **Best-performing message library** | Continuous learning | Tracks SMS/email templates that convert best across all clients → auto-suggests to individual contractors | Contractor uses battle-tested copy |

### Partner Layer (4 agents)

| Agent | Trigger | What it does | ROI/Proof |
|-------|---------|-------------|-----------|
| **Quarterly business review** | Quarterly (every 90 days) | Auto-generates client QBR with ROI, trends, predictions, next opportunities → proactive partnership discussion | Contractor sees value, renews |
| **New tool evaluator** | Weekly monitoring | Watches industry tools/startups → evaluates fit for contractor's use case → proposes integrations | Contractor adopts tools ahead of industry |
| **Stack updater** | Proactive (monthly) | Brings next thing contractor needs before they ask for it → positions you as their advisor, not vendor | Contractor thinks of you as partner |

---

## Why This Layering Matters

**Layer 1 = Utility**
- Every agent saves money or makes money immediately
- Contractors can see ROI in days (emergency fill) to weeks (invoice chaser)
- Proves the model works

**Layer 2 = Competitive Advantage**
- Layer 1 agents exist in some form in other tools (dispatching, invoicing)
- Layer 2 is unique to us (requires daily data, human judgment, continuous learning)
- Contractors can't get these from Jobber/ServiceTitan

**Layer 3 = Moat**
- Requires 30+ clients to be useful (cross-client patterns don't exist with 1-2 clients)
- Gets stronger every time you add a client (data compounds)
- Truly uncopyable (SaaS vendor with 1 CRM can't see patterns across 5 different CRMs)

---

## Phase Definitions

| Phase | Timeline | Goal | Scope | Client experience |
|-------|----------|------|-------|----------------------|
| **Phase 1** | Weeks 1-4 | MVP demo-ready | Emergency lead capture only | "This actually works 24/7?" |
| **Phase 2** | After 1st client signed | Full autonomous ops | All 11 core agents | "You're our AI operations partner?" |
| **Phase 3** | Month 2-3 | Revenue multiplier | Layer 1 + 9 Layer 2 agents | "You found revenue we didn't know existed" |
| **Phase 4** | Month 4+ | Strategic advisor | Full system + Layer 3 insights | "You're permanently keeping us ahead" |

---

## Implementation Priority Within Each Phase

### Phase 1 (Next 4 weeks)
**MVP for demo:**
1. Emergency lead capture (the 1 agent that matters)
2. Basic dashboard (shows it's working)
3. Airtable + Twilio (proof of integration)

**Not in Phase 1:**
- Cancellation fill (needs active contractors)
- Orchestrator (needs multiple workflows)
- Jobber integration (needs first client)

### Phase 2 (After first signed client)
**Sequence:**
1. Jobber webhook setup (foundation for everything)
2. Cancellation fill (highest ROI per agent)
3. Dispatch router (required for cancellation fill to work)
4. Remaining independent workflows (invoice, review, ETA, summary)
5. Full orchestrator + Inbound SMS handler
6. Waitlist manager

### Phase 3 (Month 2-3)
**Prerequisite:** 30+ days of client data from Phase 2

Build in ROI order:
1. Maintenance agreement converter ($200-500/customer)
2. Repair-then-replace tracker ($3000-5000 per conversion)
3. Upsell agent ($500-1500 per job)
4. Tech performance monitor (performance visibility)
5. Market intel agents (Tariff alert, Compliance watcher, Competitor monitor)

### Phase 4+ (Month 4+)
**Prerequisite:** 3+ clients generating comparative data

1. Seasonal conversion patterns
2. Neighborhood equipment profiler
3. Best-performing message library
4. Quarterly business review
5. New tool evaluator
6. Stack updater

---

## How to Reference This

- **Sales conversations:** "This is Layer 1 — it pays for itself in 60 days. Layer 2 starts month 2, where we find revenue you don't see yet. Layer 3 is where we become your strategic advisor."
- **Implementation:** Follow phase sequences strictly. Don't build Layer 2 before Phase 2 is live and 30 days of data exists.
- **Quarterly business reviews:** "You're in Layer 1. Next quarter, here's what Layer 2 looks like for your business." (shows partnership roadmap)
- **Retention:** Constant conversation about the next layer unlocks the long-term relationship
