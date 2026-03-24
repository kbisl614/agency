# agency-context — Fieldline AI Master Reference Bundle
**Generated:** 2026-03-23 (v2)
**Purpose:** Complete context package for Claude sessions, Claude Code, and any AI tool working on Fieldline AI.

---

## How to Use This Bundle

Drop the entire `agency-context` folder into any Claude Project or Claude Code session. Point Claude at the relevant subfolder for the task at hand.

**Always read `FIELDLINE_AI_MASTER.md` first.** It is the single source of truth. Every other file is subordinate to it.

---

## Folder Structure

### 📁 copywriting-and-sales/ ← START HERE FOR ALL COPY WORK
| File | What it is |
|---|---|
| `COPYWRITING_REFERENCE.md` | **Canonical copy guide — v2, 2026-03-23. Use this above all others.** Hero copy, voice rules, pricing copy, CRM language, step rewrites, form copy, what changed and why. |
| `Selling_Angles_Updated.md` | Discovery call scripts, pitch-by-bottleneck, objection handling, contractor profiles |
| `cold-email-templates.md` | **Updated v2.** 4 sequences (after-hours, ST, cancellation, Jobber). Guarantee language removed. Contract framing added. |
| `BRAND_ASSETS.md` | Color palette, typography, component specs, animation classes |
| `Universal_Offer_All_CRMs.md` | Cross-CRM positioning and offer framing |

### 📁 planning-and-strategy/
| File | What it is |
|---|---|
| `FIELDLINE_AI_MASTER.md` | **Single source of truth. Read this first.** Business model, tech stack, four agents, pricing, process, schema |
| `PRODUCT_ROADMAP.md` | Phase 1–5 build order, milestones, success metrics |
| `PRICING_AND_TIERS.md` | Canonical pricing — no tiers, custom-quoted, four agents, setup fees, cost structure |
| `FIRST_CLIENT_ACQUISITION.md` | Full playbook: target profile, outreach, discovery call, demo, closing, 48-hour onboarding |
| `ONBOARDING_PLAYBOOK.md` | Post-signature onboarding process |
| `LANDING_PAGE_AUDIT.md` | Full copy + layout audit 2026-03-23. Prioritized fix list with ready-to-implement rewrites |
| `expenses.md` | Fixed costs, variable costs per client, margin analysis |
| `vertical_playbook_template.md` | Template for future vertical expansion (post-revenue) |

### 📁 market-research/
| File | What it is |
|---|---|
| `market-research.md` | VOC analysis — contractor pain points, feature prioritization, stats for copy |
| `MARKET_RESEARCH_INTEGRATION.md` | How market research changed the product strategy |
| `HVAC_CRM_Pain_Point_Research.md` | Raw CRM pain point research from contractor forums |
| `PRODUCT_VISION_AGENT.md` | Long-term agent vision, Phase 1→3 evolution, why this beats SaaS |

### 📁 product-reference/
| File | What it is |
|---|---|
| `agent-ops.md` | Agent operations architecture |
| `OPENCLAW_ARCHITECTURE.md` | NemoClaw/OpenClaw sandbox architecture, AI model routing |
| `N8N_MULTITENANT_GUIDE.md` | Multi-tenant n8n — one workflow per function, all clients |
| `feature-tier-mapping.md` | Maps contractor pain → feature tiers, Phase 1 scope |
| `CRITICAL_GAPS_DEPENDENCY_MAP.md` | Known gaps and dependency chains |
| `Gaps_And_New_Implementations.md` | Gap analysis and implementation decisions |

### 📁 implementation/
| File | What it is |
|---|---|
| `phase1-tier1-implementation.md` | Tier 1 implementation plan |
| `dashboard-design.md` | Dashboard UX and component design |
| `TIER1_WORKFLOW_REFERENCE.md` | Tier 1 workflow specs |
| `WORKFLOW_BUILD_COMPLETE.md` | Completed workflow docs |
| `WORKFLOWS_WITH_CRITICAL_GAPS.md` | Workflows with known issues |
| `supabase-setup.md` | Supabase schema and RLS config |
| `ENV_SETUP.md` | All environment variables |
| `CREDENTIAL_SETUP_GUIDE.md` | n8n credential IDs and setup |
| `N8N_AI_PROMPT.md` | Claude prompt templates for n8n nodes |
| `JOBBER_TESTING_MOCK.md` | Jobber webhook mock data for testing |
| `email-notifications.md` | Email notification setup |
| `prompt-for-workflows-session.md` | Context prompt for workflow-building sessions |
| `prompt-for-dashboard-session.md` | Context prompt for dashboard-building sessions |

---

## Key Facts (Read Before Any Session)

- **Business model:** Productized agency. Not SaaS. Discovery call → custom build → monthly retainer.
- **Niche:** HVAC contractors only. Always.
- **CRM:** Connects with any CRM the contractor is already using. No lock-in.
- **Four agents:** Concierge (always first) → Closer → Dispatcher → Strategist. Named internally only — use "agent(s)" in customer copy.
- **Pricing:** No fixed tiers. Starts at $1,500/month depending on scope. Custom-quoted on discovery call.
- **No guarantee language:** "5 recovered leads / second month free" has been retired. Use contract/terms framing instead.
- **Tech stack:** n8n + Claude API + SignalWire + Supabase + Next.js/Vercel
- **Current status:** Pre-first-client. Two n8n workflows built, need credential binding.
- **Immediate priority:** Bind credentials → end-to-end test → publish website → begin outreach.

---

## File Supersession Notes

| Old File | Replaced By | Reason |
|---|---|---|
| `COPYWRITING_UPDATES.md` | `copywriting-and-sales/COPYWRITING_REFERENCE.md` (v2) | Tier table, guarantee framing, and multiple copy decisions updated |
| `cold-email-templates.md` (v1) | `copywriting-and-sales/cold-email-templates.md` (v2) | Guarantee language removed, contract framing added, 4th template added |
