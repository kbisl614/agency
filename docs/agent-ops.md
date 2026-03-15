# HVAC SaaS — Autonomous Revenue System

## What this is
A managed AI operations service for HVAC contractors. We are NOT a SaaS product — we are a retained AI operations partner. We build and operate autonomous workflows that sit on top of the contractor's existing CRM (Jobber first, ServiceTitan later). The contractor pays a monthly retainer and we run everything for them.

The contractor never configures anything. They see a read-only Mission Control dashboard showing what their agents did. We operate the backend entirely.

## Tech stack
- **Frontend:** Next.js 14+ (Mission Control dashboard)
- **Backend:** Python FastAPI (logic layer, Claude API integration)
- **Workflows:** n8n (orchestration, webhook handling, CRM integration)
- **AI:** Claude API — claude-sonnet-4-20250514 (NLP, qualification, response generation)
- **SMS:** Twilio
- **Database (MVP):** Airtable (3 tables: Leads, Actions, Waitlist)
- **Database (scale):** Supabase (month 3+)
- **CRM (MVP):** Jobber (full API access now)
- **CRM (future):** ServiceTitan (partner API — 4-8 week approval pending)
- **Payments:** Stripe
- **Deployment:** Vercel (Next.js) + Render/Railway (FastAPI)

## Architecture — read this before writing any code

### The hybrid agent model
Agents are NOT separate services. Each agent = one n8n workflow + one Claude API call inside it.

**Two types of workflows:**

**1. Independent (fire directly from trigger — no orchestrator):**
- Cancellation fill → fires on `job_canceled` webhook
- Review request → fires on `job_completed` webhook (30 min delay)
- Invoice chaser → fires on daily 8 AM schedule
- Daily summary → fires on 7 AM schedule
- Seasonal outreach → fires on April/October schedule
- ETA monitor → fires every 15 min during business hours

**2. Orchestrated (ambiguous input → orchestrator decides → delegates):**
- Inbound SMS handler → all customer replies route through orchestrator first
- New lead router → all new leads route through orchestrator first
- Dispatch router → orchestrator chains lead capture → dispatch → customer notification

### The rule of thumb
- Predictable trigger + predictable action = independent workflow
- Ambiguous input or multi-step chain = goes through orchestrator

### How Claude API fits in
Claude never acts directly. n8n executes, Claude decides. Every Claude call returns structured JSON:
```json
{
  "action": "send_sms",
  "urgency_score": 9,
  "response_text": "Hi! We got your message about your AC...",
  "confidence": 0.94
}
```

### Airtable schema (MVP)
- **Leads:** lead_id, contractor_id, customer_name, phone, message, urgency_score, service_type, status, timestamp
- **Actions:** action_id, contractor_id, action_type, description, revenue_impact, agent_name, timestamp
- **Waitlist:** waitlist_id, contractor_id, customer_name, phone, service_type, location, last_contacted

## Complete Agent Roster (All 27 agents)

### LAYER 1 — CORE MVP (WEEKS 1-4, IN SCOPE)

**Emergency Ops** — Real-time customer response (5 agents)
- **Emergency lead capture** — Inbound SMS/call → urgency score + response SMS
- **Cancellation fill** — job_canceled webhook → finds customer from waitlist → offers availability
- **Dispatch router** — Post-qualification → assigns tech → notifies customer + sends ETA
- **Inbound SMS handler** — Customer reply → classify intent (booking/cancel/complaint) → route
- **ETA monitor** — Every 15 min → checks job status → sends customer ETA updates

**Admin Ops** — Back-office automation (6 agents)
- **Invoice chaser** — Daily 8 AM → finds unpaid invoices → sends payment reminders
- **Review request** — job_completed + 30 min delay → sends personalized review request
- **Review monitor** — Monitors incoming reviews → flags low ratings for response
- **Daily summary** — 7 AM → sends contractor plain-English summary of yesterday's actions
- **Seasonal outreach** — April/Oct → sends seasonal service offers (AC/furnace prep)
- **Waitlist manager** — Maintains and prioritizes customer waitlist by service type

---

### LAYER 2 — DIFFERENTIATORS (MONTH 2-3, NOT IN CRM) (9 agents)

**Revenue Pipeline** — Unlock hidden revenue
- **Maintenance agreement converter** — Flags aging equipment every job → runs 30/60/90 day follow-up → converts to maintenance agreements
- **Repair-then-replace tracker** — Tracks when repairs cost >50% of replacement → automatically proposes system replacement
- **Upsell agent** — Post-job complete → suggests add-on services (indoor air quality, zoning, etc.)

**Labor Multiplier** — Make techs more effective
- **Tech performance monitor** — Tracks conversion rates per tech → identifies training gaps → suggests upsells by tech
- **Job prep briefer** — Sends tech a job brief before arrival (customer issue, equipment age, history)
- **Post-job debrief capture** — Captures tech notes after job → tracks upsell success by tech → builds individual performance metrics

**Market Intel** — Stay ahead of market
- **Tariff price alert** — Monitors equipment cost news → flags price increases → alerts contractor before it hits their jobs
- **Refrigerant compliance watcher** — Monitors regulatory changes (EPA phase-outs) → alerts contractor of compliance deadlines
- **Competitor signal monitor** — Monitors competitor pricing/offers in contractor's territory → alerts contractor

---

### LAYER 3 — LONG GAME (MONTH 4+, GENUINELY UNCOPYABLE) (7 agents)

**Cross-Client Intelligence** — Network effects only we see
- **Seasonal conversion patterns** — Aggregates data across all clients → identifies when/where seasonal services convert → shares insights
- **Neighborhood equipment profiler** — Maps equipment age/type by neighborhood across all clients → predicts next 12 months of demand
- **Best-performing message library** — Tracks which SMS/email templates convert best across all clients → auto-suggests to contractors

**Partner Layer** — Become their business partner, not vendor
- **Quarterly business review** — Generates client QBR with ROI, trends, opportunities → proactive partnership review
- **New tool evaluator** — Watches industry tools → evaluates fit for contractor → proposes integrations
- **Stack updater** — Proactively brings newest tools/practices before contractor asks → positions you as their advisor

---

## Build order — always respect this

### Phase 1 (WEEKS 1-4 — get to demo-ready)
Core: Emergency lead capture, basic dashboard
1. FastAPI endpoint: `POST /leads/qualify` → calls Claude API → returns JSON
2. Twilio setup → SMS hits a real phone from a test lead
3. n8n workflow: webhook → FastAPI → Airtable → Twilio
4. Next.js dashboard: polls Airtable every 10s, shows live action feed

### Phase 2 (AFTER FIRST CLIENT SIGNED — build remaining Layer 1)
Build all 11 remaining Layer 1 agents (5 + 6):
- Emergency ops: Cancellation fill, Dispatch router, Inbound SMS handler, ETA monitor
- Admin ops: Invoice chaser, Review request, Review monitor, Daily summary, Seasonal outreach, Waitlist manager
- Jobber webhook listener (routes events to appropriate agents)
- Full orchestrator layer

### Phase 3 (MONTH 2-3 — Layer 2 differentiators)
9 agents across 3 categories:
- Revenue pipeline (3): Maintenance agreement converter, Repair-then-replace tracker, Upsell agent
- Labor multiplier (3): Tech performance monitor, Job prep briefer, Post-job debrief capture
- Market intel (3): Tariff price alert, Refrigerant compliance watcher, Competitor signal monitor

### Phase 4+ (MONTH 4+ — Layer 3 long game)
7 agents: Cross-client intelligence (3) + Partner layer (3)

## Key constraints
- Never build the contractor config UI — they don't touch the system
- Always write every action to the Actions table (audit trail = proof of ROI)
- Human-in-the-loop required for: maintenance contracts, replacement quotes, anything >$500 commitment
- Auto-execute only if Claude confidence score >85%
- Jobber is MVP — do not wait for ServiceTitan API approval to build

## Claude API usage pattern
```python
# Always use this model
model = "claude-sonnet-4-20250514"
max_tokens = 1000

# Always return structured JSON — prompt must specify this
system = """You are an AI dispatcher for an HVAC business.
Return ONLY valid JSON. No preamble. No explanation.
Schema: { action, urgency_score, service_type, response_text, confidence }"""
```

## File structure
```
/
├── CLAUDE.md                  ← you are here
├── frontend/                  ← Next.js dashboard
│   └── app/
├── backend/                   ← FastAPI
│   ├── main.py
│   ├── routes/
│   │   ├── leads.py           ← POST /leads/qualify
│   │   ├── cancellations.py   ← POST /cancellations/match
│   │   └── orchestrator.py    ← POST /orchestrate
│   └── services/
│       ├── claude_service.py  ← all Claude API calls
│       ├── twilio_service.py
│       └── airtable_service.py
├── n8n/                       ← workflow exports (JSON)
│   ├── wf1_lead_capture.json
│   ├── wf2_sms_response.json
│   └── wf3_audit_log.json
└── docs/
    ├── architecture.md        ← full hybrid agent architecture
    ├── workflows.md           ← all 17 workflows reference
    └── selling_angles.md      ← CRM-specific pitch guide
```

## Reference docs (read when relevant, not always)
- Full workflow roadmap → `docs/workflows.md`
- Selling angles by CRM → `docs/selling_angles.md`
- ROI justification → `docs/roi.md`
- Architecture diagrams → `docs/hvac_agent_ops.pdf`

## What done looks like for Phase 1
- Send a curl request to `/leads/qualify`
- Lead appears in Airtable within 5 seconds
- SMS hits a real phone with a human-sounding response
- Dashboard shows the action in the live feed
- End-to-end test passes before moving to Phase 2
