# Fieldline AI — Client Onboarding Playbook
**Last Updated:** 2026-03-19
**Timeline:** 48 hours from payment to live

---

## Overview

Every new client goes through this playbook. Agents deployed depend on the discovery call scope — every client starts with the Responder minimum. The 48-hour promise is the target; phone number porting may extend this to 5-7 days (see Step 5).

---

## Pre-Onboarding Checklist (Before Any Client Is Live)

These must exist before onboarding the first client:

- [ ] Supabase tables: `clients`, `users`, `techs`, `leads`, `actions`, `workflow_performance` — all with RLS policies
- [ ] n8n credentials bound: Supabase `Pm10coWJeiICVYIi`, SignalWire `r9gOGGtsAO3GswJR`, Gmail `uWYzlK7ftArlL8zw`, Telegram `OjlxZCBapUKW4KEu`
- [ ] Both existing workflows active and tested: `jlWxZ52pFxelh7aU`, `EjrtbF205kPsOCxO`
- [ ] Telegram error alerts wired to all workflows
- [ ] Dashboard live at `dashboard.fieldlineai.com`
- [ ] Stripe configured for recurring billing
- [ ] Calendly links ready (discovery call + go-live call)

---

## Hour 0 — Payment Received

Send welcome message immediately:

```
You're in! Here's what happens next:

Hours 1-4:   I provision your account
Hours 4-12:  I initiate your number port and connect Jobber
Hours 12-24: I test everything end-to-end
Hours 24-48: I send your dashboard login and we do a 15-min go-live call

One thing I need now: your Jobber login credentials (email + password).
I'll reach out about the number port separately — it's a quick process.
```

---

## Hour 1-4 — Supabase Provisioning

### Step 1: Create `clients` row

```sql
INSERT INTO clients (
  contractor_id,      -- gen_random_uuid()
  business_name,      -- "Smith HVAC Services"
  owner_email,        -- their email
  owner_phone,        -- their mobile (for Telegram/SMS alerts)
  signalwire_number,  -- leave NULL until port completes
  crm_type,           -- 'jobber'
  business_hours,     -- JSON (see format below)
  jobber_api_key,     -- from Jobber Settings → Developer → API
  review_link,        -- their Google review short URL
  agents_active,      -- '{"concierge": true, "closer": false, "dispatcher": false, "strategist": false}'
  is_active           -- true
)
```

**Business hours JSON:**
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
`null` = closed that day. Verify hours with contractor — they often differ from standard.

---

### Step 2: Create Supabase Auth user

Authentication → Users → Invite User (or Create User):
- Email: contractor's email
- Generate a strong password, save it securely
- Note the UUID — it becomes their `user_id`

---

### Step 3: Create `users` row

```sql
INSERT INTO users (id, contractor_id, email, role)
VALUES ('[uuid from auth]', '[contractor_id]', '[email]', 'client')
```

---

### Step 4: Verify RLS enforcement

Run in Supabase SQL editor **logged in as the contractor's user** (not admin):

```sql
SELECT * FROM leads WHERE contractor_id = auth.uid();
SELECT * FROM actions WHERE contractor_id = auth.uid();
```

**Expected:** Only their own data. If any other contractor's data appears → RLS is broken. Fix before continuing.

**RLS policies that must exist on every table:**
```sql
CREATE POLICY "clients_own_leads" ON leads
  FOR ALL USING (contractor_id = auth.uid());

CREATE POLICY "clients_own_actions" ON actions
  FOR ALL USING (contractor_id = auth.uid());

CREATE POLICY "clients_own_performance" ON workflow_performance
  FOR ALL USING (contractor_id = auth.uid());
```

Admin (Karsyn) bypasses RLS via role-level bypass — not per-policy.

---

## Hour 4-12 — Phone Number + Jobber

### Step 5: Port contractor's existing business number into SignalWire

**Why port vs. new number:** Customers already know their number. 10DLC registration follows the number. Nothing changes for the contractor's customers.

**Port process:**
1. Initiate port request in SignalWire dashboard (requires contractor's account number + PIN with their current carrier)
2. Timeline: 3-7 business days
3. During port window: set up call forwarding from their current carrier to a temporary SignalWire number so nothing is missed
4. Once ported: update `signalwire_number` in `clients` table with their number
5. Set inbound SMS webhook in SignalWire to: `https://krn8n9394.app.n8n.cloud/webhook/after-hours-capture`

**In the contract:** Contractor retains full ownership of their number. Port-out is initiated within 48 hours of cancellation at no cost.

---

### Step 6: Confirm n8n workflows — no new builds needed

Existing workflows handle all clients via Supabase lookup:
```
SMS arrives → extract TO number
→ SELECT * FROM clients WHERE signalwire_number = '[TO]'
→ Gets: contractor_id, business_hours, crm_type, agents_active
→ Workflow executes with their config
→ All actions logged with contractor_id
```

Verify credentials are bound to both workflows:
- `jlWxZ52pFxelh7aU` (after-hours capture) → Supabase + SignalWire
- `EjrtbF205kPsOCxO` (missed call recovery) → Supabase + SignalWire

Send a test SMS to the number → confirm lead appears in Supabase, reply fires.

---

### Step 7: Jobber webhook setup

In contractor's Jobber account: Settings → Developer → Webhooks → Add:

| Event | URL |
|---|---|
| `job_completed` | `https://krn8n9394.app.n8n.cloud/webhook/review-request?contractor={contractor_id}` |
| `job_canceled` | `https://krn8n9394.app.n8n.cloud/webhook/cancellation-fill?contractor={contractor_id}` |

The `?contractor={contractor_id}` URL param is how n8n identifies which client the webhook is for.

---

## Hour 12-24 — End-to-End Testing

Run every test before declaring live. Do not skip.

```
[ ] SMS test
    Send test SMS to their SignalWire number (or temp number during port)
    → Lead row in Supabase within 5 seconds?
    → SMS reply fires from their number?
    → Response sounds human and correct?
    → Action logged in actions table?

[ ] After-hours test
    Send SMS outside their business_hours
    → After-hours flow triggers?
    → Lead captured and logged?

[ ] Jobber webhook test
    Trigger job_completed in Jobber (or manual POST)
    → n8n receives it?
    → review_request workflow runs?
    → Action logged with correct contractor_id?

[ ] Daily summary test
    Manually trigger daily summary
    → Pulls correct contractor data only?
    → Output is readable plain English?

[ ] RLS test — DO NOT SKIP
    Log in to dashboard as contractor user
    → Sees only their leads and actions?
    → Cannot see any other contractor's data?
```

Fix every failure before going live.

---

## Hour 24-48 — Go-Live

### Step 8: Send dashboard credentials

```
Subject: You're live — Fieldline AI is watching your business

Hi [Name],

Everything's set up and tested. Here's your access:

Dashboard: dashboard.fieldlineai.com/dashboard
Email: [their email]
Password: [generated — change it when you log in]

Your business number is now connected. Every lead that comes in after hours
gets a response in 60 seconds. Every missed call gets a follow-up.
You'll get a morning summary every day at 7 AM.

Let's do a quick 15-min call so I can walk you through it live.
[Calendly link]
```

---

### Step 9: Go-live call (15 min)

1. Show their dashboard live (2 min)
2. Send a test SMS together — they watch it respond to their phone (2 min)
3. Show the morning summary format (1 min)
4. Reinforce: "You don't need to log in unless you want to. The morning text is your interface."
5. Expectations: "First recovered lead could be today."
6. Ask: "Any recent leads you know you missed?" (seeds day-30 ROI conversation)

---

## Guarantee Tracking

Every recovered lead is logged automatically:

```sql
INSERT INTO actions (
  contractor_id,
  action_type,      -- 'lead_recovered'
  description,      -- "Responded to inbound SMS in 47s. Customer confirmed appointment."
  revenue_impact,   -- estimated job value
  agent_name,       -- 'concierge'
  confidence_score,
  success,          -- true
  created_at
)
```

At day 30:
```sql
SELECT COUNT(*) FROM actions
WHERE contractor_id = '[id]'
AND action_type = 'lead_recovered'
AND success = true
AND created_at >= '[signup_date]';
```

If < 5 → second month free. No argument. Data is the proof.

---

## Adding New Agents (After Concierge Stable)

When a client is ready to expand, update their `agents_active` in Supabase:

```sql
UPDATE clients
SET agents_active = '{"concierge": true, "closer": true, "dispatcher": false, "strategist": false}'
WHERE contractor_id = '[id]';
```

Then build or activate the relevant workflows. No new workflows for other contractors are ever created — everyone shares the same workflow pool with different Supabase config.

---

## Offboarding (If Contractor Cancels)

1. Initiate SignalWire port-out within 48 hours — contractor gets their number back
2. Set `is_active = false` in `clients` table — workflows stop processing their events
3. Retain data in Supabase for 90 days (billing disputes), then delete
4. Cancel their Supabase Auth user
5. Remove Jobber webhooks from their account
