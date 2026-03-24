# Fieldline AI — Master Reference
**Single canonical source of truth. All other docs reference this one.**
**Last Updated:** 2026-03-19

---

## What We Are

**Productized agency — not SaaS.** We are an AI implementation partner for HVAC contractors. We get on a discovery call, learn exactly where their business is leaking money or time, build custom AI workflows and agents that fix those specific bottlenecks, and give them a personal dashboard to watch the results. We manage and operate everything. They never touch infrastructure.

Not a software subscription. Not a DIY tool. Not a one-size-fits-all package. A retained AI operations partner that builds exactly what each contractor needs.

**Niche:** HVAC contractors only. Always.

---

## Business Model

- **Discovery call first** — understand bottlenecks before proposing anything
- **Custom build** — workflows and agents scoped to what was found on the call
- **Per-client dashboard** — each client gets their own dashboard showing their specific agents and results
- **Monthly retainer** — we manage, monitor, and iterate. Contractors see outputs, never infrastructure.
- **Setup fee = commitment signal** — no free trials
- **HVAC contractors only** — Jobber primary CRM, ServiceTitan secondary (API approval pending)
- **No CRM = we build one** — contractors without a CRM get a custom Supabase + Next.js CRM as part of the engagement
- One central VPS hosts all NemoClaw sandboxes (one per contractor)

---

## The Product — Digital Front Office

Four named agents. Each solves a specific villain in the contractor's business. Deployed based on what the discovery call surfaces — not every contractor gets all four on day one.

### The Concierge (24/7 Lead & Reputation)
**Villain it kills:** Missed leads, slow response, ignored reviews
- Responds to every inbound lead in under 60 seconds, 24/7
- Handles after-hours SMS, missed calls, Facebook leads, LSA leads, web forms
- Urgency triage: "No heat in January" gets treated differently than "want an estimate"
- Sends review requests 30 min after job_completed
- Routes all customer replies (confirms, cancellations, questions, complaints)
- **This is always the first agent deployed.** Delivers the guarantee.

### The Closer (Proposals & Sales Velocity)
**Villain it kills:** Late-night quoting, inconsistent pricing, slow close rate
- Triggered by tech marking a diagnostic in Jobber
- Pulls contractor's pricebook, calculates margin, drafts proposal automatically
- Under $500: auto-sends to customer via Jobber estimate
- $500–$2,000: SMS owner for one-tap approval, then sends
- $2,000+: owner must approve before customer sees it
- Proposal lands in tech's hands in under 60 seconds — they present it on-site
- **Requires Jobber pricebook to be maintained by contractor**

### The Dispatcher (Schedule & Field Coordination)
**Villain it kills:** Empty schedule gaps, wasted windshield time, last-minute chaos
- Monitors job status changes via Jobber webhooks
- Fills cancelled slots from waitlist automatically
- Sends customers "On My Way" ETA updates
- Assigns techs based on location, skill, and availability
- **Build after Concierge is stable and generating data**

### The Strategist (Retention & Revenue Mining)
**Villain it kills:** Dead customer list, slow weeks, no visibility into business performance
- Scans database for customers who haven't had service in 12+ months
- Organizes block specials to fill slow weeks with high-margin maintenance
- Sends contractor ROI report monthly (leads recovered, proposals sent, revenue impact)
- Tracks CLV trends and surfaces upsell opportunities
- **Requires 30+ days of Concierge data to be effective**

---

## The Process

```
Discovery call (30-45 min)
    → Learn their CRM, team size, biggest bottlenecks
    → Identify which agents will have the highest immediate ROI
    ↓
Custom proposal sent within 24 hours
    → Scoped to their specific situation
    → Setup fee + monthly retainer quoted per engagement
    → Guarantee stated explicitly
    ↓
Setup fee paid → 48-hour onboarding begins
    → Port their existing business number into SignalWire
    → Supabase config row created
    → Jobber webhooks connected
    → Agents built and configured
    → End-to-end test passes
    ↓
Client goes live
    → Personal dashboard provisioned
    → 15-min go-live call
    → They receive outputs (morning summary, alerts) — never log in unless they want to
    ↓
Monthly retainer
    → We monitor, fix issues, iterate on what's working
    → Monthly ROI report from the Strategist
    → Discovery for next agent when they're ready to expand
```

---

## Pricing Model

**No fixed tiers. Custom-quoted per engagement based on discovery call.**

- Engagements start at **$1,500/month** (Concierge only)
- Setup fee starts at **$500** — scales with scope of build
- 3-month minimum recommended once agents are deployed (not just Concierge)
- No free trial — setup fee is the commitment signal
- **Guarantee:** 5 recovered leads in 30 days or second month free

**What "recovered lead" means (precise):**
A lead that was (1) captured by the system, (2) received an automated response within 60 seconds, and (3) resulted in a booked appointment or a followed-up conversation — logged automatically in the Supabase `actions` table. No arguing. The data is always there.

**No CRM clients:** Full custom build (Supabase + Next.js CRM + agents). Higher setup fee, higher retainer. By agreement.

---

## Tech Stack

```
WORKFLOW LAYER — Deterministic, event-driven:
  n8n Cloud (krn8n9394.app.n8n.cloud) — one workflow per function, all clients
  Claude Sonnet 4.6 — called inside n8n for decisions ($3/M in, $15/M out)
  SignalWire — SMS ($0.0079/message) — space: hv-agency.signalwire.com
  Supabase — single source of truth (cdofgroinizevjxyzvnn.supabase.co)

AGENT LAYER — Autonomous, goal-driven:
  NemoClaw — sandbox manager (central VPS, one OpenShell sandbox per contractor)
  OpenClaw — agent runtime inside each sandbox (WhatsApp-native, MIT licensed)
  Nemotron 3 Super 120B — orchestration layer (FREE via OpenRouter)
  Claude Sonnet 4.6 — reasoning layer ($3/M in, $15/M out)
  Claude Batch API — non-real-time calls (50% off: $1.50/M in, $7.50/M out)

Frontend:
  Next.js / Vercel — per-client dashboard + marketing site

Future (Phase 3, NOT NOW):
  FastAPI — complex orchestration above n8n
```

---

## Phone Number Strategy

**Use the contractor's existing business number — do not provision new numbers.**

- Port their existing number into SignalWire
- Customers text/call the number they already know — nothing changes for them
- 10DLC registration follows the number (likely already registered if they're an active business)
- If they cancel, we port the number back within 48 hours — stated in contract
- Contractor retains full ownership of their number at all times

---

## n8n Multi-Tenant Architecture

**One workflow per function. One workflow handles ALL contractors. Never duplicate per client.**

```
SMS received → extract TO number (contractor's ported number in SignalWire)
→ SELECT * FROM clients WHERE signalwire_number = '[TO]'
→ Returns: contractor_id, business_hours, crm_type, business_name, agents_active
→ Workflow executes using that config
→ All actions logged with contractor_id
```

Jobber webhooks use URL param:
`https://krn8n9394.app.n8n.cloud/webhook/[workflow-id]?contractor={contractor_id}`

**Total n8n workflows ever: ~24 regardless of client count.**

---

## Supabase Schema

```sql
clients: contractor_id, business_name, owner_email, signalwire_number,
         owner_phone, crm_type, business_hours (JSON), jobber_api_key,
         review_link, agents_active (JSON), is_active, created_at

users: id (Supabase Auth UUID), contractor_id, email, role (admin|client), created_at

techs: id, contractor_id, name, phone, skill_set, is_active

leads: lead_id, contractor_id, customer_name, phone, message,
       urgency_score, service_type, status, created_at

actions: action_id, contractor_id, action_type, description,
         revenue_impact, agent_name, confidence_score, success, created_at

workflow_performance: date, contractor_id, workflow_id, leads_created,
                      sms_sent, errors, success_rate, avg_response_time
```

**RLS policy on every table:** `SELECT * FROM [table] WHERE contractor_id = auth.uid()`

Admin (Karsyn) bypasses RLS — configured at role level.

---

## Dashboard Architecture

- **Per-client dashboard** — each contractor gets their own dashboard view showing their specific agents and metrics
- Auth: Supabase Auth (email + password)
- Roles: `admin` (Karsyn — sees all clients) / `client` (sees own data via RLS)
- Client created via `/admin/onboard` form (~30 min to provision new client)
- Dashboard shows: agents active, leads recovered, actions taken, revenue impact, daily summary feed

---

## AI Cost Model

| Model | Purpose | Cost | Provider |
|---|---|---|---|
| Nemotron 3 Super 120B | Orchestration, tool routing, agent loops | FREE | OpenRouter |
| Claude Sonnet 4.6 | Real-time reasoning, customer responses | $3/M in, $15/M out | Anthropic |
| Claude Batch API | Reports, summaries, scoring (non-urgent) | $1.50/M in, $7.50/M out | Anthropic |
| Nemotron (fallback) | Fires when Claude hits monthly budget cap | ~$0.20/M blended | DeepInfra |

**Cost protection:**
1. Non-real-time calls → Batch API (50% savings)
2. Claude spend hits $150/month per contractor → overflow to Nemotron fallback

---

## Known Workflow IDs (n8n)

| Workflow | ID | Status |
|---|---|---|
| after_hours_lead_capture | `jlWxZ52pFxelh7aU` | Built, needs credential binding |
| missed_call_recovery_sms | `EjrtbF205kPsOCxO` | Built, needs credential binding |
| New Lead Notification | `EVtjW8VElN5Bvf32` | Active (Gmail + Telegram alerts) |

---

## Known Credential IDs (n8n)

| Credential | ID |
|---|---|
| Gmail | `uWYzlK7ftArlL8zw` |
| Telegram | `OjlxZCBapUKW4KEu` |
| Supabase | `Pm10coWJeiICVYIi` |
| SignalWire | `r9gOGGtsAO3GswJR` (twilioApi type, Space: hv-agency.signalwire.com) |

---

## Key Files

| What | File |
|---|---|
| This document | `markdown/FIELDLINE_AI_MASTER.md` |
| Agent architecture | `markdown/technical/agent-ops.md` |
| n8n multi-tenant guide | `markdown/technical/N8N_MULTITENANT_GUIDE.md` |
| Onboarding playbook | `markdown/operations/ONBOARDING_PLAYBOOK.md` |
| First client playbook | `markdown/business/FIRST_CLIENT_ACQUISITION.md` |
| OpenClaw/NemoClaw spec | `markdown/technical/OPENCLAW_ARCHITECTURE.md` |
| Credential setup | `markdown/technical/CREDENTIAL_SETUP_GUIDE.md` |
| Env vars | `markdown/technical/ENV_SETUP.md` |
| Brand/design | `markdown/marketing/BRAND_ASSETS.md` |
| Cold email templates | `markdown/marketing/cold-email-templates.md` |
| Selling angles | `markdown/marketing/Selling_Angles_Updated.md` |
| Workflow session prompt | `markdown/planning/prompt-for-workflows-session.md` |
| Dashboard session prompt | `markdown/planning/prompt-for-dashboard-session.md` |
