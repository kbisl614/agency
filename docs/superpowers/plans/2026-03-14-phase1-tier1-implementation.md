> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document contains outdated information. See current reference below.
> **Current reference:** `agency-context/agency_AI_MASTER.md`
> Preserved for session history only.

---

---
name: Phase 1 Implementation Plan — Tier 1 Only (Hero 1-2 Punch)
description: Build 3 Tier 1 workflows (After-hours capture + Missed call recovery + Audit trail) + FastAPI backend + basic Mission Control dashboard. Market research validated. First client deliverable.
type: plan
---

# Phase 1: HVAC AI Operations — Hero 1-2 Punch Demo

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build a production-ready demo showing the hero 1-2 punch: after-hours leads are captured via SMS + daytime missed calls are recovered via SMS + all actions logged to Airtable + ROI visible in dashboard. First client deliverable.

**Architecture:**
- **Frontend:** Next.js Mission Control dashboard (real-time action log, ROI metrics)
- **Backend:** FastAPI with Claude API integration for lead qualification + missed call classification
- **Orchestration:** n8n workflows: (1) After-hours SMS → Claude qualification, (2) Missed call event → SMS response
- **Data:** Airtable (3 tables: Leads, Actions, Waitlist)
- **Messaging:** Twilio for all SMS

**Tech Stack:** FastAPI, Claude API (claude-sonnet-4-20250514), Airtable, Twilio, n8n, Next.js, Python 3.11+

**Success Criteria:**
- ✅ Test customer sends SMS after 7pm → gets response within 2 seconds
- ✅ Test customer has missed call → gets SMS response within 60 seconds
- ✅ Both actions logged to Actions table with confidence scores
- ✅ Mission Control dashboard shows action log + daily summary
- ✅ ROI calculation visible: "2 leads recovered = $300 value"

---

## File Structure

```
/
├── backend/                          (NEW)
│   ├── main.py                       ← FastAPI app entry
│   ├── requirements.txt               ← Python dependencies
│   ├── .env.example                   ← Environment template
│   ├── config.py                      ← Settings/config
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── leads.py                   ← POST /leads/qualify
│   │   └── webhooks.py                ← POST /webhooks/missed-call
│   └── services/
│       ├── __init__.py
│       ├── claude_service.py          ← Claude API calls
│       ├── airtable_service.py        ← Airtable CRUD
│       └── twilio_service.py          ← SMS sending
├── app/                              (EXISTING - Next.js)
│   ├── mission-control/              (NEW)
│   │   ├── page.tsx                  ← Dashboard + action log
│   │   └── layout.tsx
│   └── ...existing landing pages...
├── n8n/                              (NEW)
│   ├── tier1_after_hours_lead_capture.json       ← [TIER 1] After-hours SMS response to evening leads
│   └── tier1_missed_call_recovery_sms.json       ← [TIER 1] Missed call SMS recovery (daytime)
├── docs/superpowers/
│   ├── specs/2026-03-14-feature-tier-mapping.md (source of truth)
│   ├── specs/2026-03-14-layer1-workflows-design.md (reference)
│   └── plans/2026-03-14-phase1-tier1-implementation.md ← This file
└── .env.local                        (EXISTING - update with new vars)
```

---

## Phase 1 Breakdown: 3 Tier 1 Workflows

### **TIER 1 Workflow #1: After-Hours Lead Capture (SMS Response to Evening Leads)**

**Trigger:** Twilio webhook (customer SMS after 7pm)

**Flow:**
1. Twilio receives SMS → POST to n8n webhook
2. n8n extracts: `{ phone, message, timestamp }`
3. n8n calls FastAPI: `POST /leads/qualify` with customer message
4. Claude classifies: urgency (1-10) + service type + response text
5. If confidence > 0.85: send SMS response + create Lead record
6. If confidence ≤ 0.85: log to Actions with status "human_review"
7. All actions logged to Airtable Actions table

**FastAPI Endpoint:** `POST /leads/qualify`
```python
{
  "phone": "+1234567890",
  "message": "My AC went out, it's 95 degrees outside",
  "is_new_customer": true
}
→
{
  "action": "send_sms",
  "urgency_score": 9,
  "service_type": "emergency_ac",
  "response_text": "Got it! We have availability tonight. Call us or reply YES.",
  "confidence": 0.92
}
```

---

### **TIER 1 Workflow #2: Missed Call → SMS Recovery (Recover Daytime Missed Calls)**

**Trigger:** Jobber missed call event (or Twilio webhook if set up)

**Flow:**
1. Missed call detected (Jobber event or Twilio missed call webhook)
2. Extract: `{ phone, timestamp }`
3. n8n calls FastAPI: `POST /webhooks/missed-call`
4. Claude classifies: should we send SMS? (intent: likely lead)
5. Send SMS within 60 seconds: *"Hey, we just missed your call — what's up with your system? We'll get back to you within the hour."*
6. Create Leads record with status "missed_call_recovery"
7. Log action to Actions table

**FastAPI Endpoint:** `POST /webhooks/missed-call`
```python
{
  "phone": "+1234567890",
  "timestamp": "2026-03-14T14:32:00Z"
}
→
{
  "action": "send_sms",
  "should_send": true,
  "response_text": "Hey, we just missed your call — what's up with your system? We'll get back to you within the hour.",
  "confidence": 0.88
}
```

---

### **TIER 1 Workflow #3: Audit Trail & ROI Logging (Action Log + Revenue Tracking)**

**Trigger:** Every action from workflows 1 & 2

**What gets logged to Airtable Actions table:**
- `action_id`: unique ID
- `timestamp`: when action occurred
- `action_type`: "sms_sent" | "lead_created" | "human_review_needed" | "sms_failed"
- `description`: what happened
- `agent_name`: "after_hours_capture" | "missed_call_recovery"
- `revenue_impact`: estimated value ($150 for captured lead, $0 for action, etc.)
- `confidence_score`: Claude's confidence
- `success`: true/false
- `lead_id`: link to Lead record if applicable

**Dashboard Display:**
- Last 10 actions in real-time (polling Airtable every 10 seconds)
- Summary stats: "X actions taken today | $Y revenue recovered | Z leads in pipeline"
- Filter by action type + date range

---

## Detailed Implementation Steps

### **Chunk 1: FastAPI Backend Setup**

#### **Task 1: Initialize FastAPI project**

Files to create:
- `backend/requirements.txt`
- `backend/main.py`
- `backend/.env.example`
- `backend/config.py`
- `backend/routes/__init__.py`
- `backend/routes/leads.py`
- `backend/routes/webhooks.py`
- `backend/services/__init__.py`
- `backend/services/claude_service.py`
- `backend/services/airtable_service.py`
- `backend/services/twilio_service.py`

#### **Task 2: Implement Claude service**

**File:** `backend/services/claude_service.py`

Two endpoints:

1. **Qualify lead (after-hours capture)**
   - Input: customer phone + message
   - Output: urgency score (1-10), service type, response text, confidence
   - Prompt: Standard lead qualification (from design spec Section 4)

2. **Classify missed call**
   - Input: missed call phone number
   - Output: should_send (bool), response text, confidence
   - Prompt: "This person just missed a call. Should we send them an SMS?"

#### **Task 3: Implement Airtable service**

**File:** `backend/services/airtable_service.py`

Three methods:
1. `create_lead(phone, message, urgency, service_type, status)`
2. `log_action(action_type, description, agent_name, revenue_impact, confidence, success, lead_id)`
3. `query_leads_by_phone(phone)` — for missed call deduplication

#### **Task 4: Implement Twilio service**

**File:** `backend/services/twilio_service.py`

One method:
- `send_sms(to_phone, message_text)` → returns SMS SID or error

#### **Task 5: Create FastAPI routes**

**File:** `backend/routes/leads.py`
- `POST /leads/qualify` — after-hours lead capture

**File:** `backend/routes/webhooks.py`
- `POST /webhooks/missed-call` — missed call recovery

#### **Task 6: Create main FastAPI app**

**File:** `backend/main.py`
- Initialize FastAPI
- Mount routes
- Error handling
- Logging

---

### **Chunk 2: n8n Workflows**

#### **Task 7: Build n8n workflow — TIER 1: After-Hours Lead Capture**

**Workflow File:** `n8n/tier1_after_hours_lead_capture.json`
**Purpose:** Respond to SMS leads received after business hours (7pm+) with instant qualification and SMS response
**Data Source:** Twilio webhook (inbound SMS)

Nodes (in order):
1. Webhook trigger (Twilio POST)
2. Extract phone + message + timestamp
3. HTTP POST to FastAPI `/leads/qualify`
4. Conditional: confidence > 0.85?
   - YES: Create Lead record in Airtable + Send SMS + Log action (success)
   - NO: Log action (human_review_needed) → STOP
5. Error handler: log any failures

**Testing:** Send SMS to Twilio number, verify response within 2 seconds + Airtable updated

#### **Task 8: Build n8n workflow — TIER 1: Missed Call → SMS Recovery**

**Workflow File:** `n8n/tier1_missed_call_recovery_sms.json`
**Purpose:** Automatically send SMS to anyone who missed a call (27% of all calls = $3,900/month recovery)
**Data Source:** Jobber missed call webhook OR Twilio missed call event

Nodes (in order):
1. Webhook trigger (Jobber missed call event OR Twilio)
2. Extract phone + timestamp
3. Query Airtable: does this phone already have a lead from today?
   - If YES: skip (no duplicate SMS)
   - If NO: proceed
4. HTTP POST to FastAPI `/webhooks/missed-call`
5. If should_send = true:
   - Send SMS to customer
   - Create Lead record (status: "missed_call_recovery")
   - Log action (success)
6. Error handler: log failures

**Testing:** Trigger a test missed call, verify SMS response within 60 seconds + Airtable updated

---

### **Chunk 3: Mission Control Dashboard**

#### **Task 9: Build Mission Control dashboard**

**File:** `app/mission-control/page.tsx`

Components:
1. **Header:** Logo + "Mission Control" + date/time
2. **Summary stats bar:**
   - Actions today (number)
   - Revenue recovered today (sum of revenue_impact)
   - Leads in pipeline (count of status = "awaiting_confirmation")
3. **Real-time action log** (poll Airtable every 10s):
   - Table: timestamp | action type | description | agent | confidence | revenue | status
   - Last 10 actions visible
   - Expandable rows for full details
4. **Filters:** date range + action type
5. **Footer:** "Last updated: [timestamp]"

**Data source:** Direct Airtable query (no FastAPI needed for dashboard)

---

### **Chunk 4: Airtable Schema Setup**

#### **Task 10: Create/update Airtable schema**

**Table 1: Leads**
- `lead_id` (primary key)
- `phone` (unique)
- `message` (initial inquiry text)
- `urgency_score` (1-10)
- `service_type` (text)
- `status` (enum: new, awaiting_confirmation, confirmed, dispatched, completed, cancelled)
- `source` (enum: after_hours_sms, missed_call, web_form, phone_call)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Table 2: Actions** (audit trail)
- `action_id` (primary key)
- `timestamp` (datetime)
- `action_type` (enum: sms_sent, lead_created, human_review_needed, sms_failed, missed_call_recovery)
- `description` (text)
- `agent_name` (text: "after_hours_capture", "missed_call_recovery")
- `revenue_impact` (number)
- `confidence_score` (0-1)
- `success` (boolean)
- `error_message` (text, if failed)
- `lead_id` (link to Leads table, nullable)
- `sms_sid` (Twilio identifier, if SMS sent)

**Table 3: Waitlist** (for future Cancellation Fill feature)
- `waitlist_id` (primary key)
- `phone` (unique)
- `service_type` (text)
- `location` (text)
- `urgency_score` (1-10)
- `last_contacted` (timestamp)
- `status` (enum: active, contacted_today, aged_out)
- `created_at` (timestamp)

---

### **Chunk 5: Environment & Deployment**

#### **Task 11: Set up environment variables**

**File:** `.env.local` (update existing)

Add:
```
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=appXXX...

# Twilio
TWILIO_ACCOUNT_SID=ACxx...
TWILIO_AUTH_TOKEN=auth...
TWILIO_PHONE_NUMBER=+1...

# Jobber (for Phase 2)
JOBBER_API_KEY=...
JOBBER_WEBHOOK_SECRET=...

# Server
BACKEND_PORT=8000
FRONTEND_PORT=3000
DEBUG=false
```

#### **Task 12: Deploy FastAPI backend**

Options:
- Render: Free tier for testing, paid for production ($12/month)
- Railway: Pay-as-you-go ($5-50/month typical)
- DigitalOcean App Platform: $12/month

Recommended for Phase 1: **Railway** (easiest git integration)

#### **Task 13: Deploy Next.js frontend**

Options:
- Vercel: Built for Next.js, free tier available
- Netlify: Free tier

Recommended: **Vercel** (native Next.js support)

---

## Testing Checklist

### **Before Demo:**

- [ ] FastAPI backend running locally
- [ ] All 3 Claude service prompts tested
- [ ] Airtable tables created + populated with test data
- [ ] Twilio number configured + can send/receive SMS
- [ ] n8n workflows deployed + firing correctly

### **Demo Flow:**

- [ ] Send test SMS after 7pm → verify response within 2 sec + Airtable logged
- [ ] Trigger missed call → verify SMS response within 60 sec + Airtable logged
- [ ] Open Mission Control dashboard → verify both actions visible + stats calculated
- [ ] Show audit trail: 2 actions logged with confidence scores + revenue impact
- [ ] Calculate ROI: 2 leads × $150 = $300 value captured

---

## Success Metrics

**Phase 1 is "done" when:**
1. ✅ After-hours SMS response working (2 sec latency)
2. ✅ Missed call SMS recovery working (60 sec latency)
3. ✅ All actions logged to Airtable + visible in dashboard
4. ✅ Claude confidence scores working (0.85 threshold enforced)
5. ✅ ROI calculation accurate (revenue_impact summing correctly)
6. ✅ FastAPI backend deployed (not just local)
7. ✅ Mission Control dashboard deployed (Vercel)
8. ✅ First customer can use it (Jobber integration for Phase 2)

---

## What's NOT in Phase 1

**These are Tier 2 or later:**
- Jobber integration (pulls real job data)
- Cancellation fill workflow
- Dispatch router
- SMS reply handling
- ETA monitoring
- Invoice reminders
- Review requests
- Seasonal outreach
- Dashboard metrics (speed-to-lead, daily summary)
- Advanced filtering in Mission Control

**These get added in Phase 2 after first client signs and validates ROI.**

---

**Status:** Implementation plan ready. Awaiting approval before starting Chunk 1.

**Dependencies:**
- [ ] FastAPI/Python environment set up
- [ ] Airtable base created
- [ ] Twilio account active + configured
- [ ] n8n instance running (self-hosted or n8n Cloud)
- [ ] Vercel/Railway accounts created
- [ ] All API keys in `.env.local`

**Estimated Timeline:**
- Chunk 1 (FastAPI backend): 2-3 days
- Chunk 2 (n8n workflows): 1-2 days
- Chunk 3 (Mission Control dashboard): 1-2 days
- Chunk 4 (Airtable setup): 2-4 hours
- Chunk 5 (Deployment): 2-4 hours
- **Total: ~1 week for experienced team, ~2 weeks for first-time setup**

---

**Last Updated:** 2026-03-14 (Market Research → Tier 1 Focus)
