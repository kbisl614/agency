# HANDOFF — Workflows Implementation Session
# Session 4, 2026-03-15
# Read this at the start of the NEXT implementation session to continue building workflows

---

## What Happened This Session

**Major realization:** The two n8n workflows we're building aren't just automation — they're the foundation for an AI Operations Agent product that contractors will ask questions to.

**Product pivot:**
- Phase 1 = Event-driven workflows (what we're building now)
- Phase 2 = Add agent reasoning layer (Claude decision-making + data querying)
- Phase 3+ = Full strategic advisor (cross-client insights, predictions)

**This changes the positioning from "SaaS tool" to "permanent operations partner"** → revenue grows from $8.6K to $17K per contractor.

---

## What We Completed This Session

✅ **Credential setup guide** (`docs/CREDENTIAL_SETUP_GUIDE.md`)
   - Direct links for every credential (Supabase, Twilio, FastAPI, n8n)
   - Clear labeling of what goes in `.env` vs n8n vs where Claude handles it
   - User responsibility: Fill in `.env` file while we build

✅ **Supabase schema** (`docs/SUPABASE_SCHEMA.sql`)
   - Ready to copy-paste into Supabase SQL editor
   - Leads table (customer data)
   - Actions table (audit trail for agent to query)
   - Indexes optimized for agent queries

✅ **Jobber testing strategy** (`docs/JOBBER_TESTING_MOCK.md`)
   - How to test missed call workflow without API key
   - curl/Postman examples for mocking webhooks
   - Migration path: mock → real Jobber webhooks (no code changes)

✅ **Product vision document** (`docs/PRODUCT_VISION_AGENT.md`)
   - Three phases of agent evolution
   - Revenue projections ($8.6K → $17K)
   - Why this is defensible moat vs traditional SaaS
   - Technical architecture for all phases

✅ **Updated all handoff files**
   - `HANDOFF.md` — Session summary + product vision section
   - `handoff-workflows.md` — Agent integration context for each workflow
   - `.env` — Credential placeholders with links (placeholder file created)

---

## What User Needs to Do (In Parallel While We Build)

These can happen independently while Claude builds workflows:

1. **Supabase Setup** (15 min)
   - [ ] Go to https://supabase.com
   - [ ] Create project
   - [ ] Copy `docs/SUPABASE_SCHEMA.sql`
   - [ ] Paste into SQL editor → Run
   - [ ] Go to Settings → API
   - [ ] Copy SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - [ ] Paste into `.env` file

2. **Twilio Setup** (20 min)
   - [ ] Go to https://console.twilio.com
   - [ ] Copy Account SID, Auth Token
   - [ ] Phone Numbers → Buy a Number
   - [ ] Copy phone number in E.164 format (+1...)
   - [ ] Paste all 3 into `.env` file
   - [ ] DON'T configure webhooks yet (we'll do that after building workflows)

3. **n8n Workflows** (5 min)
   - [ ] Go to https://app.n8n.cloud
   - [ ] Create 2 empty workflows:
     - `tier1_after_hours_lead_capture`
     - `tier1_missed_call_recovery_sms`
   - [ ] Open each, copy webhook URL
   - [ ] Paste into `.env` file (N8N_AFTER_HOURS_WEBHOOK_URL, N8N_MISSED_CALL_WEBHOOK_URL)

4. **FastAPI Backend Verification** (5 min)
   - [ ] Confirm backend is deployed and accessible
   - [ ] Test /health endpoint returns 200
   - [ ] Confirm /leads/qualify and /webhooks/missed-call endpoints exist
   - [ ] Paste backend URL into `.env` (FASTAPI_BASE_URL)

5. **Provide Updated .env** (1 min)
   - [ ] Copy filled `.env` file contents
   - [ ] Share with Claude (paste into chat or upload)
   - [ ] Claude will build workflows using these credentials

---

## What We'll Build Next Session

**Parallel execution:** Two agents building workflows simultaneously

### **Workflow #1: tier1_after_hours_lead_capture**
```
n8n nodes:
1. Webhook trigger (Twilio POST)
2. Set node (extract phone, message, timestamp)
3. HTTP POST to FastAPI /leads/qualify
4. Set node (parse response)
5. IF node (confidence > 0.85?)
   - YES: Send SMS, Create Lead in Supabase, Log action success
   - NO: Log action human_review_needed
6. Error handler (log failures)
```

**Critical design notes:**
- Confidence threshold: 0.85 (high bar for auto-send)
- Response time target: < 2 seconds
- Dual write: Supabase Leads + Actions tables
- Error handling: Never crash, always log

### **Workflow #2: tier1_missed_call_recovery_sms**
```
n8n nodes:
1. Webhook trigger (Jobber missed call OR mock POST)
2. Set node (extract phone, timestamp)
3. Supabase Query (find leads by phone, last 24h)
4. IF node (leads found?)
   - YES: Log skipped_duplicate, STOP
   - NO: Continue
5. HTTP POST to FastAPI /webhooks/missed-call
6. Set node (parse response)
7. IF node (should_send = true AND confidence > 0.8?)
   - YES: Create Lead, Send SMS, Log action
   - NO: Log action skipped
8. Error handler (log failures)
```

**Critical design notes:**
- Deduplication window: 24 hours (prevent SMS spam)
- Confidence threshold: 0.8 (slightly lenient, missed calls are proven leads)
- Response time target: < 60 seconds
- Dual write: Supabase Leads + Actions tables
- Error handling: Never crash, always log

### **Integration & Testing**
1. Both workflows complete
2. Configure Twilio webhooks (after workflows built)
3. Test with real SMS + mock missed calls
4. Verify Supabase writes (Leads + Actions)
5. Verify error handling (FastAPI down = logs error, no SMS)
6. Verify deduplication (send missed call twice = 1 SMS)
7. End-to-end test

---

## Critical Success Factors

**Don't ship without:**
- ✅ Both workflows handle errors gracefully (never crash)
- ✅ Every action logged to Actions table (audit trail = proof of ROI)
- ✅ Confidence thresholds respected (0.85 after-hours, 0.8 missed calls)
- ✅ Deduplication working (24-hour window for missed calls)
- ✅ SMS only sends when confident (safe default = don't send on low confidence)
- ✅ Response times met (< 2 sec after-hours, < 60 sec missed calls)

**Testing checklist:**
- [ ] SMS sent within target time
- [ ] Supabase Leads table has correct data
- [ ] Actions table logs every action
- [ ] Dedup prevents duplicate SMS (same phone, 24h window)
- [ ] Low confidence leads go to human_review_needed (not auto-send)
- [ ] FastAPI down = error logged, no SMS sent
- [ ] Twilio down = error logged, tries again on next webhook

---

## Key Design Principles

1. **Safe defaults:** If uncertain, don't send SMS. Log for human review.
2. **Always audit:** Every action → Actions table (contractor sees ROI)
3. **Never crash:** Errors logged, workflows continue
4. **Confidence matters:** Only auto-execute when Claude is confident (>0.85 after-hours, >0.8 missed calls)
5. **Modular for agents:** Phase 2 agent will call these workflows, so keep them clean + testable
6. **Supabase-native:** Use Supabase queries (not Airtable) because Phase 2 agent will query extensively

---

## File References for Implementation

**Workflow specs:**
- `handoff-workflows.md` — Detailed node-by-node breakdowns
- `docs/TIER1_WORKFLOW_REFERENCE.md` — Flow diagrams + demo script

**Backend dependencies:**
- `docs/agent-ops.md` — FastAPI endpoint details
- `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` — Claude prompts (copy directly into Code nodes if needed)

**Database:**
- `docs/SUPABASE_SCHEMA.sql` — Schema (already run by user)
- Leads table: phone, message, urgency_score, service_type, status, source, created_at, updated_at
- Actions table: timestamp, action_type, description, agent_name, confidence_score, revenue_impact, success, error_message, lead_id, sms_sid

**Testing:**
- `docs/JOBBER_TESTING_MOCK.md` — How to mock webhooks without API key
- `docs/CREDENTIAL_SETUP_GUIDE.md` — Where each credential comes from

---

## Decision Log (Don't Re-Litigate)

✅ **Use Supabase, not Airtable** — No API rate limits, better for agent queries
✅ **Mock Jobber for testing** — User has no API key yet, curl/Postman suffices
✅ **Confidence thresholds: 0.85 & 0.8** — Only auto-send when confident
✅ **Dedup window: 24 hours** — Don't SMS same number twice same day
✅ **Dual writes: Leads + Actions** — Every action audited for ROI proof
✅ **Error handling: Always log, never crash** — Operator sees what failed
✅ **Phase 2 agent integration** — Design workflows to be agent-callable

---

## How to Proceed Next Session

1. **User provides `.env` file** (or paste values into chat)
   - Should have: Supabase URL + keys, Twilio SID/token/number, FastAPI URL, n8n URLs
   
2. **Spawn parallel agents** to build both workflows simultaneously
   - Agent 1: Build `tier1_after_hours_lead_capture`
   - Agent 2: Build `tier1_missed_call_recovery_sms`
   - Both coordinate on shared Supabase/Twilio credentials

3. **Testing phase** (after both workflows built)
   - Configure Twilio webhooks
   - Send test SMS
   - Mock missed call via curl
   - Verify Supabase writes
   - Verify error handling
   - Verify deduplication

4. **Approval checkpoint**
   - Both workflows active in n8n
   - All tests passing
   - Ready for first contractor demo

---

## Success Definition

**Phase 1 is complete when:**
- ✅ Both n8n workflows live and tested
- ✅ SMS sends within target times (< 2 sec / < 60 sec)
- ✅ All actions logged to Supabase (audit trail complete)
- ✅ Deduplication working (24-hour window enforced)
- ✅ Error handling proven (simulated failures don't crash workflow)
- ✅ Ready for first contractor to test with real data

**Expected timeline:** 4-8 hours of implementation (includes testing)

---

## Why This Matters

These two workflows aren't just features. They're:
1. **Proof of concept** for the agent product
2. **Revenue generators** ($8,600/month per contractor)
3. **Foundation for Phase 2** (agent will call these workflows)
4. **Moat builder** (contractors see ROI immediately, trust the system)

Get Phase 1 right = Phase 2+ becomes feasible.
Phase 1 doesn't work = entire product fails.

**No pressure, but nail this.** 🎯

---

**Document created:** 2026-03-15, Session 4 end
**Status:** Ready for next implementation session
**Next owner:** The agent team building the workflows
**Critical dependency:** User provides filled `.env` file before starting
