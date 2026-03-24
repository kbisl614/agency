---
name: Layer 1 Workflows Architecture & Design
description: Complete design for 11 Layer 1 HVAC agent workflows (Emergency Ops + Admin Ops). Jobber-focused with future CRM support path documented. Includes Claude prompts, SMS frequency strategy, Orchestrator design, and Supabase migration plan.
type: spec
---

# Layer 1 Workflows — Complete Design

**Goal:** Design all 11 Layer 1 agents' n8n workflows with Jobber as primary CRM, showing patterns reusable across all agents.

**Architecture:** Hybrid model with independent workflows (fire on trigger) + orchestrated hub (routes ambiguous input). All workflows call Claude API backend for Claude decisions, then execute actions (SMS, Supabase, CRM writes).

**Tech Stack:** n8n, Claude API (claude-sonnet-4-6 via HTTP Request nodes), Jobber webhooks, SignalWire SMS, Supabase

---

## Section 1: Layer 1 Architecture Overview

Layer 1 has 11 agents split into two operational pillars:

**Emergency Ops (5 agents)** — Real-time customer response, highest urgency:
1. Emergency lead capture (Phase 1 — demo agent)
2. Cancellation fill
3. Dispatch router
4. Inbound SMS handler
5. ETA monitor

**Admin Ops (6 agents)** — Back-office automation, scheduled/triggered:
6. Invoice chaser
7. Review request
8. Review monitor
9. Daily summary
10. Seasonal outreach
11. Waitlist manager

### The Orchestration Model

**Independent workflows (6 agents)** fire directly from their triggers:
- Jobber webhook (`job_canceled`, `job_completed`, etc.) OR scheduled time (8 AM, 7 AM, 15 min interval)
- Execute Claude decision
- Write to Supabase
- Send SMS/email
- No coordination needed

**Orchestrated workflows (3 agents)** route through an Orchestrator hub:
- Inbound SMS → Orchestrator
- New lead → Orchestrator
- Dispatch event → Orchestrator
- Orchestrator classifies intent with Claude
- Routes to appropriate agent (SMS handler, lead router, dispatch router)

### Data Flow

```
Jobber webhooks & SignalWire SMS
        ↓
   Independent triggers    Orchestrator hub (receives ambiguous input)
        ↓                           ↓
   6 agents fire             Classify intent (Claude)
   independently             ↓
        ↓                    Route to agent (SMS handler, lead router, dispatch router)
   Supabase (Leads, Actions, Waitlist tables)
        ↓
   Twilio/SMS, email, CRM updates
```

---

## Section 2: Emergency Lead Capture (Phase 1) — Detailed Workflow

**Reference implementation.** Every other workflow follows similar patterns.

**Trigger:** Inbound SMS to SignalWire webhook → posts to n8n webhook URL

### Workflow Nodes (in order)

**1. Webhook Trigger Node**
- Receives Twilio POST
- Input: `From` (customer phone), `Body` (message text), `AccountSid` (Twilio verification)
- Output: Raw webhook payload

**2. Extract Customer Data** (Code node)
- Extracts: phone, message, timestamp
- Lookup in Supabase: does this phone exist in Leads table?
- Output: `{ phone, message, timestamp, is_returning_customer }`

**3. Call Claude API** (HTTP POST to Claude API)
- Endpoint: `POST /leads/qualify`
- Sends: `{ customer_phone, message, is_returning_customer }`
- Claude qualifies urgency + service type
- Returns:
  ```json
  {
    "action": "send_sms",
    "urgency_score": 8,
    "service_type": "emergency_ac",
    "response_text": "Got it! We have availability today 2-4pm. Reply YES to confirm.",
    "confidence": 0.92
  }
  ```

**4. Create Lead Record** (Supabase node)
- Writes to Leads table: `phone, message, urgency_score, service_type, status = "qualified", timestamp`
- Output: `lead_id`

**5. Conditional: Check Confidence** (IF node)
- If `confidence > 0.85`: proceed to send SMS
- If `confidence ≤ 0.85`: log to Actions table with status "human_review_needed" and STOP

**6. Send SMS Response** (SignalWire node)
- To: customer phone
- Body: Claude's `response_text`
- Output: `sms_sid` (success indicator)

**7. Log Action** (Supabase node)
- Writes to Actions table:
  - `lead_id, action_type = "sms_sent", description = response_text, agent_name = "emergency_lead_capture", timestamp`

**8. Error Handler** (Catch-all)
- If any node fails: log to Actions table with `status = "sms_failed"`, include error message
- Do NOT send SMS to customer (prevents spam on failures)

### Data Flow Diagram

```
Twilio Webhook 
    ↓
Extract Data 
    ↓
Claude (Claude API) 
    ↓
Confidence check?
    ├─ YES (>0.85) → Create Lead + Send SMS → Log Action (success)
    └─ NO (≤0.85) → Log Action (human_review_needed) → STOP
```

### Error Scenarios

| Scenario | Handling |
|----------|----------|
| SignalWire webhook malformed | Log error to Actions, STOP |
| Claude API timeout | Log error to Actions, STOP, don't send SMS |
| Supabase write fails | Log error to Actions, STOP, don't send SMS |
| SignalWire SMS send fails | Log to Actions with status "sms_failed" |

### Key Design Decisions

1. **Confidence threshold (>0.85):** SMS only sends if Claude is confident. Low-confidence cases create audit trail for your team to review.
2. **Always log to Actions:** Every workflow action writes to Actions table (proof of ROI, audit trail).
3. **Fail safe:** If anything goes wrong, log it but don't spam the customer.
4. **Data in, data out:** Every workflow returns structured JSON from Claude so n8n can make branching decisions.

---

## Section 3: The Other 10 Layer 1 Agents — Patterns & Variations

Each agent follows the Emergency Lead Capture pattern but with different triggers, data queries, and actions.

### **EMERGENCY OPS (4 remaining agents)**

#### **Agent 2: Cancellation Fill** (Independent workflow)
- **Trigger:** Jobber webhook `job_canceled`
- **Query:** Search Waitlist table for customers needing same service type + location
- **Claude decides:** "Which waitlist customer to offer this slot to?"
- **Action:** SMS to waitlist customer with "We had a cancellation, can you come today at [time]?"
- **Key nodes:** Jobber webhook → Extract job data → Query Waitlist → Claude decision → Send SMS → Log action
- **Revenue impact:** $175 per filled slot

#### **Agent 3: Dispatch Router** (Orchestrated workflow)
- **Trigger:** Qualified lead routed from Orchestrator
- **Query:** Tech availability, service history, customer location from Jobber
- **Claude decides:** "Assign to which tech? What time slot?"
- **Action:** SMS to tech + SMS to customer with tech name + ETA
- **Key nodes:** Receive routed lead → Query available techs → Claude decision → Send 2 SMSes → Log action

#### **Agent 4: Inbound SMS Handler** (Orchestrated workflow)
- **Trigger:** Customer replies to previous SMS
- **State Management:** **Match customer by phone number.** Query Leads table by phone, filter to most recent lead with status in ["awaiting_confirmation", "dispatched"].
- **Claude decides:** "Is this a booking YES/NO, complaint, or reschedule request?"
- **Action:** Route appropriately (confirm booking, escalate complaint, reschedule)
- **Key nodes:** SignalWire webhook → Extract phone + reply → Query lead by phone (most recent active) → Claude classification → Route to action → Send SMS confirmation → Log action

#### **Agent 5: ETA Monitor** (Independent workflow)
- **Trigger:** Scheduled every 15 minutes during business hours (8 AM - 6 PM)
- **ETA Update Logic:** Queries jobs in "dispatched" state. Sends SMS if:
  - Last ETA update was > 15 min ago OR
  - Tech has moved (location changed in Jobber)
  - **Stops sending once job status changes to "in_progress" (tech has arrived)**
- **Claude decides:** "What ETA message to send?"
- **Action:** Send SMS with current tech ETA + name
- **Key nodes:** Scheduled trigger → Query dispatched jobs → Filter last ETA > 15 min ago → Claude decision → Send SMS → Log action
- **Compliance note:** Only active during dispatched state to prevent SMS fatigue

### **ADMIN OPS (6 agents)**

#### **Agent 6: Invoice Chaser** (Independent workflow)
- **Trigger:** Scheduled daily at 8 AM
- **Query:** Unpaid invoices from Jobber (unpaid > 30 days)
- **Claude decides:** "What payment reminder message to send?"
- **Action:** Send SMS with payment link
- **Key nodes:** Scheduled trigger → Query unpaid invoices → Filter > 30 days → Claude decision → Send SMS → Log action

#### **Agent 7: Review Request** (Independent workflow)
- **Trigger:** Jobber webhook `job_completed` + 30 min delay
- **Query:** Job details (tech name, customer, service type)
- **Claude decides:** "What personalized review request message?"
- **Action:** Send SMS asking for Google/Yelp review with link
- **Key nodes:** Job completed webhook → Wait 30 min → Query job details → Claude decision → Send SMS → Log action

#### **Agent 8: Review Monitor** (Independent workflow)
- **Trigger:** Scheduled daily at 9 AM
- **Query:** Recent reviews from Jobber + manual entry
- **Claude decides:** "Should we escalate this low review?"
- **Action:** If rating < 3 stars, send Slack alert to manager
- **Key nodes:** Scheduled trigger → Query recent reviews → Filter low ratings → Claude decision → Send Slack message → Log action

#### **Agent 9: Daily Summary** (Independent workflow)
- **Trigger:** Scheduled daily at 7 AM
- **Query:** All actions from yesterday (from Actions table)
- **Claude decides:** "Summarize in plain English for contractor"
- **Action:** Email contractor with daily summary
- **Key nodes:** Scheduled trigger → Query Actions from yesterday → Claude decision → Send email → Log action

#### **Agent 10: Seasonal Outreach** (Independent workflow)
- **Trigger:** Scheduled on April 1 and October 1
- **Query:** Customers not contacted in 60+ days
- **Claude decides:** "What seasonal service offer? (AC prep in April, furnace prep in Oct)"
- **Action:** Send bulk SMS to customers with seasonal offer
- **Key nodes:** Scheduled trigger → Query customers by season → Filter 60+ days no contact → Claude decision → Send SMS → Log action

#### **Agent 11: Waitlist Manager** (Independent workflow)
- **Trigger:** Scheduled daily at 6 AM + triggered by Cancellation Fill
- **Query:** Entire Waitlist table, sort by urgency/location/service type
- **Claude decides:** "Who should we re-contact? Should anyone be aged out?"
- **Action:** Update Waitlist table + optionally SMS to top candidates
- **Key nodes:** Scheduled trigger → Query Waitlist → Claude decision → Update Supabase → Log action

### **Pattern Summary Table**

| Agent | Trigger Type | Input Source | Claude Decides | Primary Action |
|-------|--------------|--------------|----------------|-----------------|
| Emergency Lead Capture | Inbound SMS (webhook) | Customer message | Urgency + service type | Send SMS response |
| Cancellation Fill | Job canceled (webhook) | Jobber job data | Which waitlist customer? | Send availability SMS |
| Dispatch Router | Lead routed (orchestrated) | Qualified lead | Which tech + time? | SMS tech + customer |
| Inbound SMS Handler | Customer reply (webhook) | Reply message (matched by phone) | Intent classification | Route appropriately |
| ETA Monitor | 15 min schedule | Job progress data | ETA message text | Send SMS with ETA |
| Invoice Chaser | 8 AM daily | Jobber invoices | Payment reminder text | Send SMS reminder |
| Review Request | 30 min post-job | Job completion | Personalized message | Send SMS request |
| Review Monitor | 9 AM daily | Incoming reviews | Escalate low rating? | Send Slack alert |
| Daily Summary | 7 AM daily | Actions table | English summary | Send email |
| Seasonal Outreach | Apr 1, Oct 1 | Customer list | Seasonal offer | Send bulk SMS |
| Waitlist Manager | 6 AM daily | Waitlist table | Prioritize + age out | Update Supabase |

---

## Section 4: Claude Prompts by Agent (Production-Ready)

These are the actual system prompts each agent uses. Claude returns structured JSON for every call.

### **Agent 1: Emergency Lead Capture**
```
You are an AI dispatcher for an HVAC emergency response service.

A customer has sent an SMS with an issue. Your job is to:
1. Assess urgency (1-10 scale)
2. Identify service type (emergency_ac, emergency_heat, maintenance, etc.)
3. Generate a friendly, conversational SMS response

Return ONLY valid JSON, no preamble:
{
  "action": "send_sms",
  "urgency_score": <1-10>,
  "service_type": "<service_type>",
  "response_text": "<SMS response to send, max 160 chars>",
  "confidence": <0-1>
}

Urgency scale:
- 9-10: "No AC/heat in dangerous conditions" → respond immediately
- 7-8: "AC/heat not working, uncomfortable but safe" → respond with options
- 5-6: "Minor issue, wants maintenance" → respond with scheduling options
- 1-4: "Not actually an HVAC issue or spam" → confidence = 0.1, don't send SMS

Be conversational. Sound like a human. Keep responses under 160 chars for SMS.
```

### **Agent 2: Cancellation Fill**
```
You are a scheduler for an HVAC contractor. A job was just canceled and there's an available time slot.

Available waitlist customers:
{waitlist_data}

Your job: Pick ONE customer to offer the just-freed time slot.

Return ONLY valid JSON:
{
  "action": "send_sms",
  "selected_customer_id": "<id>",
  "selected_customer_phone": "<phone>",
  "available_time_slot": "<time, e.g., '2-4pm today'>",
  "response_text": "<SMS to send>",
  "confidence": <0-1>
}

Prioritize by:
1. Service type match (AC cancellation → AC customer first)
2. Location proximity (same neighborhood preferred)
3. Wait time (longer waiters go first)
4. Urgency score (higher urgency first)

Be friendly and specific. Include the time slot in the SMS.
```

### **Agent 3: Dispatch Router**
```
You are a tech dispatcher for an HVAC contractor. A job is ready to assign.

Customer info:
{customer_data}

Available techs:
{tech_availability_data}

Your job: Assign the job to the best tech and pick an ETA.

Return ONLY valid JSON:
{
  "action": "dispatch_job",
  "assigned_tech_id": "<id>",
  "assigned_tech_name": "<name>",
  "eta_window": "<time window, e.g., '2:30-3:00pm'>",
  "tech_sms": "<SMS for tech with job details>",
  "customer_sms": "<SMS for customer with tech name + ETA>",
  "confidence": <0-1>
}

Prioritize by:
1. Tech skill match (AC emergency → AC-certified tech)
2. Location proximity (nearest tech first)
3. Tech performance (higher ratings first)
4. Availability (soonest arrival time)

Keep SMSes under 160 chars each. Be specific about ETA window.
```

### **Agent 4: Inbound SMS Handler**
```
You are a customer service router. A customer has replied to an SMS.

Lead context:
{lead_data}

Customer reply: "{reply_text}"

Your job: Classify the intent and route appropriately.

Return ONLY valid JSON:
{
  "action": "<route_type>",
  "intent": "<confirmed_booking | reschedule | complaint | cancellation | unclear>",
  "response_text": "<SMS confirmation or escalation message>",
  "confidence": <0-1>
}

Route types:
- confirmed_booking: Customer said YES → confirm appointment
- reschedule: Customer wants different time → queue for rescheduling
- complaint: Customer is unhappy → escalate to manager
- cancellation: Customer wants to cancel → process cancellation
- unclear: You're not sure → ask one clarifying question

Be friendly. Acknowledge their message.
```

### **Agent 5: ETA Monitor**
```
You are a customer communication agent. A tech is on the way to a customer.

Job data:
{job_data}

Tech location: {tech_location}
Current time: {current_time}
Last ETA SMS: {last_eta_timestamp}

Your job: Generate an ETA update SMS for the customer.

Return ONLY valid JSON:
{
  "action": "send_sms",
  "eta_minutes": <estimated minutes>,
  "response_text": "<SMS with ETA>",
  "confidence": <0-1>
}

Rules:
- Only send if ETA changed significantly (>15 min difference from last update)
- Include tech name: "John is on his way, ETA 2:45pm"
- Be friendly and specific
- Max 160 chars
- If confidence < 0.7, don't send (bad ETA data)
```

### **Agent 6: Invoice Chaser**
```
You are a payment collections agent. An invoice is overdue.

Invoice data:
{invoice_data}

Your job: Generate a friendly payment reminder SMS.

Return ONLY valid JSON:
{
  "action": "send_sms",
  "response_text": "<SMS payment reminder>",
  "confidence": <0-1>
}

Rules:
- Be professional but friendly
- Include invoice number and amount due
- Include payment link if available
- Max 160 chars
- Never sound threatening

Example: "Invoice #1234 for $850 is due. Pay here: [link]. Thanks!"
```

### **Agent 7: Review Request**
```
You are a review generation agent. A job just completed.

Customer: {customer_name}
Tech: {tech_name}
Service: {service_type}

Your job: Generate a personalized review request SMS.

Return ONLY valid JSON:
{
  "action": "send_sms",
  "response_text": "<SMS review request>",
  "confidence": <0-1>
}

Rules:
- Mention the tech by name (builds rapport)
- Include review link (Google/Yelp)
- Be specific about the service
- Max 160 chars
- Sound grateful

Example: "Thanks for letting John help! Could you review us on Google? [link]"
```

### **Agent 8: Review Monitor**
```
You are a reputation monitor. A new review just came in.

Review data:
{review_data}

Your job: Assess if this low review needs escalation.

Return ONLY valid JSON:
{
  "action": "<send_alert | archive>",
  "escalate": <true | false>,
  "alert_message": "<message for manager if escalating>",
  "confidence": <0-1>
}

Rules:
- Escalate if rating <= 3 stars (1-3 stars = bad)
- Escalate if review mentions safety, billing fraud, or rude behavior
- Archive if 4-5 stars (good review, no action needed)

Alert message should be factual and include the review text.
```

### **Agent 9: Daily Summary**
```
You are a business intelligence agent. Summarize yesterday's activity for the contractor.

Actions from yesterday:
{actions_data}

Your job: Write a plain-English summary for the contractor.

Return ONLY valid JSON:
{
  "action": "send_email",
  "summary_text": "<1-2 paragraph plain English summary>",
  "confidence": <0-1>
}

Rules:
- Highlight key metrics: jobs completed, revenue, customer issues
- Mention any escalations (complaints, low reviews)
- Be concise but informative
- Use conversational tone

Example summary:
"Yesterday you completed 8 jobs totaling $2,340 in revenue. John had the highest completion rate. One customer complained about ETA communication; we've flagged this. 2 review requests pending."
```

### **Agent 10: Seasonal Outreach**
```
You are a seasonal marketing agent. Generate a service offer for the current season.

Season: {season} (spring = AC prep, fall = furnace prep)
Customers to contact: {customer_list}
Service type: {service_type}

Your job: Generate a seasonal service offer SMS.

Return ONLY valid JSON:
{
  "action": "send_sms",
  "response_text": "<SMS seasonal offer>",
  "confidence": <0-1>
}

Rules:
- Spring (Apr): AC prep, cleaning, seasonal tune-ups
- Fall (Oct): Furnace prep, heating system checks, maintenance agreements
- Mention preventative value
- Include offer/discount if applicable
- Max 160 chars
- Include unsubscribe link: "Reply STOP to unsubscribe"

Example: "Spring AC check special! Get your system ready for summer. $49 inspection. Book now: [link]"
```

### **Agent 11: Waitlist Manager**
```
You are a waitlist prioritization agent. Manage the customer waitlist.

Waitlist data:
{waitlist_data}

Your job: Prioritize customers and identify who to re-contact.

Return ONLY valid JSON:
{
  "action": "update_waitlist",
  "prioritized_list": [<customer_ids in priority order>],
  "recontact_now": [<customer_ids to SMS today>],
  "archive_aged": [<customer_ids who haven't contacted in 90+ days>],
  "confidence": <0-1>
}

Prioritization rules:
1. Service type match to available jobs
2. Location proximity
3. Urgency score (higher = more urgent)
4. Wait time (longer = higher priority)
5. Contact frequency (recent contact = lower priority)

Re-contact: Select 3-5 customers with highest priority.
Archive: Move customers with no contact in 90+ days to expired.
```

---

## Section 5: SMS Frequency & Compliance Strategy

**The Problem:** A customer could get 5+ SMSes in one week without frequency management. This creates fatigue, spam complaints, and Twilio will block high complaint rates.

**Customer Experience Reality:** More than 2-3 essential messages per week feels intrusive. More than 1 message per day is definitely spam territory.

### **What counts as an SMS?**
- Emergency response SMS (Emergency Lead Capture) ✅
- Dispatch notification (Dispatch Router) ✅
- Tech arrival ETA (ETA Monitor) — **counts as 1, but only during active job**
- Confirmation SMSes (Inbound SMS Handler) ✅
- Invoice reminder (Invoice Chaser) ✅
- Review request (Review Request) ✅
- Seasonal outreach (Seasonal Outreach) — **separate marketing category**

### **Frequency Caps (per customer, per week)**

| Message Type | Frequency | Compliance |
|--------------|-----------|-----------|
| Emergency response | 1x per incident | Customer initiates |
| Dispatch notification | 1x per job | Required for job to work |
| ETA updates | 1x per 30 min during active job | Only during dispatch window |
| Invoice reminders | 1x per invoice | Monthly max |
| Review request | 1x per job | Once per service |
| Seasonal outreach | 1x per season | Apr 1 + Oct 1 only, requires opt-in |
| **Total essential/job-related** | **Max 4-5/week** | Business-critical |
| **Marketing (seasonal)** | **Max 1/month** | Separate category, requires TCPA opt-in |

### **Supabase Fields to Add**

Leads + Customers table must include:
- `sms_frequency_preference`: enum "all", "essential_only", "marketing_only", "none"
- `sms_last_sent_timestamp`: tracks last SMS sent (for rate limiting)
- `sms_count_this_week`: rolling 7-day counter
- `opted_out`: boolean (if TRUE, never send any SMS)
- `tcpa_marketing_consent`: boolean (required before seasonal outreach)

### **Enforcement Rules in n8n (Before ANY SMS Send)**

```
Check 1: Is customer opted_out = true? → STOP (no SMS)
Check 2: What's their frequency_preference?
         - If "none" → STOP
         - If "essential_only" → only allow: emergency, dispatch, ETA
         - If "marketing_only" → only allow: seasonal outreach
         - If "all" → allow everything
Check 3: Does TCPA consent exist? (for marketing/seasonal only)
         - If NO → STOP for seasonal outreach
Check 4: sms_count_this_week >= 5?
         - If YES → only allow essential messages (emergency, dispatch, ETA)
Check 5: Duplicate prevention: last SMS < 30 min ago?
         - If YES → STOP unless emergency

Proceed → Send SMS → Increment sms_count_this_week → Update sms_last_sent_timestamp
```

### **Compliance Rules**

- **TCPA (US texting law):** Customer must explicitly opt-in for marketing (seasonal outreach). Keep consent records + timestamp in Supabase.
- **Twilio guidelines:** Maintain complaint rate < 0.1%. Monitor Twilio dashboard for opt-outs.
- **Message tone:** Never sound automated or spammy. Always personalize with customer name + context.
- **Unsubscribe path:** Include "Reply STOP to unsubscribe" in seasonal/marketing SMSes only.
- **Audit trail:** Every SMS logged to Actions table with: phone, message text, reason, confidence score, timestamp.

### **Example Flow: ETA Monitor With Frequency Caps**

```
Job dispatched → Tech en route
    ↓
Every 15 min: Check if ETA update needed
    ↓
Before sending SMS:
  1. Is customer opted out? → STOP
  2. What's their frequency preference? → Allow ETA? (essential)
  3. Has customer gotten ETA SMS in last 30 min? → If YES, STOP
  4. Is SMS count for week >= 5? → If YES, only send if essential (ETA is essential)
  5. Is this a duplicate of last ETA? → If YES, STOP
    ↓
Send ETA SMS → Log action → Increment counter
    ↓
When job status → "in_progress" (tech arrived) → Stop sending ETA updates
```

---

## Section 6: Orchestrator Hub — Detailed Design

The Orchestrator is the decision engine for ambiguous inputs. It receives unclassified input, asks Claude "what should happen?", and routes to the right agent.

### **What Feeds Into the Orchestrator?**

1. **New SMS from unknown customer** → Should this be emergency lead capture?
2. **Customer SMS reply** → Is this a YES, reschedule, or complaint?
3. **New lead from web form** → Should this be qualified → dispatched automatically?
4. **Jobber event with unclear context** → What action to take?

### **Orchestrator Workflow (n8n)**

```
Ambiguous Input (SMS, webhook, form)
    ↓
Webhook receives: { type, customer_phone, message/job_data }
    ↓
Query Supabase: Does this customer exist? (match by phone)
    ↓
Claude classification:
  - System prompt: "What is the intent?"
  - Outputs: action, confidence, routing instruction
    ↓
Route by action:
  ├─ "emergency_lead_capture" → Send to Agent 1
  ├─ "confirm_booking" → Send to Agent 4 (SMS handler)
  ├─ "dispatch_tech" → Send to Agent 3 (dispatcher)
  ├─ "escalate_to_human" → Send to manager Slack
  └─ "unclear" → Ask customer clarifying question + wait
    ↓
Log action to Actions table
    ↓
Return routed response
```

### **Orchestrator Confidence Rules**

- If Claude confidence >= 0.85: Execute action (send SMS, route to agent)
- If Claude confidence 0.6-0.84: Route to human (manager review in Slack)
- If Claude confidence < 0.6: Ask customer clarifying question via SMS + try again on next message

---

## Section 7: Jobber Webhook Map

**Webhooks the system listens for:**

| Webhook Event | Trigger | Handler | Action |
|---------------|---------|---------|--------|
| `job.created` | New job in Jobber | Orchestrator | May trigger dispatch or queue |
| `job.scheduled` | Job assigned to tech | Dispatch Router | Notify customer + tech |
| `job.completed` | Tech marked job done | Review Request | Send review request (30 min delay) |
| `job.cancelled` | Job was canceled | Cancellation Fill | Find waitlist customer for slot |
| `customer.created` | New customer in Jobber | Log to Leads table | Audit trail |
| `technician.location_update` | Tech location changes | ETA Monitor | Update ETA if job dispatched |

**Note:** Not all Jobber webhooks trigger agents. Some just get logged. ETA Monitor polls job status every 15 min (doesn't wait for webhooks).

---

## Section 8: Database Schema — Supabase (MVP) → Supabase (Phase 2)

### **Leads Table**
```
lead_id (Primary Key)
contractor_id (FK to Contractors table)
customer_name
phone (unique index)
message (initial inquiry)
urgency_score (1-10, set by Claude)
service_type (emergency_ac, emergency_heat, maintenance, etc.)
status (new, qualified, awaiting_confirmation, dispatched, completed, cancelled)
sms_frequency_preference (all, essential_only, marketing_only, none)
sms_count_this_week (rolling counter)
sms_last_sent_timestamp
opted_out (boolean)
tcpa_marketing_consent (boolean)
created_at
updated_at
```

### **Actions Table (Audit Trail)**
```
action_id (Primary Key)
contractor_id (FK)
lead_id (FK, nullable - some actions don't have a lead)
action_type (send_sms, create_lead, dispatch_job, escalate, etc.)
description (what happened)
agent_name (which agent took this action)
revenue_impact (if applicable)
success (boolean - did it work?)
error_message (if failed)
sms_sid (Twilio identifier, if SMS sent)
confidence_score (Claude's confidence on this decision)
created_at
```

### **Waitlist Table**
```
waitlist_id (Primary Key)
contractor_id (FK)
customer_name
phone (unique index per contractor)
service_type (AC, heating, maintenance, etc.)
location (neighborhood/address)
urgency_score
last_contacted (timestamp)
status (active, contacted_today, aged_out)
created_at
updated_at
```

### **Supabase Migration Plan (Phase 2)**

**Phase 2 timing:** After first client signs + you understand growth patterns (expect 2-3 months in)

**Why move to Supabase:**
- Supabase API rate limits (5 req/sec) will hit when you have 100+ contractors
- Supabase is PostgreSQL = unlimited scale
- Same data structure, easier joins

**Migration approach:**
1. Create identical Supabase tables (same schema as Supabase)
2. Dual-write for 1 week (n8n writes to both Supabase + Supabase)
3. Verify data consistency
4. Switch n8n read queries to Supabase
5. Keep Supabase for 2 weeks as backup, then decommission

**No code changes needed in Claude API** — just change database connection string.

---

## Section 9: Future CRM Support Path

**Jobber:** MVP ✅ Full webhook support, API access

**ServiceTitan:** (Pending API approval, 4-8 weeks)
- Equivalent webhooks: `job_created`, `job_status_changed`, `appointment_scheduled`
- New n8n workflows: Duplicate existing workflows, change Jobber query nodes → ServiceTitan query nodes
- Claude API endpoints: No change (already CRM-agnostic)
- Timeline: Phase 2 if ServiceTitan customer acquired

**House Call Pro:** (Future)
- Evaluate webhook support + API capabilities before committing
- Same pattern: new n8n workflows, same Claude API logic

---

**Status:** Design complete. All 9 sections documented. Ready for user approval.
