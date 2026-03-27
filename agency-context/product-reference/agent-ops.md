# Fieldline AI — Agent Architecture & Operations
**Last Updated:** 2026-03-19

---

## What This Is

A managed AI operations service for HVAC contractors. **AI implementation partner — not SaaS.** We build and operate custom AI workflows and agents per contractor. They pay a monthly retainer and never configure anything. They see a per-client dashboard showing what the system did.

---

## The Four Agents (Digital Front Office)

### The Concierge
**Role:** 24/7 Lead Intake & Reputation
**Villain it kills:** Missed leads, slow response, ignored reviews

**What it does:**
- Responds to every inbound lead (SMS, missed call, Facebook, LSA, web form) in under 60 seconds
- Urgency triage — "No heat in January" gets emergency routing, "want an estimate" gets standard flow
- Review request SMS 30 min after job_completed
- Classifies all customer replies (confirm, cancel, complaint, question) and routes them
- Notifies contractor of anything requiring human attention

**n8n workflows underneath:**
- after_hours_lead_capture (`jlWxZ52pFxelh7aU`)
- missed_call_recovery (`EjrtbF205kPsOCxO`)
- inbound_sms_handler
- review_request
- review_monitor

**Always deployed first.** Delivers the guarantee. Zero tech behavior change required.

---

### The Closer
**Role:** Proposals & Sales Velocity
**Villain it kills:** Late-night quoting, inconsistent pricing, slow close rate

**What it does:**
- Triggered when tech marks a diagnostic in Jobber (existing behavior — no change for tech)
- Pulls pricebook from Jobber, calculates margin, drafts proposal
- Sends to tech's phone within 60 seconds
- Auto-sends to customer or escalates based on job value:
  - Under $500 → auto-sends Jobber estimate to customer
  - $500–$2,000 → SMS owner: "Tech at [name] job. Proposed: $1,100 blower motor. Reply YES"
  - $2,000+ → owner must approve before customer sees it
- Owner replies YES → Jobber estimate goes to customer
- Tech presents proposal on-site while customer is ready to decide

**Requires:** Jobber pricebook maintained by contractor
**n8n workflows:** jobber_diagnostic_listener, proposal_generator, owner_approval_handler

---

### The Dispatcher
**Role:** Schedule Optimization & Field Coordination
**Villain it kills:** Empty gaps, wasted windshield time, last-minute chaos

**What it does:**
- Monitors Jobber job events (canceled, completed, status changes)
- When job cancels → pulls waitlist → finds best match by service type + urgency → texts them
- Sends customers "On My Way" ETA updates based on Jobber job status
- Coordinates tech assignment by location, skills, and availability
- Does NOT auto-reroute mid-day (too unpredictable) — alerts only, human decides on complex re-routes

**n8n workflows:** cancellation_fill, eta_monitor, dispatch_router, waitlist_manager

---

### The Strategist
**Role:** Retention & Revenue Mining
**Villain it kills:** Dead customer list, slow weeks, no business visibility

**What it does:**
- Scans Jobber customer history for anyone not serviced in 12+ months
- Organizes block specials for slow weeks — targets high-margin maintenance
- Generates monthly ROI report: leads recovered, proposals sent, revenue impact, trends
- Tracks CLV and flags upsell opportunities (aging equipment, repair-then-replace threshold)
- Sends plain-English daily summary to contractor owner at 7 AM

**Requires:** 30+ days of Concierge data. Needs clean Jobber customer data.
**n8n workflows:** customer_reactivation, daily_summary, invoice_chaser, monthly_roi_report

---

## Tech Stack

- **Frontend:** Next.js / Vercel — per-client dashboard
- **Workflows:** n8n Cloud (`krn8n9394.app.n8n.cloud`) — multi-tenant, one workflow per function
- **AI reasoning:** Claude Sonnet 4.6 — called from n8n HTTP Request nodes
- **AI orchestration:** Nemotron 3 Super 120B via OpenRouter (free) — agent layer only
- **AI batch:** Claude Batch API — non-real-time calls (50% off standard)
- **SMS:** SignalWire — contractor's ported existing business number
- **Database:** Supabase — single source of truth, RLS per contractor
- **Agent runtime:** OpenClaw inside NemoClaw sandboxes (one per contractor on central VPS)
- **CRM (primary):** Jobber (full API)
- **CRM (secondary):** ServiceTitan (partner API approval pending)
- **No CRM:** Build custom Supabase + Next.js CRM as part of engagement

> **Note:** FastAPI is **deferred to Phase 3** — not now. All current logic runs inside n8n. Claude is called directly from n8n HTTP Request nodes.

---

## Architecture — How Layers Work Together

```
WORKFLOW LAYER (n8n — deterministic, event-driven):
  Fires on triggers (webhook, schedule, SMS)
  Calls Claude for decisions
  Executes actions (send SMS, log to Supabase, call Jobber API)
  One workflow handles ALL contractors via Supabase config lookup

AGENT LAYER (OpenClaw / NemoClaw — autonomous, goal-driven):
  Sits ON TOP of n8n workflows
  Receives events → reasons about full context + history
  Decides WHICH n8n workflows to invoke and when
  n8n handles execution, OpenClaw handles judgment
  One NemoClaw sandbox per contractor (isolated)
```

**Multi-tenant pattern (every workflow):**
```
Event arrives → extract contractor identifier
  SMS: SELECT * FROM clients WHERE signalwire_number = '[TO number]'
  Jobber webhook: SELECT * FROM clients WHERE contractor_id = '[?contractor param]'
  Scheduled: SELECT * FROM clients WHERE is_active = true → loop
→ All actions logged with contractor_id
```

---

## How Claude API Fits In (n8n HTTP Request node)

Claude never acts directly. n8n executes, Claude decides. Every Claude call returns structured JSON:

```json
{
  "action": "send_sms",
  "urgency_score": 9,
  "response_text": "Hi! We got your message about your AC...",
  "confidence": 0.94
}
```

**Cost routing:**
- Real-time decisions → Claude Sonnet 4.6 standard ($3/M in, $15/M out)
- Reports, summaries, scoring → Claude Batch API (50% off)
- Claude spend hits $150/month per contractor → overflow to Nemotron fallback (~$0.20/M)

**Auto-execute only when confidence ≥ 0.85.** Below that → log as human_review_needed, alert contractor.

---

## Supabase Schema

```sql
clients: contractor_id, business_name, owner_email, owner_phone,
         signalwire_number, crm_type, business_hours (JSON),
         jobber_api_key, review_link, agents_active (JSON),
         is_active, created_at

techs: id, contractor_id, name, phone, skill_set, is_active

users: id (Supabase Auth UUID), contractor_id, email, role (admin|client), created_at

leads: lead_id, contractor_id, customer_name, phone, message,
       urgency_score, service_type, status, created_at

actions: action_id, contractor_id, action_type, description,
         revenue_impact, agent_name, confidence_score, success, created_at

workflow_performance: date, contractor_id, workflow_id, leads_created,
                      sms_sent, errors, success_rate, avg_response_time
```

RLS policy on every table: `SELECT * FROM [table] WHERE contractor_id = auth.uid()`

---

## Build Order

### Phase 1 (NOW — get to demo-ready)
1. Bind credentials to both existing workflows (`jlWxZ52pFxelh7aU`, `EjrtbF205kPsOCxO`)
2. Run end-to-end test — SMS in → lead in Supabase → SMS reply out
3. Build per-client dashboard: `/login`, `/dashboard`, `/admin/onboard`
4. Sign first client

### Phase 2 (After First Client — Complete Concierge)
Build remaining Concierge workflows:
1. Cancellation fill + waitlist manager (highest immediate ROI)
2. Invoice chaser
3. Review request
4. Inbound SMS handler (routes all customer replies)
5. Daily summary (7 AM to contractor)

### Phase 3 (With First Client — The Closer)
Build proposal generation from Jobber diagnostic webhook. Requires client to have maintained pricebook in Jobber.

### Phase 4 (Month 2-3 — The Dispatcher + Strategist)
Build after 30+ days of Concierge data. Requires clean Jobber customer history.

### Phase 5 (Month 4+ — Cross-Client Intelligence)
When 3+ clients are active, Strategist gains cross-client pattern recognition:
- Seasonal conversion patterns across all clients
- Neighborhood equipment profiles
- Best-performing SMS copy library
- Quarterly business reviews with cross-client benchmarks

---

## Key Constraints

- Never give contractors access to infrastructure — dashboard only, read-only
- Every action logged to Supabase `actions` table — audit trail = proof of ROI
- Auto-execute only when Claude confidence ≥ 0.85
- Owner is notified of outputs, never required to manage inputs
- Use contractor's existing phone number (ported) — never provision new numbers
- Jobber is MVP — do not wait for ServiceTitan API before building
- FastAPI is Phase 3 — do not build now
