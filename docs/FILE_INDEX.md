# Fieldline AI — File Index & Status
**Last Updated:** 2026-03-18
**Purpose:** Complete map of every planning/doc file, its current status, and what to do with it.

> ⚠️ Many files below are STALE — they reflect old decisions (Twilio, old pricing, no OpenClaw).
> Awaiting full rewrite. Do not use STALE files as source of truth.
> Current source of truth: memory files + this session's decisions.

---

## Status Legend
- ✅ CURRENT — accurate, use this
- ⚠️ STALE — old decisions baked in, needs rewrite
- 🗑️ SUPERSEDED — replaced by another file, candidate for deletion
- 🔧 PARTIAL — some sections current, some stale

---

## Session Handoffs

| File | Status | Notes |
|---|---|---|
| `HANDOFF.md` | ⚠️ STALE | Old workflow IDs, Twilio reference, old pricing, no OpenClaw |
| `CLAUDE.md` | ⚠️ STALE | Missing OpenClaw/NemoClaw stack, old FastAPI note, needs new session rules |
| `handoff-workflows.md` | ⚠️ STALE | Old workflow IDs, old architecture |
| `handoff-workflows-implementing.md` | ⚠️ STALE | Implementation phase handoff, pre-OpenClaw |
| `handoff-dashboard.md` | ⚠️ STALE | Dashboard handoff, pre-multi-tenant architecture |

---

## Product Vision & Strategy

| File | Status | Notes |
|---|---|---|
| `docs/PRODUCT_VISION_AGENT.md` | ✅ CURRENT | Phase 1→2a→2b→3 vision — mostly accurate, minor updates needed |
| `docs/PRODUCT_ROADMAP.md` | ⚠️ STALE | 27 agents listed (should be 26), old phase definitions, no OpenClaw agents, old tier structure |
| `docs/agent-ops.md` | ⚠️ STALE | Good agent roster but wrong agent count, no OpenClaw, FastAPI marked as "archived" (it's deferred not archived), old hybrid model definition |
| `updated-files/agent-ops.md` | 🗑️ SUPERSEDED | Old stack (FastAPI active, Airtable, Twilio), delete |
| `updated-files/PLAN_1_Updated.md` | 🗑️ SUPERSEDED | Old pricing (setup fee wrong), Twilio, FastAPI active, NemoClaw listed as active feature incorrectly |
| `updated-files/PLAN_2_Updated.md` | 🗑️ SUPERSEDED | Old ROI ($4,700), old pricing, NemoClaw wrong, delete |

---

## Market & Sales

| File | Status | Notes |
|---|---|---|
| `docs/market-research.md` | ✅ CURRENT | Raw research data — still accurate |
| `docs/MARKET_RESEARCH_INTEGRATION.md` | ⚠️ STALE | Feature mapping needs updating for new tier structure |
| `updated-files/MARKET_RESEARCH_INTEGRATION.md` | 🗑️ SUPERSEDED | Old version, delete |
| `updated-files/2026-03-14-market-research-integration.md` | 🗑️ SUPERSEDED | Old version, delete |
| `docs/cold-email-templates.md` | ⚠️ STALE | Old pricing in copy, no OpenClaw positioning |
| `updated-files/Selling_Angles_Updated.md` | 🗑️ SUPERSEDED | NemoClaw as live selling point (wrong), old pricing, delete |
| `updated-files/COPYWRITING_UPDATES.md` | 🗑️ SUPERSEDED | Old ROI figures ($4,700), NemoClaw wrong, delete |

---

## Architecture & Implementation Specs

| File | Status | Notes |
|---|---|---|
| `docs/TIER1_WORKFLOW_REFERENCE.md` | ⚠️ STALE | Old workflow IDs, needs updating with current IDs and multi-tenant architecture |
| `docs/superpowers/specs/2026-03-14-feature-tier-mapping.md` | ⚠️ STALE | Old tier definitions, no OpenClaw agents |
| `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` | 🔧 PARTIAL | Workflow design mostly valid, but pre-multi-tenant config lookup pattern |
| `docs/superpowers/specs/2026-03-15-dashboard-design.md` | 🔧 PARTIAL | Dashboard spec exists, needs multi-tenant + OpenClaw agent tracking sections |
| `docs/superpowers/plans/2026-03-14-phase1-implementation-detailed.md` | ⚠️ STALE | Pre-OpenClaw, old architecture |
| `docs/superpowers/plans/2026-03-14-phase1-tier1-implementation.md` | ⚠️ STALE | Old tier 1 definition (seasonal outreach still in it) |
| `docs/superpowers/plans/2026-03-14-phase1-demo.md` | ✅ CURRENT | Demo plan still valid for Foundation tier |
| `updated-files/2026-03-14-phase1-tier1-implementation.md` | 🗑️ SUPERSEDED | Delete |
| `updated-files/2026-03-14-tier1-workflow-reference.md` | 🗑️ SUPERSEDED | Delete |
| `docs/superpowers/plans/2026-03-16-docs-consolidation.md` | ⚠️ STALE | Plan written before this session's decisions — partially superseded by current session |

---

## Gap Analysis & Issues

| File | Status | Notes |
|---|---|---|
| `docs/CRITICAL_GAPS_DEPENDENCY_MAP.md` | ✅ CURRENT | Still accurate for Phase 1 gaps |
| `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` | ⚠️ STALE | Old workflow IDs |
| `updated-files/Gaps_And_New_Implementations.md` | 🗑️ SUPERSEDED | Twilio, Airtable, old stack, delete |

---

## Technical Setup

| File | Status | Notes |
|---|---|---|
| `docs/CREDENTIAL_SETUP_GUIDE.md` | 🔧 PARTIAL | Core credential setup valid, needs SignalWire clarification (not Twilio), add NemoClaw VPS credentials |
| `docs/ENV_SETUP.md` | 🔧 PARTIAL | Env vars mostly right, needs NemoClaw/OpenClaw vars added |
| `docs/supabase-setup.md` | ✅ CURRENT | Still accurate |
| `docs/JOBBER_TESTING_MOCK.md` | ✅ CURRENT | Still valid for testing |
| `docs/N8N_AI_PROMPT.md` | ⚠️ STALE | Prompts need updating for multi-tenant config lookup pattern |
| `docs/N8N_AI_PROMPT_WORKFLOW1.md` | ⚠️ STALE | Same — pre-multi-tenant |
| `docs/N8N_AI_PROMPT_WORKFLOW2.md` | ⚠️ STALE | Same |
| `docs/WORKFLOW_BUILD_COMPLETE.md` | ⚠️ STALE | Old workflow IDs |
| `docs/BRAND_ASSETS.md` | ✅ CURRENT | Design tokens unchanged |
| `updated-files/PROJECT_ORGANIZATION.md` | 🗑️ SUPERSEDED | References backend/ (FastAPI) folder that doesn't exist, delete |
| `updated-files/vertical_playbook_template.md` | ✅ CURRENT | Template for other verticals — still valid |

---

## Files To CREATE (Don't Exist Yet)

| File | Purpose |
|---|---|
| `docs/FIELDLINE_AI_MASTER.md` | Single canonical source of truth — product, stack, pricing, tiers, agents, architecture |
| `docs/OPENCLAW_ARCHITECTURE.md` | OpenClaw/NemoClaw integration spec — sandbox setup, agent configuration, skill files, WhatsApp provisioning |
| `docs/PRICING_AND_TIERS.md` | Full pricing breakdown — Foundation/Partner/Full Partner, setup fees, guarantee, cost structure |
| `docs/ONBOARDING_PLAYBOOK.md` | Step-by-step client onboarding — 48-hour checklist, Supabase setup, credential binding, dashboard access |
| `docs/N8N_MULTITENANT_GUIDE.md` | Multi-tenant n8n architecture — config lookup pattern, Supabase clients table, webhook URL structure |
| `docs/AGENT_SKILL_FILES.md` | OpenClaw skill file templates for HVAC domain agents |
| `handoff-dashboard.md` (new) | Updated dashboard handoff for multi-tenant + OpenClaw agent tracking |
| `prompt-for-dashboard-session.md` | Prompt file for dashboard/landing page Claude worktree session |

---

## Current Confirmed Decisions (Source Of Truth For Rewrites)

### Business Model
- AI implementation partner — not SaaS
- Retained partnership, monthly retainer

### Pricing
| Tier | Setup | Monthly | Commitment |
|---|---|---|---|
| Foundation | $500 | $1,500 | Month-to-month |
| Partner | $1,500 | $2,500 | 3-month minimum |
| Full Partner | $2,500 | $4,500 | 3-month minimum, custom contract |
| Custom CRM add-on | $8,000-12,000 | Tier 3 retainer required | — |

### Guarantee
5 recovered leads in 30 days or second month free. Logged automatically in Supabase actions table.

### Tech Stack
- **Workflows:** n8n Cloud (multi-tenant, one workflow per function, Supabase config lookup)
- **Agents:** OpenClaw runtime inside NemoClaw sandbox (per contractor, central VPS)
- **AI Orchestration:** Nemotron 3 Super 120B via OpenRouter (free)
- **AI Reasoning:** Claude Sonnet 4.6 ($3/M input, $15/M output)
- **AI Batch:** Claude Batch API for non-real-time ($1.50/M input, $7.50/M output)
- **Cost protection:** Claude budget cap → Nemotron fallback
- **SMS:** SignalWire (NOT Twilio)
- **Database:** Supabase PostgreSQL (single source of truth, RLS per contractor)
- **Frontend:** Next.js 14 (Vercel)
- **Future:** FastAPI in Phase 3 (deferred, not removed)

### Agent Architecture
- Layer 1: n8n standalone workflows (deterministic, event-driven)
- Layer 2+: OpenClaw agents sit on top, invoke n8n workflows as tools
- Agents are custom-built per client as part of setup fee
- Not pre-built — built when client signs

### Tier Contents
| Tier | n8n Workflows | OpenClaw Agents |
|---|---|---|
| Foundation | 10 (Layer 1, no seasonal outreach) | 0 |
| Partner | 10 + 5-7 custom | 2-3 (Marketing + Ops) |
| Full Partner | Full custom suite | 4-6 (full team) + Layer 3 |

### Workflow Architecture
- One workflow per function, handles ALL clients
- Client identified by SignalWire TO number → Supabase lookup
- Config pulled at runtime (business hours, CRM type, contractor_id)
- Jobber webhooks: yourdomain.com/webhook/jobber?contractor={id}

### Dashboard
- Single multi-tenant dashboard (not custom per client)
- Supabase RLS handles data isolation
- Client created via /admin/onboard form (30 min)
- Dashboard live immediately after account creation
- Roles: admin (Karsyn, sees all) / client (sees own data only)

### Cost Structure (Worst Case Heavy Usage)
| Tier | Variable Cost | Margin |
|---|---|---|
| Foundation | ~$53/month | 89% |
| Partner | ~$120/month | 89% |
| Full Partner | ~$219/month | 89% |

### Still Needs Decisions
1. WhatsApp provisioning flow (SignalWire WhatsApp Business API details)
2. Partner/Full Partner guarantee wording
3. Contract terms (payment, data ownership, cancellation notice)
4. CRM add-on on pricing page now or hold?
5. ServiceTitan wording on pricing page
6. First client acquisition strategy
7. OpenClaw skill file structure for HVAC
