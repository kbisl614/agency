# Environment Setup Guide

Create a `.env` file in the project root with the following structure. This file is `.gitignored` and should never be committed.

## Copy This To `.env`

```env
# ============================================================================
# ENVIRONMENT CONFIGURATION — Agency AI Ops
# ============================================================================

# ─────────────────────────────────────────────────────────────────────────
# FASTAPI BACKEND (Already Deployed)
# ─────────────────────────────────────────────────────────────────────────
FASTAPI_BASE_URL=https://your-fastapi-backend-url.com
# WHAT WE NEED FROM YOU:
#   - URL where your FastAPI backend is deployed (e.g., Railway, Render)
#   - Backend must have /leads/qualify and /webhooks/missed-call endpoints ready

# ─────────────────────────────────────────────────────────────────────────
# SUPABASE (PostgreSQL Database)
# ─────────────────────────────────────────────────────────────────────────
SUPABASE_PROJECT_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# WHAT WE NEED FROM YOU:
#   1. Create a Supabase project at https://supabase.com
#   2. Go to Project Settings → API → Copy:
#      - Project URL (from "API" section)
#      - anon public key (from "API" section)
#      - service_role key (from "API" section, marked "SECRET")
#   3. Run the SQL schema setup (see SUPABASE_SCHEMA.sql in this project)
#   4. Paste keys here

# ─────────────────────────────────────────────────────────────────────────
# TWILIO (SMS Provider)
# ─────────────────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
# WHAT WE NEED FROM YOU:
#   1. Create a Twilio account at https://www.twilio.com
#   2. Go to Account Settings:
#      - Copy Account SID
#      - Copy Auth Token
#   3. Buy a phone number (Phone Numbers → Manage → Buy a Number)
#   4. Copy the phone number in E.164 format (+1...)
#   5. Enable webhooks on that number (Phone Numbers → Active Numbers → Configure)
#      - Set "A Message Comes In" webhook to: https://YOUR_N8N_CLOUD_URL/webhook/after-hours-capture
#      - Set "A Call Comes In" webhook to: https://YOUR_N8N_CLOUD_URL/webhook/missed-call-recovery
#   6. Paste credentials here

# ─────────────────────────────────────────────────────────────────────────
# JOBBER (CRM - Missed Call Integration)
# ─────────────────────────────────────────────────────────────────────────
JOBBER_WEBHOOK_SECRET=your_jobber_webhook_secret_here
# WHAT WE NEED FROM YOU:
#   NOTE: You don't have a Jobber API key yet (cost concern)
#   WORKAROUND: We'll mock Jobber webhooks using curl/Postman for testing
#   FUTURE: Once you get a client on Jobber, you'll:
#      1. Get Jobber API access from your plan upgrade
#      2. Configure webhook at: Account Settings → Integrations → Webhooks
#      3. Set webhook URL to: https://YOUR_N8N_CLOUD_URL/webhook/missed-call-recovery
#      4. Copy webhook secret and paste here

# ─────────────────────────────────────────────────────────────────────────
# N8N CLOUD (Workflow Automation)
# ─────────────────────────────────────────────────────────────────────────
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.app.n8n.cloud
# WHAT WE NEED FROM YOU:
#   1. Go to your n8n Cloud account
#   2. Create two workflows (names match your handoff doc):
#      - tier1_after_hours_lead_capture
#      - tier1_missed_call_recovery_sms
#   3. Each workflow will have a webhook trigger node
#   4. From each workflow, copy the webhook URL and use in Twilio config above
#   5. Paste your n8n base URL here (used for health checks)

# ─────────────────────────────────────────────────────────────────────────
# LOGGING & MONITORING
# ─────────────────────────────────────────────────────────────────────────
LOG_LEVEL=info
# Options: debug, info, warn, error

# ─────────────────────────────────────────────────────────────────────────
# WORKFLOW CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────
AFTER_HOURS_CONFIDENCE_THRESHOLD=0.85
MISSED_CALL_CONFIDENCE_THRESHOLD=0.8
MISSED_CALL_DEDUP_WINDOW_HOURS=24
# These control workflow behavior (should match handoff doc values)
```

## Setup Checklist

- [ ] Create `.env` file at project root
- [ ] Fill in all `[YOUR_*]` placeholders
- [ ] Set up Supabase project and run schema SQL
- [ ] Acquire Twilio credentials and configure webhooks
- [ ] Keep `.env` in `.gitignore` (never commit)
