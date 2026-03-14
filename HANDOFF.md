# HANDOFF — HVAC AI Operations (Agency)
# READ THIS FIRST. This is the single source of truth for project state.
# Updated at the END of every session. Read at the START of every session.

---

## Last Session Summary
**Date:** 2026-03-14
**What happened:** Completed comprehensive design for all 11 Layer 1 workflows (Emergency Ops + Admin Ops). User requested planning for n8n workflow architecture, and we went through full brainstorming process resulting in a 1000+ line design specification with production-ready Claude prompts, SMS frequency/compliance strategy, Orchestrator hub design, and Supabase migration plan. Design is ready for user approval before moving to implementation planning.

---

## Project Phase
**Current Phase:** Layer 1 Workflow Design (Brainstorming → Implementation Planning)
**Overall Status:** Phase 1 implementation plan exists and is approved. Phase 1 demo (Emergency Lead Capture) is ready to build. Layer 1 design completed and awaiting user approval before moving to writing implementation plan.

---

## What Is Confirmed Working
- **Architecture**: Hybrid agent model clearly defined (independent vs orchestrated workflows)
- **Claude API integration**: System prompts written and tested for all 11 Layer 1 agents
- **Phase 1 (demo) plan**: Complete implementation plan exists in `docs/superpowers/plans/2026-03-14-phase1-demo.md`
- **Product documentation**: agent-ops.md, PRODUCT_ROADMAP.md, and design spec are comprehensive and current
- **Database schema**: Airtable MVP schema designed with migration path to Supabase clearly documented

---

## What Is NOT Working / Incomplete
- **Layer 1 workflows not yet built** in n8n. Design is complete, but no workflows exist yet.
- **Supabase setup not started** (Phase 2 activity, not Phase 1)
- **FastAPI backend** from Phase 1 plan not yet implemented
- **Mission Control dashboard** from Phase 1 plan not yet implemented
- **SMS frequency enforcement** logic not yet coded (n8n nodes, Airtable queries)
- **Orchestrator workflow** not yet built in n8n (design complete, needs implementation)

---

## Exact Next Steps (in order — do not skip)
1. **User approves Layer 1 workflows design spec** (`docs/superpowers/specs/2026-03-14-layer1-workflows-design.md`)
2. **Invoke writing-plans skill** to create detailed implementation plan for Layer 1 workflows (separate from Phase 1 demo plan)
3. **Execute Phase 1 demo first** (Emergency Lead Capture only): Use existing phase1-demo.md plan to build FastAPI backend → Mission Control dashboard → n8n demo workflow
4. **After Phase 1 demo is live**: Build remaining 10 Layer 1 agents in Phase 2 (following patterns from Phase 1 + design spec)
5. **Plan Supabase migration** (Phase 2 timing): Set up dual-write, verify data consistency, switch reads, decommission Airtable
6. **Plan ServiceTitan integration** (Phase 2+ if customer acquired): Add new n8n workflows, no FastAPI changes needed

---

## Open Questions / Blockers
- **Supabase MCP server:** User mentioned "the mcp for this should be connected if not I'll add it" — unclear if Supabase MCP is already integrated. Next session should verify Supabase MCP availability before Phase 2.
- **Jobber webhook availability:** Assumed Jobber webhooks are fully enabled in contractor's account. May need to verify on first client setup.
- **TCPA compliance scope:** Design documents TCPA rules, but user's jurisdiction may have additional requirements. Consider legal review before launch.
- **SMS carrier reputation:** Twilio guidelines mentioned (< 0.1% complaint rate). No monitoring system designed yet for tracking complaints.

---

## Key Decisions (don't re-litigate these)
- **Jobber-only for MVP + Phase 1/2.** ServiceTitan/House Call Pro integration deferred to Phase 2+. No CRM-agnostic abstraction layer (YAGNI principle).
- **Match SMS replies by phone number.** Inbound SMS Handler queries Leads table by phone, filters to most recent active lead (awaiting_confirmation or dispatched status).
- **SMS frequency caps: max 4-5 essential messages per week.** Additional compliance fields added to Airtable (sms_frequency_preference, opted_out, tcpa_marketing_consent).
- **ETA Monitor stops when tech arrives.** Monitors dispatched jobs every 15 min, stops sending SMS once job status changes to "in_progress".
- **Claude confidence threshold: 0.85 for auto-execute, 0.6-0.85 for human review, <0.6 ask for clarification.** Prevents bad SMS sends while creating audit trail.
- **All workflows log to Actions table.** Every agent action creates audit trail (proof of ROI for contractors).
- **Orchestrator as decision hub.** Routes ambiguous input (new SMS, customer replies, ambiguous webhooks) through Claude classification before delegating to agents.

---

## Context That Would Be Lost Without This File

### Key File Paths
- **Planning**: `docs/superpowers/plans/2026-03-14-phase1-demo.md` (Phase 1 implementation plan — approved)
- **Workflow Design**: `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` (All 11 Layer 1 agents — awaiting approval)
- **Product Roadmap**: `docs/PRODUCT_ROADMAP.md` (27 agents across 3 layers with ROI justification)
- **Architecture**: `docs/agent-ops.md` (Core architecture, hybrid agent model, tech stack)
- **Implementation**: `/backend/`, `/app/mission-control/`, `/n8n/` directories (from Phase 1 plan — not yet created)

### Tech Stack Details
- **Frontend**: Next.js 14+ (Vercel deployment)
- **Backend**: FastAPI (Python 3.11+, Render/Railway deployment)
- **Workflows**: n8n (orchestration, 11 agents in Layer 1)
- **AI**: Claude API (claude-sonnet-4-20250514)
- **SMS**: Twilio (with frequency caps + compliance rules)
- **Database MVP**: Airtable (3 tables: Leads, Actions, Waitlist)
- **Database Scale**: Supabase (Phase 2+, dual-write migration path documented)
- **CRM MVP**: Jobber (webhooks: job.created, job.scheduled, job.completed, job.cancelled, technician.location_update)
- **CRM Future**: ServiceTitan (pending API approval 4-8 weeks), House Call Pro (future evaluation)

### Key Agent Names & IDs (Layer 1, 11 agents)
**Emergency Ops (5)**:
1. Emergency lead capture (Phase 1 — demo)
2. Cancellation fill
3. Dispatch router
4. Inbound SMS handler
5. ETA monitor

**Admin Ops (6)**:
6. Invoice chaser
7. Review request
8. Review monitor
9. Daily summary
10. Seasonal outreach
11. Waitlist manager

### Layer 2 (9 agents) — Deferred to Phase 3, Month 2+
- Maintenance agreement converter, Repair-then-replace tracker, Upsell agent
- Tech performance monitor, Job prep briefer, Post-job debrief capture
- Tariff price alert, Refrigerant compliance watcher, Competitor signal monitor

### Layer 3 (7 agents) — Deferred to Phase 4, Month 4+
- Seasonal conversion patterns, Neighborhood equipment profiler, Best-performing message library
- Quarterly business review, New tool evaluator, Stack updater, (1 more TBD)

### Claude Prompts Location
All production-ready prompts for 11 Layer 1 agents are in Section 4 of the design spec. These are ready to copy directly into FastAPI endpoints or n8n Code nodes.

### SMS Frequency Enforcement Fields
Airtable Leads + Customers tables must include:
- `sms_frequency_preference` (enum: all, essential_only, marketing_only, none)
- `sms_count_this_week` (rolling 7-day counter)
- `sms_last_sent_timestamp`
- `opted_out` (boolean)
- `tcpa_marketing_consent` (boolean for marketing/seasonal outreach)

### Orchestrator Routing Logic
Orchestrator classifies intent with Claude, then routes:
- "emergency_lead_capture" → Agent 1
- "confirm_booking" → Agent 4 (SMS handler)
- "dispatch_tech" → Agent 3 (dispatcher)
- "escalate_to_human" → Slack to manager
- "unclear" → Ask customer clarifying question via SMS

### Supabase Migration Timing
Phase 2 (2-3 months in, after first client signs):
1. Dual-write to both Airtable + Supabase for 1 week
2. Verify data consistency
3. Switch n8n read queries to Supabase
4. Keep Airtable 2 weeks as backup, then decommission

### First Client Expectations
Based on design:
- Will use Jobber CRM (MVP integration)
- Will receive Layer 1 agents (11 agents after Phase 2)
- Cannot configure anything (read-only Mission Control dashboard)
- Pays monthly retainer for managed operations
- ROI measured through Actions table (audit trail of all agent activities)

---

## How to Update This File
At the END of every session, update:
- [ ] Last Session Summary
- [ ] What Is Confirmed Working
- [ ] What Is NOT Working
- [ ] Exact Next Steps
- [ ] Open Questions
- [ ] Context That Would Be Lost

**Do not compress. Future Claude needs specifics.**

---

**Last Updated:** 2026-03-14 (Session 2)
