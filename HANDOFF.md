# HANDOFF — HVAC AI Operations (Agency)
# READ THIS FIRST. This is the single source of truth for project state.
# Updated at the END of every session. Read at the START of every session.

---

## Last Session Summary
**Date:** 2026-03-15 (Session 4)
**What happened:** MAJOR PRODUCT PIVOT DISCOVERED. Realized Phase 1 workflows are the FOUNDATION for an agent-based product (the future of AI operations). Instead of just event-driven automation, we're building a specialized **"HVAC Operations Agent"** that contractors can ask questions to ("How much revenue this month?" / "Run missed call recovery now") and it autonomously:
- Queries business data (Supabase)
- Makes decisions (Claude)
- Executes workflows (n8n)
- Reports results

This transforms the product positioning:
- **Phase 1** = Event-driven workflows (SMS capture + missed calls + audit trail)
- **Phase 2** = Add agent reasoning layer (Claude API + data querying)
- **Phase 3+** = Full autonomous business advisor (strategic insights, optimization suggestions)

Also: Switched from Airtable to Supabase (no API limits, better for scale). Jobber testing will use curl/Postman mocks (no API key needed yet). Credential setup guide created with direct links. Ready to build both n8n workflows in parallel.

---

## Product Vision: "The AI Operations Agent"

**What contractors say:** "I wish I had an AI that understood my business, answered my questions, and took actions without me clicking things."

**What we're building:** A specialized agent that:
1. **Understands** contractor pain points (missed leads, scheduling inefficiency, pricing optimization)
2. **Gathers** real-time data (Jobber/ServiceTitan CRM, Supabase metrics)
3. **Decides** using domain knowledge (HVAC operations expertise + Claude reasoning)
4. **Acts** by running proven workflows (SMS recovery, scheduling optimization, etc.)
5. **Reports** progress + next opportunities

**Competitive Moat:**
- Not a "generic AI agent" (scary, unreliable)
- A **domain-specific contractor operations agent** (safe, profitable, defensible)
- Other players can't replicate without contractor expertise

**Revenue Unlock:**
- Phase 1: $8,600/month recovered (SMS, missed calls)
- Phase 2: +$2,000-3,000/month (dashboards, optimization)
- Phase 3: +$5,000+/month (data-driven insights, strategic decisions)
- **Total: $15,000-18,000/month per contractor** at full maturity

---

## Project Phase
**Current Phase:** Foundation Building (Phase 1 Implementation)
**Overall Status:** Product strategy locked. Tier 1 features identified (After-hours capture + Missed calls + Audit trail). Ready to build Phase 1 workflows. Supabase + n8n + FastAPI backend ready. Jobber testing via mocks confirmed (curl/Postman).

---

## What Is Confirmed Working
- **Architecture**: Hybrid agent model (event-driven + agentic querying) clearly defined
- **Claude API integration**: System prompts written for all Layer 1 agents (Section 4 of design spec)
- **Phase 1 plan**: Handoff workflows doc complete with detailed checklists
- **Product documentation**: PRODUCT_ROADMAP.md, agent-ops.md, TIER1_WORKFLOW_REFERENCE.md comprehensive
- **Database schema**: Supabase SQL ready (Leads + Actions tables with proper indexing)
- **Credential setup**: Detailed guide with direct links created (docs/CREDENTIAL_SETUP_GUIDE.md)
- **Jobber testing**: Mock strategy documented for testing without API key (docs/JOBBER_TESTING_MOCK.md)

---

## What Is NOT Working / Incomplete
- **n8n workflows not yet built** (design complete, ready to build)
- **Supabase not yet created** (user needs to set up project)
- **Twilio account not set up** (user needs to create + buy number)
- **FastAPI backend** from Phase 1 plan not yet implemented
- **Mission Control dashboard** not yet built
- **Credentials not yet gathered** (.env still has placeholders)

---

## Exact Next Steps (in order — do not skip)
1. **User gathers credentials** (while we build):
   - [ ] Create Supabase project + run schema SQL
   - [ ] Create Twilio account + buy phone number
   - [ ] Deploy FastAPI backend (or confirm URL)
   - [ ] Create 2 empty n8n workflows
   - [ ] Fill in .env file with all values

2. **Build n8n workflows in PARALLEL**:
   - [ ] Workflow 1: tier1_after_hours_lead_capture (webhook → FastAPI → SMS/Airtable)
   - [ ] Workflow 2: tier1_missed_call_recovery_sms (webhook → dedup → FastAPI → SMS/Airtable)

3. **Integration testing**:
   - [ ] Test after-hours workflow with real Twilio number
   - [ ] Test missed call workflow with curl/Postman mocks
   - [ ] Verify deduplication (24-hour window)
   - [ ] Verify Supabase writes (Leads + Actions tables)
   - [ ] Verify error handling (FastAPI down, SMS failure)

4. **After Phase 1 works**:
   - [ ] Document results + learnings
   - [ ] Plan Phase 2 agent layer (Claude API in n8n Code node)
   - [ ] Update roadmap with agent positioning

---

## Open Questions / Blockers
- **FastAPI endpoints ready?** User says backend is deployed, but need to confirm `/leads/qualify` and `/webhooks/missed-call` endpoints are working
- **Twilio webhook configuration**: After building workflows, need to configure Twilio phone number webhooks to point to n8n webhook URLs
- **Claude API key location**: Currently managed by FastAPI backend. Agent layer (Phase 2) will need direct Claude API access — plan for this.

---

## Key Decisions (don't re-litigate these)
- **Supabase over Airtable**: No API rate limits, better for scale, SQL queries for agent layer
- **Jobber-only for MVP**: ServiceTitan integration deferred. User has no clients yet (cost concern).
- **Mock Jobber webhooks for testing**: Use curl/Postman to simulate missed calls until API access available
- **Confidence thresholds**: 0.85 (after-hours), 0.8 (missed calls) — only auto-send when confident
- **Deduplication**: 24-hour window — don't SMS same phone twice in same day
- **Audit trail mandatory**: Every action logged to Actions table (proof of ROI for future contractors)
- **Agent layer in Phase 2**: Don't over-engineer Phase 1. Get workflows working first, then add reasoning.

---

## Product Strategy Summary

### Phase 1: Foundation (Weeks 1-4) — NOW
- Event-driven workflows only (no agent reasoning)
- SMS recovery from missed leads + calls
- Audit trail logging
- Targeting: HVAC contractors, Jobber CRM
- Positioning: "Automated SMS recovery system"
- Revenue per contractor: $8,600/month

### Phase 2: Agent Layer (Month 2) — After 1st Client
- Add Claude reasoning (ask questions, get answers)
- Data querying (Supabase metrics)
- Workflow triggering (no clicking)
- Positioning: "AI Operations Agent for contractors"
- New workflows: Cancellation fill, Daily summary, Invoice reminders

### Phase 3: Strategic Advisor (Month 3+) — With 3+ Clients
- Cross-client insights (seasonal patterns, neighborhood profiling)
- Optimization suggestions (pricing, scheduling, team performance)
- Proactive recommendations (market intel, compliance alerts)
- Positioning: "Your permanent AI operations partner"
- Revenue per contractor: $15,000-18,000/month

---

## Key File Paths
- **Workflow Implementation**: `handoff-workflows.md` (detailed checklist)
- **Workflow Design**: `docs/TIER1_WORKFLOW_REFERENCE.md` (flow diagrams + demo script)
- **Product Roadmap**: `docs/PRODUCT_ROADMAP.md` (27 agents across 3 layers)
- **Architecture**: `docs/agent-ops.md` (hybrid agent model, tech stack)
- **Supabase Schema**: `docs/SUPABASE_SCHEMA.sql` (copy-paste ready)
- **Credential Setup**: `docs/CREDENTIAL_SETUP_GUIDE.md` (direct links for each credential)
- **Jobber Testing**: `docs/JOBBER_TESTING_MOCK.md` (curl/Postman examples)
- **Environment Config**: `docs/ENV_SETUP.md` (template for .env file)

---

## Tech Stack (Final)
- **Frontend**: Next.js 14+ (Vercel deployment) — Mission Control dashboard
- **Backend**: FastAPI (Python 3.11+, Render/Railway) — Webhook handlers, Claude qualification
- **Workflows**: n8n Cloud — Orchestration, SMS sending, Supabase writes
- **AI**: Claude API (sonnet-4-20250514) — Lead qualification, agent reasoning (Phase 2+)
- **SMS**: Twilio — SMS sending + webhook triggers
- **Database Phase 1**: Supabase (PostgreSQL) — Leads + Actions tables
- **CRM MVP**: Jobber (webhooks only for Phase 1) — Missed call triggers (via mock testing)

---

## How to Update This File
At the END of every session:
- [ ] Update Last Session Summary
- [ ] Add/update Product Vision section
- [ ] Update What Is Confirmed Working
- [ ] Update What Is NOT Working
- [ ] Update Exact Next Steps
- [ ] Update Key Decisions if any changed
- [ ] Update Tech Stack if anything changed

**Do not compress. Future Claude needs specifics.**

---

**Last Updated:** 2026-03-15 (Session 4 — Agent Product Vision Discovered)
