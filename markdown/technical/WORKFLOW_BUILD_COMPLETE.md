# ✅ Workflow Build Complete

**Session:** 2026-03-15, Session 5  
**Status:** Both n8n workflows configured and ready for credential setup

---

## What Was Built

### Workflow #1: tier1_after_hours_lead_capture
**ID:** `jlWxZ52pFxelh7aU`  
**Purpose:** Capture SMS leads after hours with high confidence (>0.85)

**Node Flow:**
```
1. Webhook (receives POST from SignalWire)
   ↓
2. Extract Signal (parse phone, message, timestamp)
   ↓
3. Analyze Intent (detect keywords, urgency, quality score)
   ↓
4. Create Lead (Supabase insert)
   ↓
5. Decision: confidence > 0.85?
   ├─ YES → Send SMS → Log Success
   └─ NO → Log Human Review
```

### Workflow #2: tier1_missed_call_recovery_sms
**ID:** `EjrtbF205kPsOCxO`  
**Purpose:** Recover missed calls with deduplication (prevent 24h spam)

**Node Flow:**
```
1. Webhook (receives POST from Jobber/mock)
   ↓
2. Extract Data (parse phone, timestamp)
   ↓
3. Check Duplicates (query Supabase: phone in last 24h?)
   ↓
4. Decision: Is duplicate?
   ├─ YES → Log Dedup Skip (STOP)
   └─ NO → Continue
   ↓
5. Create Lead (Supabase insert)
   ↓
6. Analyze Confidence (set 0.8)
   ↓
7. Decision: should_send = true?
   ├─ YES → Send SMS → Log Success
   └─ NO → Log Skipped
```

---

## Next Steps: Credentials Setup (You Do This)

Both workflows are configured but need credentials to run. Follow these steps:

### Step 1: Add Supabase Credential to n8n
1. Log in to n8n Cloud: https://app.n8n.cloud
2. **Credentials** → **New** → **Supabase**
3. Fill in:
   - **Host:** `https://cdofgroinizevjxyzvnn.supabase.co`
   - **API Key:** (from `.env`: `SUPABASE_ANON_KEY`)
   - **Service Role Key:** (from `.env`: `SUPABASE_SERVICE_ROLE_KEY`)
4. Test connection ✓
5. Save

### Step 2: Add SignalWire/Twilio Credential to n8n
1. **Credentials** → **New** → **Twilio** (n8n uses Twilio config for SignalWire-compatible)
2. Fill in:
   - **Account SID:** `SIGNALWIRE_PROJECT_ID` from `.env`
   - **Auth Token:** `SIGNALWIRE_API_TOKEN` from `.env`
   - **Space URL** (override): `https://hv-agency.signalwire.com` (from `.env`: `SIGNALWIRE_SPACE_URL`)
3. Test connection ✓
4. Save

### Step 3: Bind Credentials to Workflows
1. Open **Workflow #1** (jlWxZ52pFxelh7aU)
   - Click each **Supabase** node → select the credential from dropdown
   - Click each **Twilio** node → select the credential from dropdown
   - Save

2. Open **Workflow #2** (EjrtbF205kPsOCxO)
   - Same as above
   - Save

### Step 4: Test with Mock Data
**For Workflow #1 (after-hours SMS):**
```bash
curl -X POST https://krn8n9394.app.n8n.cloud/webhook/tier1-after-hours-lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "From": "+1-555-0100",
    "Body": "My kitchen sink is broken and leaking. Need emergency help ASAP!"
  }'
```

**Expected:** 
- New lead created in Supabase `leads` table
- SMS sent to +1-555-0100 (via SignalWire)
- Action logged to `actions` table (type: `sms_sent`)

**For Workflow #2 (missed call recovery):**
```bash
curl -X POST https://krn8n9394.app.n8n.cloud/webhook/tier1-missed-call-recovery-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-0101",
    "timestamp": "2026-03-15T14:30:00Z",
    "source": "missed_call"
  }'
```

**Expected:** 
- New lead created in Supabase `leads` table
- SMS sent to +1-555-0101 (via SignalWire)
- Action logged to `actions` table (type: `sms_sent`)

**For Workflow #2 (dedup test — send same number twice):**
```bash
# First call
curl -X POST https://krn8n9394.app.n8n.cloud/webhook/tier1-missed-call-recovery-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1-555-0102", "timestamp": "2026-03-15T14:30:00Z"}'

# Second call (same number, within 24h)
curl -X POST https://krn8n9394.app.n8n.cloud/webhook/tier1-missed-call-recovery-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1-555-0102", "timestamp": "2026-03-15T14:35:00Z"}'
```

**Expected:**
- First call: SMS sent, action logged `sms_sent`
- Second call: SMS blocked, action logged `dedup_blocked` (no duplicate SMS)

---

## Architecture Decisions Baked In

✅ **No FastAPI** — n8n is the decision engine  
✅ **SignalWire** for SMS (not Twilio)  
✅ **Supabase** as single source of truth  
✅ **Fixed thresholds** (0.85 & 0.8) — locked, not auto-tuning  
✅ **Signal extraction** — detect intent, urgency, quality from first message  
✅ **Deduplication** — 24h window, never spam same number twice  
✅ **Audit trail** — every action logged to Actions table  
✅ **Fail safe** — if uncertain, log + human review  

---

## Critical Success Checklist

- [ ] Supabase credential added + tested in n8n
- [ ] SignalWire credential added + tested in n8n
- [ ] Workflows have credentials bound to all nodes
- [ ] Test Workflow #1 with sample SMS → verify:
  - [ ] Lead created in `leads` table
  - [ ] SMS sent to test phone
  - [ ] Action logged as `sms_sent`
- [ ] Test Workflow #2 with sample missed call → verify:
  - [ ] Lead created in `leads` table
  - [ ] SMS sent to test phone
  - [ ] Action logged as `sms_sent`
- [ ] Test Workflow #2 dedup → send same number twice:
  - [ ] First SMS sent
  - [ ] Second SMS blocked
  - [ ] Action logged as `dedup_blocked`
- [ ] Error handling: test with invalid data → verify:
  - [ ] Error logged to `actions` table
  - [ ] Workflow doesn't crash
  - [ ] System recovers gracefully

---

## What Happens Next

Once you've verified the workflows with the testing checklist above:

1. **Phase 1 Complete** — both workflows live + tested ✅
2. **Phase 2 Ready** — agent can query leads + actions to learn patterns
3. **Contractor Demo** — first contractor can test with real missed calls/SMS
4. **Jobber Integration** — when Jobber API key arrives, plug in webhook URL

---

## File References

- Workflow build scripts: `scripts/build-after-hours-workflow.js`, `scripts/build-missed-call-workflow.js`
- Supabase schema: `docs/SUPABASE_SCHEMA.sql`
- Credential guide: `docs/CREDENTIAL_SETUP_GUIDE.md`
- Architecture decisions: `memory/architecture_decisions_phase1.md`

---

**Built:** 2026-03-15  
**Status:** Ready for credential setup  
**Blocker:** n8n credentials (user adds these)
