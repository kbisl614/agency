# Tier 1 Foundation Workflows — Reference
**Last Updated:** 2026-03-18
**Total Foundation workflows:** 10
**n8n instance:** krn8n9394.app.n8n.cloud
**Architecture:** Multi-tenant — one workflow per function, Supabase config lookup at runtime

---

## Currently Built

### 1. tier1_after_hours_lead_capture
**ID:** `jlWxZ52pFxelh7aU`
**Status:** Built — needs credential binding before testing
**Trigger:** SignalWire inbound SMS webhook
**Webhook URL:** `https://krn8n9394.app.n8n.cloud/webhook/after-hours-capture`

**Flow:**
1. Receive SMS → extract FROM, TO, message, timestamp
2. Supabase lookup by TO number → get contractor config (business_hours, contractor_id, etc.)
3. Check: is current time outside business_hours?
4. Claude API → returns: urgency_score, service_type, response_text, confidence (0-1)
5. If confidence ≥ 0.85: Send SMS + INSERT leads + INSERT actions (success)
6. If confidence < 0.85: INSERT actions (human_review_needed) — no SMS

**Revenue impact:** ~$1,500/month per contractor (10 recovered after-hours leads @ $150 each)

---

### 2. tier1_missed_call_recovery_sms
**ID:** `EjrtbF205kPsOCxO`
**Status:** Built — needs credential binding before testing
**Trigger:** Jobber missed call event OR SignalWire missed call webhook
**Webhook URL:** `https://krn8n9394.app.n8n.cloud/webhook/missed-call-recovery`

**Flow:**
1. Receive event → extract phone, timestamp, source
2. Get contractor_id (from URL param `?contractor=` or TO number lookup)
3. Supabase dedup check: `SELECT * FROM leads WHERE phone = '[phone]' AND contractor_id = '[id]' AND created_at > now() - interval '24 hours'`
4. If duplicate: INSERT actions (dedup_blocked) → STOP
5. If not duplicate: Claude API → returns: should_send, response_text, confidence
6. If should_send: Send SMS + INSERT leads + INSERT actions (success)

**Revenue impact:** ~$3,900/month per contractor (26 missed calls/month, 70% recovery @ $150 each)

---

### 3. New Lead Notification
**ID:** `EVtjW8VElN5Bvf32`
**Status:** Active and working
**Trigger:** Chained from lead capture workflows
**What it does:** Notifies Karsyn via Gmail + Telegram when a new lead is created

---

## To Be Built (After First Client Signs)

Build in this order — each depends on the previous being stable:

### 4. Cancellation Fill
**Trigger:** `job_canceled` Jobber webhook → `?contractor={contractor_id}`
**Flow:** Get waitlist from Supabase → find best match by service type + urgency → SMS them → log result
**Revenue impact:** $175/slot filled (highest direct ROI in Foundation tier)

### 5. Dispatch Router
**Trigger:** Chained from emergency lead capture (post-qualification)
**Flow:** Assign tech based on location/skills/availability → notify tech + customer → log dispatch

### 6. ETA Monitor
**Trigger:** Schedule every 15 min during business_hours
**Flow:** Loop active contractors → check Jobber job status → if tech en route, SMS customer ETA

### 7. Invoice Chaser
**Trigger:** Daily schedule 8 AM
**Flow:** Loop active contractors → query Jobber for unpaid invoices > X days → SMS friendly reminder

### 8. Review Request
**Trigger:** `job_completed` Jobber webhook → `?contractor={contractor_id}` + 30 min delay
**Flow:** Get customer info from Jobber → send personalized review request SMS

### 9. Review Monitor
**Trigger:** New review event (Google Business API or Jobber review notification)
**Flow:** Check star rating → if ≤ 3 stars, log + alert (Telegram/email to contractor)

### 10. Daily Summary
**Trigger:** Daily schedule 7 AM
**Flow:** Loop active contractors → query yesterday's actions + leads → Claude generates plain English summary → send SMS/email to contractor

### 11. Inbound SMS Handler (Orchestrator)
**Trigger:** SignalWire inbound SMS (all replies)
**Flow:** Claude classifies intent → route to: cancellation request, booking request, complaint, general question

### 12. Waitlist Manager
**Trigger:** Continuous (job events + SMS replies)
**Flow:** Maintain ranked waitlist per contractor → update priority based on service type + urgency + wait time

---

## Multi-Tenant Pattern (Apply to Every Workflow)

Every workflow starts with a Supabase config lookup. Never hardcode contractor data.

**For SMS-triggered workflows (use TO number):**
```
Extract TO number from SignalWire payload: {{ $json.To }}
→ SELECT * FROM clients WHERE signalwire_number = '{{ $json.To }}'
→ Extract: contractor_id, business_hours, crm_type, tier, business_name
```

**For Jobber-triggered workflows (use URL param):**
```
Extract from URL: {{ $query.contractor }}
→ SELECT * FROM clients WHERE contractor_id = '{{ $query.contractor }}'
```

**For scheduled workflows (loop all active contractors):**
```
SELECT * FROM clients WHERE is_active = true AND tier IN ('foundation', 'partner', 'full_partner')
→ Loop → generate output per contractor → log with contractor_id
```

---

## Supabase Tables Used

| Workflow | Reads | Writes |
|---|---|---|
| After-hours capture | clients | leads, actions |
| Missed call recovery | clients, leads (dedup) | leads, actions |
| Cancellation fill | clients, leads (waitlist) | actions |
| Dispatch router | clients | actions |
| ETA monitor | clients, leads | actions |
| Invoice chaser | clients | actions |
| Review request | clients | actions |
| Daily summary | clients, leads, actions | actions |
| All workflows | clients (config lookup) | workflow_performance |

---

## Credential IDs in n8n (Already Exist)

| Credential | ID | Bind To |
|---|---|---|
| Supabase | `Pm10coWJeiICVYIi` | All Supabase nodes |
| SignalWire | `r9gOGGtsAO3GswJR` | All SMS/Twilio nodes |
| Gmail | `uWYzlK7ftArlL8zw` | Gmail notification nodes |
| Telegram | `OjlxZCBapUKW4KEu` | Telegram notification nodes |
