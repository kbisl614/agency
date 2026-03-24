# Fieldline AI — Product Roadmap
**Last Updated:** 2026-03-19

The roadmap is driven by the retained partnership model. Every phase is triggered by real client milestones, not a fixed schedule.

---

## The Product — Digital Front Office

Four agents. Deployed based on what the discovery call surfaces. Every client starts with the Concierge.

| Agent | What it kills | When deployed |
|---|---|---|
| **The Concierge** | Missed leads, slow response | Always first |
| **The Closer** | Late-night quoting, low close rate | After Concierge is stable |
| **The Dispatcher** | Empty gaps, cancellation waste | After Concierge has 30+ days of data |
| **The Strategist** | Dead customer list, no visibility | After Concierge has 30+ days of data |

---

## Phase 1 — Get to Demo-Ready (NOW)

**Goal:** One working Concierge that can be shown live on a call.

1. Bind credentials to both existing n8n workflows
   - `jlWxZ52pFxelh7aU` → Supabase + SignalWire
   - `EjrtbF205kPsOCxO` → Supabase + SignalWire
2. Run end-to-end test: SMS in → lead in Supabase → SMS reply out in < 60 seconds
3. Build per-client dashboard (`/login`, `/dashboard`, `/admin/onboard`)
4. Add Telegram error alerting to all workflows
5. Sign first client

**Success metric:** Live demo works. First client signed.

---

## Phase 2 — Complete the Concierge (After First Client Signs)

**Goal:** Full Concierge running 24/7 for the first client.

Build remaining Concierge workflows in ROI order:

| Priority | Workflow | Why |
|---|---|---|
| 1 | Cancellation fill + waitlist manager | Highest direct revenue, fills empty slots |
| 2 | Invoice chaser | Recovers money already earned |
| 3 | Review request | Compounds — more reviews = more organic leads |
| 4 | Inbound SMS handler | Routes all customer replies correctly |
| 5 | Daily summary (7 AM) | Owner sees value every morning |
| 6 | Review monitor | Flags low ratings for damage control |

**Also in Phase 2:**
- Port contractor's existing business number into SignalWire
- Connect Jobber webhooks (`job_completed`, `job_canceled`)
- Set up n8n Telegram error alerts

**Success metric:** 5 recovered leads logged in Supabase before day 30.

---

## Phase 3 — The Closer (Month 2, With First Client)

**Goal:** Build proposal generation from Jobber diagnostic workflow.

**Requirements before building:**
- Concierge stable and delivering guarantee
- Contractor has maintained pricebook in Jobber
- Jobber API credentials confirmed working

**What gets built:**
- `job_diagnostic` webhook listener in n8n
- Proposal generator (Claude + Jobber pricebook lookup)
- Owner approval flow (SMS: "Reply YES to send")
- Jobber estimate auto-send on approval

**Approval thresholds:**
- Under $500 → auto-sends to customer
- $500–$2,000 → owner 1-tap SMS approval
- $2,000+ → owner must approve first

**Success metric:** Proposals generated in < 60 seconds from tech diagnostic. Close rate measured before/after.

---

## Phase 4 — The Dispatcher + Strategist (Month 2-3, With First Client)

**Goal:** Fill schedule gaps and mine old customer list.

**Requirements:**
- 30+ days of Concierge data
- Clean Jobber customer history

**The Dispatcher builds:**
- Cancellation → waitlist fill (may already exist from Phase 2)
- ETA monitor (15-min check during business hours)
- Dispatch router (tech assignment by location/skill)

**The Strategist builds:**
- Customer reactivation (12-month dormant list)
- Monthly ROI report generation
- Block special campaign scheduler (fills slow weeks)

**What the Dispatcher does NOT do:** Full real-time schedule re-optimization. HVAC job durations are too unpredictable. The Dispatcher fills gaps and sends ETAs — humans decide on complex reroutes.

**Success metric:** Cancellation fill rate > 60%. Monthly ROI report delivered and accurate.

---

## Phase 5 — Cross-Client Intelligence (Month 4+, 3+ Clients)

**Goal:** The data moat. Only works at scale. Gets stronger every client added.

**Unlocks when 3+ clients are active:**
- Seasonal conversion patterns across all clients (when do HVAC leads convert best by region?)
- Neighborhood equipment profiler (predict demand by area and equipment age)
- Best-performing SMS copy library (what messages convert across all clients?)
- Quarterly business review agent (auto-generates QBR with cross-client benchmarks)

**Why this matters:** A single contractor's data tells you their story. Data from 10 contractors in 4 states tells you the industry's story. That's the moat no freelancer or SaaS tool can replicate.

---

## Dashboard Roadmap

| Phase | Dashboard Features |
|---|---|
| Phase 1 | Login, leads feed, actions feed, admin/onboard form |
| Phase 2 | Agent status panel (Concierge active/inactive), daily summary display, guarantee tracker |
| Phase 3 | Proposal activity feed, close rate metric |
| Phase 4 | Dispatcher board, Strategist campaign tracker, monthly ROI report view |
| Phase 5 | Cross-client intelligence view (admin only) |

---

## What Never Changes

- One workflow per function — handles ALL contractors via Supabase lookup
- Every action logged with contractor_id — proof of ROI always exists
- Owner receives outputs, never manages inputs
- Auto-execute only when Claude confidence ≥ 0.85
- Contractor's existing phone number used — no new numbers provisioned
- HVAC only
