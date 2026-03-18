# HANDOFF — Agency Strategic Changes
# READ THIS FIRST before any session touching product, pricing, architecture, or docs.
# This captures the major strategic decisions made in the session of 2026-03-17/18.
# These decisions SUPERSEDE all prior planning docs.

---

## Last Session Summary
**Date:** 2026-03-17/18
**What happened:** Full strategic overhaul of Fieldline AI — business model, tech stack, pricing, agent architecture, and n8n multi-tenant design all confirmed. No code was written. This was a pure planning/decision session. All existing docs are now stale and awaiting rewrite (trigger: "the banana ate the monkey").

---

## What Changed From Previous Sessions

### Previously Believed → Now Confirmed
| Topic | Old | New |
|---|---|---|
| Business model | Vague (SaaS-ish) | Productized agency — not SaaS |
| FastAPI | "Removed/cut" | Deferred to Phase 3 (not removed) |
| Pricing | $1,500/$2,000/$3,000, free trial | Foundation/Partner/Full Partner with setup fees, no free trial |
| Agent runtime | n8n + Claude API only | n8n (Layer 1) + OpenClaw/NemoClaw (Layer 2+) |
| OpenClaw | Unknown/misunderstood | Full autonomous agent runtime, cross-platform, WhatsApp-native, 5,700+ ClawHub skills, embeddable SDK |
| NemoClaw | Linux-only, sandbox tool | Cross-platform, enterprise OpenClaw wrapper with OpenShell isolation for multi-tenancy |
| AI model | Claude only | Nemotron (orchestration, free via OpenRouter) + Claude Sonnet 4.6 (reasoning) |
| n8n architecture | One workflow per client (duplicate) | One workflow for ALL clients — Supabase config lookup at runtime |
| Dashboard | Custom per client | One multi-tenant dashboard, Supabase RLS, client created via /admin/onboard |
| Tier 1 contents | 11 workflows incl. seasonal outreach | 10 workflows — seasonal outreach removed (moved to Tier 2) |
| Agent per workflow | Claude call inside each workflow | OpenClaw agents sit ON TOP, invoke n8n workflows as tools |

---

## Confirmed Business Model

**Productized Agency** — you build and operate everything, contractor pays one retainer.
- Not SaaS. Contractors don't configure anything.
- Custom agents built per client as part of setup fee (not pre-built speculatively)
- One central VPS hosts all NemoClaw sandboxes (one per contractor)
- Contractors interact via WhatsApp — never see the infrastructure

---

## Confirmed Pricing

| Tier | Setup Fee | Monthly | Commitment | What You Build |
|---|---|---|---|---|
| Foundation | $500 | $1,500 | Month-to-month | 10 n8n workflows (Layer 1, no agents) |
| Partner | $1,500 | $2,500 | 3-month minimum | Workflows + 2-3 custom OpenClaw agents |
| Full Partner | $2,500 | $4,500 | 3-month min, custom contract | Full stack — all layers, 4-6 agents, Layer 3 |
| Custom CRM add-on | $8,000-12,000 | Tier 3 retainer required | Separate agreement | Full Supabase + Next.js CRM built for contractor |

**Guarantee:** 5 recovered leads in 30 days or second month free.
Logged automatically in Supabase `actions` table — proof is always there.

**No free trial.** Setup fee is commitment signal. Filters tire-kickers.

---

## Confirmed Tech Stack

```
Layer 1 (deterministic, event-driven):
  n8n Cloud — one workflow per function, handles ALL clients
  Claude Sonnet 4.6 — called inside n8n for decisions
  SignalWire — SMS ($0.0079/message)
  Supabase — single source of truth, RLS per contractor

Layer 2+ (autonomous, goal-driven):
  NemoClaw — sandbox manager (central VPS, one sandbox per contractor)
  OpenClaw — agent runtime inside each sandbox
  Nemotron 3 Super 120B — orchestration layer (free via OpenRouter)
  Claude Sonnet 4.6 — reasoning layer ($3/M input, $15/M output)
  Claude Batch API — non-real-time calls (50% off: $1.50/$7.50 per M)

Infrastructure:
  Vercel — Next.js frontend
  VPS (DigitalOcean/Railway) — NemoClaw sandboxes (~$40-60/month)

Future (Phase 3, not now):
  FastAPI — complex orchestration layer above n8n
  LangGraph — multi-agent coordination at scale
```

---

## Confirmed AI Cost Model

| Model | Purpose | Cost | Provider |
|---|---|---|---|
| Nemotron 3 Super 120B | Orchestration, tool routing, agent loops | FREE | OpenRouter (budget $5/mo floor) |
| Claude Sonnet 4.6 | Real-time reasoning, customer responses | $3/M in, $15/M out | Anthropic API |
| Claude Batch API | Reports, summaries, scoring (non-urgent) | $1.50/M in, $7.50/M out | Anthropic API |
| Nemotron (fallback) | Fires when Claude hits monthly budget cap | ~$0.20/M blended | DeepInfra |

**Cost protection rules (build into agent config):**
1. Non-real-time calls → Batch API (50% savings)
2. If Claude spend hits $150/month per contractor → overflow to Nemotron

**Worst case variable cost per contractor:**
- Foundation: ~$53/month
- Partner: ~$120/month
- Full Partner: ~$219/month
- All tiers: 89%+ margin even at heavy usage

---

## Confirmed Agent Architecture

```
LAYER 1 — n8n standalone (no OpenClaw)
  Deterministic event-driven workflows
  Fire instantly, no reasoning overhead
  Same for every contractor (multi-tenant)

LAYER 2+ — OpenClaw on top, n8n as tools
  OpenClaw agent receives inbound events
  Reasons about full context + customer history
  Decides WHICH n8n workflows to invoke and when
  n8n handles execution, OpenClaw handles judgment

LAYER 3 — Multi-agent team
  Marketing agent → invokes outreach/follow-up/review workflows
  Ops agent → invokes dispatch/cancellation/ETA workflows
  Financial agent → invokes invoice/summary/reporting workflows
  Each agent has own memory domain
  Sub-agents spawn for background research
```

---

## Confirmed Tier Contents

**Foundation ($1,500/month) — 10 n8n workflows, NO agents:**
1. Emergency lead capture (inbound SMS → score → respond in 60s)
2. Inbound SMS handler (customer reply → classify → route)
3. Cancellation fill (job_canceled → fill from waitlist)
4. Dispatch router (post-qualification → assign tech → notify)
5. ETA monitor (every 15 min → customer update)
6. Invoice chaser (daily 8am → unpaid → reminder)
7. Review request (job_completed + 30min → review SMS)
8. Review monitor (new review → flag low ratings)
9. Daily summary (7am → plain English to contractor)
10. Waitlist manager (continuous → maintain/prioritize)

Note: Seasonal outreach REMOVED from Foundation — moved to Partner tier where marketing agent handles it intelligently.

**Partner ($2,500/month) — Foundation + custom workflows + 2-3 OpenClaw agents:**
- All Foundation workflows
- 5-7 custom n8n workflows (Layer 2 deterministic ones)
- Marketing agent (OpenClaw)
- Ops agent (OpenClaw)
- Seasonal outreach now handled by marketing agent (intelligent, not blanket)

**Full Partner ($4,500/month) — Full stack:**
- Everything in Partner
- All Layer 2 agents
- All Layer 3 cross-client intelligence agents
- Financial agent, full agent team
- Custom CRM dashboard visibility
- Layer 3: Seasonal patterns, neighborhood profiler, best message library, QBR, tool evaluator, stack updater

---

## Confirmed n8n Multi-Tenant Architecture

**One workflow handles ALL contractors.** Never duplicate workflows per client.

```
Webhook fires → includes TO number (contractor's SignalWire number)
→ Supabase lookup: SELECT * FROM clients WHERE signalwire_number = TO
→ Returns contractor config: id, business_hours, crm_type, tier, etc.
→ Rest of workflow executes using that config
→ All actions logged with contractor_id
```

**Jobber webhooks:** Each contractor gets unique URL:
`yourdomain.com/webhook/jobber?contractor={contractor_id}`
Same n8n workflow receives all. Reads URL param → looks up config.

**Total n8n workflows ever:** ~24 regardless of client count.

---

## Confirmed Dashboard Architecture

**One dashboard, all clients.** Never build custom dashboard per client.

- URL: `dashboard.fieldlineai.com/dashboard`
- Auth: Supabase Auth (email + password)
- Roles: `admin` (Karsyn — sees everything) / `client` (sees own data via RLS)
- Client created via `/admin/onboard` form (30 min to set up new client)
- Data captured from day 1 via contractor_id — dashboard shows history retroactively

**48-hour onboarding window:**
- Hour 1-4: Submit /admin/onboard form, create Supabase account
- Hour 4-12: Provision SignalWire number, bind Jobber webhooks, configure n8n
- Hour 12-24: Test all workflows end-to-end
- Hour 24-48: Send dashboard login, go-live call

---

## Confirmed OpenClaw/NemoClaw Understanding

**OpenClaw:**
- Full autonomous agent runtime (NOT just a CLI/coding tool)
- Cross-platform: Mac, Windows, Linux
- ClawHub: 5,700+ community skills
- Native WhatsApp/Telegram/Slack interfaces (contractors interact here)
- Embeddable via `createAgentSession()` SDK
- Persistent memory → point to Supabase instead of local files
- Self-healing: reasons through API failures, tries alternatives
- Sub-agent spawning for parallel tasks
- MIT licensed (commercial use allowed)

**NemoClaw:**
- NVIDIA's enterprise wrapper for OpenClaw
- Cross-platform
- OpenShell = isolation layer — one sandbox per contractor, prevents credential bleed
- Configurable inference: use Nemotron OR Claude OR any OpenAI-compatible endpoint
- NVIDIA Open Model License (commercial use allowed)
- Deploy centrally on VPS, contractors never see it

**Separate OpenAI account per contractor:**
If using OpenAI OAuth: create contractor@fieldlineai.com email, $200/month OpenAI account per contractor. Baked into retainer price.

---

## Supabase Schema (Confirmed)

```sql
clients: contractor_id, business_name, owner_email, signalwire_number,
         crm_type, business_hours (JSON), tier, is_active, created_at

users: id (Supabase Auth UUID), contractor_id, email, role (admin|client), created_at

leads: lead_id, contractor_id, customer_name, phone, message,
       urgency_score, service_type, status, created_at

actions: action_id, contractor_id, action_type, description,
         revenue_impact, agent_name, confidence_score, success, created_at

workflow_performance: date, contractor_id, workflow_id, leads_created,
                      sms_sent, errors, success_rate, avg_response_time
```

RLS policy: `SELECT * FROM [table] WHERE contractor_id = auth.uid()`

---

## Files Awaiting Full Rewrite

Trigger: user says **"the banana ate the monkey"**

When triggered, rewrite or delete these files based on `docs/FILE_INDEX.md`:

**DELETE (fully superseded):**
- `updated-files/agent-ops.md`
- `updated-files/PLAN_1_Updated.md`
- `updated-files/PLAN_2_Updated.md`
- `updated-files/Gaps_And_New_Implementations.md`
- `updated-files/Selling_Angles_Updated.md`
- `updated-files/PROJECT_ORGANIZATION.md`
- `updated-files/COPYWRITING_UPDATES.md`
- `updated-files/MARKET_RESEARCH_INTEGRATION.md`
- `updated-files/2026-03-14-market-research-integration.md`
- `updated-files/2026-03-14-phase1-tier1-implementation.md`
- `updated-files/2026-03-14-tier1-workflow-reference.md`

**REWRITE (stale but structurally valid):**
- `HANDOFF.md` — update with all new decisions
- `CLAUDE.md` — add OpenClaw/NemoClaw stack, update FastAPI note, new pricing
- `handoff-workflows.md` — update workflow IDs, multi-tenant architecture
- `handoff-workflows-implementing.md` — update for new architecture
- `handoff-dashboard.md` — update for multi-tenant, OpenClaw agent tracking
- `docs/PRODUCT_ROADMAP.md` — fix tier structure, add OpenClaw agents
- `docs/agent-ops.md` — add OpenClaw architecture, fix agent count, update hybrid model
- `docs/MARKET_RESEARCH_INTEGRATION.md` — update for new tier structure
- `docs/cold-email-templates.md` — update pricing in copy
- `docs/TIER1_WORKFLOW_REFERENCE.md` — update workflow IDs, multi-tenant
- `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` — update workflow IDs
- `docs/N8N_AI_PROMPT.md` / `WORKFLOW1.md` / `WORKFLOW2.md` — multi-tenant pattern
- `docs/WORKFLOW_BUILD_COMPLETE.md` — update workflow IDs
- `docs/CREDENTIAL_SETUP_GUIDE.md` — add NemoClaw VPS credentials
- `docs/ENV_SETUP.md` — add OpenClaw/NemoClaw env vars

**CREATE (don't exist yet):**
- `docs/FIELDLINE_AI_MASTER.md` — single canonical source of truth
- `docs/OPENCLAW_ARCHITECTURE.md` — OpenClaw/NemoClaw integration spec
- `docs/PRICING_AND_TIERS.md` — full pricing breakdown
- `docs/ONBOARDING_PLAYBOOK.md` — 48-hour client onboarding checklist
- `docs/N8N_MULTITENANT_GUIDE.md` — multi-tenant n8n architecture guide
- `docs/AGENT_SKILL_FILES.md` — OpenClaw skill file templates for HVAC
- `prompt-for-dashboard-session.md` — prompt for dashboard/landing page Claude worktree

---

## Open Questions (Not Yet Decided)

1. **WhatsApp provisioning** — SignalWire WhatsApp Business API per contractor. Exact provisioning flow not mapped. Option A (you provision) confirmed, details TBD.
2. **Partner/Full Partner guarantee** — "5 recovered leads" works for Foundation. What's the equivalent metric for tiers with agents?
3. **Contract terms** — beyond minimum commitment: payment terms, data ownership clause, cancellation notice period.
4. **Custom CRM on pricing page** — list as "limited availability / by application" now, or hold until built?
5. **ServiceTitan wording** — on pricing page but partner API not approved. How to word it?
6. **First client acquisition** — no sales/marketing strategy documented. Cold outreach? Referrals? LinkedIn? This is the actual blocker.
7. **OpenClaw skill file structure** — what do the HVAC domain skill files actually contain? Not yet designed.

---

## Current n8n Workflow IDs (Confirmed)

| Workflow | ID | Status |
|---|---|---|
| tier1_after_hours_lead_capture | `jlWxZ52pFxelh7aU` | Built, needs credential binding |
| tier1_missed_call_recovery_sms | `EjrtbF205kPsOCxO` | Built, needs credential binding |
| Fieldline AI New Lead Notification | `EVtjW8VElN5Bvf32` | Active, working (Gmail + Telegram) |

n8n instance: `krn8n9394.app.n8n.cloud`

---

## Existing n8n Credentials (IDs)

| Credential | ID | Status |
|---|---|---|
| Gmail | `uWYzlK7ftArlL8zw` | Active |
| Telegram | `OjlxZCBapUKW4KEu` | Active |
| Supabase | Not yet created | — |
| SignalWire | Not yet created | — |

---

## Key Context That Would Be Lost

- **FastAPI is DEFERRED not removed** — comes in Phase 3 for complex orchestration above n8n
- **Seasonal outreach removed from Foundation tier** — now lives in Partner tier under marketing agent
- **OpenClaw agents are custom-built per client as part of setup fee** — nothing is pre-built speculatively
- **NemoClaw sandboxes hosted centrally on Fieldline AI VPS** — contractors never provision or see them
- **Nemotron 3 Super is currently FREE on OpenRouter** — budget $5/month as a floor for when this ends
- **Claude Batch API saves 50% on non-real-time calls** — route reports/summaries/scoring through batch
- **$150/month Claude budget cap per contractor** — overflow routes to Nemotron to prevent margin erosion
- **docs/FILE_INDEX.md** — created this session, maps every file's status (current/stale/superseded)
- **memory files** at `~/.claude/projects/-Users-karsynregennitter-projects-agency/memory/` — fully updated this session, read at session start
- **The banana trigger** — user will say "the banana ate the monkey" to trigger full file rewrites/deletes
- **ServiceTitan partner API** — still unapproved, 4-8 week approval, cannot accurately price ST clients until approved
- **Supabase RLS** — critical for multi-tenant dashboard. Every table needs `WHERE contractor_id = auth.uid()` policy

---

## How to Continue From Here

**If picking up this session:** Read this file + `docs/FILE_INDEX.md` + memory files.

**Immediate next decisions needed (before rewriting docs):**
1. First client acquisition strategy (most important — nothing matters without clients)
2. WhatsApp provisioning details
3. Partner/Full Partner guarantee wording
4. Contract terms

**When user says "the banana ate the monkey":**
Execute full file rewrite per the files list above. Start with `docs/FIELDLINE_AI_MASTER.md` as the anchor document, then rewrite all others to reference it.
