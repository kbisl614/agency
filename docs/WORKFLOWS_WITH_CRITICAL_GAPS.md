# HVAC AI Operations — Complete Workflow Architecture with Critical Gap Resolution
**Last Updated:** March 14, 2026  
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
- **[CRITICAL GAP]** Missed call SMS → Twilio missed call webhook
- Daily summary → 7 AM schedule
- Seasonal outreach → monthly schedule

**2. Orchestrated (ambiguous input → router decides → delegates):**
- Inbound SMS handler → all customer replies (with **[CRITICAL GAP]** full conversation threading)
- New lead router → all new leads
- Dispatch router → lead capture → dispatch → notification

### Claude API Integration with Confidence Tiers

Every Claude call returns structured JSON:

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

## Part 2: Airtable Schema with Gap Requirements

### Core Tables (MVP — universal across verticals)

**Leads Table:**
```
lead_id, client_id, customer_name, phone, message, urgency_score, 
service_type, status, [CRITICAL GAP: conversation_id], 
[CRITICAL GAP: thread_history], timestamp, [CRITICAL GAP: revenue_impact]
```

**Actions Table:**
```
action_id, client_id, action_type, description, 
[CRITICAL GAP: revenue_impact (REQUIRED on EVERY record)], 
[CRITICAL GAP: confidence_score], 
[CRITICAL GAP: confidence_tier],
agent_name, timestamp, jobber_event_id, status
```

**Waitlist Table:**
```
waitlist_id, client_id, customer_name, phone, service_type, 
location, last_contacted, [CRITICAL GAP: conversation_id]
```

**[CRITICAL GAP] API Error Log Table (NEW — required for Jobber fallback):**
```
error_id, client_id, api_name (jobber|twilio|etc), 
error_code, error_message, workflow_name, 
retry_count, status (failed|retrying|resolved), timestamp
```

---

## Part 3: Phase 1 Build Order (with Critical Gaps Embedded)

### Week 1: Foundation + Critical Gaps #1, #3, #4

#### 1.1 — FastAPI Endpoint: POST /leads/qualify
- Input: phone, message, service_type
- Calls Claude with system prompt
- **[CRITICAL GAP #3]** Returns structured JSON including `revenue_impact` field
- **[CRITICAL GAP #4]** Document SMS-only constraint in code comments: "Tech-facing workflows must be single SMS only. No app opens. Confirmation = SMS reply YES."
- Output: JSON with action, confidence, confidence_tier, revenue_impact

#### 1.2 — Twilio Setup + Testing
- Receive SMS webhook on endpoint
- Parse sender phone + message
- Route to appropriate workflow

#### 1.3 — n8n Workflow: POST /leads/qualify (Workflow 1)
**HVAC: After-Hours Lead Capture via SMS/Web**

Trigger: New lead from web form OR SMS lead at after-hours
```
Web lead received → FastAPI /leads/qualify
                 ↓
Classify: Emergency or routine?
                 ↓
If emergency: Response text + urgency 9
If routine: Response text + urgency 5
                 ↓
[CRITICAL GAP #3] Log to Actions table with revenue_impact = $150
                 ↓
Send SMS response via Twilio
                 ↓
Log action to Airtable (timestamp, revenue_impact, confidence_score)
```

**Key requirement:** Every action logs revenue_impact = $150 (avg emergency job value).

---

#### 1.4 — n8n Workflow: MISSED CALL RECOVERY (Workflow 2b — NEW)
**[CRITICAL GAP #1] This workflow does not exist in current roadmap. BUILD THIS IN WEEK 1.**

Trigger: Twilio missed call webhook (inbound call went unanswered during business hours)

```
Missed call webhook received from Twilio
                 ↓
Extract caller phone number
                 ↓
Query Airtable Leads table: Is this customer on file?
                 ↓
If returning customer:
  → Query recent service history from Jobber
  → Claude personalizes: "Hey [name], we just missed your call. 
     Last time we serviced your [system]. What's going on now?"
                 ↓
If new customer:
  → Send generic but warm: "Hey, we just missed your call — 
     we're on a job. What's going on with your system? 
     We'll get back to you within the hour."
                 ↓
[CRITICAL GAP #3] Log to Actions with revenue_impact = $300 (avg missed emergency job)
[CRITICAL GAP #1] SMS sent within 60 seconds from webhook receipt
                 ↓
Create conversation_id and store in Leads table
                 ↓
Wait for reply (goes to Workflow 2: SMS Inbound Handler)
```

**Revenue impact:** $3,900/month documented (27% of calls go unanswered = 13 calls/month × $300 avg).

**Why this is critical:** Doubles your ROI pitch from $4,700 to $8,600/month without raising retainer price. Must be demo-ready for first client.

**Technical complexity:** Trivial (Twilio webhook + Claude call + SMS out).

---

#### 1.5 — n8n Workflow: AUDIT TRAIL / ACTION LOGGING (Workflow 3 — REDESIGNED)
**HVAC: Log Every Action with Revenue Impact**

Trigger: Every workflow completion sends data to this workflow

```
Workflow X completes → sends JSON:
  { action_type, description, confidence, revenue_impact, ... }
                 ↓
[CRITICAL GAP #3] Validate revenue_impact is present and >0 for revenue actions
                 ↓
[CRITICAL GAP #3] Validate confidence_score is present (0–100)
                 ↓
Calculate confidence_tier:
  IF confidence >= 85: auto_execute
  IF confidence 70-84: auto_with_flag
  IF confidence < 70: escalated
                 ↓
Write to Actions table:
  - action_id (UUID)
  - client_id
  - action_type (sms_sent, lead_captured, cancellation_filled, etc.)
  - revenue_impact (REQUIRED — $0 for retention actions, $X for revenue actions)
  - confidence_score (94, 72, 68, etc.)
  - confidence_tier (auto_execute, auto_with_flag, escalated)
  - timestamp
                 ↓
Update running ROI total:
  daily_revenue_impact = SUM(Actions.revenue_impact) for that day
                 ↓
Flag for dashboard (actions <70% confidence show red on dashboard)
```

**Database requirement:** Actions table must have these fields from the start or retrofitting is expensive.

**Why this is critical:** Without this, the dashboard ROI total will be incomplete. Contractor won't see $3,900/month from missed calls or $150 from SMS responses. They'll underestimate value and churn at day 30.

---

#### 1.6 — n8n Workflow: API ERROR HANDLING (Workflow 4 — REDESIGNED)
**[CRITICAL GAP #5] Add error branches to ALL Jobber API calls**

**Why this exists:** If Jobber API is down or rate-limited, workflows fail silently. Contractor never knows. This is a reliability requirement.

Every Jobber API call structure:
```
n8n node: HTTP request to Jobber
                 ↓
IF success:
  → Proceed normally
  → Log action with revenue_impact
                 ↓
IF error (timeout, rate limit, auth failure):
  → [CRITICAL GAP #5] Log to API Error Log table
  → [CRITICAL GAP #5] Send contractor dashboard alert:
     "Jobber connection issue — [workflow name] paused. 
      We're retrying automatically."
  → Retry logic: exponential backoff (immediate, +5s, +10s, then escalate)
  → If 3 retries fail: escalate to owner email
  → Dashboard shows error status (not silent failure)
```

**Why this is critical:** Research surfaced contractor who lost $20K when HCP's system failed for 30 days. This prevents that from happening to you.

---

#### 1.7 — Next.js Dashboard: Live Action Feed
- Polls Airtable Actions table every 10 seconds
- Shows:
  - ✅ SMS sent (94% confidence)
  - ⚠️ SMS sent with flag (72% confidence, review)
  - 🔴 Pending approval (68% confidence)
  - 💰 Revenue impact: +$150
- Running total: "$4,200 this month from automation"
- **[CRITICAL GAP #3]** Confidence score visible on every action (shows reasoning to contractor)

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
[CRITICAL GAP #5] Log to API Error table if webhook processing fails
```

---

#### 2.2 — Cancellation Fill Workflow (Workflow 6 — REDESIGNED)
Trigger: `job_canceled` webhook

```
Job canceled webhook
                 ↓
[CRITICAL GAP #5] Error handling wrapper
                 ↓
Query Airtable Waitlist: Who's available in this area?
                 ↓
Claude decides: Which customer gets offered this slot?
  (confidence: how sure are we this is the right fit?)
                 ↓
[CRITICAL GAP #3] revenue_impact = $175 (avg cancelation recovery job)
[CRITICAL GAP #3] confidence_score from Claude response
                 ↓
Send SMS: "Hey, an opening just became available 
          on [date] in [your_area]. Interested?"
                 ↓
Log to Actions table with revenue_impact + confidence
                 ↓
Wait for reply → Workflow 9 (SMS inbound handler)
```

---

### Week 3: SMS Orchestration + Multi-Turn Threading

#### 3.1 — n8n Workflow: INBOUND SMS HANDLER (Workflow 9 — REDESIGNED)
**[CRITICAL GAP #2] Implement multi-turn conversation threading**

Trigger: Customer SMS reply

```
Inbound SMS from Twilio
                 ↓
Extract: phone, message, timestamp
                 ↓
Query Airtable Leads table: Find conversation_id for this phone
                 ↓
[CRITICAL GAP #2] Query previous messages in this conversation:
  SELECT * FROM Leads 
  WHERE conversation_id = X 
  ORDER BY timestamp DESC 
  LIMIT 3
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
[CRITICAL GAP #3] revenue_impact = varies by action (booking = $150, question = $0)
[CRITICAL GAP #3] Log confidence_score (how sure about this classification?)
                 ↓
Send response or escalate
```

**Why this is critical:** 

Current workflows treat each SMS as isolated. Real conversations don't work that way.
- Customer 1: "Can you do Thursday?"
- System response (without threading): Generic "Thanks for replying!"
- Customer 2: "Can you do Thursday?"  
- System response (without threading): Same generic response

**With threading:**
- Customer 1: "Can you do Thursday?" 
- System: "Yes, we can do Thursday at 2pm. Does that work?"
- Customer 1: "What about morning?"
- System (with thread context): "We could do Thursday morning at 10am instead. Better?"

This is the difference between a script and a conversation. This is what makes contractors say "it actually understands the customer."

**Database requirement:** Add `conversation_id` and `thread_history` fields to Leads table NOW. Retrofitting is expensive.

---

### Week 4: Independent Workflows

#### 4.1 — Invoice Chaser (Workflow 7)
Trigger: Daily 2 PM schedule

```
[CRITICAL GAP #5] Error handling wrapper
↓
Query Jobber API: Unpaid invoices from last 30 days
↓
For each unpaid invoice:
  - SMS to customer: "Hi [name], just following up on the 
    [job_description] invoice from [date]. 
    Payment details: [link]"
  - [CRITICAL GAP #3] Log revenue_impact = invoice_amount
  - [CRITICAL GAP #3] Log confidence = 100% (simple rule)
↓
Wait 48 hours, check if paid
```

---

#### 4.2 — Daily Owner Summary (Workflow 12)
Trigger: Daily 7 AM schedule

```
[CRITICAL GAP #5] Error handling wrapper
↓
Query Actions table for last 24 hours:
  - Total actions taken
  - Total revenue_impact
  - Confidence tier breakdown (4 auto-executed, 1 with-flag, 0 escalated)
  - SMS conversion rate
  - Cancellation fills
↓
Email to contractor:
  "Yesterday: $412 in revenue captured. 5 actions, all at 92%+ confidence.
   This month: $4,200 total. Conversion rate: 34%."
↓
[CRITICAL GAP #3] Revenue_impact = $0 (retention action, not revenue-generating)
[CRITICAL GAP #3] Flag on dashboard as "retention_action" type
```

**Why this matters:** This is the retention engine. Contractors who see daily proof renew month 2–4.

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
☐ Twilio account created + number assigned
☐ Airtable base created for this client

DAY 1 (Setup call — 1.5 hours):
☐ Walk through: What the system will do (demo)
☐ Jobber API key: Get from contractor admin, test connection
☐ Twilio webhook: Test inbound SMS, show dashboard response in real-time
☐ Dashboard walkthrough: Show them the Actions feed, explain revenue_impact
☐ First test: Have them text the Twilio number, show SMS response in 30 seconds
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
- Your data stays yours. We'll export all Leads, Actions, and Waitlist 
  to CSV within 24 hours.
- We'll disconnect our systems from your Jobber account and disable 
  our API token.
- Final month is prorated to the day of cancellation.
- No setup fees are refunded (they cover infrastructure + integration).

Why we say this: We know vendor lock-in is your biggest fear. 
We're confident enough in the partnership that we'll tell you up front 
you can leave whenever.
```

---

### Gap: Client Health Monitoring (Admin View)

**[CRITICAL] Build this logic before first client goes live.**

Your admin dashboard should flag:

```
CLIENT HEALTH MONITORING

FOR EACH CLIENT:
☐ Last 48 hours: actions_count > 0?
  → If 0: FLAG RED "System inactive — debug immediately"
  
☐ Week-over-week: actions_count trend?
  → If declining 20%+: FLAG YELLOW "Activity declining — check-in call scheduled"
  
☐ Revenue_impact tracked?
  → If zero: FLAG RED "Revenue not being logged — audit trail incomplete"
  
☐ Confidence_tier breakdown?
  → If >30% escalated: FLAG YELLOW "High escalation rate — Claude confidence low"
  
☐ Churn risk at day 28?
  → If revenue_impact < $1,200: FLAG RED "Below ROI threshold — demo month might cancel"

AUTOMATED ACTIONS:
→ FLAG RED = You get daily digest until resolved
→ FLAG YELLOW = You get weekly digest
→ Day 28 + low ROI = Auto-schedule check-in call
```

---

## Part 5: Revised Build Checklist (Phase 1)

### Week 1
- [ ] **[CRITICAL GAP #3]** Add revenue_impact, confidence_score, confidence_tier fields to Airtable Actions table
- [ ] **[CRITICAL GAP #4]** Document SMS-only constraint in agent-ops.md: "All tech-facing workflows = single SMS only. No app opens."
- [ ] **[CRITICAL GAP #1]** Build Workflow 2b: Missed Call → SMS Recovery (Twilio webhook + Claude + SMS)
- [ ] Workflow 1: After-hours lead capture (FastAPI endpoint)
- [ ] Workflow 3: Audit trail with **[CRITICAL GAP #3]** revenue_impact logging
- [ ] Workflow 4: **[CRITICAL GAP #5]** API error handling wrapper + Error Log table
- [ ] Next.js dashboard: Action feed with confidence_score visible
- [ ] Test: Full end-to-end (lead → SMS in 30 seconds, action logged with revenue)

### Week 2
- [ ] **[CRITICAL GAP #5]** Jobber API error handling on all calls
- [ ] Workflow 5: Jobber webhook listener
- [ ] Workflow 6: Cancellation fill
- [ ] Test: Job cancellation → SMS to waitlist in 60 seconds, logged with $175 revenue_impact

### Week 3
- [ ] **[CRITICAL GAP #2]** Add conversation_id, thread_history fields to Airtable Leads table
- [ ] **[CRITICAL GAP #2]** Workflow 9: Inbound SMS handler with multi-turn threading (query full conversation history, pass to Claude)
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
- ✅ Dashboard shows monthly breakdown by action type
- ✅ Multi-turn SMS: Follow-up message shows context awareness
- ✅ Jobber API error: Shows "Connection issue — retrying" instead of silent failure
- ✅ Onboarding checklist exists
- ✅ Cancellation policy in place

---

## Part 6: Why These Gaps Matter

### Missing Missed Call Workflow
- **Cost:** $3,900/month in lost revenue per client
- **Demo impact:** You can only show $4,700 ROI instead of $8,600
- **Churn risk:** First client won't see full value prop

### Missing Multi-Turn SMS Threading
- **Cost:** Product feels like a script, not a system
- **Churn risk:** "HCP Assist can do this already"
- **Differentiator loss:** You lose the key competitive advantage over HCP

### Missing Revenue Impact Logging
- **Cost:** Dashboard shows incomplete ROI
- **Churn risk:** Contractor sees "$150 from one lead" instead of "$4,200 this month"
- **Revenue visibility:** The single biggest retention driver disappears

### Missing API Error Handling
- **Cost:** Silent failures when Jobber is down
- **Churn risk:** "I thought it was working but nothing happened for 3 days"
- **Trust loss:** One-time event kills entire partnership

### Missing SMS-Only Constraint Doc
- **Cost:** Future developer adds a workflow that requires tech to open an app
- **Churn risk:** Reproduces the exact UX problem every competitor has
- **Technical debt:** You've just commoditized your own system

---

## Status: READY FOR IMPLEMENTATION

**All gaps identified. Embedding into Phase 1 build. Extreme priority on completion before first client signature.**

Architecture is sound. Build order respects dependencies. Revenue impact is clear.

---

*Last updated: March 14, 2026 | Critical gaps embedded in Phase 1 build sequence*
