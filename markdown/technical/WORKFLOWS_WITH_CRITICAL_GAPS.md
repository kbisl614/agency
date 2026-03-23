# HVAC AI Operations — Complete Workflow Architecture with Critical Gap Resolution
**Last Updated:** 2026-03-15
**Status:** CRITICAL GAPS IDENTIFIED — MUST IMPLEMENT BEFORE FIRST CLIENT

---

## ⚠️ CRITICAL: Read This First

**Five architectural gaps will cause product failure or churn if not implemented during the initial build.** These are NOT phase 2 items. They are embedded into Phase 1 below with **[CRITICAL GAP]** markers.

1. **Missed Call → SMS Recovery** ($3,900/month lost revenue)
2. **Multi-turn SMS Threading** (differentiator vs HCP)
3. **Revenue Impact on Every Action** (prevents churn from incomplete ROI visibility)
4. **SMS-Only Tech Constraint** (prevents future UX mistakes)
5. **Jobber API Error Handling** (reliability requirement)

---

## Part 1: Architecture Overview (with gap requirements)

### The Hybrid Agent Model

Each agent = one n8n workflow + one Claude API call. Two workflow types:

**1. Independent (direct triggers, no orchestrator):**
- Cancellation fill → `job_canceled` webhook
- Review request → `job_completed` webhook
- Invoice chaser → daily 8 AM schedule
- **[CRITICAL GAP]** Missed call SMS → SignalWire missed call webhook
- Daily summary → 7 AM schedule
- Seasonal outreach → monthly schedule

**2. Orchestrated (ambiguous input → router decides → delegates):**
- Inbound SMS handler → all customer replies (with **[CRITICAL GAP]** full conversation threading)
- New lead router → all new leads
- Dispatch router → lead capture → dispatch → notification

### Claude API Integration with Confidence Tiers

Every Claude call (via n8n HTTP Request node) returns structured JSON:

```json
{
  "action": "send_sms",
  "urgency_score": 9,
  "response_text": "Hi! We got your message...",
  "confidence": 0.94,
  "revenue_impact": 150,
  "confidence_tier": "auto_execute"
}
```

**[CRITICAL GAP] Confidence tier definition (MUST define before building):**

| Confidence | Action | Dashboard Display |
|---|---|---|
| 85%+ | Auto-execute immediately | ✅ Action completed (94% confidence) |
| 70–84% | Auto-execute with dashboard flag | ⚠️ Action completed (72% confidence, review) |
| Below 70% | Escalate to owner, pause action | 🔴 Requires your approval (68% confidence) |

---

## Part 2: Supabase Schema with Gap Requirements

### Core Tables (MVP — universal across verticals)

**`leads` table:**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  customer_name TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  urgency_score INTEGER,
  service_type TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,                            -- 'after_hours' | 'missed_call' | etc.
  conversation_id UUID,                   -- [CRITICAL GAP #2]
  thread_history JSONB DEFAULT '[]',      -- [CRITICAL GAP #2]
  revenue_impact NUMERIC DEFAULT 0,       -- [CRITICAL GAP #3]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`actions` table:**
```sql
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  action_type TEXT NOT NULL,
  description TEXT,
  revenue_impact NUMERIC NOT NULL DEFAULT 0,   -- [CRITICAL GAP #3] REQUIRED
  confidence_score NUMERIC,                     -- [CRITICAL GAP #3]
  confidence_tier TEXT,                         -- [CRITICAL GAP #3]
  agent_name TEXT,
  lead_id UUID REFERENCES leads(id),
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`waitlist` table:**
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  customer_name TEXT,
  phone TEXT NOT NULL,
  service_type TEXT,
  location TEXT,
  last_contacted TIMESTAMPTZ,
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`error_log` table — [CRITICAL GAP #5] required for Jobber fallback:**
```sql
CREATE TABLE error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  api_name TEXT,        -- 'jobber' | 'signalwire' | 'supabase'
  error_code TEXT,
  error_message TEXT,
  workflow_name TEXT,
  retry_count INTEGER DEFAULT 0,
  status TEXT,          -- 'failed' | 'retrying' | 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 3: Phase 1 Build Order (with Critical Gaps Embedded)

### Week 1: Foundation + Critical Gaps #1, #3, #4

#### 1.1 — n8n: After-Hours Lead Capture (Workflow 1)
**HVAC: After-Hours Lead Capture via SMS**

Trigger: SignalWire inbound SMS webhook

- Input: phone, message, timestamp
- n8n HTTP Request node → Claude API (returns structured JSON)
- **[CRITICAL GAP #3]** JSON includes `revenue_impact` field
- **[CRITICAL GAP #4]** SMS-only constraint: "Tech-facing workflows must be single SMS only. No app opens."
- Output: JSON with action, confidence, confidence_tier, revenue_impact
- Send SignalWire SMS + insert Supabase `leads` row + insert `actions` row

```
SignalWire webhook → n8n
         ↓
Claude API: urgency_score + service_type + response_text
         ↓
If confidence > 0.85: send SMS response
         ↓
[CRITICAL GAP #3] Supabase: insert into leads + insert action (revenue_impact = $150)
```

---

#### 1.2 — n8n: MISSED CALL RECOVERY (Workflow 2b — NEW)
**[CRITICAL GAP #1] This workflow did not exist in original roadmap. BUILD THIS IN WEEK 1.**

Trigger: SignalWire missed call webhook

```
Missed call webhook from SignalWire
         ↓
Extract caller phone number
         ↓
Supabase query: Is this customer in leads table (created today)?
         ↓
If returning customer:
  → Query recent service history
  → Claude personalizes: "Hey, we just missed your call.
     Last time we helped with your [system]. What's going on now?"
         ↓
If new customer:
  → Generic warm response: "Hey, we just missed your call —
     we're on a job. What's going on with your system?
     We'll get back to you within the hour."
         ↓
[CRITICAL GAP #3] Supabase: insert action (revenue_impact = $300)
[CRITICAL GAP #1] SMS sent within 60 seconds from webhook receipt
         ↓
Create conversation_id, store in leads table
         ↓
Wait for reply (goes to Workflow 9: SMS Inbound Handler)
```

**Revenue impact:** $3,900/month (27% of calls go unanswered = 13 calls/month × $300 avg)
**n8n Workflow ID:** `EjrtbF205kPsOCxO`

---

#### 1.3 — n8n: AUDIT TRAIL / ACTION LOGGING (Workflow 3)
**Log Every Action with Revenue Impact**

Trigger: Called by every other workflow on completion

```
Workflow X completes → sends JSON:
  { action_type, description, confidence, revenue_impact, ... }
         ↓
[CRITICAL GAP #3] Validate revenue_impact is present and >= 0
[CRITICAL GAP #3] Validate confidence_score is present
         ↓
Calculate confidence_tier:
  IF confidence >= 0.85: auto_execute
  IF confidence 0.70–0.84: auto_with_flag
  IF confidence < 0.70: escalated
         ↓
Supabase: INSERT INTO actions (...) VALUES (...)
         ↓
Flag for dashboard (actions < 70% confidence show red)
```

---

#### 1.4 — n8n: API ERROR HANDLING (Workflow 4)
**[CRITICAL GAP #5] Add error branches to ALL Jobber API calls**

Every Jobber API call structure:
```
n8n node: HTTP Request to Jobber
         ↓
IF success:
  → Proceed normally
  → Log action with revenue_impact
         ↓
IF error (timeout, rate limit, auth failure):
  → [CRITICAL GAP #5] Supabase: INSERT INTO error_log (...)
  → [CRITICAL GAP #5] Send contractor dashboard notification:
     "Jobber connection issue — [workflow name] paused.
      We're retrying automatically."
  → Retry: immediate → +5s → +10s → escalate owner email
  → Dashboard shows error status (not silent failure)
```

---

#### 1.5 — Next.js Dashboard: Live Action Feed
- Reads from Supabase `actions` table (realtime or polling)
- Shows:
  - ✅ SMS sent (94% confidence)
  - ⚠️ SMS sent with flag (72% confidence, review)
  - 🔴 Pending approval (68% confidence)
  - 💰 Revenue impact: +$150
- Running total: "$4,200 this month from automation"
- **[CRITICAL GAP #3]** Confidence score visible on every action

---

### Week 2: Jobber Integration + Error Handling

#### 2.1 — Jobber Webhook Listener (Workflow 5)
Trigger: `job_created`, `job_canceled`, `job_completed`

```
Jobber webhook received (event: job_canceled)
         ↓
[CRITICAL GAP #5] Wrap in error handling
         ↓
Extract: job_id, customer_id, job_date, tech_assigned
         ↓
Route by event type (separate workflow for each)
         ↓
[CRITICAL GAP #5] Log to error_log if webhook processing fails
```

---

#### 2.2 — Cancellation Fill Workflow (Workflow 6)
Trigger: `job_canceled` webhook

```
Job canceled webhook
         ↓
[CRITICAL GAP #5] Error handling wrapper
         ↓
Supabase: Query waitlist WHERE service_type matches AND last_contacted > 24h
         ↓
Claude decides: Which customer gets offered this slot?
         ↓
[CRITICAL GAP #3] revenue_impact = $175 (avg cancellation recovery job)
[CRITICAL GAP #3] confidence_score from Claude response
         ↓
SignalWire SMS: "Hey, an opening just became available
          on [date] in [your_area]. Interested?"
         ↓
Supabase: INSERT INTO actions (...)
         ↓
Wait for reply → Workflow 9 (SMS inbound handler)
```

---

### Week 3: SMS Orchestration + Multi-Turn Threading

#### 3.1 — Inbound SMS Handler (Workflow 9)
**[CRITICAL GAP #2] Implement multi-turn conversation threading**

Trigger: SignalWire inbound SMS (customer reply)

```
Inbound SMS from SignalWire
         ↓
Extract: phone, message, timestamp
         ↓
Supabase: SELECT * FROM leads WHERE phone = $phone ORDER BY created_at DESC LIMIT 1
         ↓
[CRITICAL GAP #2] Query previous messages in this conversation:
  SELECT thread_history FROM leads WHERE conversation_id = $conv_id
         ↓
Build context for Claude:
  Previous messages: [
    "Can you do Thursday?",
    "What's the earliest?",
    "Is 2pm okay?"
  ]
  New message: "2pm works"
         ↓
Claude receives FULL THREAD HISTORY (not just latest message)
         ↓
Claude classifies:
  - Booking confirmation?
  - Question (needs answer)?
  - Schedule change?
  - Escalate to tech?
         ↓
Response is contextually aware of entire conversation
         ↓
[CRITICAL GAP #3] revenue_impact = varies by action
[CRITICAL GAP #3] Log confidence_score
         ↓
Send SignalWire response or escalate
         ↓
Supabase: append new message to thread_history jsonb array
```

---

### Week 4: Independent Workflows

#### 4.1 — Invoice Chaser (Workflow 7)
Trigger: Daily 2 PM schedule

```
[CRITICAL GAP #5] Error handling wrapper
↓
Jobber API: GET unpaid invoices from last 30 days
↓
For each unpaid invoice:
  SignalWire SMS: "Hi [name], just following up on the
    [job_description] invoice from [date].
    Payment details: [link]"
  [CRITICAL GAP #3] Supabase: INSERT action (revenue_impact = invoice_amount)
↓
Check 48h later if paid
```

---

#### 4.2 — Daily Owner Summary (Workflow 12)
Trigger: Daily 7 AM schedule

```
[CRITICAL GAP #5] Error handling wrapper
↓
Supabase: SELECT SUM(revenue_impact), COUNT(*), ... FROM actions
  WHERE created_at > NOW() - INTERVAL '24 hours'
↓
Email to contractor:
  "Yesterday: $412 in revenue captured. 5 actions, all at 92%+ confidence.
   This month: $4,200 total. Conversion rate: 34%."
↓
[CRITICAL GAP #3] Supabase: INSERT action (revenue_impact = 0, action_type = 'daily_summary')
```

---

## Part 4: Business-Level Gaps (CRITICAL BEFORE FIRST CLIENT)

### Gap: No Client Onboarding Checklist

**[CRITICAL] Must exist before first client signs.**

Create `docs/client-onboarding-checklist.md`:

```
CLIENT ONBOARDING CHECKLIST
Total time: 2–3 hours

BEFORE MEETING:
☐ Contractor signed engagement agreement
☐ Contractor has active Jobber account
☐ You have admin access to their Jobber
☐ SignalWire account created + number assigned
☐ Supabase project set up for this client (or multi-client schema with client_id)

DAY 1 (Setup call — 1.5 hours):
☐ Walk through: What the system will do (demo)
☐ Jobber API key: Get from contractor admin, test connection
☐ SignalWire webhook: Test inbound SMS, show dashboard response in real-time
☐ Dashboard walkthrough: Show them the Actions feed, explain revenue_impact
☐ First test: Have them text the SignalWire number, show SMS response in 30 seconds
☐ Confirm: Which workflows active on day 1? (lead capture + missed call + summary only)
☐ Set expectations: "First 7 days, system learns your voice. Some responses might be generic."

DAY 2–7 (Monitoring):
☐ Daily email: Send them morning summaries
☐ Check-in call (day 3): How's it feeling? Any missed responses?
☐ Manual review: You read first 20 SMS responses for quality

DAY 8–30 (Optimization):
☐ Activate: Cancellation fill workflow
☐ Activate: Invoice chaser
☐ Weekly calls: Fine-tune confidence thresholds, discuss ROI
☐ Day 30: Present "Your first month" report (attach all Actions, ROI total)
```

---

### Gap: No Cancellation Policy

**[CRITICAL] Share this at signup — it's a differentiator.**

```
CANCELLATION POLICY

You can cancel anytime. No questions asked. 30-day notice required.

When you cancel:
- Your data stays yours. We'll export all leads, actions, and waitlist
  to CSV within 24 hours.
- We'll disconnect our systems from your Jobber account and disable
  our API token.
- Final month is prorated to the day of cancellation.
- No setup fees are refunded (they cover infrastructure + integration).
```

---

### Gap: Client Health Monitoring (Admin View)

**[CRITICAL] Build this logic before first client goes live.**

Admin dashboard should flag:

```
FOR EACH CLIENT:
☐ Last 48 hours: actions count > 0?
  → If 0: FLAG RED "System inactive — debug immediately"

☐ Week-over-week: actions trend?
  → If declining 20%+: FLAG YELLOW "Activity declining — check-in call scheduled"

☐ Revenue_impact tracked?
  → If zero: FLAG RED "Revenue not being logged — audit trail incomplete"

☐ Confidence_tier breakdown?
  → If >30% escalated: FLAG YELLOW "High escalation rate — Claude confidence low"

☐ Churn risk at day 28?
  → If revenue_impact < $1,200: FLAG RED "Below ROI threshold — demo month might cancel"
```

---

## Part 5: Revised Build Checklist (Phase 1)

### Week 1
- [ ] **[CRITICAL GAP #3]** Run SUPABASE_SCHEMA.sql with revenue_impact, confidence_score, confidence_tier columns
- [ ] **[CRITICAL GAP #4]** Document SMS-only constraint in agent-ops.md
- [ ] **[CRITICAL GAP #1]** Build Workflow 2b: Missed Call → SMS Recovery (SignalWire webhook + Claude + SignalWire SMS)
- [ ] Workflow 1: After-hours lead capture
- [ ] Workflow 3: Audit trail with **[CRITICAL GAP #3]** revenue_impact logging
- [ ] Workflow 4: **[CRITICAL GAP #5]** API error handling wrapper + error_log table
- [ ] Next.js dashboard: Action feed with confidence_score visible
- [ ] Test: Full end-to-end (lead → SMS in 30 seconds, action logged with revenue)

### Week 2
- [ ] **[CRITICAL GAP #5]** Jobber API error handling on all calls
- [ ] Workflow 5: Jobber webhook listener
- [ ] Workflow 6: Cancellation fill
- [ ] Test: Job cancellation → SMS to waitlist in 60 seconds, logged with $175 revenue_impact

### Week 3
- [ ] **[CRITICAL GAP #2]** Verify conversation_id, thread_history columns in Supabase leads table
- [ ] **[CRITICAL GAP #2]** Workflow 9: Inbound SMS handler with multi-turn threading
- [ ] Test: Multi-message SMS thread, responses aware of context

### Week 4
- [ ] Workflow 7: Invoice chaser
- [ ] Workflow 12: Daily owner summary
- [ ] Create: Client onboarding checklist
- [ ] Create: Cancellation policy document
- [ ] Create: Client health monitoring dashboard logic

### Demo-Ready Requirements
- ✅ Lead comes in → SMS response in 30 seconds
- ✅ Missed call → SMS within 60 seconds
- ✅ Every action logged with revenue_impact ($150, $300, $175, etc.)
- ✅ Every action shows confidence_score and confidence_tier
- ✅ Dashboard shows running month total: "This month: $4,200 recovered"
- ✅ Multi-turn SMS: Follow-up message shows context awareness
- ✅ Jobber API error: Shows "Connection issue — retrying" instead of silent failure
- ✅ Onboarding checklist exists
- ✅ Cancellation policy in place

---

## Part 6: Why These Gaps Matter

### Missing Missed Call Workflow
- **Cost:** $3,900/month in lost revenue per client
- **Demo impact:** You can only show $4,700 ROI instead of $8,600

### Missing Multi-Turn SMS Threading
- **Cost:** Product feels like a script, not a system
- **Churn risk:** "HCP Assist can do this already"

### Missing Revenue Impact Logging
- **Cost:** Dashboard shows incomplete ROI
- **Churn risk:** Contractor sees "$150 from one lead" instead of "$4,200 this month"

### Missing API Error Handling
- **Cost:** Silent failures when Jobber is down
- **Churn risk:** "I thought it was working but nothing happened for 3 days"

### Missing SMS-Only Constraint Doc
- **Cost:** Future developer adds a workflow that requires tech to open an app

---

## Status: READY FOR IMPLEMENTATION

Architecture is sound. Supabase is the data store. SignalWire is the SMS provider. n8n is the decision engine. Claude API is called directly from n8n HTTP Request nodes.

---

*Last updated: 2026-03-15 | Airtable/FastAPI/Twilio references removed — Supabase/SignalWire only*
