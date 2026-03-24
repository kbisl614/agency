# n8n Multi-Tenant Architecture Guide
**Last Updated:** 2026-03-18

---

## The Core Rule

**One workflow per function. One workflow handles ALL contractors. Never duplicate a workflow per client.**

When a new contractor signs, you do NOT create new workflows. You create a row in the Supabase `clients` table and provision their SignalWire number. The existing workflows automatically handle them.

**Total n8n workflows ever needed: ~24, regardless of how many clients you have.**

---

## How It Works

Every inbound event carries an identifier for the contractor. The first thing every workflow does is look up that contractor's config in Supabase.

### For SMS Webhooks (SignalWire)
```
Inbound SMS arrives → n8n webhook fires
→ Extract TO number from SignalWire payload ({{ $json.To }})
→ Supabase query: SELECT * FROM clients WHERE signalwire_number = '{{ $json.To }}'
→ Returns row: contractor_id, business_name, business_hours, crm_type, tier
→ Remaining workflow uses these values
→ All Supabase inserts include contractor_id
```

**Why this works:** Each contractor has their own SignalWire number. The TO number is always unique. One lookup = one contractor's full config.

### For Jobber Webhooks
```
Jobber fires webhook → hits URL with contractor param:
https://krn8n9394.app.n8n.cloud/webhook/[workflow-id]?contractor={contractor_id}
→ Extract {{ $query.contractor }}
→ Supabase query: SELECT * FROM clients WHERE contractor_id = '{{ $query.contractor }}'
→ Same flow as above
```

**How to get the Jobber webhook URL per contractor:** Set up in contractor's Jobber account under Settings → Integrations → Webhooks. The URL includes their contractor_id as a query param.

### For Scheduled Workflows (Daily Summary, Invoice Chaser, etc.)
```
7 AM schedule fires
→ Supabase query: SELECT * FROM clients WHERE is_active = true AND tier IN (...)
→ Loop through all active contractors
→ For each: fetch their data, generate their summary, send their SMS/email
→ All logged with contractor_id
```

---

## Supabase `clients` Table (The Config Store)

Every workflow reads from this table at the start. It is the source of truth for what each contractor has configured.

```sql
CREATE TABLE clients (
  contractor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  signalwire_number TEXT,           -- used for SMS webhook routing
  crm_type TEXT DEFAULT 'jobber',   -- 'jobber' | 'servicetitan'
  business_hours JSONB,             -- determines after-hours behavior
  tier TEXT NOT NULL,               -- 'foundation' | 'partner' | 'full_partner'
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Business hours JSON format:**
```json
{
  "monday":    { "open": "08:00", "close": "17:00" },
  "tuesday":   { "open": "08:00", "close": "17:00" },
  "wednesday": { "open": "08:00", "close": "17:00" },
  "thursday":  { "open": "08:00", "close": "17:00" },
  "friday":    { "open": "08:00", "close": "17:00" },
  "saturday":  { "open": "09:00", "close": "14:00" },
  "sunday":    null
}
```

When `null` = closed that day. The after-hours lead capture workflow uses this to determine if an inbound SMS qualifies as "after hours."

---

## Current Workflow IDs

| Workflow | ID | Trigger Type |
|---|---|---|
| tier1_after_hours_lead_capture | `jlWxZ52pFxelh7aU` | SignalWire SMS webhook |
| tier1_missed_call_recovery_sms | `EjrtbF205kPsOCxO` | Jobber event or SignalWire missed call |
| New Lead Notification | `EVtjW8VElN5Bvf32` | Chained from lead capture |

---

## Adding a New Contractor (No New Workflows)

When a new contractor signs:

1. Insert row in `clients` table with their info and a new UUID as contractor_id
2. Provision a new SignalWire number in their area code
3. Update their `clients` row with the SignalWire number
4. Set up their Jobber webhooks with the URL pattern above (contractor_id as query param)
5. Create their Supabase Auth user (email + password)
6. Insert row in `users` table with their contractor_id and role = 'client'

That's it. The existing n8n workflows immediately start handling this contractor because they do the lookup at runtime.

---

## n8n Workflow Node Pattern

Every workflow should start with this pattern:

```
[1] Webhook trigger
    ↓
[2] Supabase: Get Contractor Config
    Operation: SELECT
    Table: clients
    Filter: signalwire_number = {{ $json.To }}
    (or: contractor_id = {{ $query.contractor }})
    ↓
[3] Set: Extract config fields
    contractor_id = {{ $node["Get Contractor Config"].json[0].contractor_id }}
    business_hours = {{ $node["Get Contractor Config"].json[0].business_hours }}
    tier = {{ $node["Get Contractor Config"].json[0].tier }}
    ↓
[4] ... rest of workflow logic
    (all Supabase inserts use contractor_id from step 3)
```

---

## What NOT to Do

❌ Don't create a separate workflow per contractor
❌ Don't hardcode a contractor_id or signalwire_number in any workflow
❌ Don't skip the Supabase config lookup — it's what makes multi-tenancy work
❌ Don't log to Supabase without contractor_id on every row

---

## Webhook URL Summary

| Endpoint | URL | Used For |
|---|---|---|
| After-hours capture | `https://krn8n9394.app.n8n.cloud/webhook/after-hours-capture` | SignalWire inbound SMS |
| Missed call recovery | `https://krn8n9394.app.n8n.cloud/webhook/missed-call-recovery` | Jobber + SignalWire missed calls |
| Cancellation fill | `https://krn8n9394.app.n8n.cloud/webhook/cancellation-fill?contractor={id}` | Jobber job_canceled |
| Review request | `https://krn8n9394.app.n8n.cloud/webhook/review-request?contractor={id}` | Jobber job_completed |
| Invoice chaser | `https://krn8n9394.app.n8n.cloud/webhook/invoice-chaser?contractor={id}` | Jobber invoice_created |
