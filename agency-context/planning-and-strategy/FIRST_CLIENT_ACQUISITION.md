# Fieldline AI — First Client Acquisition Playbook
**Last Updated:** 2026-03-19
**Status:** No clients signed yet. This is the full playbook from outreach → live.

---

## Part 1 — The Goal

Sign one HVAC contractor within 30 days of outreach launch. One client proves the model, funds operations, and generates the case study that makes the second client easy to close.

**Entry point:** Start every client with the Concierge agent. It requires zero behavior change from the contractor or their techs, delivers the guarantee reliably, and generates the data that justifies expanding to other agents.

---

## Part 2 — Target Contractor Profile

### Who to target
- Owner-operated HVAC business (not a franchise)
- 2-8 field techs
- Already using **Jobber** — this is non-negotiable for MVP
- $500K–$2M annual revenue
- Visibly losing leads: active after hours, busy season approaching, posts about missing calls

### Who to avoid for now
- ServiceTitan users (API approval still pending — 4-8 weeks)
- Large companies with dedicated office staff (they already have solutions)
- Franchise operators (decisions made at corporate level)
- Contractors without any software (too long to educate and onboard)

### Where they are
- Facebook groups: "HVAC Business Owners," "Jobber Users Community," "Service Business Success"
- Local HVAC supplier networks (Ferguson, Wesco, Johnstone Supply)
- LinkedIn: search "HVAC owner/founder" + Jobber mention
- Suburban markets: Texas, Florida, Arizona, Georgia, Tennessee, Carolinas

---

## Part 3 — The Pitch

**One sentence:** "We find where your business is leaking money, build the AI system that fixes it, and run everything. You just watch the numbers improve."

**For first client specifically:** Lead with the Concierge — after-hours lead recovery is the fastest, most visible ROI.

> "Every lead that texts or calls when you're off the clock gets a response in 60 seconds. Every missed call gets a follow-up in 5 minutes. We run it. You see a morning summary. Guarantee: 5 recovered leads in 30 days or second month free."

**Guarantee wording (precise):** A recovered lead is one that (1) came in through the system, (2) received an automated response within 60 seconds, and (3) resulted in a booked appointment or a followed-up conversation. Logged automatically. No arguing.

---

## Part 4 — Outreach Channels

### Channel 1: Facebook Groups (Fastest)
Join, engage for 3-5 days, then DM anyone posting about missed calls, lost leads, or admin overwhelm.

**DM Script:**
```
Hey [Name], saw your post about [specific pain].

I run an AI ops service exclusively for HVAC contractors. We get on a discovery call,
find exactly where you're losing leads or time, and build the system that fixes it.

For most contractors the first win is after-hours — every lead that comes in when
you're off the clock gets a response in 60 seconds, automatically.

Guarantee is 5 recovered leads in 30 days or second month free.

Happy to hop on a 15-min call if you're curious.
```

### Channel 2: Cold Email (3-Email Cadence)
See `cold-email-templates.md` for full sequences. Lead with the after-hours angle for Jobber contractors.

### Channel 3: LinkedIn
Search "HVAC owner/founder" + Jobber in profile. Connection note:
```
Hi [Name] — I build AI ops for HVAC contractors on Jobber. After-hours lead recovery,
cancellation fill, no config on your end. Connect if relevant.
```

---

## Part 5 — The Discovery Call (30-45 min)

This is the most important part of the process. Don't pitch until you've asked these questions.

**5 Questions:**
1. "When a customer texts or calls after hours — what happens to that lead?"
2. "How often does a job cancel in a given week, and what do you do with that slot?"
3. "Walk me through how a tech quotes a job on-site — how long does that take?"
4. "How often do you reach back out to old customers who haven't called in a while?"
5. "If you could fix one thing costing you money right now, what would it be?"

**After the call:** Send a custom proposal within 24 hours scoped exactly to what they said. Don't send a generic package menu.

---

## Part 6 — The Demo (If Needed)

**Before serious outreach, this needs to actually work:**
- [ ] `jlWxZ52pFxelh7aU` (after-hours capture) — Supabase + SignalWire credentials bound
- [ ] `EjrtbF205kPsOCxO` (missed call recovery) — same
- [ ] SMS reply actually hitting a test phone
- [ ] Lead appearing in Supabase `leads` table within 5 seconds

**Demo flow (10 min):**
1. Send a test SMS to the contractor's ported number (or test SignalWire number)
2. Show the Claude response generated in n8n in real time
3. Show the lead row appearing in Supabase
4. Show the SMS reply landing on the test phone
5. Show the daily summary format
6. Show the dashboard action feed
7. State the guarantee out loud

**If demo isn't live yet:** Record a Loom walkthrough with simulated data. A polished Loom closes just as well on a first call.

---

## Part 7 — Closing

**Trial close after call:** "Does this solve the problem you described?"

If yes: "Here's what happens next. I send a proposal today with the exact scope and price. You pay the setup fee, and you're live within 48 hours. The only things I need from you: your Jobber login and the business phone number you want to use for the AI system."

**After call, send:**
- Custom proposal (scoped to their discovery call answers)
- Invoice link (Stripe)
- Calendar link for go-live call

---

## Part 8 — The 48-Hour Onboarding

### Hour 0: Payment Received

Send welcome message:
```
You're in. Here's what happens next:

- Hours 1-4: I provision your account and set up your config
- Hours 4-12: I port your business number and connect your Jobber
- Hours 12-24: I test everything end-to-end
- Hours 24-48: I send your dashboard login and we do a 15-min go-live call

One thing I need now: your Jobber login credentials.
We'll handle the phone number port together on a quick call.
```

---

### Hour 1-4: Supabase Setup

**Step 1: Create contractor row in `clients` table**

```sql
INSERT INTO clients (
  contractor_id,      -- generate UUID
  business_name,      -- "Smith HVAC"
  owner_email,
  owner_phone,        -- their mobile for alerts
  signalwire_number,  -- fill after porting (Step 5)
  crm_type,           -- "jobber"
  business_hours,     -- JSON (see format below)
  jobber_api_key,     -- from their Jobber account
  review_link,        -- their Google review URL
  agents_active,      -- JSON: {"concierge": true, "closer": false, "dispatcher": false, "strategist": false}
  is_active           -- true
)
```

**Business hours format:**
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

**Step 2: Create Supabase Auth user**

Authentication → Users → Create User:
- Email: their email
- Password: generate strong password
- Note the UUID (it becomes their user ID)

**Step 3: Insert into `users` table**
```sql
INSERT INTO users (id, contractor_id, email, role)
VALUES ('[uuid from auth]', '[contractor_id]', '[email]', 'client')
```

**Step 4: Verify RLS**
```sql
-- Logged in as contractor user — should ONLY return their data
SELECT * FROM leads WHERE contractor_id = auth.uid();
SELECT * FROM actions WHERE contractor_id = auth.uid();
```

---

### Hour 4-12: Phone Number + n8n

**Step 5: Port their existing business number into SignalWire**

- Initiate port request in SignalWire dashboard
- Timeline: 3-7 business days for port to complete
- During port period: set up call/SMS forwarding from their current number to a temporary SignalWire number
- Once ported: update `signalwire_number` in `clients` table
- Set inbound SMS webhook in SignalWire to: `https://krn8n9394.app.n8n.cloud/webhook/after-hours-capture`

**Why their existing number:** Customers already have it. 10DLC registration follows the number. No new number for customers to learn.

**Step 6: n8n — no new workflows needed**

Existing workflows handle ALL clients. The Supabase lookup at the start routes everything:
```
SMS arrives → extract TO number → SELECT * FROM clients WHERE signalwire_number = '[TO]'
→ Gets contractor config → executes with their data → logs with their contractor_id
```

Verify both workflows have credentials bound:
- `jlWxZ52pFxelh7aU` → Supabase `Pm10coWJeiICVYIi` + SignalWire `r9gOGGtsAO3GswJR`
- `EjrtbF205kPsOCxO` → same

**Step 7: Jobber webhook binding**

In contractor's Jobber: Settings → Developer → Webhooks → Add:
- `job_completed` → `https://krn8n9394.app.n8n.cloud/webhook/review-request?contractor={contractor_id}`
- `job_canceled` → `https://krn8n9394.app.n8n.cloud/webhook/cancellation-fill?contractor={contractor_id}`

---

### Hour 12-24: End-to-End Testing

```
[ ] Send test SMS to the SignalWire number
    → Lead appears in Supabase within 5 seconds?
    → SMS reply fires from their number?
    → Response sounds human and correct?

[ ] Trigger missed call simulation
    → Recovery SMS fires within 5 minutes?
    → Logged in actions table?

[ ] Trigger daily summary manually
    → Pulls correct contractor data?
    → Output readable plain English?

[ ] Log in as contractor user to dashboard
    → Sees only their data?
    → Cannot see any other contractor's data?
```

Fix all failures before going live.

---

### Hour 24-48: Go-Live

**Step 8: Send credentials**

```
Subject: You're live — here's your Fieldline AI dashboard

Hi [Name],

Everything is set up and tested. Here's your access:

Dashboard: dashboard.fieldlineai.com/dashboard
Email: [their email]
Password: [generated password]

Your AI system is now watching your business 24/7. You'll get a morning
summary every day. That's your main interface — you don't need to log
into the dashboard unless you want to dig into the numbers.

Let's do a quick 15-minute call so I can show you what it looks like live.
[Calendly link]
```

**Step 9: Go-live call (15 min)**
1. Show dashboard live (2 min)
2. Send a test SMS together — they watch it respond to their phone (2 min)
3. Show the morning summary format (1 min)
4. Reinforce: "You don't need to log in unless you want to. The morning text is your interface."
5. Set expectations: "First recovered lead could be today."
6. Ask: "Any recent leads you know you missed?" (seeds the ROI conversation for day 30)

---

## Part 9 — Tracking the Guarantee

At day 30, pull:
```sql
SELECT COUNT(*) FROM actions
WHERE contractor_id = '[id]'
AND action_type = 'lead_recovered'
AND success = true
AND created_at >= '[signup_date]';
```

If < 5 → second month free, no argument. Data is the proof.

---

## Part 10 — Minimum Viable Sales Stack

- [ ] **Stripe** — setup fee + monthly recurring
- [ ] **Calendly** — discovery call + go-live call booking
- [ ] **Loom** — demo recording (backup if live demo isn't ready)
- [ ] **fieldlineai.com** — homepage + contact
- [ ] **karsyn@fieldlineai.com** — professional outreach email
- [ ] **Supabase tables** — `clients`, `users`, `techs`, `leads`, `actions`, `workflow_performance` with RLS
- [ ] **n8n credentials bound** — both workflows live and tested
- [ ] **End-to-end test passing** — SMS in → lead logged → reply out → shows on dashboard

---

## Part 11 — Add n8n Error Monitoring Before First Client

Before any real client is live, add Telegram error alerts to n8n:
- Every workflow should have an error branch that sends a Telegram message: "Workflow [name] failed for contractor [id] at [timestamp] — [error]"
- Credential ID for Telegram: `OjlxZCBapUKW4KEu`

Without this, you won't know when something breaks until the contractor tells you.
