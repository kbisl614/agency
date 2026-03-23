# Fieldline AI — File Index & Status
**Last Updated:** 2026-03-18
**Purpose:** Complete map of every planning/doc file and its current status.

---

## Status Legend
- ✅ CURRENT — accurate, use this
- ⚠️ STALE — needs attention
- 🗑️ DELETE — superseded, no value

---

## All Files — Current Status

### Session Handoffs
| File | Status | Notes |
|---|---|---|
| `HANDOFF.md` | ✅ CURRENT | Rewritten 2026-03-18 |
| `handoff-workflows.md` | ✅ CURRENT | Rewritten 2026-03-18 — multi-tenant, correct IDs |
| `handoff-dashboard.md` | ✅ CURRENT | Rewritten 2026-03-18 — multi-tenant, onboard form |
| `handoff-agency-changes.md` | ✅ CURRENT | Master strategic change log from 2026-03-17/18 session |
| `CLAUDE.md` | ⚠️ STALE | Missing OpenClaw/NemoClaw stack, old FastAPI note |

---

### Core Docs (New This Session)
| File | Status | Notes |
|---|---|---|
| `docs/FIELDLINE_AI_MASTER.md` | ✅ CURRENT | Canonical single source of truth — created 2026-03-18 |
| `docs/PRICING_AND_TIERS.md` | ✅ CURRENT | Full pricing breakdown — created 2026-03-18 |
| `docs/OPENCLAW_ARCHITECTURE.md` | ✅ CURRENT | OpenClaw/NemoClaw spec — created 2026-03-18 |
| `docs/N8N_MULTITENANT_GUIDE.md` | ✅ CURRENT | Multi-tenant n8n pattern — created 2026-03-18 |
| `docs/ONBOARDING_PLAYBOOK.md` | ✅ CURRENT | 48-hour onboarding checklist — created 2026-03-18 |
| `docs/FIRST_CLIENT_ACQUISITION.md` | ✅ CURRENT | Outreach + Supabase onboarding — created 2026-03-18 |
| `prompt-for-dashboard-session.md` | ✅ CURRENT | Dashboard session starter prompt — created 2026-03-18 |

---

### Architecture & Implementation
| File | Status | Notes |
|---|---|---|
| `docs/agent-ops.md` | ✅ CURRENT | Rewritten 2026-03-18 — OpenClaw, multi-tenant, FastAPI deferred |
| `docs/PRODUCT_ROADMAP.md` | ✅ CURRENT | Rewritten 2026-03-18 — 10 workflows, correct tier structure |
| `docs/TIER1_WORKFLOW_REFERENCE.md` | ✅ CURRENT | Rewritten 2026-03-18 — multi-tenant pattern, correct IDs |
| `docs/CRITICAL_GAPS_DEPENDENCY_MAP.md` | ✅ CURRENT | Phase 1 gaps — still accurate |
| `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` | ⚠️ STALE | Old workflow IDs — minor update needed |
| `docs/WORKFLOW_BUILD_COMPLETE.md` | ⚠️ STALE | Old workflow IDs — minor update needed |
| `docs/superpowers/specs/2026-03-15-dashboard-design.md` | ⚠️ STALE | Pre-multi-tenant schema — handoff-dashboard.md supersedes it |
| `docs/superpowers/plans/2026-03-14-phase1-demo.md` | ✅ CURRENT | Demo plan still valid |
| `docs/superpowers/plans/2026-03-14-phase1-implementation-detailed.md` | ⚠️ STALE | Pre-OpenClaw |
| `docs/superpowers/plans/2026-03-14-phase1-tier1-implementation.md` | ⚠️ STALE | Old tier 1 (11 workflows) |
| `docs/superpowers/specs/2026-03-14-feature-tier-mapping.md` | ⚠️ STALE | Old tier definitions |
| `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` | ⚠️ STALE | Pre-multi-tenant |
| `docs/superpowers/plans/2026-03-16-docs-consolidation.md` | ⚠️ STALE | Partially superseded |

---

### Product Vision & Strategy
| File | Status | Notes |
|---|---|---|
| `docs/PRODUCT_VISION_AGENT.md` | ✅ CURRENT | Phase vision mostly accurate |
| `docs/market-research.md` | ✅ CURRENT | Raw HVAC market data |
| `docs/MARKET_RESEARCH_INTEGRATION.md` | ⚠️ STALE | Feature mapping needs new tier structure |

---

### Technical Setup
| File | Status | Notes |
|---|---|---|
| `docs/ENV_SETUP.md` | ✅ CURRENT | Rewritten 2026-03-18 — OpenRouter/Nemotron added |
| `docs/CREDENTIAL_SETUP_GUIDE.md` | ⚠️ STALE | Needs NemoClaw VPS section — rest is accurate |
| `docs/supabase-setup.md` | ✅ CURRENT | Still accurate |
| `docs/JOBBER_TESTING_MOCK.md` | ✅ CURRENT | Still valid for testing |
| `docs/BRAND_ASSETS.md` | ✅ CURRENT | Design tokens unchanged |
| `docs/N8N_AI_PROMPT.md` | ⚠️ STALE | Pre-multi-tenant config lookup pattern |
| `docs/N8N_AI_PROMPT_WORKFLOW1.md` | ⚠️ STALE | Same |
| `docs/N8N_AI_PROMPT_WORKFLOW2.md` | ⚠️ STALE | Same |

---

### Copywriting & Sales
| File | Status | Notes |
|---|---|---|
| `updated-files/COPYWRITING_UPDATES.md` | ✅ CURRENT | Rewritten 2026-03-18 — correct pricing, no free trial |
| `updated-files/Selling_Angles_Updated.md` | ✅ CURRENT | Rewritten 2026-03-18 — correct pricing, OpenClaw as infrastructure |
| `docs/cold-email-templates.md` | ✅ CURRENT | Rewritten 2026-03-18 — Fieldline AI branding, correct pricing |
| `updated-files/vertical_playbook_template.md` | ✅ CURRENT | Template for other verticals — still valid |

---

### Memory Files (~/.claude/projects/.../memory/)
| File | Status |
|---|---|
| `MEMORY.md` (index) | ✅ CURRENT |
| `reference_project_context.md` | ✅ CURRENT |
| `architecture_decisions_phase1.md` | ✅ CURRENT |
| `pricing_cost_model.md` | ✅ CURRENT |
| `openclaw_nemoclaw_assessment.md` | ✅ CURRENT |
| `product_philosophy_phase1.md` | ✅ CURRENT |
| `memory_logging_strategy.md` | ✅ CURRENT |
| `feedback_visual_companion.md` | ✅ CURRENT |
| `feedback_session_start.md` | ✅ CURRENT |
| `feedback_read_docs_not_ask.md` | ✅ CURRENT |

---

## Files Still Needing Minor Updates (Low Priority)

These are accurate in structure but have minor stale details. Update opportunistically:
- `CLAUDE.md` — add OpenClaw/NemoClaw, fix FastAPI note
- `docs/CREDENTIAL_SETUP_GUIDE.md` — add NemoClaw VPS section
- `docs/N8N_AI_PROMPT.md` files — add multi-tenant lookup pattern example
- `docs/WORKFLOWS_WITH_CRITICAL_GAPS.md` — update workflow IDs
- `docs/MARKET_RESEARCH_INTEGRATION.md` — update tier feature mapping
