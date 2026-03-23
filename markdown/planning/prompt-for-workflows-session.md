# n8n Workflow Build Session — Fieldline AI Foundation Tier

**Date written:** 2026-03-18
**Use this as your opening prompt for a dedicated n8n workflow build session.**

---

## What You're Building

10 multi-tenant n8n workflows that power the Fieldline AI Foundation tier for HVAC contractors. Each workflow handles ALL clients — never one workflow per client. Client-specific config lives in Supabase and is looked up at runtime.

**n8n instance:** `krn8n9394.app.n8n.cloud`
**Supabase host:** `cdofgroinizevjxyzvnn.supabase.co`
**SignalWire space:** `hv-agency.signalwire.com`

---

## Already Built (Bind Credentials First)

| # | Workflow | ID | Status |
|---|---|---|---|
| 1 | tier1_after_hours_lead_capture | `jlWxZ52pFxelh7aU` | Built — needs credential binding |
| 2 | tier1_missed_call_recovery_sms | `EjrtbF205kPsOCxO` | Built — needs credential binding |
| 3 | New Lead Notification | `EVtjW8VElN5Bvf32` | Active and working |

**Step 1 — Bind these credentials to workflows 1 and 2:**

| Credential | n8n ID | Assign To |
|---|---|---|
| Supabase | `Pm10coWJeiICVYIi` | All Supabase nodes |
| SignalWire | `r9gOGGtsAO3GswJR` | All SMS nodes |
| Gmail | `uWYzlK7ftArlL8zw` | Gmail notification nodes |
| Telegram | `OjlxZCBapUKW4KEu` | Telegram notification nodes |

After binding: activate both workflows and run an end-to-end test (send a test SMS to the SignalWire number, verify a lead row appears in Supabase within 5 seconds).

---

## Build Order (8 Remaining Workflows)

Build in this order — highest ROI first, and each depends on the prior being stable.

### 4. Cancellation Fill
**Trigger:** Jobber `job_canceled` webhook → URL: `https://krn8n9394.app.n8n.cloud/webhook/cancellation-fill?contractor={contractor_id}`
**Revenue:** $175/slot filled — highest direct ROI in Foundation tier

**Flow:**
1. Receive Jobber webhook → extract `contractor_id` from `{{ $query.contractor }}`
2. Supabase lookup: `SELECT * FROM clients WHERE contractor_id = '{{ $query.contractor }}'`
3. Set: extract contractor config fields
4. Supabase: `SELECT * FROM leads WHERE contractor_id = '[id]' AND status = 'waitlist' ORDER BY urgency_score DESC, created_at ASC LIMIT 10`
5. Filter by service_type match (cancellation service type vs. waitlist lead service type)
6. Take top match → send SMS: "Hey [name], we had a cancellation and can now fit you in [date/time]. Reply YES to confirm."
7. Supabase INSERT into actions: `{ contractor_id, action_type: 'cancellation_fill', lead_id, status: 'sent' }`

---

### 5. Review Request
**Trigger:** Jobber `job_completed` webhook → URL: `https://krn8n9394.app.n8n.cloud/webhook/review-request?contractor={contractor_id}`
**Delay:** Wait 30 minutes after job completion before sending

**Flow:**
1. Receive Jobber webhook → extract customer phone, job ID, contractor_id from query param
2. Supabase config lookup
3. Wait node: 30 minutes
4. Claude API: generate personalized review request using business_name, job type, customer name
5. Send SMS with Google review link (stored in clients table as `review_link`)
6. Supabase INSERT into actions: `{ action_type: 'review_request', status: 'sent' }`

**Clients table field needed:** Add `review_link TEXT` to clients table if not present.

---

### 6. Invoice Chaser
**Trigger:** Daily schedule — 8:00 AM contractor's local timezone

**Flow:**
1. Schedule trigger fires
2. Supabase: `SELECT * FROM clients WHERE is_active = true`
3. Loop through each contractor
4. Jobber API: `GET /v2/invoices?status=unpaid&due_date_before=[15 days ago]`
   - Auth: contractor's Jobber API key (stored in `clients.jobber_api_key`)
5. For each unpaid invoice: send SMS to customer — friendly reminder with amount + pay link
6. Supabase INSERT into actions per contractor: `{ action_type: 'invoice_chase', contractor_id, status }`

**Clients table field needed:** `jobber_api_key TEXT` (encrypted)

---

### 7. ETA Monitor
**Trigger:** Schedule every 15 minutes during business hours (8 AM–6 PM)

**Flow:**
1. Schedule trigger fires
2. Supabase: `SELECT * FROM clients WHERE is_active = true`
3. Loop each contractor
4. Jobber API: get today's jobs with status = `in_progress` or `dispatched`
5. For each: calculate ETA (Jobber provides scheduled time) → if within 30 min window, SMS customer
6. Avoid duplicate sends: check actions table for `eta_sent` within last 2 hours for same job
7. Supabase INSERT into actions: `{ action_type: 'eta_notification', contractor_id, status }`

---

### 8. Daily Summary
**Trigger:** Daily schedule — 7:00 AM contractor's local timezone

**Flow:**
1. Schedule trigger fires
2. Supabase: `SELECT * FROM clients WHERE is_active = true`
3. Loop each contractor
4. Supabase: query yesterday's leads + actions for this contractor
5. Claude API: generate plain-English daily summary
   - Prompt: "Summarize yesterday for [business_name]: [X] new leads, [Y] missed calls recovered, [Z] reviews requested. Keep it under 3 sentences. Friendly tone."
6. Send SMS (and/or email) to contractor owner
7. Supabase INSERT into actions: `{ action_type: 'daily_summary', contractor_id }`

---

### 9. Inbound SMS Handler (Orchestrator)
**Trigger:** SignalWire inbound SMS webhook (all customer replies)
**Webhook URL:** `https://krn8n9394.app.n8n.cloud/webhook/inbound-sms`

This is the master routing workflow. Every customer SMS reply goes here.

**Flow:**
1. Receive SMS → extract FROM, TO, message body, timestamp
2. Supabase lookup by TO number → get contractor config
3. Claude API: classify intent
   - Prompt: "Classify this SMS reply: '[message]'. Categories: CONFIRM_BOOKING, CANCEL_REQUEST, COMPLAINT, QUESTION, WAITLIST_ADD, OTHER. Return JSON: { intent, confidence }"
4. Route by intent:
   - `CONFIRM_BOOKING` → SMS "Great! We'll see you [time]." + UPDATE leads status
   - `CANCEL_REQUEST` → SMS confirmation + trigger Cancellation Fill workflow (via n8n webhook call)
   - `COMPLAINT` → INSERT into actions with flag → send alert to contractor (Telegram/email)
   - `QUESTION` → Claude API: generate answer using contractor FAQ (stored in clients table or separate table)
   - `WAITLIST_ADD` → INSERT into leads with status = 'waitlist'
   - `OTHER` → INSERT into actions (unhandled) → notify contractor
5. All paths: Supabase INSERT into actions with full context

---

### 10. Waitlist Manager
**Trigger:** Chained — called by Inbound SMS Handler when intent = WAITLIST_ADD, and by Cancellation Fill when a slot opens

**Flow:**
1. Receive: contractor_id, customer phone, service_type, urgency (from routing workflow)
2. Supabase: check if lead already exists for this phone + contractor (dedup)
3. If new: INSERT into leads with status = 'waitlist', urgency_score, service_type
4. Supabase: recalculate waitlist rank for this contractor
   - Rank by: urgency_score DESC, created_at ASC, service_type match
5. SMS customer: "You're on our waitlist. We'll reach out when we have availability for [service_type]."
6. Supabase INSERT into actions: `{ action_type: 'waitlist_add', contractor_id, lead_id }`

---

## The Multi-Tenant Pattern (Apply to Every Workflow)

Every workflow starts with one of these three lookup patterns. Never hardcode contractor data.

**SMS-triggered (SignalWire):**
```
[1] Webhook trigger
    ↓
[2] Supabase node — SELECT * FROM clients WHERE signalwire_number = '{{ $json.To }}'
    ↓
[3] Set node — extract:
    contractor_id = {{ $node["Get Contractor Config"].json[0].contractor_id }}
    business_name = {{ $node["Get Contractor Config"].json[0].business_name }}
    business_hours = {{ $node["Get Contractor Config"].json[0].business_hours }}
    tier = {{ $node["Get Contractor Config"].json[0].tier }}
    ↓
[4] ... workflow logic (all Supabase inserts include contractor_id)
```

**Jobber webhook-triggered (URL param):**
```
[1] Webhook trigger
    ↓
[2] Supabase node — SELECT * FROM clients WHERE contractor_id = '{{ $query.contractor }}'
    ↓
[3] Set node — same as above
```

**Scheduled (loop all active clients):**
```
[1] Schedule trigger
    ↓
[2] Supabase node — SELECT * FROM clients WHERE is_active = true
    ↓
[3] Loop over items (SplitInBatches node, batch size 1)
    ↓
[4] ... per-contractor logic
```

---

## Supabase Tables Reference

```sql
-- clients (config store — all workflows start here)
contractor_id UUID PRIMARY KEY
business_name TEXT
owner_email TEXT
signalwire_number TEXT        -- SMS webhook routing key
jobber_api_key TEXT           -- for Jobber API calls
review_link TEXT              -- Google review URL
business_hours JSONB          -- after-hours logic
tier TEXT                     -- 'foundation' | 'partner' | 'full_partner'
is_active BOOL DEFAULT TRUE

-- leads (every lead/contact captured)
id UUID PRIMARY KEY
contractor_id UUID REFERENCES clients
phone TEXT
service_type TEXT
urgency_score FLOAT
status TEXT                   -- 'new' | 'waitlist' | 'converted' | 'lost'
created_at TIMESTAMPTZ

-- actions (every workflow action logged)
id UUID PRIMARY KEY
contractor_id UUID REFERENCES clients
lead_id UUID REFERENCES leads
action_type TEXT              -- 'after_hours_capture' | 'cancellation_fill' | etc.
status TEXT                   -- 'success' | 'dedup_blocked' | 'human_review_needed'
meta JSONB                    -- any additional context
created_at TIMESTAMPTZ
```

---

## Claude API Usage (In n8n)

Use the HTTP Request node with these settings for any Claude call:

```
Method: POST
URL: https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{ $env.ANTHROPIC_API_KEY }}
  anthropic-version: 2023-06-01
  content-type: application/json
Body (JSON):
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 300,
  "messages": [{ "role": "user", "content": "[your prompt]" }]
}
```

Parse response: `{{ $json.content[0].text }}` → then parse as JSON if your prompt returns JSON.

**Budget cap:** Each contractor has a $150/month Claude budget. This is enforced at the Anthropic account level for now (Phase 1). Do not add per-call budget logic to workflows yet.

---

## Webhook URLs (Full List)

| Workflow | URL |
|---|---|
| After-hours capture | `https://krn8n9394.app.n8n.cloud/webhook/after-hours-capture` |
| Missed call recovery | `https://krn8n9394.app.n8n.cloud/webhook/missed-call-recovery` |
| Cancellation fill | `https://krn8n9394.app.n8n.cloud/webhook/cancellation-fill?contractor={id}` |
| Review request | `https://krn8n9394.app.n8n.cloud/webhook/review-request?contractor={id}` |
| Invoice chaser | (scheduled — no webhook) |
| ETA monitor | (scheduled — no webhook) |
| Daily summary | (scheduled — no webhook) |
| Inbound SMS handler | `https://krn8n9394.app.n8n.cloud/webhook/inbound-sms` |
| Waitlist manager | (chained internally) |

---

## Rules for This Session

1. **Never hardcode contractor data** — always use Supabase lookup
2. **Every Supabase insert must include `contractor_id`** — no exceptions
3. **Dedup before sending any SMS** — check actions table for recent identical action
4. **Log everything** — even failed/blocked actions go into the actions table
5. **Build in order** — Cancellation Fill first, Waitlist Manager last
6. **Test each workflow before moving to the next** — use a test contractor row in Supabase
