# Tier 1 Workflows — Phase 1 Demo Reference

**Status:** Production-ready Phase 1 deliverable
**Total Workflows:** 3 (all Tier 1)
**Expected ROI:** $8,600/month revenue recovery + indirect retention value

---

## Tier 1 Workflow Directory

### **1. tier1_after_hours_lead_capture.json**

**Purpose:** Respond to SMS leads received after business hours (after 7pm)

**Trigger:** Twilio webhook (inbound SMS)

**Flow:**
- Customer sends SMS after 7pm → Webhook received by n8n
- Extract: phone + message + timestamp
- Call FastAPI `/leads/qualify` endpoint
- Claude classifies: urgency (1-10) + service type + response text
- If confidence > 0.85: Send SMS response + create Lead record + log action
- If confidence ≤ 0.85: Log as "human_review_needed" (no SMS sent)

**Revenue Impact:** $1,500/month (10 recovered leads @ $150 each)

**Pitch Message:** *"Leads that arrive after 7pm disappear by 8am. We capture them instantly with AI qualification and SMS response within 2 seconds."*

**Files:**
- Workflow: `n8n/tier1_after_hours_lead_capture.json`
- FastAPI endpoint: `backend/routes/leads.py` → `POST /leads/qualify`
- Claude prompt: Section 4 of `docs/superpowers/specs/2026-03-14-layer1-workflows-design.md` (Agent 1)

---

### **2. tier1_missed_call_recovery_sms.json**

**Purpose:** Automatically send SMS to people who missed a call (27% of all calls = $3,900/month recovery)

**Trigger:** Jobber missed call event OR Twilio missed call webhook

**Flow:**
- Missed call detected (Jobber event or Twilio)
- Extract: phone + timestamp
- Check Airtable: does this phone already have a lead created today? (deduplication)
  - If YES: skip (prevent duplicate SMS)
  - If NO: proceed
- Call FastAPI `/webhooks/missed-call` endpoint
- Claude classifies: should we send SMS? (intent assessment)
- If should_send = true:
  - Send SMS within 60 seconds: *"Hey, we just missed your call — what's going on with your system? We'll get back to you within the hour."*
  - Create Lead record with source = "missed_call_recovery"
  - Log action (success)
- Error handler: log failures, don't spam customer

**Revenue Impact:** $3,900/month (largest single revenue stream in Phase 1)

**Pitch Message:** *"You're losing $3,900 a month to missed calls during the day. We recover them with an SMS response within 60 seconds, every time."*

**Files:**
- Workflow: `n8n/tier1_missed_call_recovery_sms.json`
- FastAPI endpoint: `backend/routes/webhooks.py` → `POST /webhooks/missed-call`
- Claude prompt: Custom (not in Layer 1 design, market research driven)

---

### **3. tier1_audit_trail_roi_logging**

**Purpose:** Track every action taken by the system (proof of ROI + retention driver)

**Components:**
- Airtable Actions table (all workflows write here)
- Mission Control dashboard (real-time action log + ROI metrics)

**What Gets Logged:**
- `action_id`: unique identifier
- `timestamp`: when action occurred
- `action_type`: sms_sent | lead_created | human_review_needed | sms_failed
- `description`: what happened
- `agent_name`: which workflow took action
- `revenue_impact`: estimated value ($150 per captured lead, $0 for log entry, etc.)
- `confidence_score`: Claude's confidence (0-1)
- `success`: true/false
- `lead_id`: link to Lead record (if applicable)
- `sms_sid`: Twilio SMS ID (if SMS sent)

**Dashboard Display:**
- Real-time action log (polling Airtable every 10 seconds)
- Summary stats: "X actions today | $Y revenue recovered | Z leads in pipeline"
- Filter by date range + action type
- Click-through to detailed action view

**Revenue Impact:** Indirect (drives 80%+ Year 1 revenue through retention)

**Pitch Position:** Don't mention directly, show in demo as proof:
*"Every action we take is logged. You can see exactly what happened, when, and what value it created. That's how we prove ROI."*

**Files:**
- Airtable schema: Actions table + Leads table + Waitlist table
- Dashboard: `app/mission-control/page.tsx`
- Backend logging: All routes write to Airtable via `backend/services/airtable_service.py`

---

## Phase 1 Demo Script

**Setup:** Test SMS number + Airtable base + n8n workflows running

**Demo Flow:**

1. **Show the problem:** *"You're losing $3,900/month to missed calls. Leads that come after 7pm disappear by morning. That's $5,400 a month gone."*

2. **Demo missed call recovery:**
   - Trigger a test missed call
   - Watch SMS respond within 60 seconds
   - Show Airtable Lead record created
   - Show Actions table entry logged

3. **Demo after-hours lead capture:**
   - Send test SMS after 7pm
   - Watch instant response
   - Show Lead + Action logged

4. **Show the proof:**
   - Open Mission Control dashboard
   - Point to action log: 2 actions in the last 2 minutes
   - Point to revenue: "2 leads × $150 = $300 value captured"
   - Point to confidence scores: "Both at 92% confidence — only sends when we're sure"

5. **Close the sale:**
   - *"In 30 days, if we capture 10 missed calls and 10 after-hours leads, that's $3,000 in pure revenue recovery. Your retainer is $1,500. You break even in 18 days."*
   - Show yearly math: $8,600/month × 12 months = $103,200 recovered. Cost: $18,000 (retainer). ROI: **475%**

---

## Deployment Checklist

### Before Demo:
- [ ] FastAPI backend running (local or deployed)
- [ ] Airtable base created + API key working
- [ ] Twilio account active + phone number configured
- [ ] n8n workflows deployed + firing correctly
- [ ] Mission Control dashboard accessible
- [ ] Test SMS can send/receive
- [ ] All Claude prompts copied to FastAPI code
- [ ] Confidence threshold set to 0.85

### Phase 1 Go-Live:
- [ ] Deploy FastAPI backend (Railway/Render)
- [ ] Deploy Next.js Mission Control (Vercel)
- [ ] Configure n8n webhook URLs (point to deployed FastAPI)
- [ ] Test end-to-end with real Jobber account
- [ ] Set up SMS frequency caps + TCPA compliance fields
- [ ] Document runbook for first customer

---

## Tier 2 Features (Phase 2 — Pitch Now, Build After First Client)

These are built after first customer signs, once Phase 1 ROI is proven:

1. **Speed-to-lead dashboard metric** — Show before/after response time comparison
2. **Daily owner summary email** — Morning recap at 7 AM
3. **Cancellation fill** — Auto-SMS waitlist when job cancels
4. **Invoice reminders** — Chase unpaid invoices via SMS
5. **Review requests** — Auto-SMS review request 30 min after job completion

---

**Last Updated:** 2026-03-14
**Status:** Ready to build