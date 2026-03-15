# HANDOFF — n8n Workflows (Agency)
# READ THIS FIRST if working on workflow implementation or configuration
# IMPORTANT: These workflows are Phase 1 of an AI Operations Agent product

---

## Product Context

**This isn't just workflow automation — it's the foundation for an AI agent.**

These two Tier 1 workflows power the "HVAC Operations Agent" that contractors will ask questions to:
- **Phase 1 (Now)**: Event-driven workflows (SMS capture + missed calls)
- **Phase 2 (Month 2)**: Add agent reasoning layer (Claude decision-making + data querying)
- **Phase 3+ (Month 3+)**: Full autonomous advisor (strategic insights, optimization)

The workflows you're building will be called by:
- **Phase 1**: Webhooks (Twilio SMS, Jobber missed calls)
- **Phase 2+**: Claude agent (via n8n Code node → HTTP requests to trigger workflows)

Design them to be modular and easily callable by agent logic.

---

## Project Context

**Business Model:** AI Operations Agency (relationship-first, HVAC contractors)
**Phase:** Phase 1 Demo (Tier 1 only)
**Scope:** 2 core workflows + 1 audit trail logging pattern
**Status:** Design complete, ready for n8n implementation
**Agent Vision**: These workflows are building blocks for autonomous decision-making in Phase 2

---

## Tier 1 Workflows — Hero 1-2 Punch

We have **2 production workflows** that form the foundation of Phase 1 demo:

### **Workflow #1: tier1_after_hours_lead_capture.json**

**Purpose:** Capture SMS leads arriving after 7pm with instant Claude qualification + SMS response

**Business Value:**
- Responds to customers while they're engaged (evening emergencies)
- Agent will later use this data to identify "best time to reach out" patterns
- Feeds into Phase 2 "intelligent outreach timing" agent

**Trigger:** Twilio webhook (inbound SMS)

**Flow:**
```
1. Twilio SMS arrives → n8n webhook POST
2. Extract: { phone, message, timestamp }
3. HTTP POST to FastAPI /leads/qualify
4. Claude API response: { action, urgency_score, service_type, response_text, confidence }
5. Confidence threshold check:
   - If confidence > 0.85:
     → Send SMS response via Twilio
     → Create Lead record in Supabase
     → Log action to Actions table (success)
   - If confidence ≤ 0.85:
     → Log action to Actions table (human_review_needed)
     → STOP (do not send SMS)
6. Error handler: catch failures, log to Actions table
```

**Critical Details:**
- **Confidence threshold: 0.85** — Only auto-send when highly confident
- **Response time target: < 2 seconds** — After-hours advantage
- **SMS template:** Use response_text from Claude (customized per lead)
- **Supabase write:** Leads table + Actions table (dual write for audit trail)
- **Error handling:** Log failures with error_message field

**Dependencies:**
- Twilio account with SMS webhook enabled
- FastAPI backend running at deployed URL
- Supabase base + API key + table names in n8n credentials
- Claude API key (managed by FastAPI backend)

**Testing:**
- Send test SMS to Twilio number after 7pm
- Verify: SMS response within 2 seconds
- Verify: Lead record created in Supabase with correct phone + message
- Verify: Action logged in Actions table with confidence score

**Future Agent Integration (Phase 2):**
- Agent will query this data to answer: "What leads came in after hours?"
- Agent will analyze patterns: "Best response time?" "Best message format?"
- Agent will trigger this workflow on demand: "Send recovery SMS to this customer"

---

### **Workflow #2: tier1_missed_call_recovery_sms.json**

**Purpose:** Recover daytime missed calls with instant SMS response ($3,900/month revenue)

**Business Value:**
- Captures leads that traditional systems ignore
- Deduplication prevents SMS spam (maintains trust)
- Agent will later identify "missed call patterns" (which hours, which days, which tech?)
- Feeds into Phase 2 "dispatch optimization" agent

**Trigger:** Jobber missed call webhook OR Twilio missed call event

**Flow:**
```
1. Jobber detects missed call → webhook POST to n8n
   OR
   Twilio missed call event → webhook POST to n8n
2. Extract: { phone, timestamp, caller_id (optional) }
3. DEDUPLICATION CHECK:
   → Query Supabase Leads table:
      "Find leads with this phone created in last 24 hours"
   → If found: SKIP (don't send duplicate SMS)
   → If not found: PROCEED
4. HTTP POST to FastAPI /webhooks/missed-call
5. Claude response: { action, should_send, response_text, confidence }
6. Send decision check:
   - If should_send = true AND confidence > 0.8:
     → Send SMS: "Hey, we just missed your call — what's up with your system? We'll get back to you within the hour."
     → Create Lead record with source = "missed_call_recovery"
     → Log action (success)
   - If should_send = false OR confidence ≤ 0.8:
     → Log action (skipped, not confident)
     → STOP
7. Error handler: log failures, prevent SMS spam
```

**Critical Details:**
- **Deduplication is essential** — Prevent duplicate SMS to same caller same day
- **Confidence threshold: 0.8** — Slightly more lenient than after-hours (missed calls are proven leads)
- **Response time target: < 60 seconds** — Recovery window before caller moves on
- **SMS template:** Fixed message (testing shows this works best)
- **Lead source: "missed_call_recovery"** — Distinct from after_hours_sms
- **Supabase writes:** Leads table + Actions table (dual write)
- **Error handling:** Log failures without sending SMS (safe default)

**Dependencies:**
- Jobber webhook configured for missed call events (OR Twilio missed call webhook)
- FastAPI backend running at deployed URL
- Supabase base + API key + table names in n8n credentials
- Claude API key (managed by FastAPI backend)

**Testing:**
- Trigger test missed call (Jobber or Twilio)
- Verify: SMS response within 60 seconds
- Verify: Lead record created with source = "missed_call_recovery"
- Verify: Action logged in Actions table
- Send second missed call from same number: verify NO duplicate SMS
- Wait 24+ hours, send third missed call from same number: verify SMS sent (dedup window expired)

**Testing Without Jobber API Key:**
- Use curl/Postman to POST to n8n webhook with mock missed call data
- See `docs/JOBBER_TESTING_MOCK.md` for examples
- Once user gets Jobber API access, just switch from mock to real webhooks (no code changes needed)

**Future Agent Integration (Phase 2):**
- Agent will query: "How many missed calls today? Which hours?"
- Agent will analyze: "This tech missed 5 calls, my other tech caught 0. Why?"
- Agent will trigger: "Send recovery SMS to these 3 missed calls from this morning"
- Agent will optimize: "Dispatch 2nd tech during peak call hours next week"

---

## Workflow Architecture Patterns

### **HTTP Request to FastAPI**

Both workflows use HTTP POST to FastAPI backend. Structure:

**After-Hours Workflow:**
```json
POST /leads/qualify
{
  "phone": "+1234567890",
  "message": "My AC went out, it's 95 degrees",
  "is_new_customer": true
}
```

**Missed Call Workflow:**
```json
POST /webhooks/missed-call
{
  "phone": "+1234567890",
  "timestamp": "2026-03-14T14:32:00Z"
}
```

Both return JSON with `confidence`, `should_send`, `response_text` fields.

### **Supabase Logging Pattern (Audit Trail)**

Every workflow writes to **2 tables**:

**1. Leads table** (customer data — feeds agent queries)
```
phone, message, urgency_score, service_type, status, source, created_at, updated_at
```

**2. Actions table** (audit trail — retention + agent intelligence)
```
timestamp, action_type, description, agent_name, confidence_score, revenue_impact,
success, error_message, lead_id, sms_sid
```

**action_type values:**
- `sms_sent` — SMS successfully sent
- `lead_created` — Lead record created
- `human_review_needed` — Flagged for human review (low confidence)
- `sms_failed` — SMS send failed
- `skipped_duplicate` — Dedup logic skipped this call

**agent_name values:**
- `tier1_after_hours_capture` — After-hours workflow
- `tier1_missed_call_recovery` — Missed call workflow

**revenue_impact:** $150 for captured lead, $0 for logs/skipped actions

### **Error Handling Strategy**

Both workflows have error handlers that:
1. Catch HTTP failures (FastAPI down, network error)
2. Catch Supabase write failures
3. Catch SMS send failures
4. Log error + error_message to Actions table
5. DO NOT send SMS on error (safe default)
6. Do not crash — allow operator to see what failed

---

## n8n Credentials & Configuration

### **Required Credentials in n8n**

1. **HTTP (FastAPI)**
   - Base URL: `https://api.yourbackend.com` (from .env FASTAPI_BASE_URL)
   - Auth: None (public endpoint) OR Bearer token (if secured)

2. **Supabase**
   - Project URL: From .env SUPABASE_PROJECT_URL
   - API Key: From .env SUPABASE_ANON_KEY
   - Service Role Key: From .env SUPABASE_SERVICE_ROLE_KEY
   - Table names: `leads`, `actions`

3. **Twilio**
   - Account SID: From .env TWILIO_ACCOUNT_SID
   - Auth Token: From .env TWILIO_AUTH_TOKEN
   - Phone number: From .env TWILIO_PHONE_NUMBER

4. **Jobber** (Phase 2, but webhook secret needed now)
   - Webhook URL: n8n trigger URL (generated when workflow created)
   - Webhook Secret: From Jobber account settings (when API available)

---

## Workflow Implementation Checklist

### **Before Building:**
- [ ] FastAPI backend deployed and /health endpoint returns 200
- [ ] Supabase project created with Leads + Actions tables (run schema SQL)
- [ ] Twilio account active, phone number assigned, webhook capability enabled
- [ ] n8n Cloud instance running
- [ ] All credentials in .env file

### **Building Workflow #1 (After-Hours):**
- [ ] Create webhook trigger node (Twilio POST)
- [ ] Extract data from webhook (phone, message, timestamp)
- [ ] Add HTTP node → POST to FastAPI /leads/qualify
- [ ] Parse Claude response (JSON)
- [ ] Add conditional: confidence > 0.85?
- [ ] YES branch: Create Lead in Supabase, Send SMS, Log action
- [ ] NO branch: Log action (human_review_needed), STOP
- [ ] Add error handler: catch all, log to Actions table
- [ ] Test with SMS to Twilio number

### **Building Workflow #2 (Missed Call):**
- [ ] Create webhook trigger node (Jobber missed call OR mock POST)
- [ ] Extract data from webhook (phone, timestamp)
- [ ] Add Supabase Query node: find leads by phone from last 24h
- [ ] Add conditional: any leads found?
- [ ] YES: Log action (skipped_duplicate), STOP
- [ ] NO: Continue to FastAPI call
- [ ] HTTP node → POST to FastAPI /webhooks/missed-call
- [ ] Parse Claude response
- [ ] Add conditional: should_send = true AND confidence > 0.8?
- [ ] YES branch: Create Lead, Send SMS, Log action
- [ ] NO branch: Log action (skipped), STOP
- [ ] Add error handler: catch all, log to Actions table
- [ ] Test with Jobber missed call event OR curl/Postman mock

### **Webhook Configuration:**
- [ ] Generate n8n webhook URLs for both workflows
- [ ] Copy URLs to .env (N8N_AFTER_HOURS_WEBHOOK_URL, N8N_MISSED_CALL_WEBHOOK_URL)
- [ ] Configure Twilio to POST to after-hours workflow webhook
- [ ] Configure Jobber to POST to missed call workflow webhook (Phase 2+)
- [ ] For testing: use curl/Postman mocks (see JOBBER_TESTING_MOCK.md)

### **Testing Before Deploy:**
- [ ] Trigger after-hours workflow: SMS → response within 2 sec + Supabase logged
- [ ] Trigger missed call workflow: webhook → SMS within 60 sec + Supabase logged
- [ ] Test deduplication: send missed call twice, verify only 1 SMS sent
- [ ] Test error handling: shut down FastAPI, verify workflow logs error without crashing
- [ ] Test confidence filtering: low confidence lead, verify no SMS sent

### **Deployment:**
- [ ] Deploy n8n workflows (activate both)
- [ ] Verify webhooks are receiving events
- [ ] Run end-to-end test with real Twilio number
- [ ] Run end-to-end test with real Jobber account OR test webhook
- [ ] Monitor Actions table: verify all events logged

---

## Key File References

**For Implementation Details:**
- `updated-files/2026-03-14-phase1-tier1-implementation.md` → Full workflow specs
- `docs/TIER1_WORKFLOW_REFERENCE.md` → Workflow diagrams + demo script
- `docs/SUPABASE_SCHEMA.sql` → Database schema (copy-paste ready)

**For Backend Dependencies:**
- `docs/agent-ops.md` → FastAPI endpoint specs
- `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` → Claude prompts

**For Testing:**
- `docs/JOBBER_TESTING_MOCK.md` → How to test without Jobber API key
- `docs/CREDENTIAL_SETUP_GUIDE.md` → Where to get each credential

---

## Common Issues & Solutions

### **Issue: Workflow fires but SMS not sent**
- Check: Is confidence score above threshold? (0.85 for after-hours, 0.8 for missed calls)
- Check: FastAPI endpoint returning valid JSON?
- Check: Twilio credentials correct in n8n?
- Solution: Enable logging on HTTP node, review request/response

### **Issue: Duplicate SMS being sent to same caller**
- Check: Deduplication query in missed call workflow returning correct results
- Check: Supabase query filtering by phone + created_at in last 24 hours
- Solution: Verify Supabase API permissions, test query manually in n8n

### **Issue: High latency (> 2 sec for after-hours, > 60 sec for missed call)**
- Check: FastAPI backend response time (profile /leads/qualify endpoint)
- Check: n8n workflow execution logs (identify slow node)
- Check: Network latency between n8n and FastAPI
- Solution: May need to optimize Claude API calls or add caching

### **Issue: Supabase write failures**
- Check: API key still valid
- Check: Table names correct (leads, actions)
- Check: Workflow has permission to write to Supabase
- Solution: Refresh Supabase credentials in n8n

---

## Phase 2 Workflow Additions (After First Client)

Once Phase 1 is live with real contractor data, these workflows get added:

1. **Cancellation Fill** — Auto-SMS waitlist when job cancels
2. **Daily Summary Email** — Morning recap of actions + ROI
3. **Invoice Reminders** — Chase unpaid invoices via SMS
4. **Review Requests** — Auto-SMS 30 min after job completion

All follow same pattern:
- Jobber webhook trigger
- Claude classification
- Conditional execution
- Supabase logging (Actions table)
- SMS send (if qualified)

**Agent Integration (Phase 2+):**
- Agent will query: "What's tomorrow's schedule? Any high-value opportunities?"
- Agent will trigger: "Send review requests to these 5 jobs"
- Agent will optimize: "These customers respond better to emails, not SMS"

---

## How to Update This File

At the end of each implementation session, update:
- [ ] What workflows were built/tested
- [ ] What issues were encountered
- [ ] What config changes were made
- [ ] What's ready for Phase 2
- [ ] Any learnings about agent integration

**This keeps the workflow handoff current for next sessions.**

---

**Last Updated:** 2026-03-15 (Session 4)
**Status:** Ready for n8n implementation
**Product Vision:** Phase 1 foundation for AI Operations Agent
