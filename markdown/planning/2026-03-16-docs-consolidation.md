# Documentation Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all contradictions across Fieldline AI planning docs by creating one canonical master reference and deprecating every stale file that conflicts with current decisions.

**Architecture:** One new master file (`docs/FIELDLINE_AI_MASTER.md`) becomes the authoritative source of truth for product, architecture, phases, pricing, and agent roster. All stale files get a `⚠️ SUPERSEDED` banner at the top pointing to the master. Key active docs (`agent-ops.md`, `PRODUCT_ROADMAP.md`, `HANDOFF.md`) get targeted updates to fix specific contradictions. No stale files are deleted — they are archived-in-place so history is preserved.

**Tech Stack:** Markdown only. No code changes. Git for versioning.

---

## Current State: What's Wrong (Summary)

| # | Contradiction | Stale Files | Source of Truth |
|---|---|---|---|
| 1 | FastAPI + Airtable + Twilio in old docs | `updated-files/agent-ops.md`, `PLAN_1_Updated.md` | n8n + Supabase + SignalWire (FastAPI deferred to Phase 3, not removed) |
| 2 | Three different Phase 1 scopes | `PRODUCT_ROADMAP.md`, `agent-ops.md` | 3 Tier 1 workflows only |
| 3 | $8,600 pitch includes Phase 2 features | `feature-tier-mapping.md`, `MARKET_RESEARCH_INTEGRATION.md` | Clarify pitch vs. delivered |
| 4 | No consistent phase numbering | All planning docs | Phase 1 / 2a / 2b / 3 |
| 5 | Two pricing models (setup fee vs. none) | `PLAN_1_Updated.md`, `PLAN_2_Updated.md` | Retainer-only, escalating |
| 6 | Stale workflow IDs in most docs | `TIER1_WORKFLOW_REFERENCE.md`, `HANDOFF.md` | New IDs from Session 7 |
| 7 | Conversational agent missing from roadmap | `PRODUCT_ROADMAP.md`, `agent-ops.md` | Phase 2a from PRODUCT_VISION_AGENT.md |
| 8 | Twilio vs SignalWire in Gaps docs | `updated-files/Gaps_And_New_Implementations.md` | SignalWire |
| 9 | NemoClaw in sales pitch, no technical plan | `PLAN_1_Updated.md`, `PLAN_2_Updated.md`, `Selling_Angles_Updated.md` | Remove until evaluated |
| 10 | Agent count wrong (26 not 27) | `agent-ops.md` header | 26 |
| 11 | Old ROI ($4,700) in PLAN_2 | `PLAN_2_Updated.md` | $8,600 |
| 12 | Supabase schema inconsistent | `updated-files/agent-ops.md` vs `docs/agent-ops.md` | Supabase from day 1 |

---

## File Map

### Files to CREATE
| Path | Purpose |
|---|---|
| `docs/FIELDLINE_AI_MASTER.md` | Single canonical source of truth — replaces all conflicting docs |

### Files to MODIFY (add SUPERSEDED banner)
| Path | Why Stale |
|---|---|
| `updated-files/agent-ops.md` | FastAPI (deferred not current) + Airtable + Twilio — wrong Phase 1-2 stack, $4,700 ROI |
| `updated-files/PLAN_1_Updated.md` | FastAPI as current (deferred to Phase 3), Airtable, Twilio, setup fee pricing, no Phase 2a/2b |
| `updated-files/PLAN_2_Updated.md` | Old ROI ($4,700), NemoClaw as active feature, setup fee model |
| `updated-files/Gaps_And_New_Implementations.md` | Twilio, Airtable schema, old phase definitions |
| `updated-files/Selling_Angles_Updated.md` | NemoClaw as live selling point, stale pricing ranges |
| `updated-files/PROJECT_ORGANIZATION.md` | References `backend/` (FastAPI) folder that doesn't exist |
| `updated-files/COPYWRITING_UPDATES.md` | Contains $4,700 ROI figure and NemoClaw references |

### Files to MODIFY (targeted fixes only)
| Path | What to Fix |
|---|---|
| `docs/agent-ops.md` | Fix agent count (27→26), add Phase 2a/2b to build order, add master doc pointer |
| `docs/PRODUCT_ROADMAP.md` | Fix Phase 1 scope (3 workflows not 11), fix phase table (no Phase 4), add Phase 2a/2b rows |
| `HANDOFF.md` | Update workflow IDs + names, fix Twilio→SignalWire instruction, fix Phase 1 revenue figure |
| `docs/TIER1_WORKFLOW_REFERENCE.md` | Update workflow IDs in deployment checklist |
| `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` | Replace old workflow ID `EjrtbF205kPsOCxO` |
| `docs/WORKFLOW_BUILD_COMPLETE.md` | Replace both old workflow IDs |

### Files to LEAVE ALONE (already correct)
| Path | Why |
|---|---|
| `docs/PRODUCT_VISION_AGENT.md` | Source of truth for Phase 2a/2b — already correct |
| `docs/market-research.md` | Research data — still accurate |
| `docs/CRITICAL_GAPS_DEPENDENCY_MAP.md` | Uses correct Supabase schema, SignalWire |
| `docs/BRAND_ASSETS.md` | Design tokens — not affected |
| `docs/CREDENTIAL_SETUP_GUIDE.md` | Credential setup — not affected |
| `handoff-workflows.md` | Already has new workflow IDs |

---

## Chunk 1: Create the Master Canonical Document

**Goal:** Write `docs/FIELDLINE_AI_MASTER.md` — the single file that wins all conflicts. Covers: what the product is, tech stack, phase definitions, agent roster, pricing, ROI story, and build order. Any contradicting file will be pointed here.

---

### Task 1: Write the Master File — Sections 1–3 (Identity, Stack, Phases)

**Files:**
- Create: `docs/FIELDLINE_AI_MASTER.md`

- [ ] **Step 1: Create the file with sections 1–3**

Write `docs/FIELDLINE_AI_MASTER.md` with the following content for sections 1 through 3:

```markdown
# Fieldline AI — Master Reference Document

> **This is the single source of truth for Fieldline AI.**
> Any other document that contradicts this file is stale. See the bottom of this file for a deprecation index.
>
> Last Updated: 2026-03-16 (Session 8 — Documentation Consolidation)

---

## 1. What This Is

A retained AI operations partnership for HVAC contractors (Vertical #1). We are NOT a SaaS product. We are a managed AI partner — we build autonomous workflows that sit on top of the contractor's existing CRM, run 24/7, and recover measurable revenue from day one.

The contractor never configures anything. They see a read-only Mission Control dashboard. We operate the backend entirely.

**Two engagement lanes (both land on a monthly retainer):**
- **Productized Verticals** — Pre-built workflow packages for specific niches. Fixed price, fast deployment. HVAC is Vertical #1.
- **Custom Implementation** — Discovery-led builds for businesses that don't fit a template. Higher ticket, feeds the productized library.

---

## 2. Tech Stack (Current — Do Not Use Anything Else)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Landing page + Mission Control dashboard |
| Workflows | n8n Cloud (`krn8n9394.app.n8n.cloud`) | Decision engine — ALL logic runs here. No FastAPI. |
| AI | Claude API — `claude-sonnet-4-6` | NLP, qualification, reasoning. Called from n8n HTTP Request nodes. |
| SMS | SignalWire (`hv-agency.signalwire.com`) | NOT Twilio. Compatible API, different base URL. |
| Database | Supabase (PostgreSQL) | Single source of truth from day 1. NOT Airtable. |
| CRM (MVP) | Jobber (full API access now) | First vertical. Use webhooks for triggers. |
| CRM (future) | ServiceTitan | Partner API approval pending (4–8 weeks). Do not block on this. |
| CRM (selective) | HouseCall Pro | Limited API. Accept selectively. |
| Frontend Deploy | Vercel | Next.js deployment |
| Payments | Stripe | Retainer billing |

> **Archived decisions:**
> - FastAPI: CUT. n8n is the decision engine. Fewer moving parts.
> - Airtable: CUT. Supabase from day 1 — no API rate limits, SQL for agent queries.
> - Twilio: CUT. SignalWire chosen (compatible API, different base URL).

---

## 3. Product Phases (Canonical Definitions)

Use this phase numbering everywhere. Do not use Layer 1/2/3 as phase labels (use them for agent tiers only).

### Phase 1 — Event-Driven Workflows (Weeks 1–4) ← CURRENT
**What it is:** Fixed-threshold, rules-based automation. No agent reasoning. Runs silently in background.
**Scope:** 3 Tier 1 workflows only:
1. After-hours lead capture (SMS response to evening leads)
2. Missed call recovery (SMS response to daytime missed calls)
3. Audit trail / ROI logging (every action logged to Supabase)

**NOT in Phase 1:** Cancellation fill, dispatch automation, inbound SMS handling, any agent reasoning.

**Contractor experience:** Passive. "It just works."
**Positioning:** "Automated SMS recovery system."
**Retainer:** $1,500/month
**Payback:** ~1.5 months

---

### Phase 2a — Conversational Agent (Month 2) ← TRUST BUILDING
**What it is:** Contractor can ask questions. Agent queries Supabase, reasons with Claude, returns transparent answers. No automatic changes.
**New capabilities:** Data Q&A, on-demand workflow triggers, pattern explanations.
**New workflows built:** Cancellation fill (triggered by agent), daily summary, invoice reminders, review requests.

**Contractor experience:** Active partnership. "I ask, it answers."
**Positioning:** "AI partner you can ask questions."
**Retainer:** $2,000/month
**Why 2a before 2b:** Contractor must understand the agent's reasoning before letting it change their business. Transparency → Trust → Optimization. Never reverse this order.

---

### Phase 2b — Auto-Optimization (Month 3+) ← TRUST EARNED
**What it is:** Agent proposes threshold adjustments based on 500+ leads of data. Contractor approves. System implements within guardrails. Auto-reverts if error rate spikes.
**Prerequisites:** 2–4 weeks of Phase 2a operation, contractor trusts system, 500+ leads in Supabase.
**Guardrails:** Threshold adjustments locked to ±0.10 range. Auto-revert on error spike.

**Contractor experience:** Guided optimization. "It got smarter."
**Retainer:** $2,500/month

---

### Phase 3 — Strategic Advisor (Month 4+) ← THE MOAT
**What it is:** Cross-client intelligence. Agent proactively surfaces strategic opportunities. Requires 3+ clients generating comparative data.
**New capabilities:** Seasonal demand prediction, pricing optimization, competitor signals, cross-client pattern analysis.
**Prerequisites:** Phase 2b stable, 3+ clients at Phase 2b level.

**Contractor experience:** Proactive advisor. "It finds money I didn't know existed."
**Retainer:** $3,000–$3,500/month

---

### Revenue Per Contractor (Cumulative)
| Phase | Monthly Retainer | Delivered Features |
|---|---|---|
| Phase 1 | $1,500 | SMS workflows + audit trail |
| Phase 2a | $2,000 | + Conversational agent + new workflows |
| Phase 2b | $2,500 | + Auto-optimization |
| Phase 3 | $3,000–$3,500 | + Strategic advisor + cross-client intel |
```

- [ ] **Step 2: Verify sections 1–3 are written correctly, then commit**

```bash
git add docs/FIELDLINE_AI_MASTER.md
git commit -m "docs: create master reference — sections 1-3 (identity, stack, phases)"
```

---

### Task 2: Write Sections 4–6 (Pricing, ROI Story, Agent Roster)

**Files:**
- Modify: `docs/FIELDLINE_AI_MASTER.md`

- [ ] **Step 1: Append sections 4–6 to the master file**

```markdown
---

## 4. Pricing (Canonical — Use This, Not the Plan Docs)

**Model:** Retainer-only. No setup fee for productized verticals.

| Engagement Type | Monthly Retainer | Notes |
|---|---|---|
| Productized vertical (HVAC Phase 1) | $1,500/month | Escalates as phases progress |
| Semi-custom (template + modifications) | $1,200–$2,000/month | |
| Full custom implementation | $1,500–$3,000/month | |

**HVAC by CRM:**
| CRM | Monthly Retainer | Notes |
|---|---|---|
| Jobber (MVP customer) | $1,500/month | Full API now, best path to demo |
| HouseCall Pro | $1,200–$1,500/month | Limited API, selective |
| ServiceTitan | $2,000–$2,500/month | Bridge via Zapier until partner API approved |
| No CRM | $3,000–$4,000/month | Bundle: onboard to Jobber + layer system |

> **Archived:** Prior documents (PLAN_1_Updated.md, PLAN_2_Updated.md) listed a $1,500 setup fee. This has been removed. Retainer-only model reduces friction at close.

---

## 5. ROI Story (Canonical)

### Phase 1 Pitch: What We Deliver vs. What We Claim

**What Phase 1 actually builds:**
| Workflow | Monthly Recovery |
|---|---|
| After-hours lead capture | $1,500 (10 leads × $150) |
| Missed call recovery | $3,900 (13 missed calls × $300) |
| **Subtotal — Phase 1 workflows** | **$5,400/month** |

**Full pitch number ($8,600/month) — what it includes:**
| Channel | Monthly Recovery | Phase Available |
|---|---|---|
| After-hours lead capture | $1,500 | Phase 1 ✅ |
| Missed call recovery | $3,900 | Phase 1 ✅ |
| Cancellation fill | $700 | Phase 2a |
| Dispatcher labor savings | $2,500 | Phase 2a+ |
| **Total** | **$8,600/month** | Full Phase 1+2 picture |

> **How to use this in sales:** Lead with $8,600 as the system's full impact. Be clear Phase 1 starts with the top two ($5,400). Cancellation fill and dispatcher savings are "built in Month 2 once Phase 1 ROI is proven." This is the honest pitch and it still closes deals.

**Key stats (research-validated):**
- 78% of homeowners choose the first responder (ACCA)
- Average contractor response time: 47 hours vs. your 30 seconds
- 27% of calls go unanswered = $3,900/month lost (industry data)
- 88% of contractors take 5+ minutes to reply (Hatch)
- Dispatcher salary: $38,000–$55,000/year (anchor before $1,500/month)

---

## 6. Agent Roster (26 Agents, 3 Layers)

Agents are not separate services. Each agent = one n8n workflow + one Claude API call inside it.

### Layer 1 — Core MVP (Phase 1 + Phase 2a builds these)

**Emergency Ops (5 agents)**
| Agent | Trigger | ROI |
|---|---|---|
| Emergency lead capture | Inbound SMS/call (after hours) | $1,500/month |
| Missed call recovery | Missed call webhook | $3,900/month |
| Cancellation fill | `job_canceled` webhook | $700/month (Phase 2a) |
| Dispatch router | Post-qualification | Prevents no-shows |
| Inbound SMS handler | Customer reply | Multi-turn conversation routing |

**Admin Ops (6 agents)**
| Agent | Trigger | ROI |
|---|---|---|
| Invoice chaser | Daily 8 AM | +15–20% payment collection |
| Review request | `job_completed` + 30 min | Organic lead gen |
| Review monitor | New review | Damage control within 24h |
| Daily summary | 7 AM | Retention driver |
| Seasonal outreach | April + October | $500–1,000/month seasonal |
| Waitlist manager | Continuous | Feeds cancellation fill |

**ETA monitor** (1 agent, Month 3+) — zero pain signal in research, build last.

---

### Layer 2 — Differentiators (Phase 3 builds these — requires 30+ days data)

**Revenue Pipeline (3 agents)**
- Maintenance agreement converter — flags aging equipment, runs 30/60/90 day follow-up
- Repair-then-replace tracker — when repair >50% of replacement cost, proposes system replacement
- Upsell agent — post-job add-on suggestions

**Labor Multiplier (3 agents)**
- Tech performance monitor — conversion rates per tech, identifies training gaps
- Job prep briefer — sends tech a brief before arrival (history, equipment, upsell opportunities)
- Post-job debrief capture — tracks upsell success per tech

**Market Intel (3 agents)**
- Tariff price alert — equipment cost news, flags before it hits jobs
- Refrigerant compliance watcher — EPA phase-out deadlines
- Competitor signal monitor — pricing/offers in contractor's territory

---

### Layer 3 — Long Game (Phase 3 — requires 3+ clients)

**Cross-Client Intelligence (3 agents)**
- Seasonal conversion patterns
- Neighborhood equipment profiler
- Best-performing message library

**Partner Layer (3 agents)**
- Quarterly business review
- New tool evaluator
- Stack updater

**Total: 26 agents** — Layer 1: 11 (5 Emergency Ops + 6 Admin Ops) + ETA monitor listed separately as Month 3+ = 12 Layer 1 agents. Layer 2: 9. Layer 3: 6 (3 Cross-Client + 3 Partner). Grand total: 12 + 9 + 6 = **27 including ETA monitor, 26 excluding it** — ETA monitor has zero research validation and is Month 3+; for pitch purposes, use 26 active agents.
```

- [ ] **Step 2: Commit**

```bash
git add docs/FIELDLINE_AI_MASTER.md
git commit -m "docs: master reference — sections 4-6 (pricing, ROI, agent roster)"
```

---

### Task 3: Write Sections 7–9 (Architecture, Build Order, Deprecation Index)

**Files:**
- Modify: `docs/FIELDLINE_AI_MASTER.md`

- [ ] **Step 1: Append sections 7–9**

```markdown
---

## 7. Architecture

### The Hybrid Agent Model
Each agent = one n8n workflow + one Claude API call.

**Two workflow types:**
1. **Independent** (predictable trigger → predictable action, no orchestrator):
   - Cancellation fill → `job_canceled` webhook
   - Review request → `job_completed` + 30 min delay
   - Invoice chaser → daily 8 AM schedule
   - Daily summary → 7 AM schedule
   - Seasonal outreach → April 1 / October 1
   - After-hours lead capture → SignalWire inbound SMS webhook

2. **Orchestrated** (ambiguous input or multi-step chain → orchestrator first):
   - Inbound SMS handler → all customer replies
   - New lead router → all new leads
   - Dispatch router → lead capture → dispatch → customer notification chain

### Claude Decides, n8n Executes
Claude never acts directly. Every Claude call returns structured JSON:
```json
{
  "action": "send_sms",
  "urgency_score": 9,
  "service_type": "ac_repair",
  "response_text": "Hi! We got your message about your AC...",
  "confidence": 0.94
}
```
n8n reads the JSON and executes the action.

### Confidence Tiers
| Score | Action |
|---|---|
| 85%+ | Auto-execute |
| 70–84% | Auto-execute + dashboard flag (visible, not blocking) |
| Below 70% | Escalate to owner for approval before any action |

### Key Constraints
- Never build a contractor config UI — they don't touch the system
- Every action must write to Supabase `actions` table (audit trail = proof of ROI)
- Human-in-the-loop required for: maintenance contracts, quotes >$500
- All tech-facing workflows use SMS only — if a tech must open an app, the workflow is wrong
- Deduplication: never SMS same phone twice within 24 hours

---

## 8. Current Workflow Status

### Active Workflows (Phase 1)

| Workflow | n8n ID | Webhook Path | Status |
|---|---|---|---|
| Lead capture (after-hours) | `HlwHj2n1K42pVuja` | `/lead-capture-hvac` | Built, credentials bound, needs activation |
| Missed call recovery | `sRjVDF9FjgK3Gd6c` | `/call-recover-hvac` | Built, credentials bound, needs activation |
| New lead notification | `EVtjW8VElN5Bvf32` | — | Active, working (Gmail + Telegram) |

### Next Session Immediate Actions (Blockers)
1. Log into n8n (`https://krn8n9394.app.n8n.cloud`)
2. Publish + Activate `lead-capture-hvac-agency`
3. Publish + Activate `call-recover-hvac-agency`
4. Run `bash scripts/test-workflows.sh` for end-to-end verification
5. Verify Supabase `leads` and `actions` tables populated

### Supabase Schema (Canonical)
```sql
-- leads
lead_id UUID PRIMARY KEY
contractor_id UUID
phone TEXT
message_text TEXT
received_timestamp TIMESTAMPTZ
intent_keywords TEXT[]
urgency_score NUMERIC
message_quality_score NUMERIC
service_type TEXT
actual_service_type TEXT
status TEXT  -- 'new' | 'sms_sent' | 'human_review' | 'dedup_blocked'
source TEXT  -- 'after_hours_capture' | 'missed_call_recovery'
conversation_id UUID  -- for multi-turn SMS threading (Phase 2a)
thread_history JSONB  -- array of previous messages (Phase 2a)
created_at TIMESTAMPTZ DEFAULT NOW()

-- actions
action_id UUID PRIMARY KEY
contractor_id UUID
timestamp TIMESTAMPTZ
action_type TEXT  -- 'sms_sent' | 'sms_skipped' | 'dedup_blocked' | 'parse_error' | 'error'
description TEXT
agent_name TEXT
confidence_score NUMERIC
confidence_tier TEXT  -- 'auto_execute' | 'auto_with_flag' | 'escalated'
revenue_impact NUMERIC
success BOOLEAN
error_message TEXT
lead_id UUID  -- FK to leads
sms_sid TEXT

-- error_log
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id UUID
api_name TEXT  -- 'jobber' | 'signalwire' | 'supabase'
error_code TEXT
error_message TEXT
workflow_name TEXT
retry_count INTEGER DEFAULT 0
status TEXT  -- 'failed' | 'retrying' | 'resolved'
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 9. Deprecation Index

The following files contain outdated information. They have been preserved for historical context but should NOT be used as reference for current builds.

| File | Why Stale | Replaced By |
|---|---|---|
| `updated-files/agent-ops.md` | FastAPI + Airtable + Twilio — wrong stack | This document (Section 2, 7) |
| `updated-files/PLAN_1_Updated.md` | FastAPI, Airtable, setup fee pricing, no Phase 2a/2b | This document |
| `updated-files/PLAN_2_Updated.md` | Old $4,700 ROI, NemoClaw as active feature, setup fees | This document (Section 5) |
| `updated-files/Gaps_And_New_Implementations.md` | Twilio, Airtable schema, old phases | `docs/CRITICAL_GAPS_DEPENDENCY_MAP.md` |
| `updated-files/Selling_Angles_Updated.md` | NemoClaw as live pitch, stale pricing | This document (Section 4) + `docs/market-research.md` |
| `updated-files/PROJECT_ORGANIZATION.md` | References `backend/` (FastAPI) folder that doesn't exist | HANDOFF.md for current project structure |
| `docs/PRODUCT_ROADMAP.md` | Phase 1 = "all 11 agents" (wrong), no Phase 2a/2b layer | This document (Sections 3, 6) |

> **Note on `updated-files/` folder:** These files were the working documents during early sessions before the architecture decisions were locked. They are preserved for session history. Do not update them — treat as read-only archive.
```

- [ ] **Step 2: Commit**

```bash
git add docs/FIELDLINE_AI_MASTER.md
git commit -m "docs: master reference — sections 7-9 (architecture, workflows, deprecation index)"
```

---

## Chunk 2: Add SUPERSEDED Banners to Stale Files

**Goal:** Every stale file in `updated-files/` gets a clear warning at the top so no one accidentally uses it. One banner, same format, applied consistently.

The banner format:
```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document contains outdated information (wrong tech stack, old phase definitions, or stale pricing).
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md`
> Preserved for session history only.

---
```

---

### Task 4: Add SUPERSEDED banners to all stale updated-files/

**Files:**
- Modify: `updated-files/agent-ops.md`
- Modify: `updated-files/PLAN_1_Updated.md`
- Modify: `updated-files/PLAN_2_Updated.md`
- Modify: `updated-files/Gaps_And_New_Implementations.md`
- Modify: `updated-files/Selling_Angles_Updated.md`
- Modify: `updated-files/PROJECT_ORGANIZATION.md`

- [ ] **Step 1: Add banner to `updated-files/agent-ops.md`**

Insert at the very top of the file (before any existing content):

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document describes the old architecture: FastAPI + Airtable + Twilio.
> The current stack is: n8n + Supabase + SignalWire (no FastAPI).
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md`
> Preserved for session history only.

---

```

- [ ] **Step 2: Add banner to `updated-files/PLAN_1_Updated.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document references FastAPI, Airtable, Twilio, setup fees, and missing Phase 2a/2b.
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md`
> Preserved for session history only.

---

```

- [ ] **Step 3: Add banner to `updated-files/PLAN_2_Updated.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> ROI figure is $4,700 (pre-market research). Current ROI is $8,600. NemoClaw referenced as active — it is not evaluated.
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md` (Section 5 for ROI)
> Preserved for session history only.

---

```

- [ ] **Step 4: Add banner to `updated-files/Gaps_And_New_Implementations.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document uses Twilio (not SignalWire) and Airtable schema (not Supabase).
> **Current reference:** `docs/CRITICAL_GAPS_DEPENDENCY_MAP.md`
> Preserved for session history only.

---

```

- [ ] **Step 5: Add banner to `updated-files/Selling_Angles_Updated.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> NemoClaw is referenced as a current selling point — it has not been evaluated and should not be pitched.
> Pricing ranges are stale. See current pricing in `docs/FIELDLINE_AI_MASTER.md` (Section 4).
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md` + `docs/market-research.md`
> Preserved for session history only.

---

```

- [ ] **Step 6: Add banner to `updated-files/PROJECT_ORGANIZATION.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document references a `backend/` (FastAPI) directory that does not exist in the current project.
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md` for project structure
> Preserved for session history only.

---

```

- [ ] **Step 7: Add banner to `updated-files/COPYWRITING_UPDATES.md`**

Insert at the very top:

```markdown
> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> Contains $4,700 ROI figure (pre-market research, now $8,600) and NemoClaw references (not yet evaluated).
> **Current reference:** `docs/FIELDLINE_AI_MASTER.md` (Section 5 for ROI, Section 4 for pricing)
> Preserved for session history only.

---

```

- [ ] **Step 8: Commit all banners**

```bash
git add updated-files/agent-ops.md updated-files/PLAN_1_Updated.md updated-files/PLAN_2_Updated.md updated-files/Gaps_And_New_Implementations.md updated-files/Selling_Angles_Updated.md updated-files/PROJECT_ORGANIZATION.md updated-files/COPYWRITING_UPDATES.md
git commit -m "docs: add SUPERSEDED banners to all stale updated-files/ documents"
```

---

## Chunk 3: Targeted Fixes to Active Docs

**Goal:** Fix specific known errors in docs that are still actively referenced. Do not rewrite these files — surgical changes only.

---

### Task 5: Fix `docs/agent-ops.md`

**Files:**
- Modify: `docs/agent-ops.md`

- [ ] **Step 1: Fix model name (line ~8)**

Find:
```
- **AI:** Claude API — claude-sonnet-4-6 (NLP, qualification, response generation)
```
No change needed — model name is correct. Skip if already `claude-sonnet-4-6`.

- [ ] **Step 2: Fix agent count in the Complete Agent Roster header**

Find: `## Complete Agent Roster (All 27 agents)`
Replace with: `## Complete Agent Roster (All 26 agents)`

- [ ] **Step 3: Add Phase 2a/2b reference to the Build Order section**

After the current Phase 2 block, before Phase 3, add:

```markdown
### Phase 2a (MONTH 2 — conversational agent)
- Build Claude API conversational layer (contractor asks questions, agent answers with reasoning)
- Dashboard form for Q&A interface
- Supabase query patterns for agent data access
- On-demand workflow triggers from conversational interface
- **See:** `docs/PRODUCT_VISION_AGENT.md` for full Phase 2a spec

### Phase 2b (MONTH 3 — auto-optimization)
- Build historical analysis layer (query 4+ weeks of Leads + Actions data)
- Pattern detection (Claude analyzes thresholds, conversion rates)
- Proposal system with approval webhooks (contractor approves/rejects via dashboard)
- Guardrail enforcement (threshold bounds ±0.10, auto-revert on error spike)
- **Prerequisite:** 500+ leads in Supabase, 2–4 weeks of contractor trust from Phase 2a
```

- [ ] **Step 4: Verify workflow IDs**

`docs/agent-ops.md` does NOT contain old workflow IDs — confirm by searching:
```bash
grep -n "jlWxZ52pFxelh7aU\|EjrtbF205kPsOCxO" docs/agent-ops.md
```
Expected: zero results. If any hits appear, replace with new IDs (`HlwHj2n1K42pVuja`, `sRjVDF9FjgK3Gd6c`).

- [ ] **Step 5: Add deprecation pointer at the bottom of docs/agent-ops.md**

Append to end of file:
```markdown

---

> **Note:** For complete canonical product reference including pricing, phase definitions, and ROI story, see `docs/FIELDLINE_AI_MASTER.md`.
```

- [ ] **Step 6: Commit**

```bash
git add docs/agent-ops.md
git commit -m "docs: fix agent count, add Phase 2a/2b to build order in agent-ops.md"
```

---

### Task 6: Fix `docs/PRODUCT_ROADMAP.md`

**Files:**
- Modify: `docs/PRODUCT_ROADMAP.md`

- [ ] **Step 1: Fix Phase 1 heading — it currently says "ALL 11 AGENTS"**

Find: `## LAYER 1 — CORE MVP (WEEKS 1-4, ALL 11 AGENTS)`
Replace with: `## LAYER 1 — CORE MVP (WEEKS 1-4, TIER 1 WORKFLOWS ONLY)`

- [ ] **Step 2: Fix Phase 1 description**

Find: `**Goal:** Full autonomous operations. Client never configures anything. System runs 24/7, recovers measurable revenue from day one.`

Replace with:
```markdown
**Goal:** Prove the model works with 3 Tier 1 workflows. After-hours lead capture + missed call recovery + audit trail. Full Layer 1 (all 11 agents) is built in Phase 2 after first client signs.
```

- [ ] **Step 3: Fix the Phase Definitions table**

Find the Phase Definitions table and update it to match canonical numbering:

```markdown
| Phase | Timeline | Goal | Scope | Client experience |
|-------|----------|------|-------|----------------------|
| **Phase 1** | Weeks 1-4 | 3 Tier 1 workflows demo-ready | After-hours capture + missed call + audit trail | "This actually works 24/7?" |
| **Phase 2a** | Month 2 (after 1st client) | Conversational agent | + All 11 Layer 1 agents + Q&A interface | "I can ask it questions?" |
| **Phase 2b** | Month 3 | Auto-optimization | + Threshold tuning with approval loops | "It got smarter on its own?" |
| **Phase 3** | Month 4+ | Strategic advisor + revenue multiplier | Layer 2 (9 agents) + Layer 3 (6 agents, needs 3+ clients) | "You found revenue we didn't know existed" |
```

> **Note:** There are only 4 phases: 1, 2a, 2b, 3. Do NOT add a Phase 4 row. The old PRODUCT_ROADMAP.md used Phases 1/2/3/4 with a different meaning — that numbering is superseded.

- [ ] **Step 4: Add pointer to FIELDLINE_AI_MASTER.md at top**

Insert after the document title:
```markdown
> For complete canonical reference, see `docs/FIELDLINE_AI_MASTER.md`. This file covers agent tiers and build sequence.
```

- [ ] **Step 5: Commit**

```bash
git add docs/PRODUCT_ROADMAP.md
git commit -m "docs: fix Phase 1 scope (3 workflows not 11), add Phase 2a/2b to roadmap"
```

---

### Task 7: Fix `HANDOFF.md` — Workflow IDs, Names, Twilio reference, and Phase 1 revenue figure

**Files:**
- Modify: `HANDOFF.md`

- [ ] **Step 1: Replace old workflow IDs**

Find all instances of `jlWxZ52pFxelh7aU` → Replace with `HlwHj2n1K42pVuja`
Find all instances of `EjrtbF205kPsOCxO` → Replace with `sRjVDF9FjgK3Gd6c`

- [ ] **Step 2: Replace old workflow names**

Find: `tier1_after_hours_lead_capture` → Replace with `lead-capture-hvac-agency`
Find: `tier1_missed_call_recovery_sms` → Replace with `call-recover-hvac-agency`

- [ ] **Step 3: Fix the Twilio instruction in "Exact Next Steps"**

Find this section (under "Add credentials to n8n Cloud"):
```
- [ ] Credentials → New → Twilio (for SignalWire)
```
Replace with:
```
- [ ] Credentials → New → Twilio (select this node type — it's compatible with SignalWire)
```
And verify the sub-items already say SignalWire values (Account SID = `SIGNALWIRE_PROJECT_ID`, Auth Token = `SIGNALWIRE_API_TOKEN`). Add a note if they don't:
```
     Note: Use SignalWire credentials here, not Twilio. The node type is Twilio-compatible but points to hv-agency.signalwire.com
```

- [ ] **Step 4: Fix Phase 1 revenue figure**

Find any instance of Phase 1 showing `$8,600/month` as what Phase 1 delivers.
Replace the description to match the canonical ROI story:

> Phase 1 delivers $5,400/month directly ($1,500 after-hours + $3,900 missed call). Full $8,600/month is the complete system pitch (includes Phase 2a cancellation fill + dispatcher savings). Always present $8,600 as the full-system number, not the Phase 1-only number.

The specific line to find and fix is under the Phase 1 section of Product Strategy Summary:
```
- Revenue per contractor: $8,600/month
```
Replace with:
```
- Revenue per contractor (Phase 1 workflows): $5,400/month | Full system pitch: $8,600/month
```

- [ ] **Step 5: Verify credential IDs are unchanged**

Confirm these still appear correctly:
- Gmail: `uWYzlK7ftArlL8zw`
- Telegram: `OjlxZCBapUKW4KEu`

- [ ] **Step 6: Commit**

```bash
git add HANDOFF.md
git commit -m "docs: fix workflow IDs, names, Twilio instruction, Phase 1 revenue figure in HANDOFF.md"
```

---

### Task 8: Fix `docs/TIER1_WORKFLOW_REFERENCE.md` workflow IDs

**Files:**
- Modify: `docs/TIER1_WORKFLOW_REFERENCE.md`

- [ ] **Step 1: Find and replace old workflow IDs**

Find `jlWxZ52pFxelh7aU` → Replace with `HlwHj2n1K42pVuja`
Find `EjrtbF205kPsOCxO` → Replace with `sRjVDF9FjgK3Gd6c`

- [ ] **Step 2: Update workflow names in deployment checklist**

Find references to old workflow name patterns → update to:
- Workflow 1: `lead-capture-hvac-agency` (ID: `HlwHj2n1K42pVuja`)
- Workflow 2: `call-recover-hvac-agency` (ID: `sRjVDF9FjgK3Gd6c`)

- [ ] **Step 3: Commit**

```bash
git add docs/TIER1_WORKFLOW_REFERENCE.md
git commit -m "docs: update workflow IDs in TIER1_WORKFLOW_REFERENCE.md"
```

---

### Task 8b: Fix old workflow IDs in `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` and `docs/WORKFLOW_BUILD_COMPLETE.md`

**Files:**
- Modify: `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md`
- Modify: `docs/WORKFLOW_BUILD_COMPLETE.md`

- [ ] **Step 1: Update both files**

In both files:
Find `jlWxZ52pFxelh7aU` → Replace with `HlwHj2n1K42pVuja`
Find `EjrtbF205kPsOCxO` → Replace with `sRjVDF9FjgK3Gd6c`
Find `tier1_after_hours_lead_capture` → Replace with `lead-capture-hvac-agency`
Find `tier1_missed_call_recovery_sms` → Replace with `call-recover-hvac-agency`

- [ ] **Step 2: Commit**

```bash
git add docs/WORKFLOWS_WITH_CRITICAL_GAPS.md docs/WORKFLOW_BUILD_COMPLETE.md
git commit -m "docs: update stale workflow IDs in WORKFLOWS_WITH_CRITICAL_GAPS + WORKFLOW_BUILD_COMPLETE"
```

---

## Chunk 4: Final Verification

**Goal:** Confirm no stale references remain in active docs, and the master document is internally consistent.

---

### Task 9: Search for remaining stale references

**Files:**
- Read only — no edits

- [ ] **Step 1: Search for remaining FastAPI references in non-deprecated docs**

```bash
grep -r "FastAPI" --include="*.md" \
  --exclude-dir="updated-files" \
  --exclude-dir="node_modules" \
  /Users/karsynregennitter/projects/agency
```
Expected: Zero results (or only in files that already have SUPERSEDED banners).

- [ ] **Step 2: Search for remaining Twilio references**

```bash
grep -r "Twilio\|twilio" --include="*.md" \
  --exclude-dir="node_modules" \
  /Users/karsynregennitter/projects/agency | \
  grep -v "updated-files\|SUPERSEDED\|SignalWire (not Twilio)\|Twilio node\|twilio node\|Twilio-compatible\|twilio-compatible"
```

**Disposition guide — how to handle each type of hit:**

| Hit pattern | Action |
|---|---|
| `"Twilio webhook"` in `docs/PRODUCT_VISION_AGENT.md` | Fix → change to `"SignalWire webhook"` |
| `"Twilio node"` / `"Twilio (SignalWire)"` in n8n prompt docs | Leave alone — n8n uses the Twilio node type for SignalWire. This is technically correct. |
| `"Twilio/SignalWire"` compound references | Leave alone — these acknowledge the compatibility |
| Any bare `"Twilio"` in active docs outside the above | Fix → replace with `"SignalWire"` |

- [ ] **Step 3: Search for remaining Airtable references**

```bash
grep -r "Airtable\|airtable" --include="*.md" \
  --exclude-dir="updated-files" \
  --exclude-dir="node_modules" \
  /Users/karsynregennitter/projects/agency
```
Expected: Zero results outside deprecated files.

- [ ] **Step 4: Search for old workflow IDs**

```bash
grep -r "jlWxZ52pFxelh7aU\|EjrtbF205kPsOCxO" --include="*.md" \
  --exclude-dir="node_modules" \
  /Users/karsynregennitter/projects/agency
```
Expected: Zero results.

- [ ] **Step 5: Search for "$4,700" outside deprecated files**

```bash
grep -r "4,700\|4700" --include="*.md" \
  --exclude-dir="updated-files" \
  --exclude-dir="node_modules" \
  /Users/karsynregennitter/projects/agency
```
Expected: Zero results in active docs.

- [ ] **Step 6: Fix any remaining hits found in steps 1–5**

For each hit outside deprecated files: make the targeted fix, then commit:
```bash
git add <file>
git commit -m "docs: fix stale reference — <describe what was fixed>"
```

---

### Task 10: Update memory files to point to master doc

**Files:**
- Modify: `/Users/karsynregennitter/.claude/projects/-Users-karsynregennitter-projects-agency/memory/reference_project_context.md`
- Modify: `/Users/karsynregennitter/.claude/projects/-Users-karsynregennitter-projects-agency/memory/MEMORY.md`

- [ ] **Step 1: Update reference_project_context.md**

Add a line to the reference_project_context.md memory file noting the master doc:
```
**Master Reference:** `docs/FIELDLINE_AI_MASTER.md` — single source of truth for stack, phases, pricing, ROI. Supersedes all updated-files/ docs.
```

- [ ] **Step 2: Update MEMORY.md index**

The `reference_project_context.md` entry already exists in `MEMORY.md`. Update it in-place (do not add a duplicate):

Find:
```
- [reference_project_context.md](reference_project_context.md) — Fieldline AI: HVAC AI ops, tech stack, n8n workflow IDs, credential IDs, current phase
```
Replace with:
```
- [reference_project_context.md](reference_project_context.md) — Fieldline AI: tech stack, workflow IDs (updated Session 7), current phase, master doc at docs/FIELDLINE_AI_MASTER.md
```

- [ ] **Step 3: Final commit**

```bash
git add docs/FIELDLINE_AI_MASTER.md
git commit -m "docs: complete documentation consolidation — master reference created, stale files deprecated"
```

---

## Success Criteria

When this plan is complete, the following must be true:

- [ ] `docs/FIELDLINE_AI_MASTER.md` exists and covers: identity, stack, phases, pricing, ROI, agent roster, architecture, current workflows, deprecation index
- [ ] All 6 stale `updated-files/` docs have SUPERSEDED banners at the top
- [ ] `grep -r "FastAPI" --exclude-dir=updated-files --exclude-dir=node_modules` returns zero results
- [ ] `grep -r "Airtable" --exclude-dir=updated-files --exclude-dir=node_modules` returns zero results
- [ ] `grep -r "jlWxZ52pFxelh7aU\|EjrtbF205kPsOCxO"` returns zero results
- [ ] `docs/PRODUCT_ROADMAP.md` no longer says "ALL 11 AGENTS" for Phase 1
- [ ] `docs/agent-ops.md` has Phase 2a/2b in the build order
- [ ] `HANDOFF.md` has new workflow IDs
- [ ] Phase numbering (1 / 2a / 2b / 3) is consistent across all active docs

---

*Plan written: 2026-03-16 | Session 8 — Documentation Consolidation*
